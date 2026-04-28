import prisma from "../config/database.js"

export const getAllCategories = async (req, res, next) => {
  try {
    const categories = await prisma.category.findMany({
      include: {
        _count: {
          select: { products: true },
        },
      },
      orderBy: { name: "asc" },
    })

    res.json(categories)
  } catch (error) {
    next(error)
  }
}

export const createCategory = async (req, res, next) => {
  try {
    const { name, description } = req.body

    const category = await prisma.category.create({
      data: { name, description },
    })

    res.status(201).json(category)
  } catch (error) {
    next(error)
  }
}

export const updateCategory = async (req, res, next) => {
  try {
    const { id } = req.params
    const { name, description } = req.body

    const category = await prisma.category.update({
      where: { id },
      data: { name, description },
    })

    res.json(category)
  } catch (error) {
    next(error)
  }
}

export const deleteCategory = async (req, res, next) => {
  try {
    const { id } = req.params

    // Verificar si tiene productos
    const productsCount = await prisma.product.count({
      where: { categoryId: id },
    })

    if (productsCount > 0) {
      return res.status(400).json({
        error: "No se puede eliminar una categoría con productos asociados",
      })
    }

    await prisma.category.delete({
      where: { id },
    })

    res.json({ message: "Categoría eliminada correctamente" })
  } catch (error) {
    next(error)
  }
}
