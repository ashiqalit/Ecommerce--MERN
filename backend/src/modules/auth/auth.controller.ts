import { Request, Response } from "express";
import * as authService from "./auth.service";

export const register = async (req: Request, res: Response) => {
  const result = await authService.register(req.body);
  res.status(201).json({ success: true, data: result });
};

export const login = async (req: Request, res: Response) => {
  const result = await authService.login(req.body);
  res.json({ success: true, data: result });
};
