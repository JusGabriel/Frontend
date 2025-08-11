import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import storeAuth from '../context/storeAuth';

const Login = () => {
  const [showPassword, setShowPassword] = useState(false);
  const { token, setToken, setRol, setId } = storeAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { register, handleSubmit, formState: { errors } } = useForm();

  // ✅ Capturar datos desde Google OAuth por la URL
  useEffect(() => {
    const query = new URLSearchParams(location.search);
    const tokenFromUrl = query.get('token');
    const rolFromUrl = query.get('rol');
    const idFromUrl = query.get('id');

    if (tokenFromUrl && rolFromUrl && idFromUrl) {
      setToken(tokenFromUrl);
      setRol(rolFromUrl);
      setId(idFromUrl);
      navigate('/dashboard');
    }
  }, [location.search, setToken, setRol, setId, navigate]);

  // ✅ Redirigir si ya tiene token
  useEffect(() => {
    if (token) navigate('/dashboard');
  }, [token, navigate]);

  const loginUser = async (data) => {
    try {
      let endpoint = '';
      switch (data.role) {
        case 'admin':
          endpoint = ${import.meta.env.VITE_BACKEND_URL}/api/administradores/login;
          break;
        case 'user':
          endpoint = ${import.meta.env.VITE_BACKEND_URL}/api/clientes/login;
          break;
        case 'editor':
          endpoint = ${import.meta.env.VITE_BACKEND_URL}/api/emprendedores/login;
          break;
        default:
          toast.error('Selecciona un rol válido');
          return;
      }

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: data.email, password: data.password })
      });

      const contentType = response.headers.get('content-type');
      let result;
      if (contentType?.includes('application/json')) {
        result = await response.json();
      } else {
        throw new Error('No existen estos datos para el rol seleccionado');
      }

      if (!response.ok) throw new Error(result.msg || 'Credenciales incorrectas');

      const roleMap = {
        admin: 'Administrador',
        editor: 'Emprendedor',
        user: 'Cliente'
      };

      setToken(result.token);
      setRol(roleMap[data.role] || result.rol);
      setId(result._id);

      toast.success('Inicio de sesión exitoso');
      setTimeout(() => navigate('/dashboard'), 1500);

    } catch (error) {
      toast.error(error.message || 'Ocurrió un error inesperado');
    }
  };

  const GOOGLE_CLIENT_URL = 'https://backend-production-bd1d.up.railway.app/auth/google/cliente';
  const GOOGLE_EMPRENDEDOR_URL = 'https://backend-production-bd1d.up.railway.app/auth/google/emprendedor';

  return (
    <div className="flex flex-col sm:flex-row h-screen">
      <ToastContainer />
      <div className="w-full sm:w-1/2 h-1/3 sm:h-screen bg-[url('/public/images/doglogin.jpg')] bg-no-repeat bg-cover bg-center sm:block hidden" />
      <div className="w-full sm:w-1/2 h-screen bg-white flex justify-center items-center">
        <div className="md:w-4/5 sm:w-full">
          <h1 className="text-3xl font-semibold mb-2 text-center uppercase text-gray-500">Bienvenido(a) de nuevo</h1>
          <small className="text-gray-400 block my-4 text-sm">Por favor ingresa tus datos</small>

          <form onSubmit={handleSubmit(loginUser)}>
            <div className="mb-3">
              <label className="mb-2 block text-sm font-semibold">Correo electrónico</label>
              <input
                type="email"
                {...register('email', { required: 'El correo es obligatorio' })}
                className="block w-full rounded-md border border-gray-300 py-1 px-2 text-gray-500 focus:border-purple-700 focus:outline-none focus:ring-1 focus:ring-purple-700"
                placeholder="Ingresa tu correo"
              />
              {errors.email && <p className="text-red-800 text-sm">{errors.email.message}</p>}
            </div>

            <div className="mb-3 relative">
              <label className="mb-2 block text-sm font-semibold">Contraseña</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  {...register('password', { required: 'La contraseña es obligatoria' })}
                  className="block w-full rounded-md border border-gray-300 py-1 px-1.5 text-gray-500 pr-10 focus:border-purple-700 focus:outline-none focus:ring-1 focus:ring-purple-700"
                  placeholder="********************"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute top-2 right-3 text-gray-500 hover:text-gray-700"
                >
                  {showPassword ? '🙈' : '👁️'}
                </button>
              </div>
              {errors.password && <p className="text-red-800 text-sm">{errors.password.message}</p>}
            </div>

            <div className="mb-3">
              <label htmlFor="role" className="mb-2 block text-sm font-semibold">Selecciona tu rol</label>
              <select
                id="role"
                {...register('role', { required: 'El rol es obligatorio' })}
                className="block w-full rounded-md border border-gray-300 py-1 px-2 text-gray-500 focus:border-purple-700 focus:outline-none focus:ring-1 focus:ring-purple-700"
              >
                <option value="">Selecciona un rol</option>
                <option value="admin">Administrador</option>
                <option value="editor">Emprendedor</option>
                <option value="user">Cliente</option>
              </select>
              {errors.role && <p className="text-red-800 text-sm">{errors.role.message}</p>}
            </div>

            <div className="my-4">
              <button type="submit" className="py-2 w-full bg-gray-500 text-white rounded-xl hover:bg-gray-900">
                Iniciar sesión
              </button>
            </div>
          </form>

          <div className="mt-6 grid grid-cols-3 items-center text-gray-400">
            <hr className="border-gray-400" />
            <p className="text-center text-sm">O</p>
            <hr className="border-gray-400" />
          </div>

          <div className="flex flex-col sm:flex-row gap-3 mt-4">
            <a href={GOOGLE_CLIENT_URL} className="bg-white border py-2 w-full rounded-xl flex justify-center items-center text-sm hover:bg-red-600 hover:text-white">
              <img className="w-5 mr-2" src="https://cdn-icons-png.flaticon.com/512/281/281764.png" alt="Google" />
              Ingresar con Google como Cliente
            </a>

            <a href={GOOGLE_EMPRENDEDOR_URL} className="bg-white border py-2 w-full rounded-xl flex justify-center items-center text-sm hover:bg-blue-600 hover:text-white">
              <img className="w-5 mr-2" src="https://cdn-icons-png.flaticon.com/512/281/281764.png" alt="Google" />
              Ingresar con Google como Emprendedor
            </a>
          </div>

          <div className="mt-5 text-xs border-b-2 py-4">
            <Link to="/forgot/id" className="underline text-sm text-gray-400 hover:text-gray-900">¿Olvidaste tu contraseña?</Link>
          </div>

          <div className="mt-3 text-sm flex justify-between items-center">
            <Link to="/" className="underline text-sm text-gray-400 hover:text-gray-900">Regresar</Link>
            <Link to="/register" className="py-2 px-5 bg-gray-600 text-white rounded-xl hover:bg-gray-900">Registrarse</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
