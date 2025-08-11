import { Link, Outlet, useLocation } from 'react-router-dom';
import storeAuth from '../context/storeAuth';
import storeProfile from '../context/storeProfile';

const Dashboard = () => {
  const location = useLocation();
  const { clearToken } = storeAuth();
  const { user } = storeProfile();
  const urlActual = location.pathname;

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-[#f9f5f0] to-[#fceee3] flex flex-col">
      {/* Header común */}
      <header className="bg-white shadow-lg px-6 py-4 flex justify-between items-center">
        <div className="flex items-center gap-4">
          <img
            src="https://cdn-icons-png.flaticon.com/512/2138/2138508.png"
            alt="img-client"
            className="w-14 h-14 rounded-full border-4 border-[#AA4A44]"
          />
          <div>
            <h1 className="text-xl font-bold text-[#3B2F2F]">QuitoEmprende</h1>
            <p className="text-sm text-[#6B4F4F]">Bienvenido - {user?.nombre} | Rol - {user?.rol}</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <button
            onClick={() => clearToken()}
            className="bg-red-500 text-white px-4 py-2 rounded-full hover:bg-red-700 transition"
          >
            Salir
          </button>
        </div>
      </header>

      {/* Menú específico Administrador */}
      <nav className="bg-[#1E1E2F] text-white flex justify-center gap-6 py-3 shadow-md">
        <Link
          to="/dashboard"
          className={`px-4 py-2 rounded-full transition-all duration-200 ${
            urlActual === '/dashboard' ? 'bg-white text-[#3B2F2F]' : 'hover:bg-white hover:text-[#3B2F2F]'
          }`}
        >
          Perfil
        </Link>
        <Link
          to="/dashboard/listar"
          className={`px-4 py-2 rounded-full transition-all duration-200 ${
            urlActual === '/dashboard/listar' ? 'bg-white text-[#3B2F2F]' : 'hover:bg-white hover:text-[#3B2F2F]'
          }`}
        >
          Listar
        </Link>
        <Link
          to="/dashboard/crear"
          className={`px-4 py-2 rounded-full transition-all duration-200 ${
            urlActual === '/dashboard/crear' ? 'bg-white text-[#3B2F2F]' : 'hover:bg-white hover:text-[#3B2F2F]'
          }`}
        >
          Crear
        </Link>
        <Link
          to="/dashboard/chat"
          className={`px-4 py-2 rounded-full transition-all duration-200 ${
            urlActual === '/dashboard/chat' ? 'bg-white text-[#3B2F2F]' : 'hover:bg-white hover:text-[#3B2F2F]'
          }`}
        >
          Chat
        </Link>
      </nav>

      {/* Contenido dinámico */}
      <main className="flex-1 overflow-y-auto p-8">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="bg-white py-4 text-center shadow-inner">
        <p className="text-sm text-[#6B4F4F]">© 2025 QuitoEmprende. Todos los derechos reservados.</p>
      </footer>
    </div>
  );
};

export default Dashboard;
