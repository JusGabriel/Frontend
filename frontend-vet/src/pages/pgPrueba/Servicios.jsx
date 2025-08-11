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

const Servicios = () => {
  return (
    <div>
      <h1>Servicios</h1>
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit,minmax(250px,1fr))',
        gap: '1.5rem',
        marginTop: '1rem',
      }}>
        {serviciosData.map(servicio => (
          <div key={servicio.id} style={{
            border: '1px solid #ccc',
            borderRadius: '10px',
            padding: '1.5rem',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            textAlign: 'center',
            backgroundColor: '#f9f9f9',
          }}>
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
