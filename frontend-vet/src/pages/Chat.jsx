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

  // ID del emprendedor (user) que viene desde HomeContent
  const chatUserIdParam = params.get("user"); // id del emprendedor con quien chatear
  const productoIdParam = params.get("productoId");
  const productoNombreParam = params.get("productoNombre");
  const productoNombre = productoNombreParam ? decodeURIComponent(productoNombreParam) : null;

  // Estado local para mantener el id del target con el que queremos chatear
  const [chatTargetId, setChatTargetId] = useState(null);

  // --- Funciones Chat General ---

  const cargarConversaciones = async () => {
    if (!usuarioId) return [];
    try {
      const res = await fetch(
        `https://backend-production-bd1d.up.railway.app/api/chat/conversaciones/${usuarioId}`
      );
      const data = await res.json();
      const list = Array.isArray(data) ? data : [];
      setConversaciones(list);
      return list;
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

  /**
   * handleEnviar: envía el mensaje usando el endpoint /api/chat/mensaje
   * - receptorId: id del receptor (usuario)
   * - receptorRol: rol del receptor (por ejemplo "Emprendedor")
   * Devuelve true si envío OK, false si error.
   */
  const handleEnviar = async (e, receptorId, receptorRol) => {
    // Nota: e puede ser undefined cuando llamamos desde programático, así que protegemos
    if (e && typeof e.preventDefault === "function") e.preventDefault();

    if (!mensaje.trim() || !receptorId || !receptorRol) return false;

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
            // si tu backend admite productoId, descomenta la siguiente línea:
            // productoId: productoIdParam || null,
          }),
        }
      );

      const data = await res.json();
      if (res.ok) {
        setMensaje("");
        setInfo("");
        // refrescar mensajes y conversaciones
        await obtenerMensajes(); // si ya existe conversacionId cargará
        await cargarConversaciones();
        return true;
      } else {
        setInfo("❌ Error: " + (data.mensaje || "Error desconocido"));
        return false;
      }
    } catch (error) {
      setInfo("❌ Error de red: " + error.message);
      return false;
    }
  };

  // --- Quejas (sin cambios funcionales) ---
  const cargarQuejas = async () => {
    try {
      const res = await fetch(
        "https://backend-production-bd1d.up.railway.app/api/quejas/todas-con-mensajes"
      );
      const data = await res.json();

      let quejasFiltradas = Array.isArray(data) ? data : [];

      if (emisorRol !== "Administrador") {
        quejasFiltradas = quejasFiltradas.filter((q) =>
          q.participantes.some((p) => p.id && p.id._id === usuarioId)
        );
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

  // --- Efectos y polling ---
  useEffect(() => {
    // si la URL trae user, almacenarlo en chatTargetId y abrir vista chat
    if (chatUserIdParam) {
      setChatTargetId(chatUserIdParam);
      setVista("chat");
      // prefill si viene productoNombre
      if (productoNombre && !mensaje) {
        setMensaje(`Hola, estoy interesado en "${productoNombre}". ¿Está disponible?`);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chatUserIdParam, productoNombreParam]);

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

  // --- handleEnviarMensaje: si no existe conversacion, enviar directamente al chatTargetId
  const handleEnviarMensaje = async (e) => {
    e.preventDefault();

    if (vista === "chat") {
      // 1) Si ya hay conversacion seleccionada, enviar usando los participantes existentes
      if (conversacionId) {
        const conv = conversaciones.find((c) => c._id === conversacionId);
        const receptor = conv?.participantes?.find((p) => p.id && p.id._id !== usuarioId);
        if (receptor) {
          const ok = await handleEnviar(e, receptor.id._id, receptor.rol);
          if (ok) {
            // refrescar mensajes ya lo hace handleEnviar; obtenerMensajes y cargarConversaciones se ejecutaron
            // si no tenemos mensajes, intentar obtenerlos
            await obtenerMensajes();
          }
        }
        return;
      }

      // 2) Si no hay conversacion, pero sí tenemos chatTargetId (viene desde HomeContent)
      if (chatTargetId) {
        const ok = await handleEnviar(e, chatTargetId, "Emprendedor");
        if (ok) {
          // el backend crea la conversación con el primer mensaje. Ahora refrescamos conversaciones y seleccionamos la nueva.
          const lista = await cargarConversaciones();
          const nuevaConv = lista.find((conv) =>
            conv.participantes.some((p) => p.id && p.id._id === chatTargetId)
          );
          if (nuevaConv) {
            setConversacionId(nuevaConv._id);
            // cargar mensajes de la nueva conversación
            await obtenerMensajes();
          }
        }
        return;
      }

      // 3) si no hay target ni conversacion -> nothing
      setInfo("❌ Selecciona una conversación o usa el botón 'Contactar' desde un producto/emprendimiento.");
      return;
    }

    // Quejas
    if (vista === "quejas") {
      enviarMensajeQueja(e);
    }
  };

  // Render
  const chatActivo =
    vista === "chat"
      ? conversaciones.find((c) => c._id === conversacionId)
      : quejaSeleccionada;

  const mensajesActivos = vista === "chat" ? mensajes : mensajesQueja;

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
              💬 Chat General
            </button>
            <button
              onClick={() => setVista("quejas")}
              className={`px-3 py-1 rounded-md font-semibold transition-colors ${
                vista === "quejas"
                  ? "bg-[#AA4A44] text-white"
                  : "bg-gray-200 text-gray-700 hover:bg-[#f7d4d1]"
              }`}
            >
              📢 Quejas
            </button>
          </div>
        </div>

        <div className="flex-grow overflow-y-auto">
          {vista === "chat" ? (
            conversaciones.length === 0 ? (
              <p className="p-4 text-center text-gray-500 flex-grow">No hay conversaciones</p>
            ) : (
              conversaciones.map((conv) => {
                const otro = conv.participantes.find((p) => p.id && p.id._id !== usuarioId);
                const isActive = conv._id === conversacionId;
                return (
                  <button
                    key={conv._id}
                    onClick={() => {
                      setConversacionId(conv._id);
                      // si venimos por chatTarget, al seleccionar una conv limpiaremos chatTargetId
                      setChatTargetId(null);
                    }}
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
                const emprendedor = q.participantes.find((p) => p.rol === "Emprendedor")?.id;
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
            ) : chatTargetId ? (
              // si no hay chatActivo pero sí target (llegó desde HomeContent), mostrar nombre genérico
              `Chat con emprendedor (ID: ${chatTargetId})${productoNombre ? ` — Sobre: ${productoNombre}` : ""}`
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
            placeholder={
              vista === "chat"
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
            // habilitar input si hay conversación o si venimos desde HomeContent con user (chatTargetId)
            disabled={vista === "chat" ? !(conversacionId || chatTargetId) : !(quejaSeleccionada || emisorRol === "Cliente" || emisorRol === "Emprendedor")}
            autoComplete="off"
          />
          <button
            type="submit"
            disabled={vista === "chat" ? !(conversacionId || chatTargetId) : !(quejaSeleccionada || emisorRol === "Cliente" || emisorRol === "Emprendedor")}
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
