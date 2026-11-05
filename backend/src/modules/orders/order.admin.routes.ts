import { Router } from "express";
import { authenticate, authorize } from "../../middlewares/auth";
import { validate } from "../../middlewares/validate";
import { updateStatusSchema } from "./order.schema";
import * as adminOrderController from "./order.admin.controller";

const router = Router();

router.use(authenticate, authorize("ADMIN"));

router.get("/", adminOrderController.list);
router.get("/:id", adminOrderController.getOne);
router.patch(
  "/:id/status",
  validate(updateStatusSchema),
  adminOrderController.updateStatus,
);

export default router;
