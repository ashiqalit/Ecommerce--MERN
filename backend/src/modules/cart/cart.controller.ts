import { Request, Response } from "express";
import { parseId } from "../../utils/parseId";
import * as cartService from "./cart.service";

export const get = async (req: Request, res: Response) => {
  const cart = await cartService.getCart(req.user!.id);
  res.json({ success: true, data: { cart } });
};

export const addItem = async (req: Request, res: Response) => {
  const cart = await cartService.addItem(req.user!.id, req.body);
  res.json({ success: true, data: { cart } });
};

export const updateItem = async (req: Request, res: Response) => {
  const cart = await cartService.setQuantity(
    req.user!.id,
    parseId(req.params.productId, "product id"),
    req.body.quantity,
  );
  res.json({ success: true, data: { cart } });
};

export const removeItem = async (req: Request, res: Response) => {
  const cart = await cartService.removeItem(
    req.user!.id,
    parseId(req.params.productId, "product id"),
  );
  res.json({ success: true, data: { cart } });
};
