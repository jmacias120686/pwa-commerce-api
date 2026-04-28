import prisma from "../config/database.js"

export const getDashboardStats = async (req, res, next) => {
  try {
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)

    // Ventas de hoy
    const todaySales = await prisma.sale.aggregate({
      where: {
        createdAt: {
          gte: today,
          lt: tomorrow,
        },
        status: "COMPLETED",
      },
      _sum: { total: true },
      _count: true,
    })

    // Total de productos
    const productsCount = await prisma.product.count({
      where: { active: true },
    })

    // Productos con stock bajo
    const lowStockCount = await prisma.product.count({
      where: {
        active: true,
        stock: {
          lte: prisma.product.fields.minStock,
        },
      },
    })

    // Total de clientes
    const customersCount = await prisma.customer.count()

    res.json({
      todaySales: {
        total: todaySales._sum.total || 0,
        count: todaySales._count || 0,
      },
      productsCount,
      lowStockCount,
      customersCount,
    })
  } catch (error) {
    next(error)
  }
}

export const getSalesReport = async (req, res, next) => {
  try {
    const { startDate, endDate, groupBy = "day" } = req.query

    const where = {
      status: "COMPLETED",
    }

    if (startDate || endDate) {
      where.createdAt = {}
      if (startDate) where.createdAt.gte = new Date(startDate)
      if (endDate) where.createdAt.lte = new Date(endDate)
    }

    const sales = await prisma.sale.findMany({
      where,
      select: {
        createdAt: true,
        total: true,
        paymentMethod: true,
      },
      orderBy: { createdAt: "asc" },
    })

    // Agrupar ventas
    const grouped = {}

    sales.forEach((sale) => {
      let key
      const date = new Date(sale.createdAt)

      if (groupBy === "day") {
        key = date.toISOString().split("T")[0]
      } else if (groupBy === "month") {
        key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`
      }

      if (!grouped[key]) {
        grouped[key] = {
          date: key,
          total: 0,
          count: 0,
          byPaymentMethod: {},
        }
      }

      grouped[key].total += sale.total
      grouped[key].count += 1

      if (!grouped[key].byPaymentMethod[sale.paymentMethod]) {
        grouped[key].byPaymentMethod[sale.paymentMethod] = 0
      }
      grouped[key].byPaymentMethod[sale.paymentMethod] += sale.total
    })

    const report = Object.values(grouped)

    res.json(report)
  } catch (error) {
    next(error)
  }
}

export const getTopProducts = async (req, res, next) => {
  try {
    const { limit = 10, startDate, endDate } = req.query

    const where = {
      sale: {
        status: "COMPLETED",
      },
    }

    if (startDate || endDate) {
      where.sale.createdAt = {}
      if (startDate) where.sale.createdAt.gte = new Date(startDate)
      if (endDate) where.sale.createdAt.lte = new Date(endDate)
    }

    const items = await prisma.saleItem.groupBy({
      by: ["productId"],
      where,
      _sum: {
        quantity: true,
        subtotal: true,
      },
      _count: true,
      orderBy: {
        _sum: {
          quantity: "desc",
        },
      },
      take: Number.parseInt(limit),
    })

    // Obtener detalles de productos
    const productsDetails = await Promise.all(
      items.map(async (item) => {
        const product = await prisma.product.findUnique({
          where: { id: item.productId },
          select: {
            id: true,
            name: true,
            code: true,
            price: true,
          },
        })

        return {
          product,
          quantity: item._sum.quantity,
          revenue: item._sum.subtotal,
          salesCount: item._count,
        }
      }),
    )

    res.json(productsDetails)
  } catch (error) {
    next(error)
  }
}
