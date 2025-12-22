import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import fondoblanco from '../assets/fondoblanco.jpg';
import storeAuth from '../context/storeAuth';

// URL base del backend (ajústala si cambia)
const BACKEND_URL = 'https://backend-production-bd1d.up.railway.app';

// Imagen por defecto
const DEFAULT_IMAGE =
  'https://via.placeholder.com/400x300?text=Sin+imagen';

const HomeContent = () => {
  const navigate = useNavigate();
  const { id: usuarioId } = storeAuth();

  const [section] = useState('inicio');
  const [emprendimientos, setEmprendimientos] = useState([]);
  const [productos, setProductos] = useState([]);

  const [productoSeleccionado, setProductoSeleccionado] = useState(null);
  const [emprendimientoSeleccionado, setEmprendimientoSeleccionado] = useState(null);

  // -------------------------------------------------
  // Helpers
  // -------------------------------------------------
  const generarSlug = (texto) =>
    texto
      ?.toString()
      .toLowerCase()
      .trim()
      .replace(/[áàäâ]/g, 'a')
      .replace(/[éèëê]/g, 'e')
      .replace(/[íìïî]/g, 'i')
      .replace(/[óòöô]/g, 'o')
      .replace(/[úùüû]/g, 'u')
      .replace(/ñ/g, 'n')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');

  const buildPublicUrl = (emp) => {
    const slug = emp?.slug || generarSlug(emp?.nombreComercial) || emp?._id;
    return `https://frontend-production-480a.up.railway.app/${slug}`;
  };

  const openPublicSite = (emp, { closeModal = false } = {}) => {
    window.open(buildPublicUrl(emp), '_blank', 'noopener,noreferrer');
    if (closeModal) {
      setEmprendimientoSeleccionado(null);
      setProductoSeleccionado(null);
    }
  };

  const nombreCompletoEmprendedor = (emp) => {
    const e = emp?.emprendedor;
    if (!e) return '—';
    return `${e.nombre ?? e.nombres ?? ''} ${e.apellido ?? e.apellidos ?? ''}`.trim() || '—';
  };

  // 🔑 FUNCIÓN CLAVE PARA IMÁGENES
  const getImageUrl = (img) => {
    if (!img) return DEFAULT_IMAGE;
    if (img.startsWith('http')) return img;
    return `${BACKEND_URL}${img.startsWith('/') ? img : `/${img}`}`;
  };

  // -------------------------------------------------
  // Fetch data
  // -------------------------------------------------
  useEffect(() => {
    fetch(`${BACKEND_URL}/api/emprendimientos/publicos`)
      .then(res => res.json())
      .then(data => setEmprendimientos(Array.isArray(data) ? data : []))
      .catch(err => console.error('Error emprendimientos:', err));
  }, []);

  useEffect(() => {
    fetch(`${BACKEND_URL}/api/productos/todos`)
      .then(res => res.json())
      .then(data => {
        const arr = Array.isArray(data)
          ? data
          : Array.isArray(data?.productos)
          ? data.productos
          : [];
        setProductos(arr);
      })
      .catch(err => console.error('Error productos:', err));
  }, []);

  // -------------------------------------------------
  // Contactar
  // -------------------------------------------------
  const handleContactarProducto = (e, producto) => {
    e.stopPropagation();
    const emprendedorId = producto?.emprendimiento?.emprendedor?._id;
    if (!emprendedorId) return;

    if (usuarioId) {
      navigate(
        `/dashboard/chat?user=${emprendedorId}&productoId=${producto._id}&productoNombre=${encodeURIComponent(
          producto.nombre
        )}`
      );
    } else {
      navigate('/login?rol=cliente');
    }
  };

  const handleContactarEmprendimiento = (e, emp) => {
    e.stopPropagation();
    const emprendedorId = emp?.emprendedor?._id;
    if (!emprendedorId) return;

    if (usuarioId) {
      navigate(`/dashboard/chat?user=${emprendedorId}`);
    } else {
      navigate('/login?rol=cliente');
    }
  };

  // -------------------------------------------------
  // Render
  // -------------------------------------------------
  return (
    <>
      {section === 'inicio' && (
        <>
          {/* ================= PRODUCTOS ================= */}
          <section className="py-10 px-6 bg-white">
            <div className="max-w-7xl mx-auto">
              <h2 className="text-3xl font-bold text-[#AA4A44] text-center mb-8">
                Productos Destacados
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
                {productos.map((producto) => {
                  const empr = producto.emprendimiento ?? {};
                  const dueño = empr?.emprendedor;

                  return (
                    <article
                      key={producto._id}
                      className="border rounded-xl p-4 shadow hover:shadow-lg cursor-pointer"
                      onClick={() => setProductoSeleccionado(producto)}
                    >
                      <img
                        src={getImageUrl(producto.imagen)}
                        alt={producto.nombre}
                        className="w-full h-48 object-cover rounded-lg mb-3"
                      />

                      <h3 className="font-semibold text-[#AA4A44]">
                        {producto.nombre}
                      </h3>

                      <p className="text-sm text-gray-600 line-clamp-2">
                        {producto.descripcion}
                      </p>

                      <p className="mt-2 font-bold text-green-600">
                        ${producto.precio}
                      </p>

                      <p className="text-sm mt-1">
                        <strong>Emprendimiento:</strong>{' '}
                        {empr?.nombreComercial ?? '—'}
                      </p>

                      <p className="text-sm">
                        <strong>Emprendedor:</strong>{' '}
                        {dueño
                          ? `${dueño.nombre ?? ''} ${dueño.apellido ?? ''}`
                          : '—'}
                      </p>

                      <button
                        onClick={(e) => handleContactarProducto(e, producto)}
                        className="w-full mt-3 bg-[#AA4A44] text-white py-2 rounded-md"
                      >
                        Contactar
                      </button>
                    </article>
                  );
                })}
              </div>
            </div>
          </section>

          {/* ================= EMPRENDIMIENTOS ================= */}
          <section
            className="py-16 px-4"
            style={{
              backgroundImage: `url(${fondoblanco})`,
              backgroundSize: 'cover',
            }}
          >
            <div className="max-w-7xl mx-auto">
              <h2 className="text-3xl font-bold text-[#AA4A44] text-center mb-8">
                Explora Emprendimientos
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
                {emprendimientos.map((emp) => (
                  <div
                    key={emp._id}
                    className="bg-white p-5 rounded-xl shadow cursor-pointer"
                    onClick={() => openPublicSite(emp)}
                  >
                    <img
                      src={getImageUrl(emp.logo)}
                      alt={emp.nombreComercial}
                      className="w-full h-40 object-cover rounded-lg mb-3"
                    />

                    <h3 className="font-semibold text-[#AA4A44]">
                      {emp.nombreComercial}
                    </h3>

                    <p className="text-sm font-semibold">
                      {nombreCompletoEmprendedor(emp)}
                    </p>

                    <p className="text-sm text-gray-600 line-clamp-2">
                      {emp.descripcion}
                    </p>

                    <div className="flex gap-2 mt-3">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setEmprendimientoSeleccionado(emp);
                        }}
                        className="bg-[#AA4A44] text-white px-3 py-2 rounded-md text-sm"
                      >
                        Ver detalles
                      </button>

                      <button
                        onClick={(e) => handleContactarEmprendimiento(e, emp)}
                        className="border border-[#AA4A44] text-[#AA4A44] px-3 py-2 rounded-md text-sm"
                      >
                        Contactar
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* ================= MODALES ================= */}
          {productoSeleccionado && (
            <div
              className="fixed inset-0 bg-black/40 flex items-center justify-center z-50"
              onClick={() => setProductoSeleccionado(null)}
            >
              <div
                className="bg-white p-6 rounded-lg max-w-md w-full"
                onClick={(e) => e.stopPropagation()}
              >
                <img
                  src={getImageUrl(productoSeleccionado.imagen)}
                  alt={productoSeleccionado.nombre}
                  className="w-full h-48 object-cover rounded mb-4"
                />

                <h2 className="text-xl font-bold text-[#AA4A44]">
                  {productoSeleccionado.nombre}
                </h2>

                <p className="mt-2">{productoSeleccionado.descripcion}</p>

                <button
                  className="w-full mt-4 bg-[#AA4A44] text-white py-2 rounded"
                  onClick={(e) =>
                    handleContactarProducto(e, productoSeleccionado)
                  }
                >
                  Contactar
                </button>
              </div>
            </div>
          )}

          {emprendimientoSeleccionado && (
            <div
              className="fixed inset-0 bg-black/40 flex items-center justify-center z-50"
              onClick={() => setEmprendimientoSeleccionado(null)}
            >
              <div
                className="bg-white p-6 rounded-lg max-w-md w-full"
                onClick={(e) => e.stopPropagation()}
              >
                <img
                  src={getImageUrl(emprendimientoSeleccionado.logo)}
                  alt={emprendimientoSeleccionado.nombreComercial}
                  className="w-full h-48 object-cover rounded mb-4"
                />

                <h2 className="text-xl font-bold text-[#AA4A44]">
                  {emprendimientoSeleccionado.nombreComercial}
                </h2>

                <p className="mt-2">{emprendimientoSeleccionado.descripcion}</p>

                <button
                  className="w-full mt-4 bg-[#AA4A44] text-white py-2 rounded"
                  onClick={() =>
                    openPublicSite(emprendimientoSeleccionado, {
                      closeModal: true,
                    })
                  }
                >
                  Ir al sitio
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </>
  );
};

export default HomeContent;
