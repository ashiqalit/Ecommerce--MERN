import { Request, Response } from "express";
import { parseId } from "../../utils/parseId";
import * as addressService from "./address.service";

export const list = async (req: Request, res: Response) => {
  const addresses = await addressService.listAddresses(req.user!.id);
  res.json({ success: true, data: { addresses } });
};

export const create = async (req: Request, res: Response) => {
  const address = await addressService.createAddress(req.user!.id, req.body);
  res.status(201).json({ success: true, data: { address } });
};

export const update = async (req: Request, res: Response) => {
  const address = await addressService.updateAddress(
    req.user!.id,
    parseId(req.params.id),
    req.body,
  );
  res.json({ success: true, data: { address } });
};

export const remove = async (req: Request, res: Response) => {
  await addressService.deleteAddress(req.user!.id, parseId(req.params.id));
  res.json({ success: true, message: "Address deleted" });
};
