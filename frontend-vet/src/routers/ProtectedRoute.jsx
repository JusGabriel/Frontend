import { Navigate } from "react-router"
import storeAuth from "../context/storeAuth"
import storeProfile from "../context/storeProfile"

const ProtectedRoute = ({ children, allowedRoles }) => {
  const token = storeAuth(state => state.token)
  const user = storeProfile(state => state.user)

  if (!token) return <Navigate to="/login" replace />

  // Si allowedRoles existe, verificar que el rol esté permitido
  if (allowedRoles && !allowedRoles.includes(user?.rol)) {
    // Aquí podrías redirigir a una página "No autorizado" o al dashboard
    return <Navigate to="/dashboard" replace />
  }

  return children
}

export default ProtectedRoute
