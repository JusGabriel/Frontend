import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';

// IMÁGENES
import fondoblanco from '../assets/fondoblanco.jpg';
import heroImage from '../assets/QuitoHome.jpg';
import Servicios from './pgPrueba/Servicios';

// ---------------- HEADER ----------------
const Header = ({ onChangeSection, active }) => {
  const menuItems = [
    { id: 'inicio', label: 'Inicio' },
    { id: 'servicios', label: 'Nosotros' },
  ];

  return (
    <header className="sticky top-0 z-50 bg-[#1E1E2F] border-b border-[#F7E5D2] shadow-sm">
      <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
        <h2 className="text-2xl font-extrabold text-[#AA4A44]">
          QuitoEmprende
        </h2>

        <nav className="flex items-center gap-6">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => onChangeSection(item.id)}
              className={`text-sm md:text-base font-semibold transition-colors ${
                active === item.id
                  ? 'text-[#AA4A44]'
                  : 'text-gray-300 hover:text-[#F7E5D2]'
              }`}
            >
              {item.label}
            </button>
          ))}

          <Link
            to="/login"
            className="bg-[#AA4A44] text-white px-4 py-2 rounded-md text-sm font-semibold hover:bg-[#933834] transition-colors"
          >
            Inicio de sesión
          </Link>
        </nav>
      </div>
    </header>
  );
};

// ---------------- FOOTER ----------------
const Footer = () => (
  <footer className="bg-[#F3E1CE] py-6 text-center text-sm text-gray-700 mt-10 border-t border-[#E0C7B6]">
    © 2025 QuitoEmprende. Todos los derechos reservados.
  </footer>
);

