import { useEffect } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import storeAuth from '../context/storeAuth';
import storeProfile from '../context/storeProfile';

const Dashboard = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const urlActual = location.pathname;

  const { setToken, setRol, clearToken } = storeAuth();
  const { user, setUser, clearUser } = storeProfile();

  useEffect(() => {
    const verificarSesion = async () => {
      try {
        const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/status`, {
          credentials: 'include',
        });
        const data = await res.json();

        if (data.usuario) {
          setUser(data.usuario);
          setToken(data.token);
          setRol(data.rol);
        } else {
          handleLogout();
        }
      } catch (error) {
        console.error("Error al verificar la sesión", error);
        handleLogout();
      }
    };

    verificarSesion();
  }, []);

  const handleLogout = () => {
    clearToken();
    clearUser();
    navigate('/login');
  };

  return (
    <div className="md:flex md:min-h-screen">
      {/* Menú lateral */}
      <div className="md:w-1/5 bg-gray-800 px-5 py-4">
        <h2 className="text-[1.2rem] font-black text-center text-slate-200">QuitoEmprende</h2>
        <img src="https://cdn-icons-png.flaticon.com/512/2138/2138508.png" alt="img-client"
          className="m-auto mt-8 p-1 border-2 border-slate-500 rounded-full" width={120} height={120} />
        <p className="text-slate-400 text-center my-4 text-sm">Bienvenido - {user?.nombre}</p>
        <p className="text-slate-400 text-center my-4 text-sm">Rol - {user?.rol}</p>

        <hr className="mt-5 border-slate-500" />
        <ul className="mt-5">
          <li className="text-center">
            <Link to="/dashboard" className={`${urlActual === '/dashboard' ? 'text-slate-200 bg-gray-900 px-3 py-2 rounded-md' : 'text-slate-600'} text-xl block mt-2`}>
              Perfil
            </Link>
          </li>
          <li className="text-center">
            <Link to="/dashboard/listar" className={`${urlActual === '/dashboard/listar' ? 'text-slate-200 bg-gray-900 px-3 py-2 rounded-md' : 'text-slate-600'} text-xl block mt-2`}>
              Listar
            </Link>
          </li>
          <li className="text-center">
            <Link to="/dashboard/crear" className={`${urlActual === '/dashboard/crear' ? 'text-slate-200 bg-gray-900 px-3 py-2 rounded-md' : 'text-slate-600'} text-xl block mt-2`}>
              Crear
            </Link>
          </li>
          <li className="text-center">
            <Link to="/dashboard/chat" className={`${urlActual === '/dashboard/chat' ? 'text-slate-200 bg-gray-900 px-3 py-2 rounded-md' : 'text-slate-600'} text-xl block mt-2`}>
              Chat
            </Link>
          </li>
        </ul>
      </div>

      {/* Contenido principal */}
      <div className="flex-1 flex flex-col justify-between h-screen bg-gray-100">
        <div className="bg-gray-800 py-2 flex md:justify-end items-center gap-5 justify-center">
          <div className="text-md font-semibold text-slate-100">Usuario - {user?.nombre}</div>
          <img src="https://cdn-icons-png.flaticon.com/512/4715/4715329.png" alt="img-client"
            className="border-2 border-green-600 rounded-full" width={50} height={50} />
          <button className="bg-red-800 hover:bg-red-900 text-white px-4 py-1 rounded-lg" onClick={handleLogout}>
            Salir
          </button>
        </div>

        <div className="overflow-y-scroll p-8">
          <Outlet />
        </div>

        <div className="bg-gray-800 h-12">
          <p className="text-center text-slate-100 leading-[2.9rem] underline">Todos los derechos reservados</p>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
