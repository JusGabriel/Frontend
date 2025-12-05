import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';

// IMÁGENES
import fondoblanco from '../assets/fondoblanco.jpg';
import heroImage from '../assets/QuitoHome.jpg';

// ---------------- HEADER ----------------
const Header = () => {
  return (
    <header className="sticky top-0 z-50 bg-[#0F1724] border-b border-[#F7E5D2] shadow-sm">
      <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
        <h2 className="text-2xl font-extrabold text-[#FF6B5F] tracking-tight">
          QuitoEmprende
        </h2>

        <nav className="flex items-center gap-4">
          <Link
            to="/login"
            className="inline-flex items-center gap-2 bg-[#FF6B5F] text-white px-4 py-2 rounded-lg text-sm font-semibold shadow hover:translate-y-[-1px] transition-transform focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#FF6B5F]/40"
            aria-label="Iniciar sesión"
          >
            <!-- icon -->
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12H3m12 0l-4-4m4 4l-4 4M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Iniciar sesión
          </Link>
        </nav>
      </div>
    </header>
  );
};

// ---------------- FOOTER ----------------
const Footer = () => (
  <footer className="bg-[#FCF7F5] py-6 text-center text-sm text-gray-700 mt-10 border-t border-[#EDE0D8]">
    © 2025 QuitoEmprende. Todos los derechos reservados.
  </footer>
);

