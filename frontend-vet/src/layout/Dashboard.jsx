import { Link, Outlet, useLocation } from 'react-router';
import storeAuth from '../context/storeAuth';
import storeProfile from '../context/storeProfile';

const Dashboard = () => {
  const location = useLocation();
  const urlActual = location.pathname;
  const { clearToken } = storeAuth();
  const { user } = storeProfile();

  // Links basados en rutas definidas en App.jsx
  // Puedes ajustar según rol si quieres
  const menuLinks = {
    Administrador: [
      { to: '/dashboard', label: 'Perfil' },
      { to: '/dashboard/listar', label: 'Listar' },
      { to: '/dashboard/crear', label: 'Crear' },
      { to: '/dashboard/chat', label: 'Chat' },
    ],
    Emprendedor: [
      { to: '/dashboard', label: 'Perfil' },
      { to: '/dashboard/listar', label: 'Listar' },
      { to: '/dashboard/crear', label: 'Crear' },
      { to: '/dashboard/chat', label: 'Chat' },
    ],
    Cliente: [
      { to: '/dashboard', label: 'Perfil' },
      { to: '/dashboard/listar', label: 'Listar' },
      { to: '/dashboard/chat', label: 'Chat' },
    ],
  };

  // Obtener menú para el rol actual o vacío
  const links = menuLinks[user?.rol] || [];

  // Función para comparar la url actual con el link activo
  // A veces la url puede tener params, entonces usamos startsWith para resaltar el menu
  const isActive = (to) => {
    if (to === '/dashboard') {
      return urlActual === '/dashboard' || urlActual === '/dashboard/';
    }
    return urlActual.startsWith(to);
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-[#F7E5D2] to-[#FCEEE3]">

      {/* Header */}
      <header className="bg-white shadow-md border-b border-[#E0C7B6] px-6 py-4 flex justify-between items-center">
        <div className="flex items-center gap-4">
          <img
            src="https://cdn-icons-png.flaticon.com/512/2138/2138508.png"
            alt="logo"
            className="w-14 h-14 rounded-full border-4 border-[#AA4A44]"
          />
          <div>
            <h1 className="text-2xl font-extrabold text-[#AA4A44]">QuitoEmprende</h1>
            <p className="text-sm text-[#6B4F4F]">
              Bienvenido, <span className="font-semibold">{user?.nombre || 'Invitado'}</span> | Rol: <span className="capitalize">{user?.rol || 'Invitado'}</span>
            </p>
          </div>
        </div>
        <button
          onClick={() => clearToken()}
          className="bg-[#AA4A44] hover:bg-[#933834] text-white px-4 py-2 rounded-md font-semibold transition-colors"
          title="Cerrar sesión"
        >
          Salir
        </button>
      </header>

      {/* Navegación horizontal (menú) */}
      <nav className="bg-[#1E1E2F] text-white shadow-md flex justify-center gap-6 py-3">
        {links.map(({ to, label }) => (
          <Link
            key={to}
            to={to}
            className={`px-4 py-2 rounded-md font-semibold transition-colors duration-200 ${
              isActive(to)
                ? 'bg-[#AA4A44] text-white shadow-md'
                : 'hover:bg-[#AA4A44] hover:text-white'
            }`}
          >
            {label}
          </Link>
        ))}
      </nav>

      {/* Contenido dinámico */}
      <main className="flex-1 overflow-auto p-8 max-w-7xl mx-auto w-full">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="bg-[#F3E1CE] border-t border-[#E0C7B6] py-6 text-center text-sm text-gray-700">
        © 2025 QuitoEmprende. Todos los derechos reservados.
      </footer>
    </div>
  );
};

export default Dashboard;

