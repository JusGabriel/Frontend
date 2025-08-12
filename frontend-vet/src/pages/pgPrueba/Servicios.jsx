import React from 'react'

const serviciosData = [
  {
    id: 1,
    titulo: 'Hosting para emprendedores',
    descripcion: 'Obtén tu propia página web personalizada con URL única.',
    icono: '🌐',
  },
  {
    id: 2,
    titulo: 'Soporte técnico',
    descripcion: 'Asistencia dedicada para resolver cualquier problema.',
    icono: '🛠️',
  },
  {
    id: 3,
    titulo: 'Cursos y talleres',
    descripcion: 'Capacitación para potenciar tus ventas y marketing digital.',
    icono: '📚',
  },
  {
    id: 4,
    titulo: 'Comunidad emprendedora',
    descripcion: 'Conecta con otros emprendedores, comparte ideas y crece.',
    icono: '🤝',
  },
]

const equipo = [
  { nombre: 'Cristian Tambaco', rol: 'UX/UI Designer' },
  { nombre: 'Justin Imbaquingo', rol: 'Desarrollador Frontend' },
  { nombre: 'Sebastian Betancourt', rol: 'Desarrollador Backend' },
]

const Servicios = () => {
  return (
    <div style={{ maxWidth: 960, margin: '2rem auto', padding: '0 1rem', fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif", color: '#222' }}>
      
      {/* Sobre Nosotros */}
      <section style={{
        backgroundColor: '#e9f0fb',
        padding: '1.5rem 2rem',
        borderRadius: '10px',
        marginBottom: '3rem',
        boxShadow: '0 2px 10px rgba(0,0,0,0.05)'
      }}>
        <h2 style={{ color: '#003366', borderBottom: '3px solid #007bff', display: 'inline-block', paddingBottom: '0.3rem', marginBottom: '1rem' }}>
          Sobre Nosotros
        </h2>
        <p style={{ fontSize: '1.1rem', maxWidth: 700, marginBottom: '1.5rem' }}>
          Somos estudiantes de la Escuela Politécnica Nacional, carrera de Tecnología Superior en Desarrollo de Software.
          Apasionados por crear soluciones digitales que empoderen a los emprendedores de Quito.
        </p>
        <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap' }}>
          {equipo.map((miembro, i) => (
            <div key={i} style={{
              backgroundColor: '#fff',
              padding: '1rem 1.5rem',
              borderRadius: '10px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
              display: 'flex',
              alignItems: 'center',
              minWidth: 220,
            }}>
              <div style={{
                width: 50,
                height: 50,
                borderRadius: '50%',
                backgroundColor: '#007bff',
                color: '#fff',
                fontWeight: '700',
                fontSize: '1.5rem',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                marginRight: '1rem',
                userSelect: 'none',
              }}>
                {miembro.nombre.charAt(0)}
              </div>
              <div>
                <h4 style={{ margin: '0 0 0.3rem' }}>{miembro.nombre}</h4>
                <p style={{ margin: 0, fontStyle: 'italic', color: '#555' }}>{miembro.rol}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Servicios */}
      <h1 style={{ color: '#004085', marginBottom: '1rem' }}>Servicios</h1>
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit,minmax(250px,1fr))',
        gap: '1.5rem',
      }}>
        {serviciosData.map(servicio => (
          <div key={servicio.id} style={{
            border: '1px solid #ccc',
            borderRadius: '10px',
            padding: '1.5rem',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            textAlign: 'center',
            backgroundColor: '#f9f9f9',
            transition: 'transform 0.2s ease',
            cursor: 'default',
          }}
            onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.03)'}
            onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
          >
            <div style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>
              {servicio.icono}
            </div>
            <h3 style={{ marginBottom: '0.5rem', color: '#007bff' }}>
              {servicio.titulo}
            </h3>
            <p style={{ color: '#444' }}>{servicio.descripcion}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

export default Servicios
