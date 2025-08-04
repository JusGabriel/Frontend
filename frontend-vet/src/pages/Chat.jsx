import { useEffect, useState } from "react";

const Chat = () => {
  const [chatActivo, setChatActivo] = useState(false);
  const [usuario, setUsuario] = useState("");
  const [mensaje, setMensaje] = useState("");
  const [info, setInfo] = useState("");
  const [mensajes, setMensajes] = useState([]);

  // Emisor (este usuario)
  const EMISOR_ID = "688fc1ce099b264cc4bbfddd"; // Admin
  const EMISOR_ROL = "Administrador";

  // Receptor
  const RECEPTOR_ID = "688fb656f4d4f55eee1baa45"; // Emprendedor
  const RECEPTOR_ROL = "Emprendedor";

  const handleIngresar = async (e) => {
    e.preventDefault();
    if (usuario.trim() === "") {
      alert("Por favor ingresa un nombre de usuario");
      return;
    }

    // Buscar conversación existente entre emisor y receptor
    try {
      const res = await fetch(
        `https://backend-production-bd1d.up.railway.app/api/chat/conversaciones/${EMISOR_ID}`
      );
      const conversaciones = await res.json();

      // Buscar conversación entre estos dos usuarios
      const conversacion = conversaciones.find((conv) =>
        conv.participantes.some((p) => p.id === RECEPTOR_ID)
      );

      if (conversacion) {
        const mensajesRes = await fetch(
          `https://backend-production-bd1d.up.railway.app/api/chat/mensajes/${conversacion._id}`
        );
        const historial = await mensajesRes.json();
        setMensajes(historial);
      } else {
        setMensajes([]); // No hay conversación previa
      }

      setChatActivo(true);
      setInfo("");
    } catch (error) {
      setInfo("❌ Error al cargar conversación: " + error.message);
    }
  };

  const handleEnviar = async (e) => {
    e.preventDefault();
    if (mensaje.trim() === "") return;

    setInfo("Enviando...");
    try {
      const res = await fetch(
        "https://backend-production-bd1d.up.railway.app/api/chat/mensaje",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            emisorId: EMISOR_ID,
            emisorRol: EMISOR_ROL,
            receptorId: RECEPTOR_ID,
            receptorRol: RECEPTOR_ROL,
            contenido: mensaje,
          }),
        }
      );

      const data = await res.json();
      if (res.ok) {
        setMensajes((prev) => [...prev, data.data]); // Agrega nuevo mensaje al estado
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
    <>
      {!chatActivo ? (
        <div className="max-w-md mx-auto mt-20 p-6 bg-white rounded shadow">
          <form onSubmit={handleIngresar} className="flex flex-col gap-4">
            <input
              type="text"
              placeholder="Ingresa tu nombre de usuario"
              value={usuario}
              onChange={(e) => setUsuario(e.target.value)}
              className="rounded border border-gray-300 py-2 px-3 focus:outline-none focus:ring-2 focus:ring-purple-600"
            />
            <button
              type="submit"
              className="bg-purple-700 text-white py-2 rounded hover:bg-purple-900 transition"
            >
              Ingresar al chat
            </button>
          </form>
        </div>
      ) : (
        <div className="max-w-md mx-auto mt-10 flex flex-col h-[500px] bg-white rounded shadow">
          {/* Historial de mensajes */}
          <div className="flex-grow p-4 overflow-y-auto border-b border-gray-300 space-y-3">
            {mensajes.length === 0 && (
              <p className="text-center text-gray-500">
                No hay mensajes aún. ¡Comienza la conversación!
              </p>
            )}
            {mensajes.map((msg, index) => (
              <div
                key={index}
                className={`max-w-[80%] px-4 py-2 rounded-lg text-sm ${
                  msg.emisor === EMISOR_ID
                    ? "bg-green-100 self-end text-right ml-auto"
                    : "bg-gray-200 self-start text-left mr-auto"
                }`}
              >
                {msg.contenido}
              </div>
            ))}
          </div>

          {/* Formulario de envío */}
          <form
            onSubmit={handleEnviar}
            className="p-4 flex gap-2 border-t border-gray-300"
          >
            <input
              type="text"
              placeholder="Escribe tu mensaje"
              value={mensaje}
              onChange={(e) => setMensaje(e.target.value)}
              className="flex-grow rounded border border-gray-300 py-2 px-3 focus:outline-none focus:ring-2 focus:ring-green-600"
            />
            <button
              type="submit"
              className="bg-green-700 text-white px-4 py-2 rounded hover:bg-green-900 transition"
            >
              Enviar
            </button>
          </form>

          {/* Mensaje de estado */}
          {info && (
            <p className="text-center text-sm mt-1 mb-2 px-4 text-gray-700">
              {info}
            </p>
          )}
        </div>
      )}
    </>
  );
};

export default Chat;
