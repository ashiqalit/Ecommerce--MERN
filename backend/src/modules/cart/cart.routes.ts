import { Router } from "express";
import { authenticate, authorize } from "../../middlewares/auth";
import { validate } from "../../middlewares/validate";
import { addItemSchema, updateItemSchema } from "./cart.schema";
import * as cartController from "./cart.controller";

const router = Router();

router.use(authenticate, authorize("CUSTOMER"));

router.get("/", cartController.get);
router.post("/items", validate(addItemSchema), cartController.addItem);
router.patch(
  "/items/:productId",
  validate(updateItemSchema),
  cartController.updateItem,
);
router.delete("/items/:productId", cartController.removeItem);

export default router;
