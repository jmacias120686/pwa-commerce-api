import bcrypt from "bcryptjs"
import prisma from "../config/database.js"
import { generateToken } from "../config/auth.js"

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body

    // Buscar usuario
    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        password: true,
        name: true,
        role: true,
        active: true,
      },
    })

    if (!user) {
      return res.status(401).json({ error: "Credenciales inválidas" })
    }

    if (!user.active) {
      return res.status(401).json({ error: "Usuario inactivo" })
    }

    // Verificar password
    const isValidPassword = await bcrypt.compare(password, user.password)

    if (!isValidPassword) {
      return res.status(401).json({ error: "Credenciales inválidas" })
    }

    // Generar token
    const token = generateToken(user)

    // Remover password de la respuesta
    const { password: _, ...userWithoutPassword } = user

    res.json({
      token,
      user: userWithoutPassword,
    })
  } catch (error) {
    next(error)
  }
}

export const getProfile = async (req, res, next) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        active: true,
        createdAt: true,
      },
    })

    if (!user) {
      return res.status(404).json({ error: "Usuario no encontrado" })
    }

    res.json(user)
  } catch (error) {
    next(error)
  }
}

export const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body

    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
    })

    const isValid = await bcrypt.compare(currentPassword, user.password)

    if (!isValid) {
      return res.status(400).json({ error: "Contraseña actual incorrecta" })
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10)

    await prisma.user.update({
      where: { id: req.user.id },
      data: { password: hashedPassword },
    })

    res.json({ message: "Contraseña actualizada correctamente" })
  } catch (error) {
    next(error)
  }
}
