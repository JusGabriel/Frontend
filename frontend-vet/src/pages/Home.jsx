import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import fondoblanco from '../assets/fondoblanco.jpg';
import heroImage from '../assets/QuitoHome.jpg';
import Servicios from './pgPrueba/Servicios';

const Header = ({ onChangeSection, active }) => {
  const menuItems = [
    { id: 'inicio', label: 'Inicio' },
    { id: 'servicios', label: 'Nosotros' },
  ];

  return (
    <header className="sticky top-0 z-50 bg-[#1E1E2F] border-b border-[#F7E5D2] shadow-sm">
      <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
        <h2 className="text-2xl font-extrabold text-[#AA4A44]">QuitoEmprende</h2>
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

const Footer = () => (
  <footer className="bg-[#F3E1CE] py-6 text-center text-sm text-gray-700 mt-10 border-t border-[#E0C7B6]">
    © 2025 QuitoEmprende. Todos los derechos reservados.
  </footer>
);

export const Home = () => {
  const [section, setSection] = useState('inicio');
  const [emprendimientos, setEmprendimientos] = useState([]);
  const [productos, setProductos] = useState([]);
  const [productoSeleccionado, setProductoSeleccionado] = useState(null);
  const [emprendimientoSeleccionado, setEmprendimientoSeleccionado] = useState(null);

  useEffect(() => {
    fetch('https://backend-production-bd1d.up.railway.app/api/emprendimientos/publicos')
      .then((res) => res.json())
      .then((data) => setEmprendimientos(data))
      .catch((error) => console.error('Error al cargar emprendimientos:', error));
  }, []);

  useEffect(() => {
    fetch('https://backend-production-bd1d.up.railway.app/api/productos/todos')
      .then((res) => res.json())
      .then((data) => setProductos(data))
      .catch((error) => console.error('Error al cargar productos:', error));
  }, []);

  return (
    <>
      <Header onChangeSection={setSection} active={section} />

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
                  Un lugar donde los emprendedores promocionan sus productos y reciben su propia página web con URL personalizada.
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

          {/* Línea decorativa */}
          <div className="max-w-7xl mx-auto my-6 h-[3px] bg-gradient-to-r from-[#AA4A44] via-transparent to-[#AA4A44]" />

          {/* PRODUCTOS DESTACADOS */}
          <section className="py-4 px-6 bg-white text-gray-800">
            <div className="max-w-7xl mx-auto flex flex-col items-center">
              <h2 className="text-3xl font-bold text-[#AA4A44] text-center mb-8 relative inline-block">
                Productos Destacados
                <span className="block mx-auto mt-2 h-1 w-24 bg-[#AA4A44] rounded"></span>
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
                        <h3 className="font-semibold text-lg text-[#AA4A44]">{producto.nombre}</h3>
                        <p className="text-sm text-gray-600">{producto.descripcion}</p>
                        <p className="text-[#28a745] font-bold mt-2">${producto.precio}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </section>

          {/* Línea decorativa */}
          <div className="max-w-7xl mx-auto my-6 h-[3px] bg-gradient-to-r from-[#AA4A44] via-transparent to-[#AA4A44]" />

          {/* EMPRENDIMIENTOS */}
          <section
            className="py-16 px-4 text-gray-800 relative overflow-hidden"
            style={{
              backgroundImage: `url(${fondoblanco})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            }}
          >
            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                backgroundImage:
                  'repeating-linear-gradient(45deg, rgba(170,74,68,0.05) 0, rgba(170,74,68,0.05) 1px, transparent 1px, transparent 20px)',
                zIndex: 0,
              }}
            />

            <div className="relative z-10 max-w-7xl mx-auto flex flex-col items-center">
              <h2 className="text-3xl font-bold text-[#AA4A44] text-center mb-8 relative inline-block">
                Explora Emprendimientos
                <span className="block mx-auto mt-2 h-1 w-24 bg-[#AA4A44] rounded"></span>
              </h2>
              <div className="flex overflow-x-auto gap-6 pb-4 w-full max-w-[calc(100vw-48px)] md:max-w-full">
                {emprendimientos.length === 0 ? (
                  <p className="text-center w-full">Cargando emprendimientos...</p>
                ) : (
                  emprendimientos.map((emp) => (
                    <div
                      key={emp._id}
                      className="min-w-[280px] bg-white rounded-2xl shadow-md border border-[#E0C7B6] p-5 hover:shadow-lg transition-all cursor-pointer"
                      onClick={() => setEmprendimientoSeleccionado(emp)}
                    >
                      <img
                        src={emp.logo}
                        alt={emp.nombreComercial}
                        className="w-full h-36 object-cover rounded-lg mb-3"
                      />
                      <h3 className="text-lg font-semibold text-[#AA4A44]">{emp.nombreComercial}</h3>
                      <p className="text-sm text-gray-600">{emp.descripcion}</p>
                      <p className="text-xs text-gray-500 mt-2">
                        {emp.ubicacion?.ciudad} - {emp.ubicacion?.direccion}
                      </p>
                    </div>
                  ))
                )}
              </div>
            </div>
          </section>
        </>
      )}

      {section === 'servicios' && <Servicios />}

      {/* MODAL PRODUCTO */}
      {productoSeleccionado && (
        <div
          className="fixed inset-0 bg-white/30 backdrop-blur-md flex justify-center items-center z-50"
          onClick={() => setProductoSeleccionado(null)}
        >
          <div
            className="bg-white/90 rounded-lg p-6 max-w-md w-full shadow-xl relative border border-[#E0C7B6]"
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
          </div>
        </div>
      )}

      {/* MODAL EMPRENDIMIENTO */}
      {emprendimientoSeleccionado && (
        <div
          className="fixed inset-0 bg-white/30 backdrop-blur-md flex justify-center items-center z-50"
          onClick={() => setEmprendimientoSeleccionado(null)}
        >
          <div
            className="bg-white/90 rounded-lg p-6 max-w-md w-full shadow-xl relative border border-[#E0C7B6]"
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
            <p className="text-gray-600 mt-2">{emprendimientoSeleccionado.descripcion}</p>
            <p className="text-sm text-gray-500 mt-2">
              {emprendimientoSeleccionado.ubicacion?.ciudad} - {emprendimientoSeleccionado.ubicacion?.direccion}
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
            </div>
          </div>
        </div>
      )}

      <Footer />
    </>
  );
};
