import express from "express"
import { body } from "express-validator"
import { getAllSales, getSaleById, createSale, cancelSale } from "../controllers/saleController.js"
import { authenticate, authorize } from "../middleware/auth.js"
import { validate } from "../middleware/validate.js"

const router = express.Router()

router.use(authenticate)

router.get("/", getAllSales)
router.get("/:id", getSaleById)

router.post(
  "/",
  [
    body("items").isArray({ min: 1 }),
    body("items.*.productId").notEmpty(),
    body("items.*.quantity").isInt({ min: 1 }),
    body("paymentMethod").optional().isIn(["CASH", "CARD", "TRANSFER", "OTHER"]),
    validate,
  ],
  createSale,
)

router.post("/:id/cancel", authorize("ADMIN"), cancelSale)

export default router
