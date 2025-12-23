import { Link, Outlet, useLocation } from 'react-router-dom';
import storeAuth from '../context/storeAuth';
import storeProfile from '../context/storeProfile';
import politicasPdf from '../assets/Politicas_QuitoEmprende.pdf';

const Dashboard = () => {
  const location = useLocation();
  const urlActual = location.pathname;

  const { clearToken } = storeAuth();
  const { user } = storeProfile();

  /* -------------------- Menú por Rol -------------------- */
  const menuLinks = {
    Administrador: [
      { to: '/dashboard/inicio', label: 'Inicio' },
      { to: '/dashboard/listar', label: 'Listar' },
      { to: '/dashboard/chat', label: 'Chat' },
      { to: '/dashboard', label: 'Perfil' },
    ],
    Emprendedor: [
      { to: '/dashboard/inicio', label: 'Inicio' },
      { to: '/dashboard/crear', label: 'Crear' },
      { to: '/dashboard/chat', label: 'Chat' },
      { to: '/dashboard', label: 'Perfil' },
    ],
    Cliente: [
      { to: '/dashboard/inicio', label: 'Inicio' },
      { to: '/dashboard/chat', label: 'Chat' },
      { to: '/dashboard', label: 'Perfil' },
    ],
  };

  const links = menuLinks[user?.rol] || [];

  /* -------------------- Link activo -------------------- */
  const isActive = (to) => {
    if (to === '/dashboard') {
      return urlActual === '/dashboard' || urlActual === '/dashboard/';
    }
    return urlActual.startsWith(to);
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-[#F7E5D2] to-[#FCEEE3]">
      {/* ==================== HEADER ==================== */}
      <header className="bg-white shadow-md border-b border-[#E0C7B6] px-6 py-4 flex justify-between items-center">
        <div className="flex items-center gap-4">
          {/* Avatar con Cloudinary */}
          <img
            src={
              user?.foto
                ? user.foto // Cloudinary secure_url
                : 'https://cdn-icons-png.flaticon.com/512/847/847969.png'
            }
            alt="avatar"
            className="w-14 h-14 rounded-full border-4 border-[#AA4A44] object-cover"
          />

          <div>
            <h1 className="text-2xl font-extrabold text-[#AA4A44]">
              QuitoEmprende
            </h1>
            <p className="text-sm text-[#6B4F4F]">
              Bienvenido,&nbsp;
              <span className="font-semibold">
                {user?.nombre || 'Invitado'}
              </span>
              &nbsp;| Rol:&nbsp;
              <span className="capitalize font-semibold">
                {user?.rol || 'Invitado'}
              </span>
            </p>
          </div>
        </div>

        {/* Logout */}
        <button
          onClick={clearToken}
          className="bg-[#AA4A44] hover:bg-[#933834] text-white px-4 py-2 rounded-md font-semibold transition-colors"
          title="Cerrar sesión"
        >
          Salir
        </button>
      </header>

      {/* ==================== NAV ==================== */}
      <nav className="bg-[#1E1E2F] text-white shadow-md flex flex-wrap justify-center gap-4 py-3 px-2">
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

      {/* ==================== CONTENIDO ==================== */}
      <main className="flex-1 w-full overflow-auto p-4">
        <Outlet />
      </main>

      {/* ==================== FOOTER ==================== */}
      <footer className="bg-[#F3E1CE] border-t border-[#E0C7B6] py-6 text-center text-sm text-gray-700">
        <a
          href={politicasPdf}
          target="_blank"
          rel="noopener noreferrer"
          className="text-gray-700 no-underline hover:text-[#AA4A44] transition-colors cursor-pointer"
          aria-label="Ver políticas y derechos de QuitoEmprende en PDF"
        >
          © 2025 QuitoEmprende. Todos los derechos reservados.
        </a>
      </footer>
    </div>
  );
};

export default Dashboard;
