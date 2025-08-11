import { useParams } from 'react-router-dom';

const DetalleEmprendimiento = () => {
  const { id } = useParams();

  const paginas = JSON.parse(localStorage.getItem("paginasEmprendimientos")) || [];
  const emprendimiento = paginas.find((p) => p._id === id);

  if (!emprendimiento) {
    return (
      <main className="flex flex-col min-h-screen items-center justify-center bg-gray-50 px-6">
        <p className="text-xl text-gray-500">Emprendimiento no encontrado.</p>
      </main>
    );
  }

  return (
    <main className="flex-grow py-12 px-6 max-w-7xl mx-auto bg-gray-50 min-h-screen">
      <div className="bg-white rounded-2xl shadow-lg p-8 md:p-12">
        <div className="flex flex-col md:flex-row gap-10 items-start">
          <div className="w-full md:w-1/3">
            <div className="overflow-hidden rounded-xl shadow-md hover:scale-105 transition-transform duration-300">
              <img
                src={emprendimiento.imagen || emprendimiento.logo}
                alt={emprendimiento.nombre || emprendimiento.nombreComercial}
                className="w-full h-72 object-cover"
              />
            </div>
          </div>

          <div className="flex-1">
            <h1 className="text-4xl font-bold text-[#AA4A44] mb-4">
              {emprendimiento.nombre || emprendimiento.nombreComercial}
            </h1>
            <p className="text-lg text-gray-700 mb-6 leading-relaxed">{emprendimiento.descripcion}</p>

            <span className="inline-block bg-[#AA4A44] text-white px-4 py-2 rounded-full text-sm shadow-md">
              {emprendimiento.categoria || emprendimiento.categorias || 'Categoría no disponible'}
            </span>

            <div className="mt-8 space-y-3 text-sm text-gray-700">
              {emprendimiento.direccion && (
                <p><span className="font-semibold">Dirección:</span> {emprendimiento.direccion}</p>
              )}
              {emprendimiento.telefono && (
                <p><span className="font-semibold">Teléfono/WhatsApp:</span> {emprendimiento.telefono}</p>
              )}
              {emprendimiento.correo && (
                <p><span className="font-semibold">Correo Electrónico:</span> {emprendimiento.correo}</p>
              )}
              {emprendimiento.instagram && (
                <p>
                  <span className="font-semibold">Instagram:</span>{" "}
                  <a href={emprendimiento.instagram} target="_blank" rel="noopener noreferrer" className="text-[#AA4A44] hover:underline">
                    {emprendimiento.instagram}
                  </a>
                </p>
              )}
              {emprendimiento.facebook && (
                <p>
                  <span className="font-semibold">Facebook:</span>{" "}
                  <a href={emprendimiento.facebook} target="_blank" rel="noopener noreferrer" className="text-[#AA4A44] hover:underline">
                    {emprendimiento.facebook}
                  </a>
                </p>
              )}
              {emprendimiento.tiktok && (
                <p>
                  <span className="font-semibold">TikTok:</span>{" "}
                  <a href={emprendimiento.tiktok} target="_blank" rel="noopener noreferrer" className="text-[#AA4A44] hover:underline">
                    {emprendimiento.tiktok}
                  </a>
                </p>
              )}
              {emprendimiento.horario && (
                <p><span className="font-semibold">Horario de Atención:</span> {emprendimiento.horario}</p>
              )}
              {emprendimiento.metodosPago && (
                <p><span className="font-semibold">Métodos de Pago:</span> {emprendimiento.metodosPago}</p>
              )}
            </div>

            <div className="mt-10">
              <h2 className="text-2xl font-semibold mb-6 border-b pb-2 border-gray-200">Productos</h2>
              {(!emprendimiento.productos || emprendimiento.productos.length === 0) ? (
                <p className="text-gray-500">No hay productos disponibles.</p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {emprendimiento.productos.map((prod) => (
                    <div
                      key={prod._id || prod.id}
                      className="group border rounded-xl p-4 bg-gray-50 hover:bg-white shadow-sm hover:shadow-lg transition-all duration-300 flex flex-col items-center text-center"
                    >
                      <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-gray-200 group-hover:border-[#AA4A44] transition-all mb-3">
                        <img
                          src={prod.imagen}
                          alt={prod.nombre}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <p className="text-base font-medium text-gray-800">{prod.nombre}</p>
                      {(prod.precio || prod.valor) && (
                        <p className="text-sm text-gray-500 mt-1">
                          Valor: ${prod.precio ?? prod.valor}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};

export default DetalleEmprendimiento;
