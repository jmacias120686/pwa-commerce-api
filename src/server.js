import express from "express"
import cors from "cors"
import dotenv from "dotenv"
import { errorHandler, notFound } from "./middleware/errorHandler.js"

// Rutas
import authRoutes from "./routes/auth.js"
import userRoutes from "./routes/users.js"
import productRoutes from "./routes/products.js"
import categoryRoutes from "./routes/categories.js"
import customerRoutes from "./routes/customers.js"
import saleRoutes from "./routes/sales.js"
import syncRoutes from "./routes/sync.js"
import reportRoutes from "./routes/reports.js"

dotenv.config()

const app = express()
const PORT = process.env.PORT || 3001

// Middleware
const defaultAllowedOrigins = [
  "http://localhost:5173",
  "http://localhost:4173",
  "http://127.0.0.1:5173",
  "http://127.0.0.1:4173",
  "http://192.168.18.27:5173",
  "https://pwa-commerce-cli.vercel.app",
]
const allowedOrigins = process.env.CORS_ORIGIN
  ? process.env.CORS_ORIGIN.split(",").map((origin) => origin.trim()).filter(Boolean)
  : defaultAllowedOrigins

console.log("[Backend] Allowed CORS origins:", allowedOrigins)

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, origin)
      } else {
        callback(new Error("Not allowed by CORS"))
      }
    },
    credentials: true,
  }),
)

app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// Health check
app.get("/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() })
})

// API Routes
app.use("/api/auth", authRoutes)
app.use("/api/users", userRoutes)
app.use("/api/products", productRoutes)
app.use("/api/categories", categoryRoutes)
app.use("/api/customers", customerRoutes)
app.use("/api/sales", saleRoutes)
app.use("/api/sync", syncRoutes)
app.use("/api/reports", reportRoutes)

// Error handlers
app.use(notFound)
app.use(errorHandler)

app.listen(PORT, "0.0.0.0", () => {
  console.log(`[Backend] Servidor corriendo en puerto: ${PORT}`)
  console.log(`[Backend] Ambiente: ${process.env.NODE_ENV || "development"}`)
})
