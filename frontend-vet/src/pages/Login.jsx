
import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import storeAuth from '../context/storeAuth';

import fondoblanco from '../assets/fondoblanco.jpg';
import panecillo from '../pages/Imagenes/panecillo.jpg';

function deriveEstadoUIFront(status, estado_Emprendedor) {
  if (status === false) return 'Suspendido';
  const e = estado_Emprendedor || 'Activo';
  return ['Advertencia1', 'Advertencia2', 'Advertencia3', 'Suspendido'].includes(e) ? e : 'Correcto';
}

const estadoMensajes = {
  'Advertencia1': 'Tu cuenta tiene una advertencia. Por favor revisa las políticas y evita futuras infracciones.',
  'Advertencia2': 'Tu cuenta tiene dos advertencias. Si reincides, podrías ser suspendido.',
  'Advertencia3': 'Tu cuenta está en advertencia grave. Estás a un paso de la suspensión.',
  'Suspendido': 'Tu cuenta está suspendida. No puedes acceder. Contacta a soporte para más información.',
};

const Login = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [estadoBanner, setEstadoBanner] = useState(null);

  const {
    token, setToken, setRol, setId,
    setEstadoUI, setEstadoInterno, setStatus,
    clearToken
  } = storeAuth();

  const navigate = useNavigate();
  const location = useLocation();
  const { register, handleSubmit, formState: { errors } } = useForm();

  useEffect(() => {
    const query = new URLSearchParams(location.search);
    const tokenFromUrl = query.get('token');
    const rolFromUrl   = query.get('rol');
    const idFromUrl    = query.get('id');
    if (tokenFromUrl && rolFromUrl && idFromUrl) {
      setToken(tokenFromUrl);
      setRol(rolFromUrl);
      setId(idFromUrl);
      navigate('/dashboard');
    }
  }, [location.search, setToken, setRol, setId, navigate]);

  useEffect(() => {
    if (token) navigate('/dashboard');
  }, [token, navigate]);

  const loginUser = async (data) => {
    setEstadoBanner(null);
    try {
      let endpoint = '';
      switch (data.role) {
        case 'admin':
          endpoint = `${import.meta.env.VITE_BACKEND_URL}/api/administradores/login`;
          break;
        case 'user':
          endpoint = `${import.meta.env.VITE_BACKEND_URL}/api/clientes/login`;
          break;
        case 'editor':
          endpoint = `${import.meta.env.VITE_BACKEND_URL}/api/emprendedores/login`;
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
      if (!contentType?.includes('application/json')) {
        throw new Error('No existen estos datos para el rol seleccionado');
      }

      const result = await response.json();

      // 🚫 Manejo de suspensión (403)
      if (!response.ok) {
        if (response.status === 403 && (result?.estadoUI === 'Suspendido' || result?.status === false)) {
          clearToken();
          setEstadoBanner({ tipo: 'Suspendido', msg: estadoMensajes['Suspendido'] });
          toast.error(result?.msg || estadoMensajes['Suspendido']);
          return;
        }
        throw new Error(result?.msg || 'Credenciales incorrectas');
      }

      // ✅ Persistir credenciales base
      const roleMap = { admin: 'Administrador', editor: 'Emprendedor', user: 'Cliente' };
      setToken(result.token);
      setRol(roleMap[data.role] || result.rol);
      setId(result._id);

      // ✅ Persistir estado
      const estadoUIResp       = result?.estadoUI ?? deriveEstadoUIFront(result?.status, result?.estado_Emprendedor);
      const estadoInternoResp  = result?.estado_Emprendedor ?? 'Activo';
      const statusResp         = typeof result?.status === 'boolean' ? result.status : true;

      setEstadoUI(estadoUIResp);
      setEstadoInterno(estadoInternoResp);
      setStatus(statusResp);

      // UX: Banner si advertencia o suspensión
      if (['Advertencia1', 'Advertencia2', 'Advertencia3', 'Suspendido'].includes(estadoUIResp)) {
        setEstadoBanner({ tipo: estadoUIResp, msg: estadoMensajes[estadoUIResp] });
      }

      if (estadoUIResp === 'Suspendido' || statusResp === false) {
        clearToken();
        return;
      }

      toast.success('Inicio de sesión exitoso');
      setTimeout(() => navigate('/dashboard'), 800);
    } catch (error) {
      toast.error(error.message || 'Ocurrió un error inesperado');
    }
  };

  const GOOGLE_CLIENT_URL      = 'https://backend-production-bd1d.up.railway.app/auth/google/cliente';
  const GOOGLE_EMPRENDEDOR_URL = 'https://backend-production-bd1d.up.railway.app/auth/google/emprendedor';

  return (
    <div style={containerStyle}>
      <ToastContainer />
      <div style={backgroundStyle} />
      <Bubbles />
      <div style={cardStyle}>
        <div style={leftPanelStyle}>
          <img
            src={panecillo}
            alt="Panecillo"
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              borderRadius: '5%',
              border: '8px solid white',
            }}
          />
        </div>
        <div style={formContainerStyle}>
          {/* Banner de advertencia/suspensión */}
          {estadoBanner && (
            <div
              className={`mb-4 p-3 rounded-lg text-center font-semibold text-base
                ${estadoBanner.tipo === 'Suspendido'
                  ? 'bg-red-100 border border-red-400 text-red-800'
                  : 'bg-yellow-100 border border-yellow-400 text-yellow-800'
                }`}
              style={{ wordBreak: 'break-word' }}
            >
              {estadoBanner.msg}
              {estadoBanner.tipo !== 'Suspendido' && (
                <div className="mt-2 text-sm">
                  <a
                    href="/Politicas_QuitoEmprende.pdf"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline text-[#AA4A44]"
                  >
                    Ver políticas de uso
                  </a>
                </div>
              )}
            </div>
          )}

          <form onSubmit={handleSubmit(loginUser)} style={formStyle}>
            <h1 style={{ fontSize: '1.8rem', fontWeight: '600', textAlign: 'center', marginBottom: '0.3rem', color: '#3B2F2F' }}>
              Bienvenido(a) de nuevo
            </h1>
            <small style={{ color: '#3B2F2F', display: 'block', textAlign: 'center', marginBottom: '1.5rem' }}>
              Por favor ingresa tus datos
            </small>
            <input
              type="email"
              placeholder="Correo electrónico"
              {...register('email', { required: 'El correo es obligatorio' })}
              style={inputStyle}
            />
            {errors.email && <p style={errorText}>{errors.email.message}</p>}

            <div style={{ position: 'relative', marginTop: '1rem' }}>
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="Contraseña"
                {...register('password', { required: 'La contraseña es obligatoria' })}
                style={{ ...inputStyle, paddingRight: '3rem' }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: 'absolute',
                  top: '50%',
                  right: '10px',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  color: '#888',
                  cursor: 'pointer',
                  fontSize: '0.85rem',
                  userSelect: 'none'
                }}
              >
                {showPassword ? 'Ocultar' : 'Mostrar'}
              </button>
            </div>
            {errors.password && <p style={errorText}>{errors.password.message}</p>}

            <select
              {...register('role', { required: 'El rol es obligatorio' })}
              style={selectStyle}
            >
              <option value="">Selecciona un rol</option>
              <option value="admin">Administrador</option>
              <option value="editor">Emprendedor</option>
              <option value="user">Cliente</option>
            </select>
            {errors.role && <p style={errorText}>{errors.role.message}</p>}

            <div style={{ textAlign: 'right', marginTop: '0.5rem' }}>
              <Link to="/forgot/id" style={{ color: '#AA4A44', fontSize: '0.9rem', textDecoration: 'underline' }}>
                ¿Olvidaste tu contraseña?
              </Link>
            </div>

            <button type="submit" style={buttonStyle}>
              Iniciar sesión
            </button>

            <div style={{ marginTop: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Link to="/" style={{ color: '#AA4A44', fontSize: '0.9rem', textDecoration: 'underline' }}>
                Regresar
              </Link>
              <Link
                to="/register"
                style={{
                  backgroundColor: '#AA4A44',
                  padding: '0.5rem 1.2rem',
                  borderRadius: '20px',
                  color: 'white',
                  fontWeight: '600',
                  textDecoration: 'none',
                  fontSize: '0.9rem',
                }}
              >
                Registrarse
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

// ...Bubbles y estilos igual que tu código...

export default Login;
``
