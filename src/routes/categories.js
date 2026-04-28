import express from "express"
import { body } from "express-validator"
import { getAllCategories, createCategory, updateCategory, deleteCategory } from "../controllers/categoryController.js"
import { authenticate, authorize } from "../middleware/auth.js"
import { validate } from "../middleware/validate.js"

const router = express.Router()

router.use(authenticate)

router.get("/", getAllCategories)

router.post("/", [authorize("ADMIN"), body("name").notEmpty(), validate], createCategory)

router.put("/:id", [authorize("ADMIN"), body("name").notEmpty(), validate], updateCategory)

router.delete("/:id", authorize("ADMIN"), deleteCategory)

export default router
