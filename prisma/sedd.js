import { PrismaClient } from "@prisma/client"
import bcrypt from "bcryptjs"

const prisma = new PrismaClient()

async function main() {
  console.log("[Seed] Iniciando seed de la base de datos...")

  // Limpiar datos existentes
  await prisma.saleItem.deleteMany()
  await prisma.sale.deleteMany()
  await prisma.product.deleteMany()
  await prisma.category.deleteMany()
  await prisma.customer.deleteMany()
  await prisma.user.deleteMany()

  // Crear usuarios
  const hashedPassword = await bcrypt.hash("123456", 10)

  const admin = await prisma.user.create({
    data: {
      email: "admin@tienda.com",
      password: hashedPassword,
      name: "Administrador",
      role: "ADMIN",
    },
  })

  const cashier = await prisma.user.create({
    data: {
      email: "cajero@tienda.com",
      password: hashedPassword,
      name: "Cajero Principal",
      role: "CASHIER",
    },
  })

  console.log("[Seed] Usuarios creados")

  // Crear categorías
  const categories = await Promise.all([
    prisma.category.create({
      data: {
        name: "Electrónica",
        description: "Dispositivos electrónicos y accesorios",
      },
    }),
    prisma.category.create({
      data: {
        name: "Ropa",
        description: "Ropa y accesorios de moda",
      },
    }),
    prisma.category.create({
      data: {
        name: "Hogar",
        description: "Artículos para el hogar",
      },
    }),
    prisma.category.create({
      data: {
        name: "Deportes",
        description: "Artículos deportivos y fitness",
      },
    }),
  ])

  console.log("[Seed] Categorías creadas")

  // Crear productos
  await Promise.all([
    prisma.product.create({
      data: {
        code: "ELEC-001",
        name: "Smartphone X Pro",
        description: "Teléfono inteligente de última generación",
        price: 599.99,
        stock: 15,
        minStock: 5,
        categoryId: categories[0].id,
      },
    }),
    prisma.product.create({
      data: {
        code: "ELEC-002",
        name: "Auriculares Bluetooth",
        description: "Auriculares inalámbricos con cancelación de ruido",
        price: 89.99,
        stock: 30,
        minStock: 10,
        categoryId: categories[0].id,
      },
    }),
    prisma.product.create({
      data: {
        code: "ROPA-001",
        name: "Camiseta Casual",
        description: "Camiseta de algodón 100%",
        price: 19.99,
        stock: 50,
        minStock: 15,
        categoryId: categories[1].id,
      },
    }),
    prisma.product.create({
      data: {
        code: "ROPA-002",
        name: "Jeans Clásicos",
        description: "Pantalones de mezclilla azul",
        price: 49.99,
        stock: 25,
        minStock: 10,
        categoryId: categories[1].id,
      },
    }),
    prisma.product.create({
      data: {
        code: "HOGAR-001",
        name: "Lámpara LED",
        description: "Lámpara de escritorio LED regulable",
        price: 34.99,
        stock: 20,
        minStock: 5,
        categoryId: categories[2].id,
      },
    }),
    prisma.product.create({
      data: {
        code: "DEPORT-001",
        name: "Pelota de Fútbol",
        description: "Pelota profesional tamaño oficial",
        price: 29.99,
        stock: 3,
        minStock: 5,
        categoryId: categories[3].id,
      },
    }),
  ])

  console.log("[Seed] Productos creados")

  // Crear clientes
  await Promise.all([
    prisma.customer.create({
      data: {
        name: "Juan Pérez",
        email: "juan@example.com",
        phone: "+1234567890",
        address: "Calle Principal 123",
      },
    }),
    prisma.customer.create({
      data: {
        name: "María García",
        email: "maria@example.com",
        phone: "+1234567891",
        address: "Avenida Central 456",
      },
    }),
    prisma.customer.create({
      data: {
        name: "Carlos López",
        phone: "+1234567892",
      },
    }),
  ])

  console.log("[Seed] Clientes creados")
  console.log("[Seed] ¡Seed completado exitosamente!")
  console.log("\n[Seed] Credenciales de acceso:")
  console.log("Admin - Email: admin@tienda.com | Password: 123456")
  console.log("Cajero - Email: cajero@tienda.com | Password: 123456")
}

main()
  .catch((e) => {
    console.error("[Seed] Error:", e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
