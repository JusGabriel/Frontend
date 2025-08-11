import { Link, Outlet, useLocation } from 'react-router-dom';
import storeAuth from '../context/storeAuth';
import storeProfile from '../context/storeProfile';

const DashboardEmprendedor = () => {
  const location = useLocation();
  const { clearToken } = storeAuth();
  const { user } = storeProfile();
  const urlActual = location.pathname;

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-[#f0f8ff] to-[#d6e6f2] flex flex-col">
      {/* Header común */}
      <header className="bg-white shadow-lg px-6 py-4 flex justify-between items-center">
        <div className="flex items-center gap-4">
          <img
            src="https://cdn-icons-png.flaticon.com/512/1250/1250685.png"
            alt="img-client"
            className="w-14 h-14 rounded-full border-4 border-[#4a90e2]"
          />
          <div>
            <h1 className="text-xl font-bold text-[#2a3d66]">QuitoEmprende</h1>
            <p className="text-sm text-[#566a99]">Bienvenido - {user?.nombre} | Rol - {user?.rol}</p>
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

      {/* Menú específico Emprendedor */}
      <nav className="bg-[#4a90e2] text-white flex justify-center gap-6 py-3 shadow-md">
        <Link
          to="/dashboard"
          className={`px-4 py-2 rounded-full transition-all duration-200 ${
            urlActual === '/dashboard' ? 'bg-white text-[#2a3d66]' : 'hover:bg-white hover:text-[#2a3d66]'
          }`}
        >
          Perfil
        </Link>
        <Link
          to="/dashboard/crear"
          className={`px-4 py-2 rounded-full transition-all duration-200 ${
            urlActual === '/dashboard/crear' ? 'bg-white text-[#2a3d66]' : 'hover:bg-white hover:text-[#2a3d66]'
          }`}
        >
          Crear Productos
        </Link>
        <Link
          to="/dashboard/listar"
          className={`px-4 py-2 rounded-full transition-all duration-200 ${
            urlActual === '/dashboard/listar' ? 'bg-white text-[#2a3d66]' : 'hover:bg-white hover:text-[#2a3d66]'
          }`}
        >
          Mis Productos
        </Link>
        <Link
          to="/dashboard/chat"
          className={`px-4 py-2 rounded-full transition-all duration-200 ${
            urlActual === '/dashboard/chat' ? 'bg-white text-[#2a3d66]' : 'hover:bg-white hover:text-[#2a3d66]'
          }`}
        >
          Chat
        </Link>
        <Link
          to="/dashboard/notificaciones"
          className={`px-4 py-2 rounded-full transition-all duration-200 ${
            urlActual === '/dashboard/notificaciones' ? 'bg-white text-[#2a3d66]' : 'hover:bg-white hover:text-[#2a3d66]'
          }`}
        >
          Notificaciones
        </Link>
      </nav>

      {/* Contenido dinámico */}
      <main className="flex-1 overflow-y-auto p-8">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="bg-white py-4 text-center shadow-inner">
        <p className="text-sm text-[#566a99]">© 2025 QuitoEmprende. Todos los derechos reservados.</p>
      </footer>
    </div>
  );
};

export default DashboardEmprendedor;
