import { useState, useEffect, useRef } from "react";

const Chat = () => {
  const [chatActivo, setChatActivo] = useState(false);
  const [emisorId, setEmisorId] = useState("");
  const [emisorRol, setEmisorRol] = useState("Administrador");
  const [receptorId, setReceptorId] = useState("");
  const [receptorRol, setReceptorRol] = useState("Emprendedor");
  const [mensaje, setMensaje] = useState("");
  const [mensajes, setMensajes] = useState([]);
  const [conversacionId, setConversacionId] = useState(null);
  const [info, setInfo] = useState("");
  const mensajesRef = useRef(null);

  // Función para iniciar chat
  const iniciarChat = async (e) => {
    e.preventDefault();
    if (!emisorId.trim() || !receptorId.trim()) {
      alert("Completa los campos requeridos");
      return;
    }

    try {
      // Crear o iniciar conversación enviando mensaje inicial
      const res = await fetch(
        "https://backend-production-bd1d.up.railway.app/api/chat/mensaje",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            emisorId,
            emisorRol,
            receptorId,
            receptorRol,
            contenido: "📨 Conversación iniciada",
          }),
        }
      );
      const data = await res.json();
      if (res.ok) {
        setConversacionId(data.data.conversacion);
        setChatActivo(true);
        setMensaje("");
        setInfo("Mensajes no leidos");
      } else {
        setInfo("❌ Error iniciando chat");
      }
    } catch (error) {
      setInfo("❌ Error de red: " + error.message);
    }
  };

  // Función para obtener mensajes del backend
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
      setInfo("❌ Error cargando mensajes");
    }
  };

  // Efecto para cargar mensajes inicialmente y hacer polling cada 3 segundos
  useEffect(() => {
    if (!conversacionId) return;

    obtenerMensajes(); // carga inicial

    const interval = setInterval(() => {
      obtenerMensajes();
    }, 3000);

    return () => clearInterval(interval);
  }, [conversacionId]);

  // Auto scroll al último mensaje
  useEffect(() => {
    if (mensajesRef.current) {
      mensajesRef.current.scrollTop = mensajesRef.current.scrollHeight;
    }
  }, [mensajes]);

  // Función para enviar mensajes
  const handleEnviar = async (e) => {
    e.preventDefault();
    if (mensaje.trim() === "") return;

    try {
      const res = await fetch(
        "https://backend-production-bd1d.up.railway.app/api/chat/mensaje",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            emisorId,
            emisorRol,
            receptorId,
            receptorRol,
            contenido: mensaje.trim(),
          }),
        }
      );
      const data = await res.json();
      if (res.ok) {
        // Aquí no agregamos manualmente para evitar duplicados,
        // el polling actualizará la lista en unos segundos.
        setMensaje("");
        setInfo("");
      } else {
        setInfo("❌ Error: " + (data.mensaje || "Error desconocido"));
      }
    } catch (error) {
      setInfo("❌ Error de red: " + error.message);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10 p-4 font-sans">
      {!chatActivo ? (
        <form
          onSubmit={iniciarChat}
          className="space-y-4 bg-white p-6 rounded-lg shadow-lg"
        >
          <input
            type="text"
            placeholder="ID del emisor"
            value={emisorId}
            onChange={(e) => setEmisorId(e.target.value)}
            className="w-full border border-gray-300 rounded-md p-3 focus:outline-none focus:ring-2 focus:ring-purple-600"
          />
          <select
            value={emisorRol}
            onChange={(e) => setEmisorRol(e.target.value)}
            className="w-full border border-gray-300 rounded-md p-3 focus:outline-none focus:ring-2 focus:ring-purple-600"
          >
            <option>Administrador</option>
            <option>Emprendedor</option>
            <option>Cliente</option>
          </select>

          <input
            type="text"
            placeholder="ID del receptor"
            value={receptorId}
            onChange={(e) => setReceptorId(e.target.value)}
            className="w-full border border-gray-300 rounded-md p-3 focus:outline-none focus:ring-2 focus:ring-purple-600"
          />
          <select
            value={receptorRol}
            onChange={(e) => setReceptorRol(e.target.value)}
            className="w-full border border-gray-300 rounded-md p-3 focus:outline-none focus:ring-2 focus:ring-purple-600"
          >
            <option>Administrador</option>
            <option>Emprendedor</option>
            <option>Cliente</option>
          </select>

          <button
            type="submit"
            className="w-full bg-purple-700 text-white py-3 rounded-md font-semibold hover:bg-purple-900 transition-colors"
          >
            Ingresar al chat
          </button>
          {info && (
            <p
              className={`text-center mt-2 ${
                info.startsWith("✅") ? "text-green-600" : "text-red-600"
              }`}
            >
              {info}
            </p>
          )}
        </form>
      ) : (
        <div className="bg-white rounded-lg shadow-lg flex flex-col h-[500px]">
          <div
            ref={mensajesRef}
            className="flex-grow overflow-y-auto p-4 space-y-3 bg-gray-50"
          >
            {mensajes.length === 0 && (
              <p className="text-center text-gray-400">No hay mensajes aún.</p>
            )}
            {mensajes.map((msg) => {
              const esEmisor = msg.emisor === emisorId;
              return (
                <div
                  key={msg._id}
                  className={`max-w-[70%] p-3 rounded-xl shadow-sm text-sm break-words
                    ${esEmisor ? "bg-green-200 self-end text-right" : "bg-gray-200 self-start text-left"}
                  `}
                  style={{ wordWrap: "break-word" }}
                >
                  {msg.contenido}
                  <div className="text-xs text-gray-500 mt-1">{msg.emisorRol}</div>
                </div>
              );
            })}
          </div>

          <form
            onSubmit={handleEnviar}
            className="p-4 flex gap-3 border-t border-gray-300"
          >
            <input
              type="text"
              placeholder="Escribe un mensaje"
              value={mensaje}
              onChange={(e) => setMensaje(e.target.value)}
              className="flex-grow border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-600"
              autoComplete="off"
              autoFocus
            />
            <button
              type="submit"
              className="bg-green-700 text-white px-5 py-2 rounded-lg font-semibold hover:bg-green-900 transition-colors"
            >
              Enviar
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

export default Chat;
