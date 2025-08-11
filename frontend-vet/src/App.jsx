import { BrowserRouter, Route, Routes } from 'react-router';

import { Home } from './pages/Home';
import Login from './pages/Login';
import { Register } from './pages/Register';
import { Forgot } from './pages/Forgot';
import { Confirm } from './pages/Confirm';
import { NotFound } from './pages/NotFound';

import Dashboard from './layout/Dashboard'; // Admin
import DashboardEmprendedor from './layout/Dashboard_emprendedor';
import DashboardCliente from './layout/Dashboard_cliente';

import Profile from './pages/Profile';
import List from './pages/List';
import Details from './pages/Details';
import Create from './pages/Create';
import Update from './pages/Update';
import Chat from './pages/Chat';

import Reset from './pages/Reset';
import ResetAdministrador from './pages/ResetAdministrador';
import ResetCliente from './pages/ResetCliente';
import ResetEmprendedor from './pages/ResetEmprendedor';

import PublicRoute from './routers/PublicRoute';
import ProtectedRoute from './routers/ProtectedRoute';

import { useEffect } from 'react';
import storeProfile from './context/storeProfile';
import storeAuth from './context/storeAuth';

// Componente que elige el dashboard según rol
const DashboardSelector = () => {
  const { user } = storeProfile();

  if (!user) return <div>Cargando...</div>;

  switch (user.rol?.toLowerCase()) {
    case 'administrador':
      return <Dashboard />;
    case 'emprendedor':
      return <DashboardEmprendedor />;
    case 'cliente':
      return <DashboardCliente />;
    default:
      return <div>Rol no reconocido</div>;
  }
};

function App() {
  const { profile } = storeProfile();
  const { token } = storeAuth();

  useEffect(() => {
    if (token) {
      profile();
    }
  }, [token]);

  return (
    <BrowserRouter>
      <Routes>
        {/* Rutas públicas */}
        <Route element={<PublicRoute />}>
          <Route index element={<Home />} />
          <Route path="login" element={<Login />} />
          <Route path="register" element={<Register />} />
          <Route path="forgot/:id" element={<Forgot />} />
          <Route path="confirm/:token" element={<Confirm />} />
          <Route path="reset/:token" element={<Reset />} />
          <Route path="reset/admin/:token" element={<ResetAdministrador />} />
          <Route path="reset/cliente/:token" element={<ResetCliente />} />
          <Route path="reset/emprendedor/:token" element={<ResetEmprendedor />} />
          <Route path="*" element={<NotFound />} />
        </Route>

        {/* Rutas protegidas */}
        <Route
          path="dashboard/*"
          element={
            <ProtectedRoute>
              <DashboardSelector />
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
