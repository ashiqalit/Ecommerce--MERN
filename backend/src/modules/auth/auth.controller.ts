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

export const me = async (req: Request, res: Response) => {
  const user = await authService.getProfile(req.user!.id);
  res.json({ success: true, data: { user } });
};
