import { Navigate, Outlet } from "react-router-dom";
import { getUserInfo } from "../services/authService";

export default function RoleRoute({ allowedRoles }) {
  const { roles } = getUserInfo();

  // Si no hay roles guardados o no coincide, redirige a Home
  const hasAccess = roles?.some((r) => allowedRoles.includes(r));

  return hasAccess ? <Outlet /> : <Navigate to="/home" replace />;
}
