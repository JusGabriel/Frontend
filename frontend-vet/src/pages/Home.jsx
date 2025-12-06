import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';

// IMÁGENES (usa tus assets existentes)
import fondoblanco from '../assets/fondoblanco.jpg';
import heroImage from '../assets/QuitoHome.jpg';

// ---------- COMPONENTES AUXILIARES ----------
const Header = () => {
  return (
    <header className="sticky top-0 z-50 bg-[#1E1E2F] border-b border-[#F7E5D2] shadow-sm">
      <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
        <h2 className="text-2xl font-extrabold text-[#AA4A44]">QuitoEmprende</h2>

        <nav className="flex items-center gap-4">
          <Link
            to="/login?rol=cliente"
            className="inline-block bg-[#AA4A44] text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-[#933834] transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#AA4A44]"
            aria-label="Abrir formulario de inicio de sesión"
          >
            Iniciar sesión
          </Link>
        </nav>
      </div>
    </header>
  );
};

const Footer = () => (
  <footer className="bg-[#F3E1CE] py-6 text-center text-sm text-gray-700 mt-10 border-t border-[#E0C7B6]">
    © 2025 QuitoEmprende. Todos los derechos reservados.
  </footer>
);

// Iconos inline para que no dependas de librerías externas
const IconUser = () => (
  <svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
    <path d="M12 12c2.761 0 5-2.239 5-5s-2.239-5-5-5-5 2.239-5 5 2.239 5 5 5z" stroke="#AA4A44" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M20 21a8 8 0 10-16 0" stroke="#AA4A44" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const IconStore = () => (
  <svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
    <path d="M3 9l1-3h16l1 3" stroke="#AA4A44" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M5 9v8a2 2 0 002 2h10a2 2 0 002-2V9" stroke="#AA4A44" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M8 12h.01M12 12h.01M16 12h.01" stroke="#AA4A44" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

// Card que reutilizamos para roles
const RoleCard = ({ title, subtitle, features = [], to, variant = 'primary', icon }) => {
  return (
    <div className="bg-[#F7E5D2] border border-[#E0C7B6] rounded-2xl p-6 shadow-sm hover:shadow-md transition-all focus-within:ring-2 focus-within:ring-[#AA4A44]" tabIndex={0}>
      <div className="flex items-start gap-4">
        <div className="flex-none">{icon}</div>
        <div className="flex-1">
          <h3 className="text-lg font-bold text-[#AA4A44]">{title}</h3>
          <p className="text-gray-700 mt-1">{subtitle}</p>

          {features.length > 0 && (
            <ul className="mt-3 space-y-1 text-sm text-gray-600">
              {features.map((f, i) => (
                <li key={i} className="flex items-center gap-2">
                  <span className="inline-block w-2 h-2 rounded-full bg-[#AA4A44] mr-2" aria-hidden />
                  {f}
                </li>
              ))}
            </ul>
          )}

          <div className="mt-4 flex flex-wrap gap-3">
            <Link
              to={to}
              className={`inline-block px-4 py-2 rounded-md text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#AA4A44] ${
                variant === 'primary'
                  ? 'bg-[#AA4A44] text-white hover:bg-[#933834]'
                  : 'bg-white text-[#AA4A44] border border-[#AA4A44] hover:bg-white/90'
              }`}
            >
              {title.includes('Cliente') ? 'Iniciar como Cliente' : 'Iniciar como Emprendedor'}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

// ---------------- HOME ----------------
export const Home = () => {
  const [emprendimientos, setEmprendimientos] = useState([]);
  const [productos, setProductos] = useState([]);
  const [productoSeleccionado, setProductoSeleccionado] = useState(null);
  const [emprendimientoSeleccionado, setEmprendimientoSeleccionado] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchEmprendimientos = async () => {
      try {
        const res = await fetch('https://backend-production-bd1d.up.railway.app/api/emprendimientos/publicos');
        const data = await res.json();
        setEmprendimientos(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error('Error al cargar emprendimientos:', error);
      }
    };

    fetchEmprendimientos();
  }, []);

  useEffect(() => {
    const fetchProductos = async () => {
      try {
        const res = await fetch('https://backend-production-bd1d.up.railway.app/api/productos/todos');
        const data = await res.json();
        // Si el backend devuelve un objeto con {productos: []} o directamente array, normalizamos:
        const productosArray = Array.isArray(data) ? data : (Array.isArray(data?.productos) ? data.productos : []);
        setProductos(productosArray);
      } catch (error) {
        console.error('Error al cargar productos:', error);
      }
    };

    fetchProductos();
  }, []);

  const buildPublicUrl = (emp) => {
    const slug = emp?.slug || emp?.nombreComercial;
    return `/${encodeURIComponent(slug)}`;
  };

  const nombreCompletoEmprendedor = (emp) => {
    const e = emp?.emprendedor;
    if (!e) return '—';
    const nombre = e.nombre ?? e.nombres ?? '';
    const apellido = e.apellido ?? e.apellidos ?? '';
    return `${nombre} ${apellido}`.trim() || '—';
  };

  return (
    <>
      <Header />

      {/* ================== SECCIÓN TIPOS DE USUARIO (MEJORADA) ================== */}
      <section className="bg-white py-12 px-6 border-b border-[#E0C7B6]">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            <h2 className="text-3xl font-extrabold text-[#AA4A44] mb-2">¿Cómo deseas usar QuitoEmprende?</h2>
            <p className="text-gray-700 max-w-2xl mx-auto mb-8">Elige la opción que mejor se adapte a tus necesidades.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <RoleCard
              title="Iniciar sesión como Cliente"
              subtitle="Explora productos reales, guarda favoritos y contacta directamente con emprendedores."
              features={[
                'Buscar y filtrar productos',
                'Favoritos y chat con emprendedores'
              ]}
              to="/login?rol=cliente"
              variant="primary"
              icon={<IconUser />}
            />

            <RoleCard
              title="Iniciar sesión como Emprendedor"
              subtitle="Publica productos, crea tu página y gestiona pedidos y promociones."
              features={[
                'Página personalizada para tu emprendimiento',
                'Gestión de productos y stock',
                'Herramientas de promoción sencillas'
              ]}
              to="/login?rol=emprendedor"
              variant="primary"
              icon={<IconStore />}
            />
          </div>
        </div>
      </section>

      {/* HERO (ligera mejora) */}
      <main className="py-20 px-6 bg-[#F7E5D2] text-gray-900">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center gap-10">
          <div className="flex-1 text-center md:text-left">
            <h1 className="font-extrabold uppercase text-4xl md:text-5xl text-[#AA4A44] mb-4">Conecta, vende y crece</h1>
            <p className="text-xl md:text-2xl mb-6 text-gray-800">QuitoEmprende: Tu espacio digital</p>
            <p className="max-w-2xl text-gray-700 mx-auto md:mx-0">Un lugar donde los emprendedores promocionan productos y reciben su propia página personalizada.</p>

            <div className="mt-6 flex flex-wrap gap-3 justify-center md:justify-start">
              <Link to="/login?rol=cliente" className="inline-block bg-[#AA4A44] text-white px-5 py-2 rounded-md text-sm font-semibold hover:bg-[#933834] transition-colors">Iniciar como Cliente</Link>
              <Link to="/login?rol=emprendedor" className="inline-block bg-white text-[#AA4A44] px-5 py-2 rounded-md text-sm font-semibold border border-[#AA4A44] hover:bg-white/90">Iniciar como Emprendedor</Link>
            </div>
          </div>

          <div className="flex-1 flex justify-center md:justify-end">
            <img src={heroImage} alt="Hero" className="w-full max-w-xl rounded-[15px] shadow-xl object-cover border-2 border-[#AA4A44]" />
          </div>
        </div>
      </main>

      {/* Línea */}
      <div className="max-w-7xl mx-auto my-6 h-[3px] bg-gradient-to-r from-[#AA4A44] via-transparent to-[#AA4A44]" />

      {/* ---------------- PRODUCTOS (con botón Contactar + Emprendimiento/Emprendedor) ---------------- */}
      <section className="py-10 px-6 bg-white text-gray-800">
        <div className="max-w-7xl mx-auto flex flex-col items-center">
          <h2 className="text-3xl font-bold text-[#AA4A44] text-center mb-8">Productos Destacados</h2>

          {productos.length === 0 ? (
            <p className="text-gray-600">Cargando productos...</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8 w-full">
              {productos.map((producto) => {
                const empr = producto.emprendimiento ?? {};
                const dueño = empr?.emprendedor ?? null;

                return (
                  <article
                    key={producto._id}
                    className="bg-white border border-[#E0C7B6] rounded-xl p-4 shadow hover:shadow-lg transition-all cursor-pointer"
                    onClick={() => setProductoSeleccionado(producto)}
                    role="button"
                    tabIndex={0}
                  >
                    <img src={producto.imagen} alt={producto.nombre} className="w-full h-48 object-cover rounded-lg mb-4" />

                    {/* Nombre */}
                    <h3 className="font-semibold text-lg text-[#AA4A44]">{producto.nombre}</h3>

                    {/* Descripción */}
                    <p className="text-sm text-gray-600 mt-1 line-clamp-2">{producto.descripcion}</p>

                    {/* Precio */}
                    <p className="mt-3 text-lg font-bold text-[#28a745]">${producto.precio}</p>

                    {/* Stock */}
                    <p className="text-sm font-semibold text-gray-700 mt-1">Stock: {producto.stock ?? '—'}</p>

                    {/* Emprendimiento */}
                    <p className="text-sm text-gray-600 mt-1"><strong>Emprendimiento:</strong> {empr?.nombreComercial ?? '—'}</p>

                    {/* Emprendedor */}
                    <p className="text-sm text-gray-600 mt-1"><strong>Emprendedor:</strong> {dueño ? `${dueño.nombre ?? ''} ${dueño.apellido ?? ''}`.trim() || '—' : '—'}</p>

                    <div className="mt-3">
                      <button
                        onClick={(e) => { e.stopPropagation(); navigate('/login?rol=cliente'); }}
                        className="w-full mt-2 bg-[#AA4A44] text-white py-2 rounded-md text-sm hover:bg-[#933834] transition-colors"
                        aria-label={`Contactar ${producto.nombre}`}
                      >
                        Contactar
                      </button>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* Línea */}
      <div className="max-w-7xl mx-auto my-6 h-[3px] bg-gradient-to-r from-[#AA4A44] via-transparent to-[#AA4A44]" />

      {/* ---------------- EMPRENDIMIENTOS EN VERTICAL ---------------- */}
      <section className="py-16 px-4 text-gray-800" style={{ backgroundImage: `url(${fondoblanco})`, backgroundSize: 'cover', backgroundPosition: 'center' }}>
        <div className="max-w-7xl mx-auto flex flex-col items-center">
          <h2 className="text-3xl font-bold text-[#AA4A44] text-center mb-8">Explora Emprendimientos</h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8 w-full">
            {emprendimientos.map((emp) => (
              <div
                key={emp._id}
                className="bg-white rounded-2xl shadow-md border border-[#E0C7B6] p-5 hover:shadow-lg transition-all cursor-pointer"
                onClick={() => navigate(buildPublicUrl(emp))}
              >
                <img src={emp.logo} alt={emp.nombreComercial} className="w-full h-40 object-cover rounded-lg mb-3" />

                <h3 className="text-lg font-semibold text-[#AA4A44]">{emp.nombreComercial}</h3>

                <p className="text-sm text-gray-700 font-semibold mt-1">{nombreCompletoEmprendedor(emp)}</p>

                <p className="text-sm text-gray-600 mt-1 line-clamp-2">{emp.descripcion}</p>

                <p className="text-xs text-gray-500 mt-2">{emp.ubicacion?.ciudad} - {emp.ubicacion?.direccion}</p>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setEmprendimientoSeleccionado(emp);
                  }}
                  className="mt-3 bg-[#AA4A44] text-white w-full py-2 rounded-md text-sm hover:bg-[#933834] transition-colors"
                >
                  Ver detalles
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ---------------- MODAL PRODUCTO ---------------- */}
      {productoSeleccionado && (
        <div
          className="fixed inset-0 bg-black/30 backdrop-blur-md flex justify-center items-center z-50"
          onClick={() => setProductoSeleccionado(null)}
        >
          <div
            className="bg-white rounded-lg p-6 max-w-md w-full shadow-xl relative"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setProductoSeleccionado(null)}
              className="absolute top-2 right-2 text-gray-500 hover:text-gray-700 text-xl"
            >
              ✕
            </button>

            <img
              src={productoSeleccionado.imagen}
              alt={productoSeleccionado.nombre}
              className="w-full h-48 object-cover rounded-md mb-4"
            />

            <h2 className="text-xl font-bold text-[#AA4A44]">{productoSeleccionado.nombre}</h2>

            <p className="text-gray-600 mt-2">{productoSeleccionado.descripcion}</p>

            <p className="font-bold text-[#28a745] mt-3 text-lg">${productoSeleccionado.precio}</p>

            <p className="font-semibold text-gray-800 mt-2">Stock disponible: {productoSeleccionado.stock ?? '—'}</p>

            <p className="text-sm text-gray-600 mt-2"><strong>Emprendimiento:</strong> {productoSeleccionado.emprendimiento?.nombreComercial ?? '—'}</p>

            <p className="text-sm text-gray-600 mt-1"><strong>Emprendedor:</strong> {productoSeleccionado.emprendimiento?.emprendedor ? `${productoSeleccionado.emprendimiento.emprendedor.nombre ?? ''} ${productoSeleccionado.emprendimiento.emprendedor.apellido ?? ''}`.trim() || '—' : '—'}</p>

            <div className="mt-4">
              <button
                onClick={() => { navigate('/login?rol=cliente'); }}
                className="w-full mt-2 bg-[#AA4A44] text-white py-2 rounded-md text-sm hover:bg-[#933834] transition-colors"
              >
                Contactar (iniciar sesión)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ---------------- MODAL EMPRENDIMIENTO ---------------- */}
      {emprendimientoSeleccionado && (
        <div
          className="fixed inset-0 bg-black/30 backdrop-blur-md flex justify-center items-center z-50"
          onClick={() => setEmprendimientoSeleccionado(null)}
        >
          <div
            className="bg-white rounded-lg p-6 max-w-md w-full shadow-xl relative"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setEmprendimientoSeleccionado(null)}
              className="absolute top-2 right-2 text-gray-500 hover:text-gray-700 text-xl"
            >
              ✕
            </button>

            <img
              src={emprendimientoSeleccionado.logo}
              alt={emprendimientoSeleccionado.nombreComercial}
              className="w-full h-48 object-cover rounded-md mb-4"
            />

            <h2 className="text-xl font-bold text-[#AA4A44]">{emprendimientoSeleccionado.nombreComercial}</h2>

            <p className="text-gray-800 font-bold text-sm mt-1">Emprendedor: {nombreCompletoEmprendedor(emprendimientoSeleccionado)}</p>

            <p className="text-gray-600 mt-2">{emprendimientoSeleccionado.descripcion}</p>

            <p className="text-sm text-gray-500 mt-2">{emprendimientoSeleccionado.ubicacion?.ciudad} – {emprendimientoSeleccionado.ubicacion?.direccion}</p>

            <div className="flex gap-3 mt-4 flex-wrap text-sm">
              {emprendimientoSeleccionado.contacto?.sitioWeb && (
                <a href={emprendimientoSeleccionado.contacto.sitioWeb} target="_blank" rel="noreferrer" className="text-[#007bff] hover:underline">Sitio web</a>
              )}

              {emprendimientoSeleccionado.contacto?.facebook && (
                <a href={emprendimientoSeleccionado.contacto.facebook} target="_blank" rel="noreferrer" className="text-[#3b5998] hover:underline">Facebook</a>
              )}

              {emprendimientoSeleccionado.contacto?.instagram && (
                <a href={emprendimientoSeleccionado.contacto.instagram} target="_blank" rel="noreferrer" className="text-[#C13584] hover:underline">Instagram</a>
              )}

              <button
                onClick={() => {
                  setEmprendimientoSeleccionado(null);
                  navigate(buildPublicUrl(emprendimientoSeleccionado));
                }}
                className="bg-[#AA4A44] text-white px-3 py-1 rounded-md text-sm hover:bg-[#933834] transition-colors"
              >
                Ir al sitio
              </button>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </>
  );
};

export default Home;
