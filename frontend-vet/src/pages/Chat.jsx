import { useEffect, useRef, useState } from "react";
import storeAuth from "../context/storeAuth";

const Chat = () => {
  const { id: usuarioId, rol: emisorRol } = storeAuth();

  const [vista, setVista] = useState("chat");
  const [conversacionId, setConversacionId] = useState(null);
  const [mensaje, setMensaje] = useState("");
  const [mensajes, setMensajes] = useState([]);
  const [conversaciones, setConversaciones] = useState([]);
  const mensajesRef = useRef(null);

  // Obtener conversaciones del usuario
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

  // Obtener mensajes de la conversación actual
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

  useEffect(() => {
    if (mensajesRef.current) {
      mensajesRef.current.scrollTop = mensajesRef.current.scrollHeight;
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
    <div className="max-w-3xl mx-auto mt-10 p-4">
      <h2 className="text-xl font-bold text-center mb-4">Chat General</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Lista de conversaciones */}
        <div className="border rounded-md p-3 max-h-[500px] overflow-y-auto">
          <h3 className="text-lg font-semibold mb-2">Conversaciones</h3>
          {conversaciones.length === 0 ? (
            <p className="text-sm text-gray-500">No hay conversaciones aún.</p>
          ) : (
            conversaciones.map((conv) => {
              const otro = conv.participantes.find((p) => p.id._id !== usuarioId);
              return (
                <button
                  key={conv._id}
                  onClick={() => setConversacionId(conv._id)}
                  className={`w-full text-left p-2 mb-2 rounded-md border hover:bg-purple-50 ${
                    conv._id === conversacionId ? "bg-purple-100 border-purple-700" : ""
                  }`}
                >
                  <p className="font-medium text-purple-800">
                    {otro.id.nombre} {otro.id.apellido}
                  </p>
                  <p className="text-xs text-gray-500">{otro.rol}</p>
                </button>
              );
            })
          )}
        </div>

        {/* Chat actual */}
        <div className="border rounded-md flex flex-col h-[500px]">
          <div
            ref={mensajesRef}
            className="flex-grow overflow-y-auto p-3 bg-gray-50"
          >
            {mensajes.length === 0 ? (
              <p className="text-center text-gray-500">No hay mensajes aún.</p>
            ) : (
              mensajes.map((msg) => {
                const esMio = msg.emisor === usuarioId;
                return (
                  <div
                    key={msg._id}
                    className={`max-w-[70%] p-3 rounded-md mb-2 text-sm break-words ${
                      esMio
                        ? "bg-green-200 self-end text-right ml-auto"
                        : "bg-gray-200 self-start text-left mr-auto"
                    }`}
                  >
                    {msg.contenido}
                    <div className="text-xs text-gray-500 mt-1">{msg.emisorRol}</div>
                  </div>
                );
              })
            )}
          </div>

          {conversacionId && (
            <form
              onSubmit={(e) => {
                const conv = conversaciones.find((c) => c._id === conversacionId);
                const receptor = conv?.participantes?.find((p) => p.id._id !== usuarioId);
                if (receptor) {
                  handleEnviar(e, receptor.id._id, receptor.rol);
                }
              }}
              className="p-3 border-t flex gap-3 bg-white"
            >
              <input
                type="text"
                value={mensaje}
                onChange={(e) => setMensaje(e.target.value)}
                className="flex-grow border border-gray-300 rounded-lg px-4 py-2"
                placeholder="Escribe un mensaje"
                autoComplete="off"
              />
              <button
                type="submit"
                className="bg-purple-700 text-white px-4 py-2 rounded-lg hover:bg-purple-900"
              >
                Enviar
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default Chat;
