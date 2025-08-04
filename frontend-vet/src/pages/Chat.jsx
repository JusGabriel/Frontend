import { useState, useEffect, useRef } from "react";
import storeAuth from "./path/to/storeAuth"; // Ajusta la ruta real
import storeProfile from "./path/to/storeProfile"; // Ajusta la ruta real

const Chat = () => {
  // Obtén token, rol e id usuario autenticado desde el store
  // Por ejemplo, supongamos que el storeProfile guarda el usuario con su id y rol
  const emisorId = storeProfile((state) => state.user?._id || "");
  const emisorRol = storeProfile((state) => state.user?.rol || "");
  // Si no usas user.rol, podrías obtenerlo desde storeAuth o ajustar según tu modelo

  const [chatActivo, setChatActivo] = useState(false);
  const [receptorId, setReceptorId] = useState("");
  const [receptorRol, setReceptorRol] = useState("Emprendedor");
  const [mensaje, setMensaje] = useState("");
  const [mensajes, setMensajes] = useState([]);
  const [conversacionId, setConversacionId] = useState(null);
  const [info, setInfo] = useState("");
  const mensajesRef = useRef(null);

  // Iniciar chat sin enviar mensaje inicial
  const iniciarChat = (e) => {
    e.preventDefault();
    if (!emisorId.trim() || !receptorId.trim()) {
      alert("Completa los campos requeridos");
      return;
    }
    // Crear id conversación basado en IDs ordenados para que sea único y consistente
    const idConv = [emisorId, receptorId].sort().join("_");
    setConversacionId(idConv);
    setChatActivo(true);
    setMensaje("");
    setInfo("✅ Chat iniciado");
  };

  // Obtener mensajes de la conversación
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

  // Polling cada 3 segundos para refrescar mensajes
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

  // Enviar mensaje
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
        setMensaje("");
        setInfo("");
        // No añadimos mensaje manualmente porque el polling lo refresca
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
          {/* No mostramos inputs para emisor, vienen del store */}
          <div className="p-2 bg-green-100 rounded text-green-800 font-medium">
            Usuario autenticado: <strong>{emisorId || "Cargando..."}</strong> - Rol:{" "}
            <strong>{emisorRol || "Cargando..."}</strong>
          </div>

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
            disabled={!emisorId || !emisorRol} // Deshabilitar si no hay usuario autenticado
            className="w-full bg-purple-700 text-white py-3 rounded-md font-semibold hover:bg-purple-900 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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
