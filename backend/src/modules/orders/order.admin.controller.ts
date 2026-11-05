import { Request, Response } from "express";
import { parseId } from "../../utils/parseId";
import { adminListOrdersQuerySchema } from "./order.schema";
import * as adminOrderService from "./order.admin.service";

export const list = async (req: Request, res: Response) => {
  const query = adminListOrdersQuerySchema.parse(req.query);
  const data = await adminOrderService.listAllOrders(query);
  res.json({ success: true, data });
};

export const getOne = async (req: Request, res: Response) => {
  const order = await adminOrderService.getOrder(parseId(req.params.id));
  res.json({ success: true, data: { order } });
};

export const updateStatus = async (req: Request, res: Response) => {
  const order = await adminOrderService.updateOrderStatus(
    parseId(req.params.id),
    req.body.status,
  );
  res.json({ success: true, data: { order } });
};
