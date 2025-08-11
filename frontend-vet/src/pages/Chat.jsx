import { useState, useEffect, useRef } from "react";
import storeAuth from "../context/storeAuth";

const Chat = () => {
  const { id: usuarioId, rol: emisorRol } = storeAuth();

  // Vista activa: "chat" o "quejas"
  const [vista, setVista] = useState("chat");

  // Estados para Chat General
  const [conversacionId, setConversacionId] = useState(null);
  const [mensaje, setMensaje] = useState("");
  const [mensajes, setMensajes] = useState([]);
  const [conversaciones, setConversaciones] = useState([]);

  // Estados para Quejas
  const [quejas, setQuejas] = useState([]);
  const [quejaSeleccionada, setQuejaSeleccionada] = useState(null);
  const [mensajeQueja, setMensajeQueja] = useState("");
  const [mensajesQueja, setMensajesQueja] = useState([]);

  // Mensajes de info / error
  const [info, setInfo] = useState("");

  // Ref para hacer scroll automático en ambas vistas
  const mensajesRef = useRef(null);

  // --- Funciones para Chat General ---

  // Cargar conversaciones del usuario
  const cargarConversaciones = async () => {
    if (!usuarioId) return;
    try {
      const res = await fetch(
        `https://backend-production-bd1d.up.railway.app/api/chat/conversaciones/${usuarioId}`
      );
      const data = await res.json();
      setConversaciones(data);
    } catch (error) {
      console.error("Error cargando conversaciones", error);
      setInfo("❌ Error cargando conversaciones");
    }
  };

  // Obtener mensajes de la conversación seleccionada
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

  // Enviar mensaje en chat general (requiere receptorId y receptorRol)
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
        setInfo("");
        obtenerMensajes();
        cargarConversaciones();
      } else {
        setInfo("❌ Error: " + (data.mensaje || "Error desconocido"));
      }
    } catch (error) {
      setInfo("❌ Error de red: " + error.message);
    }
  };

  // --- Funciones para Quejas ---

  // Cargar todas las quejas con mensajes
  const cargarQuejas = async () => {
    try {
      const res = await fetch(
        "https://backend-production-bd1d.up.railway.app/api/quejas/todas-con-mensajes"
      );
      const data = await res.json();
      setQuejas(data);
    } catch (error) {
      console.error("Error cargando quejas", error);
      setInfo("❌ Error cargando quejas");
    }
  };

  // Seleccionar una queja para ver chat
  const seleccionarQueja = (queja) => {
    setQuejaSeleccionada(queja);
    setMensajesQueja(queja.mensajes || []);
    setMensajeQueja("");
    setInfo("");
  };

  // Enviar mensaje en queja seleccionada
  const enviarMensajeQueja = async (e) => {
    e.preventDefault();
    if (!mensajeQueja.trim() || !quejaSeleccionada) return;

    try {
      const res = await fetch(
        "https://backend-production-bd1d.up.railway.app/api/quejas/queja",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            emisorId: usuarioId,
            emisorRol,
            contenido: mensajeQueja.trim(),
            quejaId: quejaSeleccionada._id, // si la API lo requiere para identificar la queja
          }),
        }
      );
      const data = await res.json();
      if (res.ok) {
        // Añadir nuevo mensaje localmente para mejor UX
        const nuevoMsg = {
          _id: data.data._id,
          contenido: mensajeQueja.trim(),
          emisor: usuarioId,
          emisorRol,
          timestamp: new Date().toISOString(),
        };
        setMensajesQueja((prev) => [...prev, nuevoMsg]);
        setMensajeQueja("");
        setInfo("");
      } else {
        setInfo("❌ Error: " + (data.mensaje || "Error desconocido"));
      }
    } catch (error) {
      console.error("Error enviando mensaje de queja", error);
      setInfo("❌ Error de red al enviar mensaje");
    }
  };

  // --- Effects ---

  // Cargar conversaciones al montar o cambiar usuarioId
  useEffect(() => {
    if (vista === "chat") {
      cargarConversaciones();
    }
  }, [usuarioId, vista]);

  // Actualizar mensajes en chat general cada 3s si hay conversación activa
  useEffect(() => {
    if (vista === "chat" && conversacionId) {
      obtenerMensajes();
      const interval = setInterval(obtenerMensajes, 3000);
      return () => clearInterval(interval);
    }
  }, [conversacionId, vista]);

  // Cargar quejas si se cambia a vista quejas
  useEffect(() => {
    if (vista === "quejas") {
      cargarQuejas();
      setQuejaSeleccionada(null);
      setMensajesQueja([]);
      setMensajeQueja("");
    }
  }, [vista]);

  // Scroll automático en mensajes (chat general o quejas)
  useEffect(() => {
    if (mensajesRef.current) {
      mensajesRef.current.scrollTop = mensajesRef.current.scrollHeight;
    }
  }, [mensajes, mensajesQueja]);

  return (
    <div className="max-w-3xl mx-auto mt-10 p-4 font-sans">
      {/* Botones para cambiar vista */}
      <div className="flex justify-center mb-6 gap-4">
        <button
          onClick={() => setVista("chat")}
          className={`px-4 py-2 rounded-full font-semibold transition-colors ${
            vista === "chat"
              ? "bg-purple-700 text-white"
              : "bg-gray-200 text-gray-700 hover:bg-purple-200"
          }`}
        >
          💬 Chat General
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

      {info && (
        <div className="mb-4 text-center text-red-600 font-medium">{info}</div>
      )}

      {/* VISTA CHAT GENERAL */}
      {vista === "chat" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-white rounded-lg shadow-lg p-4 h-[500px]">
          {/* Lista de conversaciones */}
          <div className="border rounded-md p-3 max-h-full overflow-y-auto">
            <h3 className="text-lg font-semibold mb-2 text-purple-800">Conversaciones</h3>
            {conversaciones.length === 0 ? (
              <p className="text-sm text-gray-500">No hay conversaciones aún.</p>
            ) : (
              conversaciones.map((conv) => {
                const otro = conv.participantes.find((p) => p.id._id !== usuarioId);
                const isActive = conv._id === conversacionId;
                return (
                  <button
                    key={conv._id}
                    onClick={() => setConversacionId(conv._id)}
                    className={`w-full text-left p-2 mb-2 rounded-md border transition-colors ${
                      isActive
                        ? "bg-purple-100 border-purple-700"
                        : "border-gray-200 hover:bg-purple-50"
                    }`}
                  >
                    <p className="font-medium text-purple-800">
                      {otro?.id?.nombre} {otro?.id?.apellido}
                    </p>
                    <p className="text-xs text-gray-500">{otro?.rol}</p>
                  </button>
                );
              })
            )}
          </div>

          {/* Mensajes y form de envío */}
          <div className="border rounded-md flex flex-col max-h-full">
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

            {/* Formulario para enviar mensajes solo si hay conversación */}
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
      )}

      {/* VISTA QUEJAS */}
      {vista === "quejas" && (
        <div className="bg-white rounded-lg shadow-md p-4 space-y-4 flex flex-col md:flex-row gap-6 h-[500px]">
          {/* Lista de quejas */}
          <div className="md:w-1/2 max-h-full overflow-y-auto border border-gray-300 rounded-md p-2">
            {quejas.length === 0 ? (
              <p className="text-center text-gray-500 mt-4">No hay quejas registradas.</p>
            ) : (
              quejas.map((q) => {
                const emprendedor = q.participantes.find((p) => p.rol === "Emprendedor")?.id;
                const admin = q.participantes.find((p) => p.rol === "Administrador")?.id;
                const ultimoMensaje = q.mensajes[q.mensajes.length - 1];
                const isSelected = quejaSeleccionada?._id === q._id;

                return (
                  <button
                    key={q._id}
                    onClick={() => seleccionarQueja(q)}
                    className={`w-full text-left mb-2 p-3 rounded-md border transition-colors ${
                      isSelected
                        ? "border-purple-700 bg-purple-50"
                        : "border-gray-200 hover:bg-purple-100"
                    }`}
                  >
                    <p className="font-semibold text-purple-700">
                      Emisor: {emprendedor?.nombre} {emprendedor?.apellido}
                    </p>
                    <p className="text-sm text-gray-600">
                      Receptor: {admin?.nombre} {admin?.apellido}
                    </p>
                    <p className="mt-1 text-gray-800 text-sm line-clamp-2">
                      <strong>Último mensaje:</strong>{" "}
                      {ultimoMensaje?.contenido || "Sin mensajes"}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {new Date(q.updatedAt).toLocaleString()}
                    </p>
                  </button>
                );
              })
            )}
          </div>

          {/* Chat queja seleccionada */}
          <div className="md:w-1/2 bg-gray-50 rounded-md flex flex-col max-h-full">
            {quejaSeleccionada ? (
              <>
                <div className="bg-white p-3 border-b border-gray-300 font-semibold text-purple-800">
                  Chat Queja con{" "}
                  {
                    quejaSeleccionada.participantes.find(
                      (p) => p.rol !== emisorRol
                    )?.id?.nombre
                  }
                </div>
                <div
                  ref={mensajesRef}
                  className="flex-grow overflow-y-auto p-4 space-y-3"
                >
                  {mensajesQueja.length === 0 ? (
                    <p className="text-center text-gray-500 mt-4">No hay mensajes aún.</p>
                  ) : (
                    mensajesQueja.map((msg) => {
                      const esMio = msg.emisor === usuarioId;
                      return (
                        <div
                          key={msg._id}
                          className={`max-w-[75%] p-3 rounded-xl shadow-sm text-sm break-words ${
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

                <form
                  onSubmit={enviarMensajeQueja}
                  className="p-4 flex gap-2 border-t border-gray-300 bg-white"
                >
                  <input
                    type="text"
                    placeholder="Escribe tu respuesta..."
                    value={mensajeQueja}
                    onChange={(e) => setMensajeQueja(e.target.value)}
                    className="flex-grow border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    autoComplete="off"
                  />
                  <button
                    type="submit"
                    className="bg-purple-700 text-white px-5 py-2 rounded-lg font-semibold hover:bg-purple-900 transition-colors"
                  >
                    Enviar
                  </button>
                </form>
              </>
            ) : (
              <div className="flex-grow flex items-center justify-center text-gray-500">
                Selecciona una queja para ver y responder.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Chat;
