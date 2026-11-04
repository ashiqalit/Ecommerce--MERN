import express from "express";
import cors from "cors";
import { notFound, errorHandler } from "./middlewares/errorHandler";
import authRoutes from "./modules/auth/auth.routes";
import categoryRoutes from "./modules/categories/category.routes";

const app = express();

app.use(cors());
app.use(express.json());

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok" });
});

// feature routes will be mounted here
app.use("/api/categories", categoryRoutes);
app.use("/api/auth", authRoutes);
app.use(notFound);
app.use(errorHandler);

export default app;
