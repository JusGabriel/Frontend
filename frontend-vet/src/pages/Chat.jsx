import { useState, useEffect, useRef } from "react";
import storeAuth from "../context/storeAuth";

const Chat = () => {
  const { id: usuarioId, rol: emisorRol } = storeAuth();

  const [vista, setVista] = useState("chat");
  const [conversacionId, setConversacionId] = useState(null);
  const [mensaje, setMensaje] = useState("");
  const [mensajes, setMensajes] = useState([]);
  const [conversaciones, setConversaciones] = useState([]);
  const [info, setInfo] = useState("");

  const [quejas, setQuejas] = useState([]);
  const [quejaSeleccionada, setQuejaSeleccionada] = useState(null);
  const [mensajeQueja, setMensajeQueja] = useState("");
  const [mensajesQueja, setMensajesQueja] = useState([]);

  const mensajesRef = useRef(null);

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

  useEffect(() => {
    cargarConversaciones();
  }, [usuarioId]);

  useEffect(() => {
    if (conversacionId) {
      obtenerMensajes();
      const interval = setInterval(() => {
        obtenerMensajes();
      }, 3000);
      return () => clearInterval(interval);
    }
  }, [conversacionId]);

  const handleEnviar = async (e) => {
    e.preventDefault();
    if (mensaje.trim() === "" || !conversacionId) return;

    try {
      const res = await fetch(
        "https://backend-production-bd1d.up.railway.app/api/chat/mensaje",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            emisorId: usuarioId,
            emisorRol,
            contenido: mensaje.trim(),
          }),
        }
      );
      const data = await res.json();
      if (res.ok) {
        setMensaje("");
        setInfo("");
        obtenerMensajes(); // refrescar mensajes al enviar
      } else {
        setInfo("❌ Error: " + (data.mensaje || "Error desconocido"));
      }
    } catch (error) {
      setInfo("❌ Error de red: " + error.message);
    }
  };

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

  const seleccionarQueja = (queja) => {
    setQuejaSeleccionada(queja);
    setMensajesQueja(queja.mensajes || []);
    setMensajeQueja("");
  };

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
          }),
        }
      );
      const data = await res.json();
      if (res.ok) {
        const nuevoMsg = {
          _id: data.data._id,
          contenido: mensajeQueja.trim(),
          emisor: usuarioId,
          emisorRol,
          timestamp: new Date().toISOString(),
        };
        setMensajesQueja((prev) => [...prev, nuevoMsg]);
        setMensajeQueja("");
      } else {
        alert("Error al enviar mensaje: " + (data.mensaje || "Error desconocido"));
      }
    } catch (error) {
      console.error("Error enviando mensaje de queja", error);
      alert("Error de red al enviar mensaje");
    }
  };

  useEffect(() => {
    if (vista === "quejas") {
      cargarQuejas();
    }
  }, [vista]);

  useEffect(() => {
    if (mensajesRef.current) {
      mensajesRef.current.scrollTop = mensajesRef.current.scrollHeight;
    }
  }, [mensajes, mensajesQueja]);

  return (
    <div className="max-w-3xl mx-auto mt-10 p-4 font-sans">
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

      {/* CHAT GENERAL */}
      {vista === "chat" && (
        <>
          <div className="bg-white rounded-lg shadow-lg flex flex-col h-[500px]">
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
              />
              <button
                type="submit"
                className="bg-green-700 text-white px-5 py-2 rounded-lg font-semibold hover:bg-green-900 transition-colors"
              >
                Enviar
              </button>
            </form>
          </div>
        </>
      )}

      {/* QUEJAS */}
      {vista === "quejas" && (
        <div className="bg-white rounded-lg shadow-md p-4 space-y-4 flex flex-col md:flex-row gap-6">
          <div className="md:w-1/2 max-h-[500px] overflow-y-auto border border-gray-300 rounded-md p-2">
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

          <div className="md:w-1/2 bg-gray-50 rounded-md flex flex-col h-[500px]">
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
