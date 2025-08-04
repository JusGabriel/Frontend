import { useState, useEffect } from "react";

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

  const iniciarChat = async (e) => {
    e.preventDefault();
    if (!emisorId || !receptorId) return alert("Completa los campos requeridos");

    // Enviamos un mensaje inicial vacío para crear la conversación si no existe
    try {
      const res = await fetch("https://backend-production-bd1d.up.railway.app/api/chat/mensaje", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          emisorId,
          emisorRol,
          receptorId,
          receptorRol,
          contenido: "📨 Conversación iniciada"
        })
      });
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

  useEffect(() => {
    const obtenerMensajes = async () => {
      if (!conversacionId) return;
      try {
        const res = await fetch(
          `https://backend-production-bd1d.up.railway.app/api/chat/mensajes/${conversacionId}`
        );
        const data = await res.json();
        setMensajes(data);
      } catch (error) {
        console.log("Error cargando mensajes", error);
      }
    };
    obtenerMensajes();
  }, [conversacionId]);

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
            contenido: mensaje
          })
        }
      );
      const data = await res.json();
      if (res.ok) {
        setMensajes([...mensajes, data.data]);
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
    <div className="max-w-md mx-auto mt-10 p-4">
      {!chatActivo ? (
        <form onSubmit={iniciarChat} className="space-y-3 bg-white p-4 rounded shadow">
          <input
            type="text"
            placeholder="ID del emisor"
            value={emisorId}
            onChange={(e) => setEmisorId(e.target.value)}
            className="w-full border rounded p-2"
          />
          <select
            value={emisorRol}
            onChange={(e) => setEmisorRol(e.target.value)}
            className="w-full border rounded p-2"
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
            className="w-full border rounded p-2"
          />
          <select
            value={receptorRol}
            onChange={(e) => setReceptorRol(e.target.value)}
            className="w-full border rounded p-2"
          >
            <option>Administrador</option>
            <option>Emprendedor</option>
            <option>Cliente</option>
          </select>

          <button className="w-full bg-purple-700 text-white py-2 rounded hover:bg-purple-900">
            Ingresar al chat
          </button>
        </form>
      ) : (
        <div className="bg-white rounded shadow flex flex-col h-[500px]">
          <div className="flex-grow overflow-y-auto p-4 space-y-2">
            {mensajes.map((msg) => (
              <div
                key={msg._id}
                className={`max-w-[70%] p-2 rounded-md text-sm shadow ${
                  msg.emisor === emisorId ? "bg-green-200 self-end" : "bg-gray-200 self-start"
                }`}
              >
                {msg.contenido}
              </div>
            ))}
          </div>

          <form onSubmit={handleEnviar} className="p-3 flex gap-2 border-t">
            <input
              type="text"
              placeholder="Escribe un mensaje"
              value={mensaje}
              onChange={(e) => setMensaje(e.target.value)}
              className="flex-grow border rounded p-2"
            />
            <button className="bg-green-700 text-white px-4 py-2 rounded hover:bg-green-900">
              Enviar
            </button>
          </form>
          {info && <p className="text-center text-sm text-gray-600 mt-1">{info}</p>}
        </div>
      )}
    </div>
  );
};

export default Chat;
