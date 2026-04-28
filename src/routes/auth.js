import express from "express"
import { body } from "express-validator"
import { login, getProfile, changePassword } from "../controllers/authController.js"
import { authenticate } from "../middleware/auth.js"
import { validate } from "../middleware/validate.js"

const router = express.Router()

router.post(
  "/login",
  [
    body("email").isEmail().withMessage("Email inválido"),
    body("password").notEmpty().withMessage("Password requerido"),
    validate,
  ],
  login,
)

router.get("/profile", authenticate, getProfile)

router.post(
  "/change-password",
  [
    authenticate,
    body("currentPassword").notEmpty(),
    body("newPassword").isLength({ min: 6 }).withMessage("La contraseña debe tener al menos 6 caracteres"),
    validate,
  ],
  changePassword,
)

export default router
