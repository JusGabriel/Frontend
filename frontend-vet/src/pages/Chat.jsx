import { useState, useEffect, useRef } from "react";

const Chat = () => {
  // Simulamos usuario autenticado (reemplaza por tu sistema auth real)
  const usuarioId = "64d73a0123456789abcdef01"; 
  const usuarioRol = "Emprendedor"; // Cambia según sea Administrador, Cliente, Emprendedor

  const [vista, setVista] = useState("chat"); // chat | quejas

  // Estados para CHAT
  const [conversaciones, setConversaciones] = useState([]);
  const [conversacionActiva, setConversacionActiva] = useState(null);
  const [mensajes, setMensajes] = useState([]);
  const [mensaje, setMensaje] = useState("");
  const [info, setInfo] = useState("");

  // Estados para QUEJAS
  const [quejas, setQuejas] = useState([]);
  const [quejaActiva, setQuejaActiva] = useState(null);
  const [mensajesQueja, setMensajesQueja] = useState([]);
  const [mensajeQueja, setMensajeQueja] = useState("");
  const [infoQueja, setInfoQueja] = useState("");

  const mensajesRef = useRef(null);
  const mensajesQuejaRef = useRef(null);

  // Cargar conversaciones al montar y cuando usuarioId cambia
  const cargarConversaciones = async () => {
    if (!usuarioId) return;
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

  // Enviar mensaje chat
  const handleEnviarMensaje = async (e) => {
    e.preventDefault();
    if (mensaje.trim() === "" || !conversacionActiva) return;

    const emisorId = usuarioId;
    const emisorRol =
      conversacionActiva.participantes.find((p) => p.id._id === usuarioId)?.rol ||
      "Usuario";
    const receptor = conversacionActiva.participantes.find(
      (p) => p.id._id !== usuarioId
    );
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
        setInfo("");
      } else {
        setInfo("❌ Error: " + (data.mensaje || "Error desconocido"));
      }
    } catch (error) {
      setInfo("❌ Error de red: " + error.message);
    }
  };

  // Polling mensajes chat
  useEffect(() => {
    if (!conversacionActiva) return;

    cargarMensajes(conversacionActiva._id);
    const interval = setInterval(() => {
      cargarMensajes(conversacionActiva._id);
    }, 3000);

    return () => clearInterval(interval);
  }, [conversacionActiva]);

  // Auto scroll chat
  useEffect(() => {
    if (mensajesRef.current) {
      mensajesRef.current.scrollTop = mensajesRef.current.scrollHeight;
    }
  }, [mensajes]);

  // Cargar quejas con mensajes
  const cargarQuejas = async () => {
    try {
      const res = await fetch(
        "https://backend-production-bd1d.up.railway.app/api/quejas/todas-con-mensajes"
      );
      if (!res.ok) throw new Error("Error cargando quejas");
      const data = await res.json();
      setQuejas(data);
      setQuejaActiva(null);
      setMensajesQueja([]);
      setInfoQueja("");
    } catch (error) {
      setInfoQueja("❌ " + error.message);
      setQuejas([]);
      setQuejaActiva(null);
      setMensajesQueja([]);
    }
  };

  // Seleccionar queja y cargar mensajes
  const seleccionarQueja = (queja) => {
    setQuejaActiva(queja);
    setMensajesQueja(queja.mensajes || []);
  };

  // Enviar mensaje queja
  const enviarMensajeQueja = async (e) => {
    e.preventDefault();
    if (mensajeQueja.trim() === "" || !quejaActiva) return;

    try {
      const res = await fetch(
        "https://backend-production-bd1d.up.railway.app/api/quejas/queja",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            emisorId: usuarioId,
            emisorRol: usuarioRol,
            contenido: mensajeQueja.trim(),
            // puedes agregar id de queja si el backend lo necesita
          }),
        }
      );
      const data = await res.json();
      if (res.ok) {
        setMensajeQueja("");
        setInfoQueja("");
        // Refrescar mensajes queja
        cargarQuejas();
        seleccionarQueja(quejaActiva); // recarga mensajes del chat queja seleccionado
      } else {
        setInfoQueja("❌ Error: " + (data.mensaje || "Error desconocido"));
      }
    } catch (error) {
      setInfoQueja("❌ Error de red: " + error.message);
    }
  };

  // Polling mensajes queja
  useEffect(() => {
    if (!quejaActiva) return;

    const interval = setInterval(() => {
      cargarQuejas();
      seleccionarQueja(quejaActiva);
    }, 3000);

    return () => clearInterval(interval);
  }, [quejaActiva]);

  // Auto scroll mensajes queja
  useEffect(() => {
    if (mensajesQuejaRef.current) {
      mensajesQuejaRef.current.scrollTop = mensajesQuejaRef.current.scrollHeight;
    }
  }, [mensajesQueja]);

  // Carga inicial de conversaciones
  useEffect(() => {
    cargarConversaciones();
  }, []);

  // Carga inicial quejas solo si la vista cambia a quejas
  useEffect(() => {
    if (vista === "quejas") cargarQuejas();
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
        <>
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
        </>
      )}

      {/* VISTA QUEJAS */}
      {vista === "quejas" && (
        <div className="flex flex-col md:flex-row gap-4">
          {/* Lista quejas */}
          <div className="md:w-1/3 bg-white rounded-lg shadow-md p-2 max-h-[600px] overflow-y-auto">
            <h2 className="font-semibold mb-2 text-center">Tus Quejas</h2>
            {quejas.length === 0 ? (
              <p className="text-center text-gray-500">No tienes quejas registradas.</p>
            ) : (
              quejas.map((q) => (
                <button
                  key={q._id}
                  onClick={() => seleccionarQueja(q)}
                  className={`w-full text-left px-3 py-2 rounded-md mb-1 ${
                    quejaActiva?._id === q._id
                      ? "bg-purple-700 text-white"
                      : "hover:bg-purple-100"
                  }`}
                >
                  <p className="font-semibold">
                    Emisor:{" "}
                    {q.participantes.find((p) => p.rol === "Emprendedor")?.id?.nombre ||
                      ""}
                    {" "}
                    {q.participantes.find((p) => p.rol === "Emprendedor")?.id?.apellido || ""}
                  </p>
                  <p className="font-semibold">
                    Receptor:{" "}
                    {q.participantes.find((p) => p.rol === "Administrador")?.id?.nombre || ""}
                    {" "}
                    {q.participantes.find((p) => p.rol === "Administrador")?.id?.apellido || ""}
                  </p>
                  <p className="text-xs text-gray-400 truncate max-w-full">
                    Último mensaje:{" "}
                    {q.mensajes && q.mensajes.length > 0
                      ? q.mensajes[q.mensajes.length - 1].contenido
                      : "Sin mensajes"}
                  </p>
                  <p className="text-xs text-gray-500">
                    {new Date(q.updatedAt).toLocaleString()}
                  </p>
                </button>
              ))
            )}
          </div>

          {/* Chat queja */}
          <div className="md:w-2/3 bg-white rounded-lg shadow-md flex flex-col h-[600px]">
            {!quejaActiva ? (
              <p className="m-auto text-gray-500">Selecciona una queja para ver y responder.</p>
            ) : (
              <>
                <div
                  ref={mensajesQuejaRef}
                  className="flex-grow overflow-y-auto p-4 space-y-3 bg-gray-50"
                >
                  {mensajesQueja.length === 0 ? (
                    <p className="text-center text-gray-400">No hay mensajes aún.</p>
                  ) : (
                    mensajesQueja.map((msg) => {
                      const esEmisor = msg.emisor === usuarioId;
                      return (
                        <div
                          key={msg._id}
                          className={`max-w-[70%] p-3 rounded-xl shadow-sm text-sm break-words ${
                            esEmisor
                              ? "bg-blue-200 self-end text-right"
                              : "bg-gray-200 self-start text-left"
                          }`}
                        >
                          {msg.contenido}
                          <div className="text-xs text-gray-500 mt-1">{msg.emisorRol}</div>
                        </div>
                      );
                    })
                  )}
                </div>

                <form
                  onSubmit={enviarMensajeQueja}
                  className="p-4 flex gap-3 border-t border-gray-300"
                >
                  <input
                    type="text"
                    placeholder="Escribe un mensaje"
                    value={mensajeQueja}
                    onChange={(e) => setMensajeQueja(e.target.value)}
                    className="flex-grow border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-600"
                    autoComplete="off"
                    autoFocus
                  />
                  <button
                    type="submit"
                    className="bg-blue-700 text-white px-5 py-2 rounded-lg font-semibold hover:bg-blue-900 transition-colors"
                  >
                    Enviar
                  </button>
                </form>
                {infoQueja && (
                  <p
                    className={`text-center mt-2 ${
                      infoQueja.startsWith("✅") ? "text-green-600" : "text-red-600"
                    }`}
                  >
                    {infoQueja}
                  </p>
                )}
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Chat;
