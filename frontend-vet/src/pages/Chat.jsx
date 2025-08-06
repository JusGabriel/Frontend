import { useEffect, useRef, useState } from "react";
import storeAuth from "../context/storeAuth";

const Chat = () => {
  const { id: usuarioId, rol: emisorRol } = storeAuth();

  const [conversacionId, setConversacionId] = useState(null);
  const [mensaje, setMensaje] = useState("");
  const [mensajes, setMensajes] = useState([]);
  const [conversaciones, setConversaciones] = useState([]);
  const mensajesRef = useRef(null);

  // Carga conversaciones del usuario
  const cargarConversaciones = async () => {
    try {
      const res = await fetch(
        `https://backend-production-bd1d.up.railway.app/api/chat/conversaciones/${usuarioId}`
      );
      const data = await res.json();
      setConversaciones(data);
    } catch (error) {
      console.error("Error cargando conversaciones", error);
    }
  };

  // Carga mensajes de la conversación actual
  const obtenerMensajes = async () => {
    if (!conversacionId) return;
    try {
      const res = await fetch(
        `https://backend-production-bd1d.up.railway.app/api/chat/mensajes/${conversacionId}`
      );
      const data = await res.json();
      setMensajes(data);
    } catch (error) {
      console.error("Error cargando mensajes", error);
    }
  };

  useEffect(() => {
    if (usuarioId) cargarConversaciones();
  }, [usuarioId]);

  useEffect(() => {
    if (conversacionId) {
      obtenerMensajes();
      const interval = setInterval(obtenerMensajes, 3000);
      return () => clearInterval(interval);
    }
  }, [conversacionId]);

  // Scroll suave al último mensaje
  useEffect(() => {
    if (mensajesRef.current) {
      mensajesRef.current.scrollTo({
        top: mensajesRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [mensajes]);

  const handleEnviar = async (e, receptorId, receptorRol) => {
    e.preventDefault();
    if (!mensaje.trim() || !receptorId || !receptorRol) return;

    try {
      const res = await fetch(
        "https://backend-production-bd1d.up.railway.app/api/chat/mensaje",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            emisorId: usuarioId,
            emisorRol,
            receptorId,
            receptorRol,
            contenido: mensaje.trim(),
          }),
        }
      );

      const data = await res.json();
      if (res.ok) {
        setMensaje("");
        obtenerMensajes();
        cargarConversaciones();
      } else {
        alert("Error: " + (data.mensaje || "Error desconocido"));
      }
    } catch (error) {
      console.error("Error al enviar mensaje", error);
    }
  };

  return (
    <div className="max-w-4xl mx-auto mt-12 p-4 bg-white rounded-lg shadow-lg">
      <h2 className="text-3xl font-extrabold text-center text-purple-800 mb-6 tracking-wide">
        Chat General
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-[600px]">
        {/* Lista de conversaciones */}
        <aside className="col-span-1 border rounded-lg shadow-sm overflow-y-auto bg-gray-50">
          <h3 className="text-xl font-semibold text-gray-700 px-6 py-4 border-b">
            Conversaciones
          </h3>
          {conversaciones.length === 0 ? (
            <p className="p-6 text-gray-400 italic text-center">
              No tienes conversaciones aún.
            </p>
          ) : (
            <ul>
              {conversaciones.map((conv) => {
                const otro = conv.participantes.find(
                  (p) => p.id._id !== usuarioId
                );
                const seleccionado = conv._id === conversacionId;

                return (
                  <li key={conv._id} className="border-b last:border-b-0">
                    <button
                      onClick={() => setConversacionId(conv._id)}
                      className={`flex items-center gap-4 w-full px-6 py-4 hover:bg-purple-100 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-colors ${
                        seleccionado
                          ? "bg-purple-200 font-semibold shadow-inner"
                          : "bg-transparent"
                      }`}
                      aria-current={seleccionado ? "true" : "false"}
                    >
                      {/* Avatar con iniciales */}
                      <div className="flex-shrink-0 w-12 h-12 rounded-full bg-purple-400 text-white flex items-center justify-center font-bold text-lg select-none">
                        {otro.id.nombre.charAt(0)}
                        {otro.id.apellido.charAt(0)}
                      </div>

                      <div className="flex flex-col text-left">
                        <span className="text-purple-900 text-lg leading-tight truncate">
                          {otro.id.nombre} {otro.id.apellido}
                        </span>
                        <span className="text-sm text-purple-700 bg-purple-100 px-2 py-0.5 rounded-full w-max font-medium select-none uppercase tracking-widest">
                          {otro.rol}
                        </span>
                      </div>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </aside>

        {/* Chat actual */}
        <section className="col-span-2 flex flex-col border rounded-lg shadow-sm bg-white">
          {/* Mensajes */}
          <div
            ref={mensajesRef}
            className="flex-grow overflow-y-auto p-6 space-y-4 bg-gray-50"
            role="log"
            aria-live="polite"
            aria-relevant="additions"
          >
            {mensajes.length === 0 ? (
              <p className="text-center text-gray-400 italic mt-12">
                No hay mensajes aún. Comienza la conversación.
              </p>
            ) : (
              mensajes.map((msg) => {
                const esMio = msg.emisor === usuarioId;

                return (
                  <div
                    key={msg._id}
                    className={`max-w-[75%] px-5 py-3 rounded-2xl relative break-words text-sm shadow-sm ${
                      esMio
                        ? "bg-green-200 text-green-900 self-end ml-auto rounded-br-none"
                        : "bg-purple-100 text-purple-900 self-start mr-auto rounded-bl-none"
                    }`}
                    aria-label={esMio ? "Mensaje enviado" : "Mensaje recibido"}
                  >
                    {msg.contenido}

                    <div className="mt-1 text-xs text-gray-500 italic select-none">
                      {msg.emisorRol}
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Input para enviar mensaje */}
          {conversacionId && (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const conv = conversaciones.find((c) => c._id === conversacionId);
                const receptor = conv?.participantes?.find(
                  (p) => p.id._id !== usuarioId
                );
                if (receptor) {
                  handleEnviar(e, receptor.id._id, receptor.rol);
                }
              }}
              className="border-t px-6 py-4 flex gap-4 items-center bg-white"
              aria-label="Enviar mensaje"
            >
              <input
                type="text"
                value={mensaje}
                onChange={(e) => setMensaje(e.target.value)}
                className="flex-grow border border-gray-300 rounded-full px-5 py-3 text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition"
                placeholder="Escribe un mensaje..."
                autoComplete="off"
                aria-required="true"
                aria-label="Campo para escribir mensaje"
              />
              <button
                type="submit"
                disabled={!mensaje.trim()}
                className={`bg-purple-700 text-white px-6 py-3 rounded-full font-semibold shadow-md hover:bg-purple-900 focus:outline-none focus:ring-2 focus:ring-purple-600 transition disabled:bg-purple-300 disabled:cursor-not-allowed`}
                aria-disabled={!mensaje.trim()}
              >
                Enviar
              </button>
            </form>
          )}
        </section>
      </div>
    </div>
  );
};

export default Chat;