// ---------------- HOME ----------------
export const Home = () => {
  const [section, setSection] = useState('inicio');
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

  // URL pública del emprendimiento
  const buildPublicUrl = (emp) => {
    const slug = emp?.slug || emp?.nombreComercial;
    return `/${encodeURIComponent(slug)}`;
  };

  // Helper para mostrar nombre completo del emprendedor con fallback
  const nombreCompletoEmprendedor = (emp) => {
    const e = emp?.emprendedor;
    if (!e) return '—';
    const nombre = e.nombre ?? e.nombres ?? '';
    const apellido = e.apellido ?? e.apellidos ?? '';
    const full = `${nombre} ${apellido}`.trim();
    return full || '—';
  };

  return (
    <>
      <Header onChangeSection={setSection} active={section} />

      {/* ---------------- SECCIÓN INICIO ---------------- */}
      {section === 'inicio' && (
        <>
          {/* HERO */}
          <main className="py-20 px-6 bg-[#F7E5D2] text-gray-900">
            <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center md:items-start gap-10">
              <div className="flex-1 text-center md:text-left">
                <h1 className="font-extrabold uppercase text-4xl md:text-5xl text-[#AA4A44] mb-4">
                  Conecta, vende y crece
                </h1>
                <p className="text-xl md:text-2xl mb-6 text-gray-800">
                  QuitoEmprende: Tu espacio digital
                </p>
                <p className="max-w-2xl text-gray-700 text-base mx-auto md:mx-0">
                  Un lugar donde los emprendedores promocionan productos y reciben su propia página web personalizada.
                </p>
              </div>

              <div className="flex-1 flex justify-center md:justify-end">
                <img
                  src={heroImage}
                  alt="Hero"
                  className="w-full max-w-xl rounded-[15px] shadow-xl object-cover border-2 border-[#AA4A44]"
                />
              </div>
            </div>
          </main>

          {/* Línea */}
          <div className="max-w-7xl mx-auto my-6 h-[3px] bg-gradient-to-r from-[#AA4A44] via-transparent to-[#AA4A44]" />

          {/* ---------------- PRODUCTOS ---------------- */}
          <section className="py-4 px-6 bg-white text-gray-800">
            <div className="max-w-7xl mx-auto flex flex-col items-center">
              <h2 className="text-3xl font-bold text-[#AA4A44] text-center mb-8">
                Productos Destacados
              </h2>

              {productos.length === 0 ? (
                <p className="text-center mt-6">Cargando productos...</p>
              ) : (
                <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 w-full">
                  {productos.map((producto) => (
                    <div
                      key={producto._id}
                      className="bg-white border border-[#E0C7B6] rounded-xl p-4 shadow hover:shadow-lg transition-all flex cursor-pointer"
                      onClick={() => setProductoSeleccionado(producto)}
                    >
                      <div className="w-1 bg-[#AA4A44] rounded-l-xl mr-4"></div>

                      <div className="flex-1">
                        <img
                          src={producto.imagen}
                          alt={producto.nombre}
                          className="w-full h-48 object-cover rounded-lg mb-4"
                        />

                        <h3 className="font-semibold text-lg text-[#AA4A44]">
                          {producto.nombre}
                        </h3>

                        <p className="text-sm text-gray-600">
                          {producto.descripcion}
                        </p>

                        <p className="text-[#28a745] font-bold mt-2">
                          ${producto.precio}
                        </p>

                        {/* STOCK */}
                        <p className="text-sm font-semibold text-gray-700 mt-1">
                          Stock: {producto.stock}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </section>

          {/* Línea */}
          <div className="max-w-7xl mx-auto my-6 h-[3px] bg-gradient-to-r from-[#AA4A44] via-transparent to-[#AA4A44]" />

          {/* ---------------- EMPRENDIMIENTOS ---------------- */}
          <section
            className="py-16 px-4 text-gray-800 relative overflow-hidden"
            style={{
              backgroundImage: `url(${fondoblanco})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            }}
          >
            <div className="relative z-10 max-w-7xl mx-auto flex flex-col items-center">
              <h2 className="text-3xl font-bold text-[#AA4A44] text-center mb-8">
                Explora Emprendimientos
              </h2>

              <div className="flex overflow-x-auto gap-6 pb-4 w-full">
                {emprendimientos.map((emp) => (
                  <div
                    key={emp._id}
                    className="min-w-[280px] bg-white rounded-2xl shadow-md border border-[#E0C7B6] p-5 hover:shadow-lg transition-all cursor-pointer relative"
                    onClick={() => navigate(buildPublicUrl(emp))}
                  >
                    <img
                      src={emp.logo}
                      alt={emp.nombreComercial}
                      className="w-full h-36 object-cover rounded-lg mb-3"
                    />

                    <h3 className="text-lg font-semibold text-[#AA4A44]">
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
                      className="absolute right-4 bottom-4 bg-[#AA4A44] text-white px-3 py-1 rounded-md text-sm hover:bg-[#933834] transition-colors"
                    >
                      Ver
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </section>
        </>
      )}

      {/* ---------------- SECCIÓN NOSOTROS ---------------- */}
      {section === 'servicios' && <Servicios />}

      {/* ---------------- MODAL PRODUCTO ---------------- */}
      {productoSeleccionado && (
        <div
          className="fixed inset-0 bg-white/20 backdrop-blur-md flex justify-center items-center z-50"
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

            <h2 className="text-xl font-bold text-[#AA4A44]">
              {productoSeleccionado.nombre}
            </h2>

            <p className="text-gray-600 mt-2">
              {productoSeleccionado.descripcion}
            </p>

            <p className="font-bold text-[#28a745] mt-3 text-lg">
              ${productoSeleccionado.precio}
            </p>

            {/* STOCK EN MODAL */}
            <p className="font-semibold text-gray-800 mt-2">
              Stock disponible: {productoSeleccionado.stock}
            </p>
          </div>
        </div>
      )}

      {/* ---------------- MODAL EMPRENDIMIENTO ---------------- */}
      {emprendimientoSeleccionado && (
        <div
          className="fixed inset-0 bg-white/20 backdrop-blur-md flex justify-center items-center z-50"
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

            <h2 className="text-xl font-bold text-[#AA4A44]">
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

            {/* Redes sociales */}
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
