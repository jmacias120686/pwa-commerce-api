import express from "express"
import { syncSales, getLastSync } from "../controllers/syncController.js"
import { authenticate } from "../middleware/auth.js"

const router = express.Router()

router.use(authenticate)

router.post("/sales", syncSales)
router.get("/last-sync", getLastSync)

export default router
