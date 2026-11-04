import { Router } from "express";
import { authenticate, authorize } from "../../middlewares/auth";
import { validate } from "../../middlewares/validate";
import { checkoutSchema } from "./order.schema";
import * as orderController from "./order.controller";

const router = Router();

router.use(authenticate, authorize("CUSTOMER"));

router.post("/", validate(checkoutSchema), orderController.checkout);
router.get("/", orderController.listMine);
router.get("/:id", orderController.getMine);

export default router;
