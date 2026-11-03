import { Router } from "express";
import { validate } from "../../middlewares/validate";
import { loginSchema, registerSchema } from "./auth.schema";
import * as authController from "./auth.controller";
import { authenticate, authorize } from "../../middlewares/auth";

const router = Router();

router.post("/register", validate(registerSchema), authController.register);
router.post("/login", validate(loginSchema), authController.login);
router.get("/me", authenticate, authController.me);

export default router;
