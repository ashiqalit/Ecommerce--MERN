import { Request, Response } from "express";
import { parseId } from "../../utils/parseId";
import { listOrdersQuerySchema } from "./order.schema";
import * as orderService from "./order.service";

export const checkout = async (req: Request, res: Response) => {
  const order = await orderService.placeOrder(req.user!.id, req.body);
  res.status(201).json({ success: true, data: { order } });
};

export const listMine = async (req: Request, res: Response) => {
  const query = listOrdersQuerySchema.parse(req.query);
  const data = await orderService.listMyOrders(req.user!.id, query);
  res.json({ success: true, data });
};

export const getMine = async (req: Request, res: Response) => {
  const order = await orderService.getMyOrder(
    req.user!.id,
    parseId(req.params.id),
  );
  res.json({ success: true, data: { order } });
};