// ---------------- HOME ----------------
export const Home = () => {
  const [emprendimientos, setEmprendimientos] = useState([]);
  const [productos, setProductos] = useState([]);
  const [productoSeleccionado, setProductoSeleccionado] = useState(null);
  const [emprendimientoSeleccionado, setEmprendimientoSeleccionado] =
    useState(null);

  const navigate = useNavigate();

  // =============== OBTENER EMPRENDIMIENTOS ===============
  useEffect(() => {
    const fetchEmprendimientos = async () => {
      try {
        const res = await fetch(
          'https://backend-production-bd1d.up.railway.app/api/emprendimientos/publicos'
        );
        const data = await res.json();
        setEmprendimientos(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error('Error al cargar emprendimientos:', error);
      }
    };

    fetchEmprendimientos();
  }, []);

  // =============== OBTENER PRODUCTOS ===============
  useEffect(() => {
    const fetchProductos = async () => {
      try {
        const res = await fetch(
          'https://backend-production-bd1d.up.railway.app/api/productos/todos'
        );
        const data = await res.json();
        setProductos(Array.isArray(data) ? data : []);
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

      {/* ================== SECCIÓN TIPOS DE USUARIO (REDISEÑO) ================== */}
      <section className="bg-gradient-to-b from-white/60 to-[#FFF6F4] py-12 px-6 border-b border-[#EDE0D8]">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-4xl font-extrabold text-[#FF6B5F] tracking-tight">
              ¿Cómo deseas usar <span className="text-[#1F2937]">QuitoEmprende</span>?
            </h2>
            <p className="mt-3 text-gray-600 max-w-2xl mx-auto">
              Elige tu perfil y accede a herramientas pensadas para impulsar ventas y visibilidad.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Tarjeta Cliente */}
            <div
              className="relative overflow-hidden rounded-2xl p-6 bg-white shadow-lg border border-[#F0E6E3] transform hover:-translate-y-1 transition-transform"
              role="article"
              aria-label="Iniciar sesión como Cliente"
            >
              {/* Decorative gradient circle */}
              <div className="pointer-events-none absolute -right-10 -top-10 w-40 h-40 rounded-full bg-gradient-to-tr from-[#FFF1EE] to-[#FFE0D9] opacity-80 blur-2xl" />
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0">
                  <div className="w-16 h-16 rounded-lg bg-gradient-to-br from-[#FFB8A6] to-[#FF6B5F] flex items-center justify-center shadow-md">
                    {/* Cliente icon */}
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M5.121 17.804A9 9 0 1118.88 6.196M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                </div>

                <div className="flex-1">
                  <h3 className="text-xl font-semibold text-[#1F2937]">Cliente</h3>
                  <p className="mt-2 text-gray-600">
                    Encuentra productos reales de emprendedores locales, chatea directamente y compra con confianza.
                  </p>

                  <ul className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm text-gray-600">
                    <li className="flex items-center gap-2">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-[#34D399]" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>
                      Productos verificados
                    </li>
                    <li className="flex items-center gap-2">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-[#34D399]" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>
                      Chat directo con emprendedores
                    </li>
                  </ul>

                  <div className="mt-5 flex flex-wrap gap-3">
                    <Link
                      to="/login?rol=cliente"
                      className="inline-flex items-center gap-2 bg-[#FF6B5F] text-white px-4 py-2 rounded-lg text-sm font-semibold shadow hover:scale-[1.01] transition-transform focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#FF6B5F]/30"
                      aria-label="Iniciar como Cliente"
                    >
                      Iniciar como Cliente
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
                    </Link>

                    <button
                      onClick={() => window.scrollTo({ top: document.getElementById('productos-section')?.offsetTop || 0, behavior: 'smooth' })}
                      className="inline-flex items-center gap-2 border border-[#FFD6CE] bg-white px-3 py-2 rounded-lg text-sm font-medium text-[#FF6B5F] hover:bg-[#FFF6F5]"
                    >
                      Ver productos
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Tarjeta Emprendedor */}
            <div
              className="relative overflow-hidden rounded-2xl p-6 bg-white shadow-lg border border-[#F0E6E3] transform hover:-translate-y-1 transition-transform"
              role="article"
              aria-label="Iniciar sesión como Emprendedor"
            >
              <div className="pointer-events-none absolute -left-10 -bottom-10 w-44 h-44 rounded-full bg-gradient-to-tr from-[#FDEBD8] to-[#FFD0C2] opacity-80 blur-2xl" />
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0">
                  <div className="w-16 h-16 rounded-lg bg-gradient-to-br from-[#FFD1A9] to-[#FF8A66] flex items-center justify-center shadow-md">
                    {/* Emprendedor icon */}
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 8c1.657 0 3-1.567 3-3.5S13.657 1 12 1 9 2.567 9 4.5 10.343 8 12 8zM19.5 21a3.5 3.5 0 01-3.5-3.5V14a3.5 3.5 0 00-3.5-3.5H12a3.5 3.5 0 00-3.5 3.5v3.5A3.5 3.5 0 015 21" />
                    </svg>
                  </div>
                </div>

                <div className="flex-1">
                  <h3 className="text-xl font-semibold text-[#1F2937]">Emprendedor</h3>
                  <p className="mt-2 text-gray-600">
                    Crea tu sitio, publica productos y accede a herramientas de promoción y métricas.
                  </p>

                  <ul className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm text-gray-600">
                    <li className="flex items-center gap-2">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-[#FFB548]" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4" /></svg>
                      Página personalizada
                    </li>
                    <li className="flex items-center gap-2">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-[#FFB548]" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 7v10a2 2 0 002 2h3m10-12v10a2 2 0 01-2 2h-3" /></svg>
                      Gestión de productos
                    </li>
                  </ul>

                  <div className="mt-5 flex flex-wrap gap-3">
                    <Link
                      to="/login?rol=emprendedor"
                      className="inline-flex items-center gap-2 bg-[#FF8A66] text-white px-4 py-2 rounded-lg text-sm font-semibold shadow hover:scale-[1.01] transition-transform focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#FF8A66]/30"
                      aria-label="Iniciar como Emprendedor"
                    >
                      Iniciar como Emprendedor
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
                    </Link>

                    <Link
                      to="/registro-emprendedor"
                      className="inline-flex items-center gap-2 border border-[#FFE7DB] bg-white px-3 py-2 rounded-lg text-sm font-medium text-[#FF8A66] hover:bg-[#FFF6F5]"
                    >
                      Crea tu página
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* micro nota */}
          <div className="mt-6 text-xs text-gray-500 text-center">
            ¿No sabes qué elegir? Elige "Cliente" para comprar o "Emprendedor" si quieres vender.
          </div>
        </div>
      </section>

      {/* HERO */}
      <main className="py-20 px-6 bg-[#FFF5F3] text-gray-900">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center gap-10">
          <div className="flex-1 text-center md:text-left">
            <h1 className="font-extrabold uppercase text-4xl md:text-5xl text-[#FF6B5F] mb-4">
              Conecta, vende y crece
            </h1>
            <p className="text-xl md:text-2xl mb-6 text-gray-800">
              QuitoEmprende: Tu espacio digital
            </p>
            <p className="max-w-2xl text-gray-700 mx-auto md:mx-0">
              Un lugar donde los emprendedores promocionan productos y reciben su propia página personalizada.
            </p>
          </div>

          <div className="flex-1 flex justify-center md:justify-end">
            <img
              src={heroImage}
              alt="Hero"
              className="w-full max-w-xl rounded-[15px] shadow-xl object-cover border-2 border-[#FF6B5F]"
            />
          </div>
        </div>
      </main>

      {/* Línea */}
      <div className="max-w-7xl mx-auto my-6 h-[3px] bg-gradient-to-r from-[#FF6B5F] via-transparent to-[#FF6B5F]" />

      {/* ---------------- PRODUCTOS ---------------- */}
      <section id="productos-section" className="py-10 px-6 bg-white text-gray-800">
        <div className="max-w-7xl mx-auto flex flex-col items-center">
          <h2 className="text-3xl font-bold text-[#FF6B5F] text-center mb-8">
            Productos Destacados
          </h2>

          {productos.length === 0 ? (
            <p>Cargando productos...</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8 w-full">
              {productos.map((producto) => (
                <div
                  key={producto._id}
                  className="bg-white border border-[#F0E6E3] rounded-xl p-4 shadow hover:shadow-lg transition-all cursor-pointer"
                  onClick={() => setProductoSeleccionado(producto)}
                >
                  <img
                    src={producto.imagen}
                    alt={producto.nombre}
                    className="w-full h-48 object-cover rounded-lg mb-4"
                  />

                  <h3 className="font-semibold text-lg text-[#1F2937]">
                    {producto.nombre}
                  </h3>

                  <p className="text-sm text-gray-600">{producto.descripcion}</p>

                  <div className="mt-3 flex items-center justify-between">
                    <p className="text-[#10B981] font-bold">${producto.precio}</p>
                    <p className="text-sm font-semibold text-gray-700">Stock: {producto.stock}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Línea */}
      <div className="max-w-7xl mx-auto my-6 h-[3px] bg-gradient-to-r from-[#FF6B5F] via-transparent to-[#FF6B5F]" />

      {/* ---------------- EMPRENDIMIENTOS EN VERTICAL ---------------- */}
      <section
        className="py-16 px-4 text-gray-800"
        style={{
          backgroundImage: `url(${fondoblanco})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <div className="max-w-7xl mx-auto flex flex-col items-center">
          <h2 className="text-3xl font-bold text-[#FF6B5F] text-center mb-8">
            Explora Emprendimientos
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8 w-full">
            {emprendimientos.map((emp) => (
              <div
                key={emp._id}
                className="bg-white rounded-2xl shadow-md border border-[#F0E6E3] p-5 hover:shadow-lg transition-all cursor-pointer"
                onClick={() => navigate(buildPublicUrl(emp))}
              >
                <img
                  src={emp.logo}
                  alt={emp.nombreComercial}
                  className="w-full h-40 object-cover rounded-lg mb-3"
                />

                <h3 className="text-lg font-semibold text-[#1F2937]">
                  {emp.nombreComercial}
                </h3>

                <p className="text-sm text-gray-700 font-semibold mt-1">
                  {nombreCompletoEmprendedor(emp)}
                </p>

                <p className="text-sm text-gray-600 mt-1">
                  {emp.descripcion}
                </p>

                <p className="text-xs text-gray-500 mt-2">
                  {emp.ubicacion?.ciudad} - {emp.ubicacion?.direccion}
                </p>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setEmprendimientoSeleccionado(emp);
                  }}
                  className="mt-3 bg-[#FF6B5F] text-white w-full py-2 rounded-md text-sm hover:bg-[#ff4f3f] transition-colors"
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
              aria-label="Cerrar modal producto"
            >
              ✕
            </button>

            <img
              src={productoSeleccionado.imagen}
              alt={productoSeleccionado.nombre}
              className="w-full h-48 object-cover rounded-md mb-4"
            />

            <h2 className="text-xl font-bold text-[#1F2937]">
              {productoSeleccionado.nombre}
            </h2>

            <p className="text-gray-600 mt-2">
              {productoSeleccionado.descripcion}
            </p>

            <p className="font-bold text-[#10B981] mt-3 text-lg">
              ${productoSeleccionado.precio}
            </p>

            <p className="font-semibold text-gray-800 mt-2">
              Stock disponible: {productoSeleccionado.stock}
            </p>
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
              aria-label="Cerrar modal emprendimiento"
            >
              ✕
            </button>

            <img
              src={emprendimientoSeleccionado.logo}
              alt={emprendimientoSeleccionado.nombreComercial}
              className="w-full h-48 object-cover rounded-md mb-4"
            />

            <h2 className="text-xl font-bold text-[#1F2937]">
              {emprendimientoSeleccionado.nombreComercial}
            </h2>

            <p className="text-gray-800 font-bold text-sm mt-1">
              Emprendedor: {nombreCompletoEmprendedor(emprendimientoSeleccionado)}
            </p>

            <p className="text-gray-600 mt-2">
              {emprendimientoSeleccionado.descripcion}
            </p>

            <p className="text-sm text-gray-500 mt-2">
              {emprendimientoSeleccionado.ubicacion?.ciudad} –{' '}
              {emprendimientoSeleccionado.ubicacion?.direccion}
            </p>

            <div className="flex gap-3 mt-4 flex-wrap text-sm">
              {emprendimientoSeleccionado.contacto?.sitioWeb && (
                <a
                  href={emprendimientoSeleccionado.contacto.sitioWeb}
                  target="_blank"
                  rel="noreferrer"
                  className="text-[#007bff] hover:underline"
                >
                  Sitio web
                </a>
              )}

              {emprendimientoSeleccionado.contacto?.facebook && (
                <a
                  href={emprendimientoSeleccionado.contacto.facebook}
                  target="_blank"
                  rel="noreferrer"
                  className="text-[#3b5998] hover:underline"
                >
                  Facebook
                </a>
              )}

              {emprendimientoSeleccionado.contacto?.instagram && (
                <a
                  href={emprendimientoSeleccionado.contacto.instagram}
                  target="_blank"
                  rel="noreferrer"
                  className="text-[#C13584] hover:underline"
                >
                  Instagram
                </a>
              )}

              <button
                onClick={() => {
                  setEmprendimientoSeleccionado(null);
                  navigate(buildPublicUrl(emprendimientoSeleccionado));
                }}
                className="bg-[#FF6B5F] text-white px-3 py-1 rounded-md text-sm hover:bg-[#ff4f3f] transition-colors"
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
