import React from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import storeAuth from '../context/storeAuth';
import storeProfile from '../context/storeProfile';

const Dashboard = () => {
  const location = useLocation();
  const urlActual = location.pathname;
  const { clearToken } = storeAuth();
  const { user } = storeProfile();

  // Menú según rol
  // Los ids coinciden con las rutas hijas en App.jsx
  const menusPorRol = {
    administrador: [
      { id: 'profile', label: 'Perfil', to: '/dashboard' },
      { id: 'listar', label: 'Listar', to: '/dashboard/listar' },
      { id: 'crear', label: 'Crear', to: '/dashboard/crear' },
      { id: 'chat', label: 'Chat', to: '/dashboard/chat' },
    ],
    emprendedor: [
      { id: 'profile', label: 'Perfil', to: '/dashboard' },
      { id: 'listar', label: 'Listar', to: '/dashboard/listar' },
      { id: 'crear', label: 'Crear', to: '/dashboard/crear' },
      { id: 'chat', label: 'Chat', to: '/dashboard/chat' },
      // Puedes agregar más enlaces específicos aquí si necesitas
    ],
    cliente: [
      { id: 'profile', label: 'Perfil', to: '/dashboard' },
      { id: 'chat', label: 'Chat', to: '/dashboard/chat' },
      // Clientes no tienen 'listar' ni 'crear' por ejemplo
    ],
  };

  // Obtenemos menú según rol o vacío si no definido
  const menuItems = menusPorRol[user?.rol?.toLowerCase()] || [];

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-[#f9f5f0] to-[#fceee3] flex flex-col">

      {/* Header igual que Home */}
      <header className="sticky top-0 z-50 bg-[#1E1E2F] border-b border-[#F7E5D2] shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <h2 className="text-2xl font-extrabold text-[#AA4A44]">QuitoEmprende</h2>
          <nav className="flex items-center gap-6">
            <span className="text-sm md:text-base font-semibold text-gray-300 mr-6">
              Bienvenido, <span className="text-[#AA4A44]">{user?.nombre}</span> | Rol: <span className="text-[#AA4A44]">{user?.rol}</span>
            </span>
            {menuItems.map((item) => (
              <Link
                key={item.id}
                to={item.to}
                className={`px-4 py-2 rounded-full transition-all duration-200 font-semibold ${
                  urlActual === item.to
                    ? 'bg-[#AA4A44] text-white'
                    : 'text-gray-300 hover:bg-[#AA4A44] hover:text-white'
                }`}
              >
                {item.label}
              </Link>
            ))}
            <button
              onClick={() => clearToken()}
              className="bg-red-600 text-white px-4 py-2 rounded-full hover:bg-red-800 transition ml-6 font-semibold"
            >
              Salir
            </button>
          </nav>
        </div>
      </header>

      {/* Contenido dinámico */}
      <main className="flex-1 overflow-y-auto p-8 max-w-7xl mx-auto w-full">
        <Outlet />
      </main>

      {/* Footer igual que Home */}
      <footer className="bg-[#F3E1CE] py-6 text-center text-sm text-gray-700 mt-10 border-t border-[#E0C7B6]">
        © 2025 QuitoEmprende. Todos los derechos reservados.
      </footer>
    </div>
  );
};

export default Dashboard;
