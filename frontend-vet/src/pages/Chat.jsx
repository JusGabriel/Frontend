
// src/pages/Chat.jsx
import { useState, useEffect, useRef } from "react";
import storeAuth from "../context/storeAuth";
import { useLocation } from "react-router-dom";

/**
 * Chat responsivo con avatar (foto o iniciales) y soporte de quejas.
 * - Evita clases Tailwind generadas en runtime (rompen el build).
 * - Para colores dinámicos, usa `style={{ ... }}`.
 */

const Avatar = ({ nombre = "", foto = null, size = 32, className = "" }) => {
  const initials =
    (nombre || "")
      .trim()
      .split(/\s+/)
      .map((w) => w[0] || "")
      .join("")
      .slice(0, 2)
      .toUpperCase() || "?";

  const styleImg = {
    width: size,
    height: size,
    borderRadius: "9999px",
    objectFit: "cover",
  };
  const styleDiv = {
    width: size,
    height: size,
    borderRadius: "9999px",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: 700,
    fontSize: Math.max(10, Math.floor(size / 3)),
    backgroundColor: "#F7E5D2",
    color: "#8C3E39",
  };

  if (foto) {
    return (
      <img
        src={foto}
        alt={nombre || "Usuario"}
        style={styleImg}
        className={className}
        onError={(e) => {
          const parent = e.currentTarget.parentNode;
          if (!parent) return;
          const span = document.createElement("span");
          span.textContent = initials;
          Object.assign(span.style, styleDiv);
          span.className = className;
          parent.replaceChild(span, e.currentTarget);
        }}
      />
    );
  }

  return (
    <div style={styleDiv} className={className}>
      {initials}
    </div>
  );
};

