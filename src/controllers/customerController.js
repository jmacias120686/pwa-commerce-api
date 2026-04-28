import prisma from "../config/database.js"

export const getAllCustomers = async (req, res, next) => {
  try {
    const { search } = req.query

    const where = {}

    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
        { phone: { contains: search, mode: "insensitive" } },
      ]
    }

    const customers = await prisma.customer.findMany({
      where,
      include: {
        _count: {
          select: { sales: true },
        },
      },
      orderBy: { name: "asc" },
    })

    res.json(customers)
  } catch (error) {
    next(error)
  }
}

export const getCustomerById = async (req, res, next) => {
  try {
    const { id } = req.params

    const customer = await prisma.customer.findUnique({
      where: { id },
      include: {
        sales: {
          orderBy: { createdAt: "desc" },
          take: 10,
        },
      },
    })

    if (!customer) {
      return res.status(404).json({ error: "Cliente no encontrado" })
    }

    res.json(customer)
  } catch (error) {
    next(error)
  }
}

export const createCustomer = async (req, res, next) => {
  try {
    const { name, email, phone, address } = req.body

    const customer = await prisma.customer.create({
      data: { name, email, phone, address },
    })

    res.status(201).json(customer)
  } catch (error) {
    next(error)
  }
}

export const updateCustomer = async (req, res, next) => {
  try {
    const { id } = req.params
    const { name, email, phone, address } = req.body

    const customer = await prisma.customer.update({
      where: { id },
      data: { name, email, phone, address },
    })

    res.json(customer)
  } catch (error) {
    next(error)
  }
}

export const deleteCustomer = async (req, res, next) => {
  try {
    const { id } = req.params

    await prisma.customer.delete({
      where: { id },
    })

    res.json({ message: "Cliente eliminado correctamente" })
  } catch (error) {
    next(error)
  }
}
