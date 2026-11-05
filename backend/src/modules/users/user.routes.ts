import { Router } from "express";
import { authenticate, authorize } from "../../middlewares/auth";
import * as userController from "./user.controller";

const router = Router();

router.use(authenticate, authorize("ADMIN"));

router.get("/", userController.list);
router.get("/:id", userController.getOne);

export default router;
