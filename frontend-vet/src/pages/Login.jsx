import { useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import storeAuth from '../context/storeAuth';

const Login = () => {
  const { setToken, setRol, token } = storeAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Detectar token y rol desde URL luego de Google OAuth
  useEffect(() => {
    const query = new URLSearchParams(window.location.search); // importante usar window para captar en redirección
    const tokenFromUrl = query.get('token');
    const rolFromUrl = query.get('rol');

    if (tokenFromUrl && rolFromUrl) {
      setToken(tokenFromUrl);
      setRol(rolFromUrl);
      navigate('/dashboard');
    }
  }, []);

  // Si ya está autenticado, redirigir automáticamente
  useEffect(() => {
    if (token) {
      navigate('/dashboard');
    }
  }, [token]);

  const GOOGLE_CLIENT_URL = 'https://backend-production-bd1d.up.railway.app/auth/google/cliente';
  const GOOGLE_EMPRENDEDOR_URL = 'https://backend-production-bd1d.up.railway.app/auth/google/emprendedor';

  return (
    <div className="flex flex-col sm:flex-row h-screen">
      <ToastContainer />
      
      <div className="w-full sm:w-1/2 h-1/3 sm:h-screen bg-[url('/public/images/doglogin.jpg')] bg-no-repeat bg-cover bg-center sm:block hidden" />
      
      <div className="w-full sm:w-1/2 h-screen bg-white flex justify-center items-center">
        <div className="md:w-4/5 sm:w-full">
          <h1 className="text-3xl font-semibold mb-4 text-center uppercase text-gray-500">Inicio de Sesión</h1>
          <p className="text-center text-gray-400 mb-6 text-sm">Selecciona una forma de ingresar:</p>

          <div className="flex flex-col sm:flex-row gap-3">
            <a
              href={GOOGLE_CLIENT_URL}
              className="bg-white border py-2 w-full rounded-xl flex justify-center items-center text-sm hover:scale-105 duration-300 hover:bg-red-600 hover:text-white"
            >
              <img className="w-5 mr-2" src="https://cdn-icons-png.flaticon.com/512/281/281764.png" alt="Google icon" />
              Ingresar con Google como Cliente
            </a>

            <a
              href={GOOGLE_EMPRENDEDOR_URL}
              className="bg-white border py-2 w-full rounded-xl flex justify-center items-center text-sm hover:scale-105 duration-300 hover:bg-blue-600 hover:text-white"
            >
              <img className="w-5 mr-2" src="https://cdn-icons-png.flaticon.com/512/281/281764.png" alt="Google icon" />
              Ingresar con Google como Emprendedor
            </a>
          </div>

          <div className="mt-6 text-sm flex justify-between items-center">
            <Link to="/" className="underline text-sm text-gray-400 hover:text-gray-900">Regresar</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
