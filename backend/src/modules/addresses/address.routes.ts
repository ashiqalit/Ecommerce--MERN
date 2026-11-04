import { Router } from "express";
import { authenticate, authorize } from "../../middlewares/auth";
import { validate } from "../../middlewares/validate";
import { addressSchema } from "./address.schema";
import * as addressController from "./address.controller";

const router = Router();

router.use(authenticate, authorize("CUSTOMER"));

router.get("/", addressController.list);
router.post("/", validate(addressSchema), addressController.create);
router.put("/:id", validate(addressSchema), addressController.update);
router.delete("/:id", addressController.remove);

export default router;
