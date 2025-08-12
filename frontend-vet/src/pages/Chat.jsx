import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import storeAuth from '../context/storeAuth';

const Chat = () => {
  const { conversacionId } = useParams();
  const { id: usuarioId, rol: usuarioRol } = storeAuth();

  const [mensajes, setMensajes] = useState([]);
  const [nuevoMensaje, setNuevoMensaje] = useState('');
  const mensajesEndRef = useRef(null);

  // Función para cargar mensajes
  const cargarMensajes = async () => {
    try {
      const res = await fetch(`https://backend-production-bd1d.up.railway.app/api/mensajes/conversacion/${conversacionId}`);
      const data = await res.json();
      setMensajes(data);
      scrollToBottom();
    } catch (error) {
      console.error('Error cargando mensajes:', error);
    }
  };

  // useEffect con polling cada 3 segundos
  useEffect(() => {
    if (!conversacionId) return;

    cargarMensajes();

    const interval = setInterval(() => {
      cargarMensajes();
    }, 3000);

    return () => clearInterval(interval);
  }, [conversacionId]);

  // Scroll automático al último mensaje
  const scrollToBottom = () => {
    if (mensajesEndRef.current) {
      mensajesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Enviar mensaje
  const handleEnviarMensaje = async () => {
    if (!nuevoMensaje.trim()) return;

    const mensajeObj = {
      conversacion: conversacionId,
      emisor: usuarioId,
      emisorRol: usuarioRol,
      contenido: nuevoMensaje.trim(),
      leido: false,
      timestamp: new Date().toISOString(),
    };

    try {
      const res = await fetch('https://backend-production-bd1d.up.railway.app/api/mensajes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(mensajeObj),
      });

      if (!res.ok) throw new Error('Error al enviar mensaje');

      const mensajeGuardado = await res.json();

      setMensajes(prev => [...prev, mensajeGuardado]);
      setNuevoMensaje('');
      scrollToBottom();
    } catch (error) {
      console.error(error);
      alert('Error enviando mensaje');
    }
  };

  // Enviar mensaje al presionar Enter
  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleEnviarMensaje();
    }
  };

  return (
    <div className="flex flex-col h-full max-w-3xl mx-auto p-4 border rounded shadow bg-white">
      <div className="flex-grow overflow-auto mb-4" style={{ maxHeight: '70vh' }}>
        {mensajes.length === 0 && <p className="text-center text-gray-500 mt-4">No hay mensajes aún.</p>}

        {mensajes.map((msg) => (
          <div
            key={msg._id}
            className={`mb-2 p-2 rounded max-w-[70%] ${msg.emisor === usuarioId ? 'bg-[#AA4A44] text-white self-end' : 'bg-gray-200 text-gray-800 self-start'}`}
            style={{ alignSelf: msg.emisor === usuarioId ? 'flex-end' : 'flex-start' }}
          >
            <p className="whitespace-pre-wrap">{msg.contenido}</p>
            <small className="block mt-1 text-xs text-gray-400 text-right">
              {new Date(msg.timestamp).toLocaleString()}
            </small>
          </div>
        ))}

        <div ref={mensajesEndRef} />
      </div>

      <div className="flex gap-2">
        <textarea
          className="flex-grow border border-gray-300 rounded p-2 resize-none"
          rows={2}
          value={nuevoMensaje}
          onChange={(e) => setNuevoMensaje(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Escribe tu mensaje..."
        />
        <button
          onClick={handleEnviarMensaje}
          className="bg-[#AA4A44] text-white px-4 py-2 rounded hover:bg-[#883d3a] transition-colors"
        >
          Enviar
        </button>
      </div>
    </div>
  );
};

export default Chat;
