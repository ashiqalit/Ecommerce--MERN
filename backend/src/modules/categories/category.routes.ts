import { Router } from "express";
import { authenticate, authorize } from "../../middlewares/auth";
import { validate } from "../../middlewares/validate";
import { categorySchema } from "./category.schema";
import * as categoryController from "./category.controller";

const router = Router();

router.get("/", categoryController.list);

router.post(
  "/",
  authenticate,
  authorize("ADMIN"),
  validate(categorySchema),
  categoryController.create,
);
router.put(
  "/:id",
  authenticate,
  authorize("ADMIN"),
  validate(categorySchema),
  categoryController.update,
);
router.delete(
  "/:id",
  authenticate,
  authorize("ADMIN"),
  categoryController.remove,
);

export default router;
