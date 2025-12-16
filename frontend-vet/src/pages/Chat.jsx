import { useState, useEffect, useRef } from "react";
import storeAuth from "../context/storeAuth";
import { useLocation } from "react-router-dom";

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

  // Ref para scroll automático
  const mensajesRef = useRef(null);

  // Para leer parámetros de la URL
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const chatUserId = params.get("user"); // id del emprendedor con quien chatear
  const productoId = params.get("productoId");
  const productoNombreParam = params.get("productoNombre");
  const productoNombre = productoNombreParam ? decodeURIComponent(productoNombreParam) : null;

  // --- Funciones Chat General ---

  const cargarConversaciones = async () => {
    if (!usuarioId) return;
    try {
      const res = await fetch(
        `https://backend-production-bd1d.up.railway.app/api/chat/conversaciones/${usuarioId}`
      );
      const data = await res.json();
      setConversaciones(Array.isArray(data) ? data : []);
      return Array.isArray(data) ? data : [];
    } catch (error) {
      console.error("Error cargando conversaciones", error);
      setInfo("❌ Error cargando conversaciones");
      return [];
    }
  };

  const obtenerMensajes = async () => {
    if (!conversacionId) return;
    try {
      const res = await fetch(
        `https://backend-production-bd1d.up.railway.app/api/chat/mensajes/${conversacionId}`
      );
      const data = await res.json();
      setMensajes(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error cargando mensajes", error);
      setInfo("❌ Error cargando mensajes");
    }
  };

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
        // actualizar lista local de conversaciones (opcional)
        cargarConversaciones().then((list) => setConversaciones(list));
      } else {
        setInfo("❌ Error: " + (data.mensaje || "Error desconocido"));
      }
    } catch (error) {
      setInfo("❌ Error de red: " + error.message);
    }
  };

  // --- Función para abrir o crear conversación con chatUserId ---
  const abrirConversacionConUsuario = async () => {
    if (!chatUserId || !usuarioId) return;

    try {
      // Traer conversaciones directamente del backend (evita stale state)
      const resConv = await fetch(
        `https://backend-production-bd1d.up.railway.app/api/chat/conversaciones/${usuarioId}`
      );
      const convList = await resConv.json();
      const conversacionesArr = Array.isArray(convList) ? convList : [];

      // Buscar conversación existente con ese usuario
      const convExistente = conversacionesArr.find((conv) =>
        conv.participantes.some((p) => p.id && p.id._id === chatUserId)
      );

      if (convExistente) {
        setConversacionId(convExistente._id);
        setVista("chat");
        setConversaciones(conversacionesArr);
        // prefill mensaje si viene productoNombre y el input está vacío
        if (productoNombre && !mensaje) {
          setMensaje(`Hola, estoy interesado en "${productoNombre}". ¿Está disponible?`);
        }
      } else {
        // crear conversación
        const res = await fetch(
          "https://backend-production-bd1d.up.railway.app/api/chat/conversacion",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              participantes: [
                { id: usuarioId, rol: emisorRol },
                { id: chatUserId, rol: "Emprendedor" },
              ],
            }),
          }
        );

        if (!res.ok) throw new Error("Error creando conversación");

        const data = await res.json();
        setConversacionId(data._id);
        setVista("chat");
        // agregar a lista local
        setConversaciones((prev) => (Array.isArray(prev) ? [...prev, data] : [data]));
        // prefill mensaje si viene productoNombre
        if (productoNombre) {
          setMensaje(`Hola, estoy interesado en "${productoNombre}". ¿Está disponible?`);
        }
      }
    } catch (error) {
      setInfo("❌ Error al abrir/crear conversación: " + (error.message || error));
      console.error(error);
    }
  };

  // --- Funciones Quejas ---
  const cargarQuejas = async () => {
    try {
      const res = await fetch(
        "https://backend-production-bd1d.up.railway.app/api/quejas/todas-con-mensajes"
      );
      const data = await res.json();

      let quejasFiltradas = Array.isArray(data) ? data : [];

      // Si no es administrador, filtrar quejas solo del usuario actual
      if (emisorRol !== "Administrador") {
        quejasFiltradas = quejasFiltradas.filter((q) => {
          return q.participantes.some(
            (p) => p.id && p.id._id === usuarioId
          );
        });
      }

      setQuejas(quejasFiltradas);
    } catch (error) {
      console.error("Error cargando quejas", error);
      setInfo("❌ Error cargando quejas");
    }
  };

  const seleccionarQueja = (queja) => {
    setQuejaSeleccionada(queja);
    setMensajesQueja(queja.mensajes || []);
    setMensajeQueja("");
    setInfo("");
  };

  const enviarMensajeQueja = async (e) => {
    e.preventDefault();
    if (!mensajeQueja.trim()) return;

    const receptorId =
      emisorRol === "Cliente" || emisorRol === "Emprendedor"
        ? "6894f9c409b9687e33e57f56"
        : quejaSeleccionada?._id;

    const receptorRol =
      emisorRol === "Cliente" || emisorRol === "Emprendedor"
        ? "Administrador"
        : null;

    if (!receptorId) return;

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
            quejaId:
              emisorRol === "Cliente" || emisorRol === "Emprendedor"
                ? null
                : quejaSeleccionada?._id,
            receptorId,
            receptorRol,
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
        setInfo("");
      } else {
        setInfo("❌ Error: " + (data.mensaje || "Error desconocido"));
      }
    } catch (error) {
      console.error("Error enviando mensaje de queja", error);
      setInfo("❌ Error de red al enviar mensaje");
    }
  };

  // --- Effect para actualizar mensajes de quejas cada 2 segundos ---
  useEffect(() => {
    if (vista === "quejas" && quejaSeleccionada) {
      const cargarMensajesQueja = async () => {
        try {
          const res = await fetch(
            `https://backend-production-bd1d.up.railway.app/api/quejas/mensajes/${quejaSeleccionada._id}`
          );
          const data = await res.json();
          setMensajesQueja(Array.isArray(data) ? data : []);
        } catch (error) {
          setInfo("❌ Error cargando mensajes de queja");
        }
      };

      cargarMensajesQueja();

      const interval = setInterval(cargarMensajesQueja, 2000);

      return () => clearInterval(interval);
    }
  }, [vista, quejaSeleccionada]);

  // --- Otros effects ---
  useEffect(() => {
    if (vista === "chat") {
      cargarConversaciones();
      setQuejaSeleccionada(null);
      setMensajesQueja([]);
      setMensajeQueja("");
    }
  }, [usuarioId, vista]);

  useEffect(() => {
    if (vista === "chat" && conversacionId) {
      obtenerMensajes();
      const interval = setInterval(obtenerMensajes, 3000);
      return () => clearInterval(interval);
    }
  }, [conversacionId, vista]);

  useEffect(() => {
    if (vista === "quejas") {
      cargarQuejas();
      setConversacionId(null);
      setMensajes([]);
      setMensaje("");
    }
  }, [vista]);

  useEffect(() => {
    if (mensajesRef.current) {
      mensajesRef.current.scrollTop = mensajesRef.current.scrollHeight;
    }
  }, [mensajes, mensajesQueja]);

  // abrir conversación cuando llegue chatUserId en la URL
  useEffect(() => {
    if (chatUserId && usuarioId) {
      abrirConversacionConUsuario();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chatUserId, usuarioId]);

  // --- Render ---
  const chatActivo =
    vista === "chat"
      ? conversaciones.find((c) => c._id === conversacionId)
      : quejaSeleccionada;

  const mensajesActivos = vista === "chat" ? mensajes : mensajesQueja;

  const handleEnviarMensaje = (e) => {
    if (vista === "chat") {
      const conv = conversaciones.find((c) => c._id === conversacionId);
      const receptor = conv?.participantes?.find(
        (p) => p.id && p.id._id !== usuarioId
      );
      if (receptor) {
        handleEnviar(e, receptor.id._id, receptor.rol);
      }
    } else {
      enviarMensajeQueja(e);
    }
  };

  return (
    <div
      className="flex bg-white"
      style={{ width: "calc(100vw - 1.5cm)", height: "calc(100vh - 7cm)", padding: 5 }}
    >
      {/* Sidebar */}
      <aside className="w-80 border-r border-gray-300 flex flex-col">
        <div
          className="py-4 px-6 font-bold text-lg text-center cursor-pointer"
          style={{ color: "#AA4A44", backgroundColor: "#F7E5D2" }}
        >
          <div className="flex justify-center gap-4">
            <button
              onClick={() => setVista("chat")}
              className={`px-3 py-1 rounded-md font-semibold transition-colors ${
                vista === "chat"
                  ? "bg-[#AA4A44] text-white"
                  : "bg-gray-200 text-gray-700 hover:bg-[#f7d4d1]"
              }`}
            >
              Chat General
            </button>
            <button
              onClick={() => setVista("quejas")}
              className={`px-3 py-1 rounded-md font-semibold transition-colors ${
                vista === "quejas"
                  ? "bg-[#AA4A44] text-white"
                  : "bg-gray-200 text-gray-700 hover:bg-[#f7d4d1]"
              }`}
            >
              Quejas
            </button>
          </div>
        </div>

        <div className="flex-grow overflow-y-auto">
          {vista === "chat" ? (
            conversaciones.length === 0 ? (
              <p className="p-4 text-center text-gray-500 flex-grow">No hay conversaciones</p>
            ) : (
              conversaciones.map((conv) => {
                const otro = conv.participantes.find(
                  (p) => p.id && p.id._id !== usuarioId
                );
                const isActive = conv._id === conversacionId;
                return (
                  <button
                    key={conv._id}
                    onClick={() => setConversacionId(conv._id)}
                    className={`w-full text-left px-4 py-3 border-b border-gray-100 hover:bg-[#fceaea] flex justify-between items-center ${
                      isActive ? "bg-[#fceaea]" : ""
                    }`}
                  >
                    <span>
                      {otro ? `${otro.id?.nombre} ${otro.id?.apellido}` : "Participante desconocido"}
                    </span>
                  </button>
                );
              })
            )
          ) : vista === "quejas" ? (
            quejas.length === 0 ? (
              <p className="p-4 text-center text-gray-500 flex-grow">
                {(emisorRol === "Cliente" || emisorRol === "Emprendedor")
                  ? "Manda una queja al administrador del sitio"
                  : "No hay quejas registradas."}
              </p>
            ) : (
              quejas.map((q) => {
                const emprendedor = q.participantes.find(
                  (p) => p.rol === "Emprendedor"
                )?.id;
                const admin = q.participantes.find((p) => p.rol === "Administrador")?.id;
                const ultimoMensaje = q.mensajes[q.mensajes.length - 1];
                const isSelected = quejaSeleccionada?._id === q._id;

                return (
                  <button
                    key={q._id}
                    onClick={() => seleccionarQueja(q)}
                    className={`w-full text-left px-4 py-3 border-b border-gray-100 hover:bg-[#fceaea] flex flex-col ${
                      isSelected ? "bg-[#fceaea]" : ""
                    }`}
                  >
                    <p className="font-semibold text-[#AA4A44]">
                      Emisor: {emprendedor?.nombre} {emprendedor?.apellido}
                    </p>
                    <p className="text-sm text-gray-600">
                      Receptor: {admin?.nombre} {admin?.apellido}
                    </p>
                    <p className="mt-1 text-gray-800 text-sm line-clamp-2">
                      <strong>Último mensaje:</strong> {ultimoMensaje?.contenido || "Sin mensajes"}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {new Date(q.updatedAt).toLocaleString()}
                    </p>
                  </button>
                );
              })
            )
          ) : null}
        </div>
      </aside>

      <section className="flex-1 flex flex-col">
        <header
          className="py-4 px-6 font-bold text-lg"
          style={{ color: "#AA4A44", backgroundColor: "#F7E5D2" }}
        >
          {vista === "chat" ? (
            chatActivo ? (
              `Chat con ${
                chatActivo.participantes.find((p) => p.id && p.id._id !== usuarioId)?.id?.nombre || "Desconocido"
              }${productoNombre ? ` — Sobre: ${productoNombre}` : ""}`
            ) : (
              "Selecciona una conversación"
            )
          ) : vista === "quejas" ? (
            quejaSeleccionada ? (
              `Chat Queja con ${
                quejaSeleccionada.participantes.find((p) => p.rol !== emisorRol)?.id?.nombre || "Desconocido"
              }`
            ) : (emisorRol === "Cliente" || emisorRol === "Emprendedor") ? (
              "Manda una queja al administrador del sitio"
            ) : (
              "Selecciona una queja"
            )
          ) : (
            ""
          )}
        </header>

        <div
          ref={mensajesRef}
          className="flex-1 overflow-y-auto p-4 bg-gray-50 space-y-4"
        >
          {chatActivo ? (
            mensajesActivos.length === 0 ? (
              <p className="text-center text-gray-500 mt-10">No hay mensajes aún.</p>
            ) : (
              mensajesActivos.map((msg) => {
                const esMio = msg.emisor === usuarioId;
                return (
                  <div
                    key={msg._id || msg.id}
                    className={`flex ${esMio ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-xs px-4 py-2 rounded-lg shadow ${
                        esMio ? "text-white" : "bg-white border border-gray-300"
                      }`}
                      style={esMio ? { backgroundColor: "#AA4A44" } : {}}
                    >
                      {msg.contenido}
                      <div className="text-xs text-gray-300 mt-1 text-right">{msg.emisorRol || ""}</div>
                    </div>
                  </div>
                );
              })
            )
          ) : (
            <p className="text-center text-gray-500 mt-10">
              {(emisorRol === "Cliente" || emisorRol === "Emprendedor")
                ? "Manda una queja al administrador del sitio"
                : "Selecciona una queja para comenzar"}
            </p>
          )}
        </div>

        <form
          onSubmit={handleEnviarMensaje}
          className="flex p-4 border-t border-gray-300 bg-white"
        >
          <input
            type="text"
            placeholder={vista === "chat"
              ? productoNombre ? `Mensaje sobre "${productoNombre}"` : "Escribe un mensaje..."
              : "Escribe tu respuesta..."
            }
            value={vista === "chat" ? mensaje : mensajeQueja}
            onChange={(e) =>
              vista === "chat" ? setMensaje(e.target.value) : setMensajeQueja(e.target.value)
            }
            className="flex-1 border border-gray-300 rounded-l-lg p-2 focus:outline-none"
            style={{ boxShadow: "0 0 0 2px transparent" }}
            onFocus={(e) => (e.currentTarget.style.boxShadow = "0 0 0 2px #AA4A44")}
            onBlur={(e) => (e.currentTarget.style.boxShadow = "0 0 0 2px transparent")}
            disabled={vista === "chat" ? !conversacionId : !(quejaSeleccionada || emisorRol === "Cliente" || emisorRol === "Emprendedor")}
            autoComplete="off"
          />
          <button
            type="submit"
            disabled={vista === "chat" ? !conversacionId : !(quejaSeleccionada || emisorRol === "Cliente" || emisorRol === "Emprendedor")}
            className="text-white px-6 py-2 rounded-r-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ backgroundColor: "#AA4A44" }}
            onMouseOver={(e) => (e.currentTarget.style.backgroundColor = "#8C3E39")}
            onMouseOut={(e) => (e.currentTarget.style.backgroundColor = "#AA4A44")}
          >
            Enviar
          </button>
        </form>

        {info && <div className="p-2 text-center text-red-600 font-medium">{info}</div>}
      </section>
    </div>
  );
};

export default Chat;
