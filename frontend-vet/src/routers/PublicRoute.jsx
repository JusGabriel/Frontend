import { Navigate, Outlet, useLocation } from "react-router-dom";
import storeAuth from "../context/storeAuth";

const PublicRoute = () => {
  const token = storeAuth((state) => state.token);
  const location = useLocation();

  // 🔥 Detectar rutas de SLUG (ej: /panaderia-poli)
  const isSlugRoute = /^\/[^/]+$/.test(location.pathname);

  // 🔥 Si es una ruta por SLUG → SIEMPRE permitir (aunque esté logueado)
  if (isSlugRoute) {
    return <Outlet />;
  }

  // Para login, register, forgot, etc.
  if (token) {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
};

export default PublicRoute;
