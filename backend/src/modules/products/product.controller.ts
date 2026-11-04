import { Request, Response } from "express";
import { parseId } from "../../utils/parseId";
import { listProductsQuerySchema } from "./product.schema";
import * as productService from "./product.service";
import { ApiError } from "../../utils/ApiError";

export const uploadImage = (req: Request, res: Response) => {
  if (!req.file) {
    throw ApiError.badRequest("No image file provided");
  }
  res.status(201).json({
    success: true,
    data: { imageUrl: `/uploads/${req.file.filename}` },
  });
};

export const list = async (req: Request, res: Response) => {
  const query = listProductsQuerySchema.parse(req.query);
  const data = await productService.listProducts(query);
  res.json({ success: true, data });
};

export const getOne = async (req: Request, res: Response) => {
  const product = await productService.getProduct(parseId(req.params.id));
  res.json({ success: true, data: { product } });
};

export const create = async (req: Request, res: Response) => {
  const product = await productService.createProduct(req.body);
  res.status(201).json({ success: true, data: { product } });
};

export const update = async (req: Request, res: Response) => {
  const product = await productService.updateProduct(
    parseId(req.params.id),
    req.body,
  );
  res.json({ success: true, data: { product } });
};

export const remove = async (req: Request, res: Response) => {
  await productService.deleteProduct(parseId(req.params.id));
  res.json({ success: true, message: "Product deleted" });
};
