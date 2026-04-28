import prisma from "../config/database.js"

export const getAllProducts = async (req, res, next) => {
  try {
    const { active, categoryId, search } = req.query

    const where = {}

    if (active !== undefined) {
      where.active = active === "true"
    }

    if (categoryId) {
      where.categoryId = categoryId
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { code: { contains: search, mode: "insensitive" } },
      ]
    }

    const products = await prisma.product.findMany({
      where,
      include: {
        category: {
          select: { id: true, name: true },
        },
      },
      orderBy: { name: "asc" },
    })

    res.json(products)
  } catch (error) {
    next(error)
  }
}

export const getProductById = async (req, res, next) => {
  try {
    const { id } = req.params

    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        category: true,
      },
    })

    if (!product) {
      return res.status(404).json({ error: "Producto no encontrado" })
    }

    res.json(product)
  } catch (error) {
    next(error)
  }
}

export const createProduct = async (req, res, next) => {
  try {
    const { code, name, description, price, stock, minStock, categoryId, imageUrl } = req.body

    const product = await prisma.product.create({
      data: {
        code,
        name,
        description,
        price: Number.parseFloat(price),
        stock: Number.parseInt(stock) || 0,
        minStock: Number.parseInt(minStock) || 5,
        categoryId,
        imageUrl,
      },
      include: {
        category: true,
      },
    })

    res.status(201).json(product)
  } catch (error) {
    if (error.code === "P2002") {
      return res.status(400).json({ error: "El código del producto ya existe" })
    }
    next(error)
  }
}

export const updateProduct = async (req, res, next) => {
  try {
    const { id } = req.params
    const { code, name, description, price, stock, minStock, categoryId, imageUrl, active } = req.body

    const product = await prisma.product.update({
      where: { id },
      data: {
        ...(code && { code }),
        ...(name && { name }),
        ...(description !== undefined && { description }),
        ...(price && { price: Number.parseFloat(price) }),
        ...(stock !== undefined && { stock: Number.parseInt(stock) }),
        ...(minStock !== undefined && { minStock: Number.parseInt(minStock) }),
        ...(categoryId && { categoryId }),
        ...(imageUrl !== undefined && { imageUrl }),
        ...(active !== undefined && { active }),
      },
      include: {
        category: true,
      },
    })

    res.json(product)
  } catch (error) {
    next(error)
  }
}

export const deleteProduct = async (req, res, next) => {
  try {
    const { id } = req.params

    // Soft delete
    await prisma.product.update({
      where: { id },
      data: { active: false },
    })

    res.json({ message: "Producto desactivado correctamente" })
  } catch (error) {
    next(error)
  }
}

export const getLowStockProducts = async (req, res, next) => {
  try {
    const products = await prisma.product.findMany({
      where: {
        active: true,
        stock: {
          lte: prisma.product.fields.minStock,
        },
      },
      include: {
        category: {
          select: { id: true, name: true },
        },
      },
      orderBy: { stock: "asc" },
    })

    res.json(products)
  } catch (error) {
    next(error)
  }
}
