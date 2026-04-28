import express from "express"
import { body } from "express-validator"
import {
  getAllCustomers,
  getCustomerById,
  createCustomer,
  updateCustomer,
  deleteCustomer,
} from "../controllers/customerController.js"
import { authenticate } from "../middleware/auth.js"
import { validate } from "../middleware/validate.js"

const router = express.Router()

router.use(authenticate)

router.get("/", getAllCustomers)
router.get("/:id", getCustomerById)

router.post("/", [body("name").notEmpty(), body("email").optional().isEmail(), validate], createCustomer)

router.put("/:id", updateCustomer)
router.delete("/:id", deleteCustomer)

export default router
