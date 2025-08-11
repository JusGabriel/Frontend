import { Link, Outlet, useLocation } from 'react-router-dom';
import storeAuth from '../context/storeAuth';
import storeProfile from '../context/storeProfile';

const DashboardCliente = () => {
  const location = useLocation();
  const { clearToken } = storeAuth();
  const { user } = storeProfile();
  const urlActual = location.pathname;

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-[#fff7e6] to-[#fff1cc] flex flex-col">
      {/* Header común */}
      <header className="bg-white shadow-lg px-6 py-4 flex justify-between items-center">
        <div className="flex items-center gap-4">
          <img
            src="https://cdn-icons-png.flaticon.com/512/1077/1077114.png"
            alt="img-client"
            className="w-14 h-14 rounded-full border-4 border-[#f4a261]"
          />
          <div>
            <h1 className="text-xl font-bold text-[#7b5e00]">QuitoEmprende</h1>
            <p className="text-sm text-[#a68500]">Bienvenido - {user?.nombre} | Rol - {user?.rol}</p>
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

      {/* Menú específico Cliente */}
      <nav className="bg-[#f4a261] text-white flex justify-center gap-6 py-3 shadow-md">
        <Link
          to="/dashboard"
          className={`px-4 py-2 rounded-full transition-all duration-200 ${
            urlActual === '/dashboard' ? 'bg-white text-[#7b5e00]' : 'hover:bg-white hover:text-[#7b5e00]'
          }`}
        >
          Perfil
        </Link>
        <Link
          to="/dashboard/emprendimientos"
          className={`px-4 py-2 rounded-full transition-all duration-200 ${
            urlActual === '/dashboard/emprendimientos' ? 'bg-white text-[#7b5e00]' : 'hover:bg-white hover:text-[#7b5e00]'
          }`}
        >
          Emprendimientos
        </Link>
        <Link
          to="/dashboard/favoritos"
          className={`px-4 py-2 rounded-full transition-all duration-200 ${
            urlActual === '/dashboard/favoritos' ? 'bg-white text-[#7b5e00]' : 'hover:bg-white hover:text-[#7b5e00]'
          }`}
        >
          Favoritos
        </Link>
        <Link
          to="/dashboard/chat"
          className={`px-4 py-2 rounded-full transition-all duration-200 ${
            urlActual === '/dashboard/chat' ? 'bg-white text-[#7b5e00]' : 'hover:bg-white hover:text-[#7b5e00]'
          }`}
        >
          Chat
        </Link>
        <Link
          to="/dashboard/notificaciones"
          className={`px-4 py-2 rounded-full transition-all duration-200 ${
            urlActual === '/dashboard/notificaciones' ? 'bg-white text-[#7b5e00]' : 'hover:bg-white hover:text-[#7b5e00]'
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
        <p className="text-sm text-[#a68500]">© 2025 QuitoEmprende. Todos los derechos reservados.</p>
      </footer>
    </div>
  );
};

export default DashboardCliente;
