import { useState, useEffect, useRef } from "react";

const Chat = () => {
  const [vista, setVista] = useState("chat"); // chat | quejas

  const [chatActivo, setChatActivo] = useState(false);
  const [emisorId, setEmisorId] = useState("");
  const [emisorRol, setEmisorRol] = useState("Administrador");
  const [receptorId, setReceptorId] = useState("");
  const [receptorRol, setReceptorRol] = useState("Emprendedor");
  const [mensaje, setMensaje] = useState("");
  const [mensajes, setMensajes] = useState([]);
  const [conversacionId, setConversacionId] = useState(null);
  const [info, setInfo] = useState("");

  const [quejas, setQuejas] = useState([]);
  const mensajesRef = useRef(null);

  const iniciarChat = async (e) => {
    e.preventDefault();
    if (!emisorId.trim() || !receptorId.trim()) {
      alert("Completa los campos requeridos");
      return;
    }

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
            contenido: "📨 Conversación iniciada",
          }),
        }
      );
      const data = await res.json();
      if (res.ok) {
        setConversacionId(data.data.conversacion);
        setChatActivo(true);
        setMensaje("");
        setInfo("✅ Chat iniciado");
      } else {
        setInfo("❌ Error iniciando chat");
      }
    } catch (error) {
      setInfo("❌ Error de red: " + error.message);
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
    if (!conversacionId) return;
    obtenerMensajes();
    const interval = setInterval(() => {
      obtenerMensajes();
    }, 3000);
    return () => clearInterval(interval);
  }, [conversacionId]);

  useEffect(() => {
    if (mensajesRef.current) {
      mensajesRef.current.scrollTop = mensajesRef.current.scrollHeight;
    }
  }, [mensajes]);

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

  useEffect(() => {
    if (vista === "quejas") {
      cargarQuejas();
    }
  }, [vista]);

  return (
    <div className="max-w-2xl mx-auto mt-10 p-4 font-sans">
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

      {vista === "chat" && (
        <>
          {!chatActivo ? (
            <form
              onSubmit={iniciarChat}
              className="space-y-4 bg-white p-6 rounded-lg shadow-md"
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
                  <p className="text-center text-gray-400">
                    No hay mensajes aún.
                  </p>
                )}
                {mensajes.map((msg) => {
                  const esEmisor = msg.emisor === emisorId;
                  return (
                    <div
                      key={msg._id}
                      className={`max-w-[70%] p-3 rounded-xl shadow-sm text-sm break-words
                      ${esEmisor ? "bg-green-200 self-end text-right" : "bg-gray-200 self-start text-left"}
                    `}
                    >
                      {msg.contenido}
                      <div className="text-xs text-gray-500 mt-1">
                        {msg.emisorRol}
                      </div>
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
        </>
      )}

      {vista === "quejas" && (
        <div className="bg-white rounded-lg shadow-md p-4 space-y-4">
          {quejas.length === 0 ? (
            <p className="text-center text-gray-500">
              No hay quejas registradas.
            </p>
          ) : (
            quejas.map((q) => (
              <div
                key={q._id}
                className="border border-gray-200 p-4 rounded-md shadow-sm"
              >
                <p className="text-sm text-gray-600">
                  <strong>Emisor:</strong>{" "}
                  {
                    q.participantes.find((p) => p.rol === "Emprendedor")?.id
                      ?.nombre
                  }{" "}
                  {q.participantes.find((p) => p.rol === "Emprendedor")?.id
                    ?.apellido || ""}
                </p>
                <p className="text-sm text-gray-600">
                  <strong>Receptor:</strong>{" "}
                  {
                    q.participantes.find((p) => p.rol === "Administrador")?.id
                      ?.nombre
                  }{" "}
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
