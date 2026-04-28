import express from "express"
import { getDashboardStats, getSalesReport, getTopProducts } from "../controllers/reportController.js"
import { authenticate } from "../middleware/auth.js"

const router = express.Router()

router.use(authenticate)

router.get("/dashboard", getDashboardStats)
router.get("/sales", getSalesReport)
router.get("/top-products", getTopProducts)

export default router
