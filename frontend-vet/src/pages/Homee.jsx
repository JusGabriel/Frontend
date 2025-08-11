import React, { useState } from 'react'
import Servicios from './pgPrueba/Servicios'
import heroBg from '../pages/pgPrueba/imagenes/fondo.png'

const productosMock = [
  { id: 1, nombre: 'Camiseta artesanal', precio: 20, imagen: 'https://via.placeholder.com/150' },
  { id: 2, nombre: 'Joyería fina', precio: 45, imagen: 'https://via.placeholder.com/150' },
  { id: 3, nombre: 'Arte en madera', precio: 70, imagen: 'https://via.placeholder.com/150' }
]

const emprendimientosMock = [
  { id: 1, nombre: 'Artesanías Quito', descripcion: 'Productos hechos a mano', url: '#' },
  { id: 2, nombre: 'Joyería Bella', descripcion: 'Diseños únicos y exclusivos', url: '#' },
  { id: 3, nombre: 'Maderas Quito', descripcion: 'Artesanía con madera local', url: '#' }
]

const Header = ({ onChangeSection, active }) => {
  const menuItems = [
    { id: 'inicio', label: 'Inicio' },
    { id: 'servicios', label: 'Nosotros' },
  ]

  return (
    <header style={{
      position: 'sticky',
      top: 0,
      backgroundColor: '#fff',
      borderBottom: '2px solid #007bff',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '1rem 2rem',
      zIndex: 1000,
    }}>
      <h2 style={{ margin: 0, fontWeight: '700', color: '#10394D' }}>QuitoEmprende</h2>
      <nav>
        {menuItems.map(item => (
          <button
            key={item.id}
            onClick={() => onChangeSection(item.id)}
            style={{
              margin: '0 1rem',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              fontWeight: active === item.id ? '700' : '400',
              color: active === item.id ? '#007bff' : '#10394D',
              fontSize: '1rem',
            }}
          >
            {item.label}
          </button>
        ))}
        <button
          style={{
            margin: '0 1rem',
            padding: '0.3rem 0.8rem',
            backgroundColor: '#007bff',
            border: 'none',
            borderRadius: 5,
            color: '#fff',
            cursor: 'pointer',
            fontWeight: '700',
          }}
          onClick={() => alert('Aquí iría login')}
        >
          Iniciar sesión
        </button>
      </nav>
    </header>
  )
}

const Homee = () => {
  const [section, setSection] = useState('inicio')

  return (
    <div style={{ fontFamily: "'Poppins', sans-serif", color: '#10394D', maxWidth: 1200, margin: 'auto' }}>
      <Header onChangeSection={setSection} active={section} />

      <main style={{ padding: '2rem', minHeight: '80vh' }}>
        {section === 'inicio' && (
          <>
            {/* Hero Section */}
            <section style={{
              backgroundImage: `url(${heroBg})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              minHeight: '60vh',
              maxHeight: '600px',
              width: '100%',
              position: 'relative',
              color: '#fff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              textAlign: 'center',
              borderRadius: 8,
              overflow: 'hidden',
              marginBottom: '2rem',
              padding: '2rem'
            }}>
              {/* Overlay */}
              <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                backgroundColor: 'rgba(0, 0, 0, 0.5)',
                zIndex: 1
              }} />

              {/* Contenido */}
              <div style={{ position: 'relative', zIndex: 2, maxWidth: '800px' }}>
                <h1 style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>Conecta, Vende y Crece</h1>
                <p style={{ fontSize: '1.25rem', marginBottom: '1rem' }}>
                  QuitoEmprende: Tu espacio digital
                </p>
                <p style={{ fontSize: '1.1rem', marginBottom: '2rem' }}>
                  Un lugar donde los emprendedores promocionan sus productos y reciben su propia página web con URL personalizada.
                </p>
                <button style={{
                  padding: '0.75rem 1.5rem',
                  backgroundColor: '#007bff',
                  color: '#fff',
                  border: 'none',
                  borderRadius: 5,
                  marginRight: 10,
                  cursor: 'pointer',
                  fontWeight: '600',
                  fontSize: '1rem'
                }}>
                  Explorar productos
                </button>
                <button style={{
                  padding: '0.75rem 1.5rem',
                  backgroundColor: '#28a745',
                  color: '#fff',
                  border: 'none',
                  borderRadius: 5,
                  cursor: 'pointer',
                  fontWeight: '600',
                  fontSize: '1rem'
                }}>
                  Crear mi sitio web
                </button>
              </div>
            </section>

            {/* Productos Destacados */}
            <section>
              <h2 style={{ borderBottom: '3px solid #007bff', display: 'inline-block', paddingBottom: '0.25rem' }}>
                Productos Destacados
              </h2>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '1.5rem',
                marginTop: '1.5rem'
              }}>
                {productosMock.map(producto => (
                  <div key={producto.id} style={{
                    border: '1px solid #ccc',
                    borderRadius: 8,
                    padding: '1rem',
                    boxShadow: '0 2px 5px rgba(0,0,0,0.1)'
                  }}>
                    <img src={producto.imagen} alt={producto.nombre} style={{ width: '100%', borderRadius: 5 }} />
                    <h3 style={{ marginTop: 10 }}>{producto.nombre}</h3>
                    <p style={{ color: '#28a745', fontWeight: '700' }}>${producto.precio}</p>
                    <button style={{
                      padding: '0.5rem 1rem',
                      backgroundColor: '#007bff',
                      color: '#fff',
                      border: 'none',
                      borderRadius: 5,
                      cursor: 'pointer',
                      fontWeight: '600'
                    }}>
                      Ver más
                    </button>
                  </div>
                ))}
              </div>
            </section>

            {/* Emprendimientos Destacados */}
            <section style={{ marginTop: '3rem' }}>
              <h2 style={{ borderBottom: '3px solid #007bff', display: 'inline-block', paddingBottom: '0.25rem' }}>
                Explora Emprendimientos
              </h2>
              <div style={{
                display: 'flex',
                overflowX: 'auto',
                gap: '1rem',
                padding: '1rem 0',
                marginTop: '1rem'
              }}>
                {emprendimientosMock.map(emp => (
                  <div key={emp.id} style={{
                    minWidth: 250,
                    border: '1px solid #ccc',
                    borderRadius: 8,
                    padding: '1rem',
                    boxShadow: '0 2px 5px rgba(0,0,0,0.1)',
                    backgroundColor: '#f9f9f9',
                    flexShrink: 0
                  }}>
                    <h3>{emp.nombre}</h3>
                    <p>{emp.descripcion}</p>
                    <a href={emp.url} style={{
                      color: '#007bff',
                      fontWeight: '600',
                      textDecoration: 'none',
                      cursor: 'pointer'
                    }}>
                      Visitar sitio
                    </a>
                  </div>
                ))}
              </div>
            </section>
          </>
        )}

        {section === 'nosotros' && (
          <section>
            <h1>Nosotros</h1>
            <p>Somos una plataforma que conecta emprendedores con clientes.</p>
          </section>
        )}

        {section === 'servicios' && <Servicios />}

        {section === 'contacto' && (
          <section>
            <h1>Contacto</h1>
            <p>Escríbenos, estamos para ayudarte.</p>
          </section>
        )}
      </main>

      <footer style={{
        marginTop: '4rem',
        padding: '1rem 2rem',
        backgroundColor: '#10394D',
        color: 'white',
        textAlign: 'center',
        borderRadius: 8,
        fontSize: '0.9rem'
      }}>
        © 2025 QuitoEmprende. Todos los derechos reservados.
      </footer>
    </div>
  )
}

export default Homee
