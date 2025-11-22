import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';

export const Home = () => {
  const [section, setSection] = useState('inicio');
  const [emprendimientos, setEmprendimientos] = useState([]);

  const navigate = useNavigate();

  // 🔥 Cargar emprendimientos reales del backend
  useEffect(() => {
    const fetchEmprendimientos = async () => {
      try {
        const response = await fetch(
          'https://backend-production-bd1d.up.railway.app/api/emprendimientos/publicos'
        );
        const data = await response.json();
        setEmprendimientos(data);
      } catch (error) {
        console.error('Error al cargar emprendimientos:', error);
      }
    };

    fetchEmprendimientos();
  }, []);

  return (
    <div className="min-h-screen flex flex-col items-center bg-[#F5EDE3]">
      {/* Navbar */}
      <header className="w-full bg-[#AA4A44] text-white px-6 py-4 shadow-md flex justify-between items-center">
        <h1 className="text-2xl font-bold tracking-wide">Quito Emprende</h1>
        <nav className="hidden md:flex gap-8 text-lg">
          <button onClick={() => setSection('inicio')} className="hover:underline">Inicio</button>
          <button onClick={() => setSection('explorar')} className="hover:underline">Qué ofrecemos</button>
          <button onClick={() => setSection('contacto')} className="hover:underline">Contacto</button>
        </nav>
      </header>

      {/* Contenido dinámico */}
      <main className="flex-1 w-full px-6 py-10">

        {/* Sección: Explorar Emprendimientos */}
        {section === 'explorar' && (
          <>
            <h2 className="text-3xl font-bold text-[#AA4A44] mb-6 text-center">
              Explora Emprendimientos
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">

              {emprendimientos.map((emp) => (
                <div
                  key={emp._id}
                  className="bg-white rounded-2xl shadow-md border border-[#E0C7B6] p-5 hover:shadow-xl transition-all cursor-pointer"
                  onClick={() => navigate(`/${emp.nombreComercial}`)}   // 🔥 Aquí se va al sitio web público
                >
                  <img
                    src={emp.logo}
                    alt={emp.nombreComercial}
                    className="w-full h-40 object-cover rounded-lg mb-4"
                  />

                  <h3 className="text-xl font-semibold text-[#AA4A44] mb-2">
                    {emp.nombreComercial}
                  </h3>

                  <p className="text-gray-600 text-sm mb-2">{emp.descripcion}</p>

                  <p className="text-xs text-gray-500">
                    {emp.ubicacion?.ciudad} - {emp.ubicacion?.direccion}
                  </p>
                </div>
              ))}

            </div>
          </>
        )}

        {/* Sección Inicio */}
        {section === 'inicio' && (
          <div className="text-center py-20">
            <h2 className="text-4xl font-bold text-[#AA4A44] mb-4">Bienvenido a Quito Emprende</h2>
            <p className="text-lg text-gray-700">
              Una plataforma para que emprendedores puedan mostrar sus productos al mundo.
            </p>
          </div>
        )}

        {/* Sección Contacto */}
        {section === 'contacto' && (
          <div className="text-center">
            <h2 className="text-3xl font-bold text-[#AA4A44] mb-4">Contacto</h2>
            <p className="text-gray-700 text-lg">Escríbenos a soporte@quitoemprende.com</p>
          </div>
        )}

      </main>
    </div>
  );
};

export default Home;
