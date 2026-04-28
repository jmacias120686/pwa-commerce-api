import prisma from "../config/database.js"

export const getAllSales = async (req, res, next) => {
  try {
    const { startDate, endDate, userId, status } = req.query

    const where = {}

    if (startDate || endDate) {
      where.createdAt = {}
      if (startDate) where.createdAt.gte = new Date(startDate)
      if (endDate) where.createdAt.lte = new Date(endDate)
    }

    if (userId) where.userId = userId
    if (status) where.status = status

    const sales = await prisma.sale.findMany({
      where,
      include: {
        user: {
          select: { id: true, name: true },
        },
        customer: {
          select: { id: true, name: true },
        },
        items: {
          include: {
            product: {
              select: { id: true, name: true, code: true },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    })

    res.json(sales)
  } catch (error) {
    next(error)
  }
}

export const getSaleById = async (req, res, next) => {
  try {
    const { id } = req.params

    const sale = await prisma.sale.findUnique({
      where: { id },
      include: {
        user: {
          select: { id: true, name: true, email: true },
        },
        customer: true,
        items: {
          include: {
            product: true,
          },
        },
      },
    })

    if (!sale) {
      return res.status(404).json({ error: "Venta no encontrada" })
    }

    res.json(sale)
  } catch (error) {
    next(error)
  }
}

export const createSale = async (req, res, next) => {
  try {
    const { items, customerId, paymentMethod, notes, discount, tax } = req.body

    // Validar que haya items
    if (!items || items.length === 0) {
      return res.status(400).json({ error: "La venta debe tener al menos un producto" })
    }

    // Calcular totales
    let subtotal = 0
    const saleItems = []

    for (const item of items) {
      const product = await prisma.product.findUnique({
        where: { id: item.productId },
      })

      if (!product) {
        return res.status(400).json({
          error: `Producto ${item.productId} no encontrado`,
        })
      }

      if (product.stock < item.quantity) {
        return res.status(400).json({
          error: `Stock insuficiente para ${product.name}`,
        })
      }

      const itemSubtotal = product.price * item.quantity
      subtotal += itemSubtotal

      saleItems.push({
        productId: product.id,
        quantity: item.quantity,
        price: product.price,
        subtotal: itemSubtotal,
      })
    }

    const discountAmount = discount || 0
    const taxAmount = tax || 0
    const total = subtotal - discountAmount + taxAmount

    // Generar número de venta
    const lastSale = await prisma.sale.findFirst({
      orderBy: { createdAt: "desc" },
      select: { saleNumber: true },
    })

    let saleNumber = "V-00001"
    if (lastSale) {
      const lastNumber = Number.parseInt(lastSale.saleNumber.split("-")[1])
      saleNumber = `V-${String(lastNumber + 1).padStart(5, "0")}`
    }

    // Crear venta con transacción
    const sale = await prisma.$transaction(async (tx) => {
      // Crear venta
      const newSale = await tx.sale.create({
        data: {
          saleNumber,
          subtotal,
          discount: discountAmount,
          tax: taxAmount,
          total,
          paymentMethod: paymentMethod || "CASH",
          status: "COMPLETED",
          notes,
          userId: req.user.id,
          customerId: customerId || null,
          items: {
            create: saleItems,
          },
        },
        include: {
          items: {
            include: {
              product: true,
            },
          },
          user: {
            select: { id: true, name: true },
          },
          customer: true,
        },
      })

      // Actualizar stock de productos
      for (const item of items) {
        await tx.product.update({
          where: { id: item.productId },
          data: {
            stock: {
              decrement: item.quantity,
            },
          },
        })
      }

      return newSale
    })

    res.status(201).json(sale)
  } catch (error) {
    next(error)
  }
}

export const cancelSale = async (req, res, next) => {
  try {
    const { id } = req.params

    const sale = await prisma.sale.findUnique({
      where: { id },
      include: { items: true },
    })

    if (!sale) {
      return res.status(404).json({ error: "Venta no encontrada" })
    }

    if (sale.status === "CANCELLED") {
      return res.status(400).json({ error: "La venta ya está cancelada" })
    }

    // Cancelar venta y restaurar stock
    await prisma.$transaction(async (tx) => {
      // Actualizar estado
      await tx.sale.update({
        where: { id },
        data: { status: "CANCELLED" },
      })

      // Restaurar stock
      for (const item of sale.items) {
        await tx.product.update({
          where: { id: item.productId },
          data: {
            stock: {
              increment: item.quantity,
            },
          },
        })
      }
    })

    res.json({ message: "Venta cancelada correctamente" })
  } catch (error) {
    next(error)
  }
}
