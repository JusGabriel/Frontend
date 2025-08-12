import React from 'react';
import { Link } from 'react-router-dom';
import fondoblanco from '../assets/fondoblanco.jpg';

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
            <Link
              key={item.id}
              to="/"
              className="text-sm md:text-base font-semibold text-gray-700 hover:text-[#AA4A44]"
            >
              {item.label}
            </Link>
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

export const NotFound = () => {
  return (
    <>
      <Header />
      <section
        className="relative py-20 px-6 flex flex-col justify-center items-center text-center text-gray-900"
        style={{
          backgroundImage: `url(${fondoblanco})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          minHeight: '60vh',
        }}
      >
        {/* Líneas diagonales sutiles */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage:
              'repeating-linear-gradient(45deg, rgba(170,74,68,0.05) 0, rgba(170,74,68,0.05) 1px, transparent 1px, transparent 20px)',
            zIndex: 0,
          }}
        />
        <div className="relative z-10 max-w-3xl mx-auto">
          <h1 className="text-4xl font-extrabold text-[#AA4A44] mb-6">Acceso restringido</h1>
          <p className="text-lg mb-4">
            Debes{' '}
            <Link to="/login" className="text-[#AA4A44] underline">
              iniciar sesión
            </Link>{' '}
            o{' '}
            <Link to="/register" className="text-[#AA4A44] underline">
              registrarte
            </Link>{' '}
            para poder acceder a esta sección.
          </p>
        </div>
      </section>
      <Footer />
    </>
  );
};



