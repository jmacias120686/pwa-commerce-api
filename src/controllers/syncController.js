import prisma from "../config/database.js"

export const syncSales = async (req, res, next) => {
  try {
    const { sales } = req.body

    if (!sales || !Array.isArray(sales)) {
      return res.status(400).json({ error: "Formato de datos inválido" })
    }

    const results = []

    for (const saleData of sales) {
      try {
        // Verificar si ya existe (por localId)
        if (saleData.localId) {
          const existingSale = await prisma.sale.findFirst({
            where: { localId: saleData.localId },
          })

          if (existingSale) {
            results.push({
              localId: saleData.localId,
              status: "already_synced",
              id: existingSale.id,
            })
            continue
          }
        }

        // Calcular totales
        let subtotal = 0
        const saleItems = []

        for (const item of saleData.items) {
          const product = await prisma.product.findUnique({
            where: { id: item.productId },
          })

          if (!product) {
            results.push({
              localId: saleData.localId,
              status: "error",
              error: `Producto ${item.productId} no encontrado`,
            })
            continue
          }

          const itemSubtotal = item.price * item.quantity
          subtotal += itemSubtotal

          saleItems.push({
            productId: product.id,
            quantity: item.quantity,
            price: item.price,
            subtotal: itemSubtotal,
          })
        }

        const total = subtotal - (saleData.discount || 0) + (saleData.tax || 0)

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

        // Crear venta
        const sale = await prisma.$transaction(async (tx) => {
          const newSale = await tx.sale.create({
            data: {
              saleNumber,
              subtotal,
              discount: saleData.discount || 0,
              tax: saleData.tax || 0,
              total,
              paymentMethod: saleData.paymentMethod || "CASH",
              status: "COMPLETED",
              notes: saleData.notes,
              userId: saleData.userId,
              customerId: saleData.customerId || null,
              localId: saleData.localId,
              syncedAt: new Date(),
              createdAt: saleData.createdAt ? new Date(saleData.createdAt) : new Date(),
              items: {
                create: saleItems,
              },
            },
          })

          // Actualizar stock
          for (const item of saleData.items) {
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

        results.push({
          localId: saleData.localId,
          status: "synced",
          id: sale.id,
        })
      } catch (error) {
        console.error("[v0] Error syncing sale:", error)
        results.push({
          localId: saleData.localId,
          status: "error",
          error: error.message,
        })
      }
    }

    res.json({
      total: sales.length,
      synced: results.filter((r) => r.status === "synced").length,
      errors: results.filter((r) => r.status === "error").length,
      results,
    })
  } catch (error) {
    next(error)
  }
}

export const getLastSync = async (req, res, next) => {
  try {
    const lastSale = await prisma.sale.findFirst({
      where: { syncedAt: { not: null } },
      orderBy: { syncedAt: "desc" },
      select: { syncedAt: true },
    })

    res.json({
      lastSync: lastSale?.syncedAt || null,
    })
  } catch (error) {
    next(error)
  }
}
