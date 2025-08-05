import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import heroBg from '../pages/Imagenes/fondo.png'
import Servicios from './pgPrueba/Servicios'

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
      <nav style={{ display: 'flex', alignItems: 'center' }}>
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
        <Link to="/login" style={{
          listStyle: 'none',
          backgroundColor: '#007bff',
          color: '#fff',
          borderRadius: 5,
          padding: '0.5rem 1rem',
          fontWeight: '600',
          textDecoration: 'none',
          marginLeft: '1rem'
        }}>
          Inicio de sesión
        </Link>
      </nav>
    </header>
  )
}

export const Home = () => {
  const [section, setSection] = useState('inicio')
  const [emprendimientos, setEmprendimientos] = useState([])

  useEffect(() => {
    fetch('https://backend-production-bd1d.up.railway.app/api/emprendimientos/publicos')
      .then(res => res.json())
      .then(data => setEmprendimientos(data))
      .catch(error => console.error('Error al cargar emprendimientos:', error))
  }, [])

  const productosMock = [
    { id: 1, nombre: 'Camiseta artesanal', precio: 20, imagen: 'https://via.placeholder.com/150' },
    { id: 2, nombre: 'Joyería fina', precio: 45, imagen: 'https://via.placeholder.com/150' },
    { id: 3, nombre: 'Arte en madera', precio: 70, imagen: 'https://via.placeholder.com/150' }
  ]

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
              height: '60vh',
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
              <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                backgroundColor: 'rgba(0, 0, 0, 0.5)',
                zIndex: 1
              }} />
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
                    boxShadow: '0 2px 5px rgba(0,0,0,0.1)',
                    backgroundColor: '#fff'
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

            {/* Emprendimientos Destacados desde la API */}
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
                {emprendimientos.length === 0 ? (
                  <p>Cargando emprendimientos...</p>
                ) : (
                  emprendimientos.map(emp => (
                    <div key={emp._id} style={{
                      minWidth: 280,
                      border: '1px solid #ccc',
                      borderRadius: 8,
                      padding: '1rem',
                      backgroundColor: '#f9f9f9',
                      boxShadow: '0 2px 5px rgba(0,0,0,0.1)',
                      flexShrink: 0
                    }}>
                      <img src={emp.logo} alt={emp.nombreComercial} style={{ width: '100%', borderRadius: 6, marginBottom: 10 }} />
                      <h3>{emp.nombreComercial}</h3>
                      <p style={{ fontSize: '0.95rem', margin: '0.5rem 0' }}>{emp.descripcion}</p>
                      <p style={{ fontSize: '0.85rem', color: '#666' }}>
                        {emp.ubicacion?.ciudad} - {emp.ubicacion?.direccion}
                      </p>
                      <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem', flexWrap: 'wrap' }}>
                        {emp.contacto?.sitioWeb && (
                          <a href={emp.contacto.sitioWeb} target="_blank" rel="noreferrer" style={{ color: '#007bff', textDecoration: 'none' }}>Sitio web</a>
                        )}
                        {emp.contacto?.facebook && (
                          <a href={emp.contacto.facebook} target="_blank" rel="noreferrer" style={{ color: '#3b5998', textDecoration: 'none' }}>Facebook</a>
                        )}
                        {emp.contacto?.instagram && (
                          <a href={emp.contacto.instagram} target="_blank" rel="noreferrer" style={{ color: '#C13584', textDecoration: 'none' }}>Instagram</a>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </section>
          </>
        )}

        {section === 'servicios' && <Servicios />}
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
