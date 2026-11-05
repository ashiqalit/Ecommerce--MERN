import { Request, Response } from "express";
import { parseId } from "../../utils/parseId";
import { listUsersQuerySchema } from "./user.schema";
import * as userService from "./user.service";

export const list = async (req: Request, res: Response) => {
  const query = listUsersQuerySchema.parse(req.query);
  const data = await userService.listUsers(query);
  res.json({ success: true, data });
};

export const getOne = async (req: Request, res: Response) => {
  const user = await userService.getUser(parseId(req.params.id));
  res.json({ success: true, data: { user } });
};
