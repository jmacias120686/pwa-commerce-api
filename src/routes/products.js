import express from "express"
import { body } from "express-validator"
import {
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  getLowStockProducts,
} from "../controllers/productController.js"
import { authenticate, authorize } from "../middleware/auth.js"
import { validate } from "../middleware/validate.js"

const router = express.Router()

router.use(authenticate)

router.get("/", getAllProducts)
router.get("/low-stock", getLowStockProducts)
router.get("/:id", getProductById)

// Solo ADMIN puede crear/editar/eliminar
router.post(
  "/",
  [
    authorize("ADMIN"),
    body("code").notEmpty(),
    body("name").notEmpty(),
    body("price").isFloat({ min: 0 }),
    body("categoryId").notEmpty(),
    validate,
  ],
  createProduct,
)

router.put("/:id", authorize("ADMIN"), updateProduct)
router.delete("/:id", authorize("ADMIN"), deleteProduct)

export default router
