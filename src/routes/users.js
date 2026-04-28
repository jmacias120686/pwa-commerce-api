import express from "express"
import { body } from "express-validator"
import { getAllUsers, createUser, updateUser, deleteUser } from "../controllers/userController.js"
import { authenticate, authorize } from "../middleware/auth.js"
import { validate } from "../middleware/validate.js"

const router = express.Router()

// Todas las rutas requieren autenticación y rol ADMIN
router.use(authenticate, authorize("ADMIN"))

router.get("/", getAllUsers)

router.post(
  "/",
  [
    body("email").isEmail(),
    body("password").isLength({ min: 6 }),
    body("name").notEmpty(),
    body("role").isIn(["ADMIN", "CASHIER"]),
    validate,
  ],
  createUser,
)

router.put(
  "/:id",
  [
    body("name").optional().notEmpty(),
    body("role").optional().isIn(["ADMIN", "CASHIER"]),
    body("active").optional().isBoolean(),
    validate,
  ],
  updateUser,
)

router.delete("/:id", deleteUser)

export default router
