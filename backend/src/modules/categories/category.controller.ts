import { Request, Response } from "express";
import { parseId } from "../../utils/parseId";
import * as categoryService from "./category.service";

export const list = async (_req: Request, res: Response) => {
  const categories = await categoryService.listCategories();
  res.json({ success: true, data: { categories } });
};

export const create = async (req: Request, res: Response) => {
  const category = await categoryService.createCategory(req.body);
  res.status(201).json({ success: true, data: { category } });
};

export const update = async (req: Request, res: Response) => {
  const category = await categoryService.updateCategory(
    parseId(req.params.id),
    req.body,
  );
  res.json({ success: true, data: { category } });
};

export const remove = async (req: Request, res: Response) => {
  await categoryService.deleteCategory(parseId(req.params.id));
  res.json({ success: true, message: "Category deleted" });
};
