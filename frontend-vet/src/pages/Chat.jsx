import { useState, useEffect, useRef } from "react";

const Chat = () => {
  const [vista, setVista] = useState("chat"); // chat | quejas

  // Estados para CHAT
  const [usuarioId, setUsuarioId] = useState(""); // Para cargar conversaciones
  const [conversaciones, setConversaciones] = useState([]);
  const [conversacionActiva, setConversacionActiva] = useState(null);
  const [mensajes, setMensajes] = useState([]);
  const [mensaje, setMensaje] = useState("");
  const [info, setInfo] = useState("");

  // Estados para QUEJAS (ya los tienes)
  const [quejas, setQuejas] = useState([]);

  const mensajesRef = useRef(null);

  // Cargar conversaciones para usuario
  const cargarConversaciones = async () => {
    if (!usuarioId.trim()) {
      setConversaciones([]);
      setConversacionActiva(null);
      setMensajes([]);
      return;
    }
    try {
      const res = await fetch(
        `https://backend-production-bd1d.up.railway.app/api/chat/conversaciones/${usuarioId}`
      );
      if (!res.ok) throw new Error("Error cargando conversaciones");
      const data = await res.json();
      setConversaciones(data);
      setConversacionActiva(null);
      setMensajes([]);
      setInfo("");
    } catch (error) {
      setInfo("❌ " + error.message);
      setConversaciones([]);
      setConversacionActiva(null);
      setMensajes([]);
    }
  };

  // Cargar mensajes de conversación activa
  const cargarMensajes = async (conversacionId) => {
    if (!conversacionId) return;
    try {
      const res = await fetch(
        `https://backend-production-bd1d.up.railway.app/api/chat/mensajes/${conversacionId}`
      );
      if (!res.ok) throw new Error("Error cargando mensajes");
      const data = await res.json();
      setMensajes(data);
      setInfo("");
    } catch (error) {
      setInfo("❌ " + error.message);
      setMensajes([]);
    }
  };

  // Polling mensajes cada 3 segundos
  useEffect(() => {
    if (!conversacionActiva) return;

    cargarMensajes(conversacionActiva._id);

    const interval = setInterval(() => {
      cargarMensajes(conversacionActiva._id);
    }, 3000);

    return () => clearInterval(interval);
  }, [conversacionActiva]);

  // Auto scroll
  useEffect(() => {
    if (mensajesRef.current) {
      mensajesRef.current.scrollTop = mensajesRef.current.scrollHeight;
    }
  }, [mensajes]);

  // Enviar mensaje
  const handleEnviarMensaje = async (e) => {
    e.preventDefault();
    if (mensaje.trim() === "" || !conversacionActiva) return;

    // Para enviar, necesitamos saber emisorId y receptorId/roles.
    // Extraemos participantes para asignar roles correctamente:
    // Asumiremos que usuarioId es emisor y el otro participante es receptor.
    const emisorId = usuarioId;
    const emisorRol = conversacionActiva.participantes.find(p => p.id._id === usuarioId)?.rol || "Usuario";
    const receptor = conversacionActiva.participantes.find(p => p.id._id !== usuarioId);
    const receptorId = receptor?.id._id || "";
    const receptorRol = receptor?.rol || "";

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
        // No agregamos el mensaje manualmente porque el polling lo actualizará
        setInfo("");
      } else {
        setInfo("❌ Error: " + (data.mensaje || "Error desconocido"));
      }
    } catch (error) {
      setInfo("❌ Error de red: " + error.message);
    }
  };

  // Cargar quejas (mantener tu lógica)
  const cargarQuejas = async () => {
    try {
      const res = await fetch(
        "https://backend-production-bd1d.up.railway.app/api/quejas/todas-con-mensajes"
      );
      const data = await res.json();
      setQuejas(data);
    } catch (error) {
      console.error("Error cargando quejas", error);
    }
  };

  useEffect(() => {
    if (vista === "quejas") {
      cargarQuejas();
    }
  }, [vista]);

  return (
    <div className="max-w-3xl mx-auto mt-10 p-4 font-sans">
      {/* Selector de vista */}
      <div className="flex justify-center mb-6 gap-4">
        <button
          onClick={() => setVista("chat")}
          className={`px-4 py-2 rounded-full font-semibold transition-colors ${
            vista === "chat"
              ? "bg-purple-700 text-white"
              : "bg-gray-200 text-gray-700 hover:bg-purple-200"
          }`}
        >
          💬 Chat
        </button>
        <button
          onClick={() => setVista("quejas")}
          className={`px-4 py-2 rounded-full font-semibold transition-colors ${
            vista === "quejas"
              ? "bg-purple-700 text-white"
              : "bg-gray-200 text-gray-700 hover:bg-purple-200"
          }`}
        >
          📢 Quejas
        </button>
      </div>

      {/* VISTA CHAT */}
      {vista === "chat" && (
        <div>
          {/* Input para cargar conversaciones */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              cargarConversaciones();
            }}
            className="mb-4 flex gap-2"
          >
            <input
              type="text"
              placeholder="Ingresa tu ID de usuario"
              value={usuarioId}
              onChange={(e) => setUsuarioId(e.target.value)}
              className="flex-grow border border-gray-300 rounded-md p-3 focus:outline-none focus:ring-2 focus:ring-purple-600"
              required
            />
            <button
              type="submit"
              className="bg-purple-700 text-white px-5 py-3 rounded-md font-semibold hover:bg-purple-900 transition-colors"
            >
              Cargar Conversaciones
            </button>
          </form>

          {/* Lista de conversaciones */}
          <div className="mb-4 max-h-56 overflow-y-auto border border-gray-300 rounded-md p-2 bg-white">
            {conversaciones.length === 0 ? (
              <p className="text-center text-gray-500">No hay conversaciones.</p>
            ) : (
              conversaciones.map((conv) => {
                const otroParticipante = conv.participantes.find(
                  (p) => p.id._id !== usuarioId
                );
                const nombreCompleto = otroParticipante
                  ? `${otroParticipante.id.nombre} ${otroParticipante.id.apellido}`
                  : "Usuario desconocido";

                return (
                  <button
                    key={conv._id}
                    onClick={() => setConversacionActiva(conv)}
                    className={`w-full text-left px-3 py-2 rounded-md mb-1 ${
                      conversacionActiva?._id === conv._id
                        ? "bg-purple-700 text-white"
                        : "hover:bg-purple-100"
                    }`}
                  >
                    {nombreCompleto}
                    <span className="block text-xs text-gray-400">
                      Última actualización:{" "}
                      {new Date(conv.ultimaActualizacion).toLocaleString()}
                    </span>
                  </button>
                );
              })
            )}
          </div>

          {/* Chat activo */}
          {conversacionActiva && (
            <div className="bg-white rounded-lg shadow-lg flex flex-col h-[450px]">
              <div
                ref={mensajesRef}
                className="flex-grow overflow-y-auto p-4 space-y-3 bg-gray-50"
              >
                {mensajes.length === 0 ? (
                  <p className="text-center text-gray-400">No hay mensajes aún.</p>
                ) : (
                  mensajes.map((msg) => {
                    const esEmisor = msg.emisor === usuarioId;
                    return (
                      <div
                        key={msg._id}
                        className={`max-w-[70%] p-3 rounded-xl shadow-sm text-sm break-words ${
                          esEmisor
                            ? "bg-green-200 self-end text-right"
                            : "bg-gray-200 self-start text-left"
                        }`}
                      >
                        {msg.contenido}
                        <div className="text-xs text-gray-500 mt-1">
                          {msg.emisorRol}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              <form
                onSubmit={handleEnviarMensaje}
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

          {info && (
            <p
              className={`text-center mt-2 ${
                info.startsWith("✅") ? "text-green-600" : "text-red-600"
              }`}
            >
              {info}
            </p>
          )}
        </div>
      )}

      {/* VISTA QUEJAS (mantén tu código para quejas) */}
      {vista === "quejas" && (
        <div className="bg-white rounded-lg shadow-md p-4 space-y-4 max-h-[600px] overflow-y-auto">
          {quejas.length === 0 ? (
            <p className="text-center text-gray-500">No hay quejas registradas.</p>
          ) : (
            quejas.map((q) => (
              <div
                key={q._id}
                className="border border-gray-200 p-4 rounded-md shadow-sm"
              >
                <p className="text-sm text-gray-600">
                  <strong>Emisor:</strong>{" "}
                  {q.participantes.find((p) => p.rol === "Emprendedor")?.id
                    ?.nombre || ""}
                  {" "}
                  {q.participantes.find((p) => p.rol === "Emprendedor")?.id
                    ?.apellido || ""}
                </p>
                <p className="text-sm text-gray-600">
                  <strong>Receptor:</strong>{" "}
                  {q.participantes.find((p) => p.rol === "Administrador")?.id
                    ?.nombre || ""}
                  {" "}
                  {q.participantes.find((p) => p.rol === "Administrador")?.id
                    ?.apellido || ""}
                </p>
                <p className="mt-2 text-gray-800">
                  <strong>Último mensaje:</strong>{" "}
                  {q.mensajes[q.mensajes.length - 1]?.contenido}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {new Date(q.updatedAt).toLocaleString()}
                </p>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default Chat;
