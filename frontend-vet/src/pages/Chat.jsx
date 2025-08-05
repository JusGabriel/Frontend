import { useEffect, useState, useRef } from "react";

const Chat = () => {
  const [usuario, setUsuario] = useState(null);
  const [vista, setVista] = useState("chat");
  const [receptor, setReceptor] = useState(null);
  const [conversaciones, setConversaciones] = useState([]);
  const [mensajes, setMensajes] = useState([]);
  const [mensaje, setMensaje] = useState("");
  const [conversacionId, setConversacionId] = useState(null);

  // Estado para quejas
  const [quejas, setQuejas] = useState([]);
  const [quejaSeleccionada, setQuejaSeleccionada] = useState(null);
  const [mensajeQueja, setMensajeQueja] = useState("");
  const [mensajesQueja, setMensajesQueja] = useState([]);

  const mensajesRef = useRef(null);

  useEffect(() => {
    const obtenerUsuario = async () => {
      const res = await fetch("/api/status");
      const data = await res.json();
      if (res.ok) setUsuario(data.usuario);
    };
    obtenerUsuario();
  }, []);

  // Obtener conversaciones activas del usuario
  useEffect(() => {
    if (vista === "chat" && usuario?._id) {
      const fetchConversaciones = async () => {
        const res = await fetch(`https://backend-production-bd1d.up.railway.app/api/chat/conversaciones/${usuario._id}`);
        const data = await res.json();
        setConversaciones(data);
      };
      fetchConversaciones();
    }
  }, [vista, usuario]);

  // Obtener mensajes por conversacionId
  const obtenerMensajes = async (idConversacion) => {
    const res = await fetch(`https://backend-production-bd1d.up.railway.app/api/chat/mensajes/${idConversacion}`);
    const data = await res.json();
    setMensajes(data);
  };

  // Iniciar conversación
  const iniciarConversacion = async (receptor) => {
    if (!usuario) return;
    try {
      const res = await fetch(`https://backend-production-bd1d.up.railway.app/api/chat/mensaje`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          emisorId: usuario._id,
          emisorRol: usuario.rol,
          receptorId: receptor.id._id,
          receptorRol: receptor.rol,
          contenido: "📨 Conversación iniciada",
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setReceptor(receptor);
        setConversacionId(data.data.conversacion);
        obtenerMensajes(data.data.conversacion);
      }
    } catch (err) {
      console.error("Error iniciando conversación:", err);
    }
  };

  const handleEnviar = async (e) => {
    e.preventDefault();
    if (!mensaje.trim() || !usuario || !receptor || !conversacionId) return;

    const res = await fetch("https://backend-production-bd1d.up.railway.app/api/chat/mensaje", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        emisorId: usuario._id,
        emisorRol: usuario.rol,
        receptorId: receptor.id._id,
        receptorRol: receptor.rol,
        contenido: mensaje.trim(),
      }),
    });

    const data = await res.json();
    if (res.ok) {
      setMensajes((prev) => [...prev, data.data]);
      setMensaje("");
    }
  };

  // Scroll automático
  useEffect(() => {
    if (mensajesRef.current) {
      mensajesRef.current.scrollTop = mensajesRef.current.scrollHeight;
    }
  }, [mensajes, mensajesQueja]);

  // ---------------------- QUEJAS ----------------------

  const cargarQuejas = async () => {
    const res = await fetch("https://backend-production-bd1d.up.railway.app/api/quejas/todas-con-mensajes");
    const data = await res.json();
    setQuejas(data);
  };

  const seleccionarQueja = (q) => {
    setQuejaSeleccionada(q);
    setMensajesQueja(q.mensajes || []);
  };

  const enviarMensajeQueja = async (e) => {
    e.preventDefault();
    if (!mensajeQueja.trim() || !usuario || !quejaSeleccionada) return;

    const res = await fetch("https://backend-production-bd1d.up.railway.app/api/quejas/queja", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        emisorId: usuario._id,
        emisorRol: usuario.rol,
        contenido: mensajeQueja.trim(),
      }),
    });

    const data = await res.json();
    if (res.ok) {
      const nuevoMsg = {
        _id: data.data._id,
        contenido: mensajeQueja.trim(),
        emisor: usuario._id,
        emisorRol: usuario.rol,
        timestamp: new Date().toISOString(),
      };
      setMensajesQueja((prev) => [...prev, nuevoMsg]);
      setMensajeQueja("");
    }
  };

  useEffect(() => {
    if (vista === "quejas") cargarQuejas();
  }, [vista]);

  // ---------------------- UI ----------------------

  return (
    <div className="max-w-4xl mx-auto mt-10 px-4 font-sans">
      {/* Tabs */}
      <div className="flex justify-center mb-6 gap-4">
        <button
          onClick={() => setVista("chat")}
          className={`px-4 py-2 rounded-full font-semibold transition-colors ${
            vista === "chat" ? "bg-blue-700 text-white" : "bg-gray-200 text-gray-700 hover:bg-blue-200"
          }`}
        >
          💬 Chat
        </button>
        <button
          onClick={() => setVista("quejas")}
          className={`px-4 py-2 rounded-full font-semibold transition-colors ${
            vista === "quejas" ? "bg-purple-700 text-white" : "bg-gray-200 text-gray-700 hover:bg-purple-200"
          }`}
        >
          📢 Quejas
        </button>
      </div>

      {/* CHAT */}
      {vista === "chat" && (
        <div className="grid md:grid-cols-2 gap-6">
          {/* Conversaciones */}
          <div className="bg-white border rounded-md p-4 max-h-[500px] overflow-y-auto">
            <h2 className="font-bold text-blue-700 mb-3">Tus conversaciones</h2>
            {conversaciones.map((conv) => {
              const otro = conv.participantes.find((p) => p.id._id !== usuario._id);
              return (
                <button
                  key={conv._id}
                  onClick={() => iniciarConversacion(otro)}
                  className="block w-full text-left p-3 mb-2 rounded-md hover:bg-blue-50 border"
                >
                  <p className="font-semibold text-blue-800">
                    {otro.id.nombre} {otro.id.apellido}
                  </p>
                  <p className="text-sm text-gray-600">{otro.rol}</p>
                </button>
              );
            })}
          </div>

          {/* Chat de conversación */}
          <div className="flex flex-col bg-gray-50 border rounded-md h-[500px]">
            {conversacionId ? (
              <>
                <div className="bg-white border-b p-3 font-semibold">
                  Conversación con {receptor?.id?.nombre} {receptor?.id?.apellido}
                </div>
                <div ref={mensajesRef} className="flex-grow p-4 space-y-3 overflow-y-auto">
                  {mensajes.map((msg) => {
                    const esMio = msg.emisor === usuario._id;
                    return (
                      <div
                        key={msg._id}
                        className={`max-w-[75%] p-3 rounded-xl text-sm break-words shadow-sm ${
                          esMio ? "bg-green-200 ml-auto text-right" : "bg-white mr-auto"
                        }`}
                      >
                        {msg.contenido}
                        <div className="text-xs text-gray-500 mt-1">{msg.emisorRol}</div>
                      </div>
                    );
                  })}
                </div>
                <form onSubmit={handleEnviar} className="p-3 bg-white border-t flex gap-2">
                  <input
                    type="text"
                    placeholder="Escribe un mensaje..."
                    value={mensaje}
                    onChange={(e) => setMensaje(e.target.value)}
                    className="flex-grow border rounded-md px-3 py-2"
                  />
                  <button type="submit" className="bg-green-600 text-white px-4 rounded-md">
                    Enviar
                  </button>
                </form>
              </>
            ) : (
              <div className="flex items-center justify-center flex-grow text-gray-400">
                Selecciona una conversación.
              </div>
            )}
          </div>
        </div>
      )}

      {/* QUEJAS */}
      {vista === "quejas" && (
        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-white p-3 border rounded-md max-h-[500px] overflow-y-auto">
            <h2 className="text-purple-700 font-bold mb-3">Quejas</h2>
            {quejas.map((q) => {
              const emprendedor = q.participantes.find((p) => p.rol === "Emprendedor")?.id;
              const admin = q.participantes.find((p) => p.rol === "Administrador")?.id;
              const ultimo = q.mensajes[q.mensajes.length - 1];

              return (
                <button
                  key={q._id}
                  onClick={() => seleccionarQueja(q)}
                  className="block w-full text-left p-3 mb-2 rounded-md hover:bg-purple-100 border"
                >
                  <p className="font-semibold text-purple-800">
                    {emprendedor?.nombre} {emprendedor?.apellido}
                  </p>
                  <p className="text-sm text-gray-600">Receptor: {admin?.nombre}</p>
                  <p className="text-xs text-gray-500">
                    Último mensaje: {ultimo?.contenido || "Sin mensajes"}
                  </p>
                </button>
              );
            })}
          </div>

          <div className="bg-gray-50 border rounded-md h-[500px] flex flex-col">
            {quejaSeleccionada ? (
              <>
                <div className="bg-white p-3 border-b font-semibold text-purple-800">
                  Chat Queja
                </div>
                <div ref={mensajesRef} className="flex-grow p-4 space-y-3 overflow-y-auto">
                  {mensajesQueja.map((msg) => {
                    const esMio = msg.emisor === usuario._id;
                    return (
                      <div
                        key={msg._id}
                        className={`max-w-[75%] p-3 rounded-xl text-sm break-words shadow-sm ${
                          esMio ? "bg-purple-200 ml-auto text-right" : "bg-white mr-auto"
                        }`}
                      >
                        {msg.contenido}
                        <div className="text-xs text-gray-500 mt-1">{msg.emisorRol}</div>
                      </div>
                    );
                  })}
                </div>
                <form onSubmit={enviarMensajeQueja} className="p-3 bg-white border-t flex gap-2">
                  <input
                    type="text"
                    placeholder="Escribe tu respuesta..."
                    value={mensajeQueja}
                    onChange={(e) => setMensajeQueja(e.target.value)}
                    className="flex-grow border rounded-md px-3 py-2"
                  />
                  <button type="submit" className="bg-purple-600 text-white px-4 rounded-md">
                    Enviar
                  </button>
                </form>
              </>
            ) : (
              <div className="flex-grow flex items-center justify-center text-gray-500">
                Selecciona una queja.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Chat;
