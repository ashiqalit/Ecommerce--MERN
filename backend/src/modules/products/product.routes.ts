import { Router } from "express";
import { authenticate, authorize } from "../../middlewares/auth";
import { validate } from "../../middlewares/validate";
import { createProductSchema, updateProductSchema } from "./product.schema";
import * as productController from "./product.controller";

const router = Router();

router.get("/", productController.list);
router.get("/:id", productController.getOne);

router.post(
  "/",
  authenticate,
  authorize("ADMIN"),
  validate(createProductSchema),
  productController.create,
);
router.put(
  "/:id",
  authenticate,
  authorize("ADMIN"),
  validate(updateProductSchema),
  productController.update,
);
router.delete(
  "/:id",
  authenticate,
  authorize("ADMIN"),
  productController.remove,
);

export default router;
