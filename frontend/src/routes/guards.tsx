import { Navigate, Outlet, useLocation } from "react-router";
import { useAuth } from "../context/useAuth";
import { homePathFor } from "../utils/roles";
import type { Role } from "../types";

export function ProtectedRoute({ role }: { role?: Role }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <p className="p-8 text-gray-600">Loading...</p>;
  }
  if (!user) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }
  if (role && user.role !== role) {
    return <Navigate to={homePathFor(user.role)} replace />;
  }
  return <Outlet />;
}

export function GuestRoute() {
  const { user, loading } = useAuth();

  if (loading) {
    return <p className="p-8 text-gray-600">Loading...</p>;
  }
  if (user) {
    return <Navigate to={homePathFor(user.role)} replace />;
  }
  return <Outlet />;
}