import { Route, Routes } from "react-router";
import { GuestRoute, ProtectedRoute } from "./routes/guards";
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import Home from "./pages/customer/Home";
import Dashboard from "./pages/admin/Dashboard";
import NotFound from "./pages/NotFound";
import { CustomerLayout } from "./components/CustomerLayout";
import ProductDetails from "./pages/customer/ProductDetails";
import Cart from "./pages/customer/Cart";

export default function App() {
  return (
    <Routes>
      <Route element={<CustomerLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/products/:id" element={<ProductDetails />} />
      </Route>

      <Route element={<GuestRoute />}>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
      </Route>

      <Route element={<ProtectedRoute role="ADMIN" />}>
        <Route path="/admin" element={<Dashboard />} />
      </Route>

      <Route element={<ProtectedRoute role="CUSTOMER" />}>
        <Route element={<CustomerLayout />}>
          <Route path="/cart" element={<Cart />} />
        </Route>
      </Route>

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
