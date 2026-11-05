import express from "express";
import cors from "cors";
import { notFound, errorHandler } from "./middlewares/errorHandler";
import authRoutes from "./modules/auth/auth.routes";
import categoryRoutes from "./modules/categories/category.routes";
import productRoutes from "./modules/products/product.routes";
import { uploadsDir } from "./config/paths";
import cartRoutes from "./modules/cart/cart.routes";
import addressRoutes from "./modules/addresses/address.routes";
import orderRoutes from "./modules/orders/order.routes";
import adminOrderRoutes from "./modules/orders/order.admin.routes";
import userRoutes from "./modules/users/user.routes";

const app = express();

app.use(cors());
app.use(express.json());
app.use("/uploads", express.static(uploadsDir));

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok" });
});

// feature routes will be mounted here
app.use("/api/admin/orders", adminOrderRoutes);
app.use("/api/admin/users", userRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/addresses", addressRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/products", productRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/auth", authRoutes);
app.use(notFound);
app.use(errorHandler);

export default app;