const Chat = () => {
  const { id: usuarioId, rol: emisorRol } = storeAuth();

  const [vista, setVista] = useState("chat");
  const [conversacionId, setConversacionId] = useState(null);
  const [mensaje, setMensaje] = useState("");
  const [mensajes, setMensajes] = useState([]);
  const [conversaciones, setConversaciones] = useState([]);
  const [quejas, setQuejas] = useState([]);
  const [quejaSeleccionada, setQuejaSeleccionada] = useState(null);
  const [mensajeQueja, setMensajeQueja] = useState("");
  const [mensajesQueja, setMensajesQueja] = useState([]);
  const [info, setInfo] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loadingConv, setLoadingConv] = useState(false);
  const [loadingMsgs, setLoadingMsgs] = useState(false);
  const [loadingQuejas, setLoadingQuejas] = useState(false);

  const mensajesRef = useRef(null);

  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const chatUserIdParam = params.get("user");
  const productoIdParam = params.get("productoId"); // reservado si lo usas más adelante
  const productoNombreParam = params.get("productoNombre");
  const productoNombre = productoNombreParam
    ? decodeURIComponent(productoNombreParam)
    : null;

  const [chatTargetId, setChatTargetId] = useState(null);

  // Colores base de la marca
  const colorBrand = "#AA4A44";
  const colorBrandHover = "#8C3E39";
  const colorBrandSoft = "#FFF5F4";
  const bubbleMaxWMobile = "max-w-[80%]";
  const bubbleMaxWDesktop = "sm:max-w-[70%]";

  const inputEnabled =
    vista === "chat"
      ? Boolean(conversacionId || chatTargetId)
      : Boolean(
          quejaSeleccionada ||
            emisorRol === "Cliente" ||
            emisorRol === "Emprendedor"
        );

  // ---------------- Backend calls ----------------
  const cargarConversaciones = async () => {
    if (!usuarioId) return [];
    try {
      setLoadingConv(true);
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
    } finally {
      setLoadingConv(false);
    }
  };

  const obtenerMensajes = async () => {
    if (!conversacionId) return;
    try {
      setLoadingMsgs(true);
      const res = await fetch(
        `https://backend-production-bd1d.up.railway.app/api/chat/mensajes/${conversacionId}`
      );
      const data = await res.json();
      setMensajes(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error cargando mensajes", error);
      setInfo("❌ Error cargando mensajes");
    } finally {
      setLoadingMsgs(false);
    }
  };

  const handleEnviar = async (e, receptorId, receptorRol) => {
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
          }),
        }
      );

      const data = await res.json();
      if (res.ok) {
        setMensaje("");
        setInfo("");
        await obtenerMensajes();
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

  // ---------------- Quejas ----------------
  const cargarQuejas = async () => {
    try {
      setLoadingQuejas(true);
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
    } finally {
      setLoadingQuejas(false);
    }
  };

  const seleccionarQueja = (queja) => {
    setQuejaSeleccionada(queja);

    const mensajesEnriquecidos = (queja.mensajes || []).map((m) => {
      const copia = { ...m };

      if (
        typeof copia.emisor === "object" &&
        copia.emisor !== null &&
        copia.emisor.nombre
      ) {
        return copia;
      }

      const participantes = queja.participantes || [];
      const found = participantes.find((p) => {
        if (!p?.id) return false;
        const pid =
          typeof p.id === "object" && p.id !== null ? p.id._id : p.id;
        return String(pid) === String(copia.emisor);
      });

      if (found && found.id) {
        copia._emisorObj =
          typeof found.id === "object" && found.id !== null
            ? {
                _id: found.id._id,
                nombre: found.id.nombre,
                apellido: found.id.apellido,
                foto: found.id.foto,
              }
            : { _id: found.id, nombre: "", apellido: "", foto: null };
      }

      return copia;
    });

    setMensajesQueja(mensajesEnriquecidos);
    setMensajeQueja("");
    setInfo("");
    setSidebarOpen(false);
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
        const nuevo =
          data?.data || {
            _id: Date.now().toString(),
            contenido: mensajeQueja.trim(),
            emisor: usuarioId,
            emisorRol,
            timestamp: new Date().toISOString(),
          };

        const usuarioLocal = {
          _id: usuarioId,
          nombre: storeAuth()?.nombre || "",
          apellido: storeAuth()?.apellido || "",
          foto: storeAuth()?.foto || null,
        };
        const nuevoEnriquecido = { ...nuevo, _emisorObj: usuarioLocal };

        setMensajesQueja((prev) => [...prev, nuevoEnriquecido]);
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

  // ---------------- Effects ----------------
  useEffect(() => {
    if (chatUserIdParam) {
      setChatTargetId(chatUserIdParam);
      setVista("chat");
      if (productoNombre && !mensaje) {
        setMensaje(
          `Hola, estoy interesado en "${productoNombre}". ¿Está disponible?`
        );
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
    if (!chatTargetId) return;
    if (!conversaciones || conversaciones.length === 0) return;

    const convExistente = conversaciones.find((conv) =>
      conv.participantes.some((p) => p.id && p.id._id === chatTargetId)
    );

    if (convExistente) {
      setConversacionId(convExistente._id);
      setVista("chat");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chatTargetId, conversaciones]);

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

  // ---------------- Envío del mensaje (UI) ----------------
  const handleEnviarMensaje = async (e) => {
    e.preventDefault();

    if (vista === "chat") {
      if (conversacionId) {
        const conv = conversaciones.find((c) => c._id === conversacionId);
        const receptor = conv?.participantes?.find(
          (p) => p.id && p.id._id !== usuarioId
        );
        if (receptor) {
          const ok = await handleEnviar(e, receptor.id._id, receptor.rol);
          if (ok) await obtenerMensajes();
        }
        return;
      }

      if (chatTargetId) {
        const ok = await handleEnviar(e, chatTargetId, "Emprendedor");
        if (ok) {
          const lista = await cargarConversaciones();
          const nuevaConv = lista.find((conv) =>
            conv.participantes.some((p) => p.id && p.id._id === chatTargetId)
          );
          if (nuevaConv) {
            setConversacionId(nuevaConv._id);
            await obtenerMensajes();
            setChatTargetId(null);
          }
        }
        return;
      }

      setInfo(
        "❌ Selecciona una conversación o usa el botón 'Contactar' desde un producto/emprendimiento."
      );
      return;
    }

    if (vista === "quejas") {
      enviarMensajeQueja(e);
    }
  };

  // ---------------- Render helpers ----------------
  const chatActivo =
    vista === "chat"
      ? conversaciones.find((c) => c._id === conversacionId)
      : quejaSeleccionada;

  const mensajesActivos = vista === "chat" ? mensajes : mensajesQueja;

  const HeaderTitle = () => {
    if (vista === "chat") {
      if (chatActivo) {
        const nombreReceptor =
          chatActivo.participantes.find(
            (p) => p.id && p.id._id !== usuarioId
          )?.id?.nombre || "Desconocido";
        return `Chat con ${nombreReceptor}${
          productoNombre ? ` — Sobre: ${productoNombre}` : ""
        }`;
      }
      if (chatTargetId) {
        return `Chat con el emprendedor${
          productoNombre ? ` — Sobre: ${productoNombre}` : ""
        }`;
      }
      return "Selecciona una conversación";
    }
    if (vista === "quejas") {
      if (quejaSeleccionada) {
        const nombreOtro =
          quejaSeleccionada.participantes.find((p) => p.rol !== emisorRol)?.id
            ?.nombre || "Desconocido";
        return `Chat Queja con ${nombreOtro}`;
      }
      return emisorRol === "Cliente" || emisorRol === "Emprendedor"
        ? "Manda una queja al administrador del sitio"
        : "Selecciona una queja";
    }
    return "";
  };

  return (
    <div className="bg-white min-h-[100dvh] w-full" style={{ padding: 5 }}>
      <header
        className="flex items-center justify-between px-4 py-3 md:py-4 md:px-6 sticky top-0 z-30"
        style={{ color: colorBrand, backgroundColor: colorBrandSoft }}
      >
        <div className="flex items-center gap-2">
          <button
            type="button"
            aria-label="Abrir panel lateral"
            onClick={() => setSidebarOpen(true)}
            className="md:hidden inline-flex items-center justify-center w-10 h-10 rounded-md bg-white border border-gray-300 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path
                d="M4 6h16M4 12h16M4 18h16"
                stroke={colorBrand}
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
          </button>
          <h1 className="font-bold text-base sm:text-lg">{HeaderTitle()}</h1>
        </div>

        <div className="hidden md:flex gap-2">
          <button
            onClick={() => setVista("chat")}
            className={`px-3 py-2 rounded-md font-semibold transition-colors ${
              vista === "chat"
                ? "text-white"
                : "bg-gray-200 text-gray-700 hover:bg-[#f7d4d1]"
            }`}
            style={{ backgroundColor: vista === "chat" ? colorBrand : undefined }}
          >
            Chat
          </button>
          <button
            onClick={() => setVista("quejas")}
            className={`px-3 py-2 rounded-md font-semibold transition-colors ${
              vista === "quejas"
                ? "text-white"
                : "bg-gray-200 text-gray-700 hover:bg-[#f7d4d1]"
            }`}
            style={{
              backgroundColor: vista === "quejas" ? colorBrand : undefined,
            }}
          >
            Quejas
          </button>
        </div>
      </header>

      <div className="grid md:grid-cols-[20rem_1fr] md:gap-0">
        {sidebarOpen && (
          <div
            onClick={() => setSidebarOpen(false)}
            className="fixed inset-0 bg-black/20 backdrop-blur-[1px] z-40 md:hidden"
            aria-hidden="true"
          />
        )}

        <aside
          className={`fixed md:relative z-50 md:z-10 inset-y-0 left-0 w-80 md:w-full bg-white border-r border-gray-300 flex flex-col transform transition-transform duration-300 ${
            sidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
          }`}
        >
          <div
            className="py-3 px-4 md:px-6 font-bold text-sm md:text-lg text-center md:text-left"
            style={{ color: colorBrand, backgroundColor: colorBrandSoft }}
          >
            <div className="flex justify-center md:justify-start gap-2">
              <button
                onClick={() => setVista("chat")}
                className={`px-3 py-1 rounded-md font-semibold transition-colors ${
                  vista === "chat"
                    ? "text-white"
                    : "bg-gray-200 text-gray-700 hover:bg-[#f7d4d1]"
                }`}
                style={{
                  backgroundColor: vista === "chat" ? colorBrand : undefined,
                }}
              >
                Chat
              </button>
              <button
                onClick={() => setVista("quejas")}
                className={`px-3 py-1 rounded-md font-semibold transition-colors ${
                  vista === "quejas"
                    ? "text-white"
                    : "bg-gray-200 text-gray-700 hover:bg-[#f7d4d1]"
                }`}
                style={{
                  backgroundColor: vista === "quejas" ? colorBrand : undefined,
                }}
              >
                Quejas
              </button>
              <button
                onClick={() => setSidebarOpen(false)}
                className="md:hidden ml-auto px-3 py-1 rounded-md bg-gray-200 text-gray-700 hover:bg-[#f7d4d1]"
              >
                Cerrar
              </button>
            </div>
          </div>

          <div className="flex-grow overflow-y-auto">
            {vista === "chat" ? (
              loadingConv ? (
                <p className="p-4 text-center text-gray-500">
                  Cargando conversaciones…
                </p>
              ) : conversaciones.length === 0 ? (
                <p className="p-4 text-center text-gray-500">
                  No hay conversaciones
                </p>
              ) : (
                conversaciones.map((conv) => {
                  const otro = conv.participantes.find(
                    (p) => p.id && p.id._id !== usuarioId
                  );
                  const isActive = conv._id === conversacionId;
                  const nombre = otro
                    ? `${otro.id?.nombre ?? ""} ${otro.id?.apellido ?? ""}`.trim()
                    : "Participante desconocido";
                  const foto = otro?.id?.foto || null;

                  return (
                    <button
                      key={conv._id}
                      onClick={() => {
                        setConversacionId(conv._id);
                        setChatTargetId(null);
                        setSidebarOpen(false);
                      }}
                      className={`w-full text-left px-4 py-3 border-b border-gray-100 hover:bg-[#fceaea] flex items-center gap-3 ${
                        isActive ? "bg-[#fceaea]" : ""
                      }`}
                    >
                      <Avatar
                        nombre={nombre}
                        foto={foto}
                        size={32}
                        className="flex-shrink-0"
                      />
                      <span className="truncate">{nombre}</span>
                    </button>
                  );
                })
              )
            ) : loadingQuejas ? (
              <p className="p-4 text-center text-gray-500">Cargando quejas…</p>
            ) : quejas.length === 0 ? (
              <p className="p-4 text-center text-gray-500">
                {emisorRol === "Cliente" || emisorRol === "Emprendedor"
                  ? "Manda una queja al administrador del sitio"
                  : "No hay quejas registradas."}
              </p>
            ) : (
              quejas.map((q) => {
                const emprendedor = q.participantes.find(
                  (p) => p.rol === "Emprendedor"
                )?.id;
                const admin = q.participantes.find(
                  (p) => p.rol === "Administrador"
                )?.id;
                const ultimoMensaje = q.mensajes[q.mensajes.length - 1];
                const isSelected = quejaSeleccionada?._id === q._id;

                const nombreEmpr = emprendedor
                  ? `${emprendedor.nombre || ""} ${
                      emprendedor.apellido || ""
                    }`.trim()
                  : "Emprendedor";
                const fotoEmpr = emprendedor?.foto || null;

                return (
                  <button
                    key={q._id}
                    onClick={() => seleccionarQueja(q)}
                    className={`w-full text-left px-4 py-3 border-b border-gray-100 hover:bg-[#fceaea] flex items-start gap-3 ${
                      isSelected ? "bg-[#fceaea]" : ""
                    }`}
                  >
                    <Avatar
                      nombre={nombreEmpr}
                      foto={fotoEmpr}
                      size={32}
                      className="mt-1 flex-shrink-0"
                    />
                    <div className="flex-1">
                      <p className="font-semibold text-[#AA4A44]">
                        Emisor: {emprendedor?.nombre} {emprendedor?.apellido}
                      </p>
                      <p className="text-xs text-gray-600">
                        Receptor: {admin?.nombre} {admin?.apellido}
                      </p>
                      <p className="mt-1 text-gray-800 text-sm line-clamp-2">
                        <strong>Último mensaje:</strong>{" "}
                        {ultimoMensaje?.contenido || "Sin mensajes"}
                      </p>
                      <p className="text-[11px] text-gray-500 mt-1">
                        {new Date(q.updatedAt).toLocaleString()}
                      </p>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </aside>

        <section className="flex-1 flex flex-col">
          <div
            ref={mensajesRef}
            role="log"
            aria-live="polite"
            className="flex-1 overflow-y-auto p-3 sm:p-4 bg-gray-50 space-y-3 sm:space-y-4"
          >
            {chatActivo ? (
              loadingMsgs ? (
                <p className="text-center text-gray-500 mt-10">
                  Cargando mensajes…
                </p>
              ) : mensajesActivos.length === 0 ? (
                <p className="text-center text-gray-500 mt-10">
                  No hay mensajes aún.
                </p>
              ) : (
                mensajesActivos.map((msg) => {
                  let emisorObj = null;
                  if (
                    msg &&
                    typeof msg.emisor === "object" &&
                    msg.emisor !== null &&
                    (msg.emisor.nombre || msg.emisor.foto)
                  ) {
                    emisorObj = msg.emisor;
                  } else if (msg && msg._emisorObj) {
                    emisorObj = msg._emisorObj;
                  } else if (chatActivo && chatActivo.participantes) {
                    const pFound = chatActivo.participantes.find((p) => {
                      const pid =
                        typeof p.id === "object" && p.id !== null
                          ? p.id._id
                          : p.id;
                      return String(pid) === String(msg.emisor);
                    });
                    if (pFound && pFound.id) {
                      emisorObj =
                        typeof pFound.id === "object" && pFound.id !== null
                          ? {
                              _id: pFound.id._id,
                              nombre: pFound.id.nombre,
                              apellido: pFound.id.apellido,
                              foto: pFound.id.foto,
                            }
                          : { _id: pFound.id, nombre: "", apellido: "", foto: null };
                    }
                  }

                  const emisorId = emisorObj ? emisorObj._id : msg.emisor;
                  const emisorNombre = emisorObj
                    ? `${emisorObj.nombre || ""} ${emisorObj.apellido || ""}`.trim()
                    : "";
                  const emisorFoto = emisorObj ? emisorObj.foto : null;
                  const esMio = String(emisorId) === String(usuarioId);

                  return (
                    <div
                      key={msg._id || msg.id}
                      className={`flex items-end ${
                        esMio ? "justify-end" : "justify-start"
                      }`}
                    >
                      {!esMio && (
                        <div className="mr-3">
                          <Avatar
                            nombre={emisorNombre}
                            foto={emisorFoto}
                            size={36}
                          />
                        </div>
                      )}

                      <div
                        className={`px-4 py-2 rounded-2xl shadow ${
                          esMio
                            ? `text-white ${bubbleMaxWMobile} ${bubbleMaxWDesktop}`
                            : `bg-white border border-gray-300 ${bubbleMaxWMobile} ${bubbleMaxWDesktop}`
                        }`}
                        style={esMio ? { backgroundColor: colorBrand } : {}}
                      >
                        <div className="whitespace-pre-wrap break-words">
                          {msg.contenido}
                        </div>
                        <div
                          className={`mt-1 text-[11px] ${
                            esMio ? "text-white/80" : "text-gray-500"
                          } text-right`}
                        >
                          {msg.emisorRol || ""}
                          {msg.timestamp
                            ? ` · ${new Date(msg.timestamp).toLocaleTimeString()}`
                            : ""}
                        </div>
                      </div>

                      {esMio && <div className="ml-3" />}
                    </div>
                  );
                })
              )
            ) : (
              <p className="text-center text-gray-500 mt-10">
                {emisorRol === "Cliente" || emisorRol === "Emprendedor"
                  ? "Manda una queja al administrador del sitio"
                  : "Selecciona una queja para comenzar"}
              </p>
            )}
          </div>

          <form
            onSubmit={handleEnviarMensaje}
            className="flex items-center gap-2 p-3 sm:p-4 border-t border-gray-300 bg-white sticky bottom-0"
            style={{ paddingBottom: "calc(env(safe-area-inset-bottom, 0px))" }}
          >
            <label htmlFor="messageInput" className="sr-only">
              {vista === "chat"
                ? productoNombre
                  ? `Mensaje sobre "${productoNombre}"`
                  : "Escribe un mensaje…"
                : "Escribe tu respuesta…"}
            </label>
            <input
              id="messageInput"
              type="text"
              placeholder={
                vista === "chat"
                  ? productoNombre
                    ? `Mensaje sobre "${productoNombre}"`
                    : "Escribe un mensaje…"
                  : "Escribe tu respuesta…"
              }
              value={vista === "chat" ? mensaje : mensajeQueja}
              onChange={(e) =>
                vista === "chat"
                  ? setMensaje(e.target.value)
                  : setMensajeQueja(e.target.value)
              }
              className="flex-1 border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-offset-0 text-[15px]"
              disabled={!inputEnabled}
              autoComplete="off"
            />
            <button
              type="submit"
              disabled={!inputEnabled}
              className="inline-flex items-center gap-2 text-white px-4 sm:px-6 py-2 rounded-md transition disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-offset-2"
              style={{ backgroundColor: colorBrand }}
              onMouseOver={(e) => (e.currentTarget.style.backgroundColor = colorBrandHover)}
              onMouseOut={(e) => (e.currentTarget.style.backgroundColor = colorBrand)}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <path d="M3 20l18-8L3 4l3 7 8 1-8 1-3 7z" fill="currentColor" />
              </svg>
              <span className="hidden sm:inline">Enviar</span>
            </button>
          </form>

          {!!info && (
            <div className="p-2 text-center text-red-600 font-medium">{info}</div>
          )}
        </section>
      </div>
    </div>
  );
};

export default Chat;
