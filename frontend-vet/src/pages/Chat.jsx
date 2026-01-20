
// src/pages/Chat.jsx
import { useState, useEffect, useRef, useMemo } from "react";
import storeAuth from "../context/storeAuth";
import { useLocation } from "react-router-dom";

/**
 * Chat + Quejas con UI/UX consistente y responsiva.
 * - Avatar con fallback a iniciales (sin manipular el DOM).
 * - Tabs unificadas en header y sidebar.
 * - Burbuja de mensaje reutilizable con mismos estilos para ambas vistas.
 * - Accesibilidad mejorada (roles, aria, focus).
 * - Sidebar responsivo con overlay en móvil.
 * - Mantiene APIs y lógica de negocio original.
 */

/* ----------------------------- Diseño / tokens ----------------------------- */
const COLORS = {
  brand: "#AA4A44",
  brandHover: "#8C3E39",
  brandSoft: "#F7E5D2",
  bubbleMineBg: "#AA4A44",
  bubbleOtherBg: "#FFFFFF",
  bubbleOtherBorder: "#E5E7EB",
  textMuted: "#6B7280",
};

const SIZES = {
  sidebarWidth: "20rem",
  avatarMd: 36,
  avatarSm: 32,
};

const ROLES = {
  ADMIN: "Administrador",
  CLIENTE: "Cliente",
  EMPRENDEDOR: "Emprendedor",
};

/* --------------------------------- Utils ---------------------------------- */
const formatTime = (dateLike) => {
  if (!dateLike) return "";
  try {
    return new Date(dateLike).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  } catch {
    return "";
  }
};

const fullName = (u) => `${u?.nombre || ""} ${u?.apellido || ""}`.trim();

/* --------------------------------- Avatar --------------------------------- */
const Avatar = ({ nombre = "", foto = null, size = SIZES.avatarSm, className = "" }) => {
  const [imgError, setImgError] = useState(false);

  const initials =
    (nombre || "")
      .trim()
      .split(/\s+/)
      .map((w) => w[0] || "")
      .join("")
      .slice(0, 2)
      .toUpperCase() || "?";

  const common = "inline-flex items-center justify-center rounded-full select-none";
  const style = { width: size, height: size, fontWeight: 700, fontSize: Math.max(10, Math.floor(size / 3)) };

  if (foto && !imgError) {
    return (
      <img
        src={foto}
        alt={nombre || "Usuario"}
        className={`rounded-full object-cover ${className}`}
        style={{ width: size, height: size }}
        onError={() => setImgError(true)}
      />
    );
  }

  return (
    <div
      className={`${common} ${className}`}
      style={{ ...style, backgroundColor: COLORS.brandSoft, color: COLORS.brandHover }}
      aria-label={nombre ? `Avatar de ${nombre}` : "Avatar"}
    >
      {initials}
    </div>
  );
};

/* ---------------------------------- Tabs ---------------------------------- */
const Tabs = ({ vista, setVista }) => (
  <div className="flex gap-2" role="tablist" aria-label="Cambiar vista">
    <button
      role="tab"
      aria-selected={vista === "chat"}
      onClick={() => setVista("chat")}
      className={`px-3 py-2 rounded-md font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 ${
        vista === "chat" ? "text-white" : "bg-gray-200 text-gray-700 hover:bg-[#f7d4d1]"
      }`}
      style={{ backgroundColor: vista === "chat" ? COLORS.brand : undefined }}
    >
      Chat
    </button>
    <button
      role="tab"
      aria-selected={vista === "quejas"}
      onClick={() => setVista("quejas")}
      className={`px-3 py-2 rounded-md font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 ${
        vista === "quejas" ? "text-white" : "bg-gray-200 text-gray-700 hover:bg-[#f7d4d1]"
      }`}
      style={{ backgroundColor: vista === "quejas" ? COLORS.brand : undefined }}
    >
      Quejas
    </button>
  </div>
);

/* ----------------------------- Message Bubble ----------------------------- */
const MessageBubble = ({
  esMio,
  contenido,
  emisorRol,
  timestamp,
  emisorNombre,
  emisorFoto,
}) => {
  return (
    <div className={`flex items-end ${esMio ? "justify-end" : "justify-start"}`}>
      {!esMio && (
        <div className="mr-3 flex-shrink-0">
          <Avatar nombre={emisorNombre} foto={emisorFoto} size={SIZES.avatarMd} />
        </div>
      )}

      <div
        className={`px-4 py-2 rounded-2xl shadow ${esMio ? "text-white" : ""} max-w-[80%] sm:max-w-[70%]`}
        style={
          esMio
            ? { backgroundColor: COLORS.bubbleMineBg }
            : { backgroundColor: COLORS.bubbleOtherBg, border: `1px solid ${COLORS.bubbleOtherBorder}` }
        }
      >
        <div className="whitespace-pre-wrap break-words text-[15px]">{contenido}</div>
        <div
          className={`mt-1 text-[11px] text-right ${esMio ? "text-white/80" : "text-gray-500"}`}
          aria-label={`Enviado por ${emisorRol || "usuario"} a las ${formatTime(timestamp)}`}
        >
          {emisorRol || ""} {timestamp ? `· ${formatTime(timestamp)}` : ""}
        </div>
      </div>

      {esMio && <div className="ml-3" />}
    </div>
  );
};

/* ------------------------------- Empty/Loader ------------------------------ */
const EmptyState = ({ title, subtitle }) => (
  <div className="text-center text-gray-500 mt-10">
    <p className="font-medium">{title}</p>
    {subtitle && <p className="text-sm mt-1">{subtitle}</p>}
  </div>
);

const Loader = ({ label = "Cargando…" }) => (
  <div className="p-4">
    <div className="animate-pulse space-y-3">
      <div className="h-4 bg-gray-200 rounded w-1/2" />
      <div className="h-4 bg-gray-200 rounded w-1/3" />
      <div className="h-4 bg-gray-200 rounded w-2/3" />
    </div>
    <p className="text-center text-gray-500 mt-4">{label}</p>
  </div>
);

/* -------------------------------- Componente ------------------------------- */
const Chat = () => {
  const auth = storeAuth();
  const { id: usuarioId, rol: emisorRol } = auth || {};

  const [vista, setVista] = useState("chat"); // 'chat' | 'quejas'
  const [conversacionId, setConversacionId] = useState(null);

  // Chat
  const [mensaje, setMensaje] = useState("");
  const [mensajes, setMensajes] = useState([]);
  const [conversaciones, setConversaciones] = useState([]);
  const [loadingConv, setLoadingConv] = useState(false);
  const [loadingMsgs, setLoadingMsgs] = useState(false);

  // Quejas
  const [quejas, setQuejas] = useState([]);
  const [quejaSeleccionada, setQuejaSeleccionada] = useState(null);
  const [mensajeQueja, setMensajeQueja] = useState("");
  const [mensajesQueja, setMensajesQueja] = useState([]);
  const [loadingQuejas, setLoadingQuejas] = useState(false);

  // UI Misc
  const [info, setInfo] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const mensajesRef = useRef(null);

  // Query params
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const chatUserIdParam = params.get("user");
  const productoIdParam = params.get("productoId");
  const productoNombreParam = params.get("productoNombre");
  const productoNombre = productoNombreParam ? decodeURIComponent(productoNombreParam) : null;
  const [chatTargetId, setChatTargetId] = useState(null);

  const inputEnabled =
    vista === "chat"
      ? Boolean(conversacionId || chatTargetId)
      : Boolean(quejaSeleccionada || emisorRol === ROLES.CLIENTE || emisorRol === ROLES.EMPRENDEDOR);

  /* ---------------------------- Llamadas Backend ---------------------------- */
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
      const res = await fetch("https://backend-production-bd1d.up.railway.app/api/chat/mensaje", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          emisorId: usuarioId,
          emisorRol,
          receptorId,
          receptorRol,
          contenido: mensaje.trim(),
        }),
      });

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

  const cargarQuejas = async () => {
    try {
      setLoadingQuejas(true);
      const res = await fetch(
        "https://backend-production-bd1d.up.railway.app/api/quejas/todas-con-mensajes"
      );
      const data = await res.json();
      let quejasFiltradas = Array.isArray(data) ? data : [];

      if (emisorRol !== ROLES.ADMIN) {
        quejasFiltradas = quejasFiltradas.filter((q) =>
          q.participantes?.some((p) => p.id && p.id._id === usuarioId)
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

    // Enriquecer mensajes con datos del emisor si vienen sin poblar
    const mensajesEnriquecidos = (queja.mensajes || []).map((m) => {
      const copia = { ...m };

      if (copia.emisor && typeof copia.emisor === "object" && (copia.emisor.nombre || copia.emisor.foto)) {
        return copia;
      }

      const participantes = queja.participantes || [];
      const found = participantes.find((p) => {
        if (!p?.id) return false;
        const pid = typeof p.id === "object" && p.id !== null ? p.id._id : p.id;
        return String(pid) === String(copia.emisor);
      });

      if (found?.id) {
        copia._emisorObj =
          typeof found.id === "object" && found.id !== null
            ? { _id: found.id._id, nombre: found.id.nombre, apellido: found.id.apellido, foto: found.id.foto }
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
      emisorRol === ROLES.CLIENTE || emisorRol === ROLES.EMPRENDEDOR
        ? "6894f9c409b9687e33e57f56"
        : quejaSeleccionada?._id;

    const receptorRol =
      emisorRol === ROLES.CLIENTE || emisorRol === ROLES.EMPRENDEDOR ? ROLES.ADMIN : null;

    if (!receptorId) return;

    try {
      const res = await fetch("https://backend-production-bd1d.up.railway.app/api/quejas/queja", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          emisorId: usuarioId,
          emisorRol,
          contenido: mensajeQueja.trim(),
          quejaId: emisorRol === ROLES.CLIENTE || emisorRol === ROLES.EMPRENDEDOR ? null : quejaSeleccionada?._id,
          receptorId,
          receptorRol,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        const nuevo = data?.data || {
          _id: Date.now().toString(),
          contenido: mensajeQueja.trim(),
          emisor: usuarioId,
          emisorRol,
          timestamp: new Date().toISOString(),
        };

        const usuarioLocal = {
          _id: usuarioId,
          nombre: auth?.nombre || "",
          apellido: auth?.apellido || "",
          foto: auth?.foto || null,
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

  /* --------------------------------- Effects -------------------------------- */
  // Pre-carga con query params (producto/contactar)
  useEffect(() => {
    if (chatUserIdParam) {
      setChatTargetId(chatUserIdParam);
      setVista("chat");
      if (productoNombre && !mensaje) {
        setMensaje(`Hola, estoy interesado en "${productoNombre}". ¿Está disponible?`);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chatUserIdParam, productoNombreParam]);

  // Cambios de vista: carga listas
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
      conv.participantes?.some((p) => p.id && p.id._id === chatTargetId)
    );

    if (convExistente) {
      setConversacionId(convExistente._id);
      setVista("chat");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chatTargetId, conversaciones]);

  // Polling de mensajes cuando hay conversación activa
  useEffect(() => {
    if (vista === "chat" && conversacionId) {
      obtenerMensajes();
      const interval = setInterval(obtenerMensajes, 3000);
      return () => clearInterval(interval);
    }
  }, [conversacionId, vista]);

  // Carga quejas al entrar a su vista
  useEffect(() => {
    if (vista === "quejas") {
      cargarQuejas();
      setConversacionId(null);
      setMensajes([]);
      setMensaje("");
    }
  }, [vista]);

  // Autoscroll suave al final
  useEffect(() => {
    if (mensajesRef.current) {
      mensajesRef.current.scrollTop = mensajesRef.current.scrollHeight;
    }
  }, [mensajes, mensajesQueja]);

  /* ----------------------------- Render helpers ----------------------------- */
  const chatActivo = vista === "chat" ? conversaciones.find((c) => c._id === conversacionId) : quejaSeleccionada;
  const mensajesActivos = vista === "chat" ? mensajes : mensajesQueja;

  const headerTitle = useMemo(() => {
    if (vista === "chat") {
      if (chatActivo) {
        const nombreReceptor =
          chatActivo.participantes?.find((p) => p.id && p.id._id !== usuarioId)?.id?.nombre || "Desconocido";
        return `Chat con ${nombreReceptor}${productoNombre ? ` — Sobre: ${productoNombre}` : ""}`;
      }
      if (chatTargetId) {
        return `Chat con el emprendedor${productoNombre ? ` — Sobre: ${productoNombre}` : ""}`;
      }
      return "Selecciona una conversación";
    }
    if (vista === "quejas") {
      if (quejaSeleccionada) {
        const nombreOtro = fullName(quejaSeleccionada.participantes?.find((p) => p.rol !== emisorRol)?.id) || "Desconocido";
        return `Chat de Queja con ${nombreOtro}`;
      }
      return emisorRol === ROLES.CLIENTE || emisorRol === ROLES.EMPRENDEDOR
        ? "Manda una queja al administrador del sitio"
        : "Selecciona una queja";
    }
    return "";
  }, [vista, chatActivo, chatTargetId, productoNombre, usuarioId, emisorRol, quejaSeleccionada]);

  const handleEnviarMensaje = async (e) => {
    e.preventDefault();

    if (vista === "chat") {
      if (conversacionId) {
        const conv = conversaciones.find((c) => c._id === conversacionId);
        const receptor = conv?.participantes?.find((p) => p.id && p.id._id !== usuarioId);
        if (receptor) {
          const ok = await handleEnviar(e, receptor.id._id, receptor.rol);
          if (ok) await obtenerMensajes();
        }
        return;
      }

      if (chatTargetId) {
        const ok = await handleEnviar(e, chatTargetId, ROLES.EMPRENDEDOR);
        if (ok) {
          const lista = await cargarConversaciones();
          const nuevaConv = lista.find((conv) =>
            conv.participantes?.some((p) => p.id && p.id._id === chatTargetId)
          );
          if (nuevaConv) {
            setConversacionId(nuevaConv._id);
            await obtenerMensajes();
            setChatTargetId(null);
          }
        }
        return;
      }

      setInfo("❌ Selecciona una conversación o usa el botón 'Contactar' desde un producto/emprendimiento.");
      return;
    }

    if (vista === "quejas") {
      enviarMensajeQueja(e);
    }
  };

  /* ---------------------------------- UI ----------------------------------- */
  return (
    <div className="bg-white min-h-[100dvh] w-full">
      {/* Header */}
      <header
        className="flex items-center justify-between px-4 py-3 md:py-4 md:px-6 sticky top-0 z-30 shadow-sm"
        style={{ color: COLORS.brand, backgroundColor: COLORS.brandSoft }}
      >
        <div className="flex items-center gap-2">
          <button
            type="button"
            aria-label="Abrir panel lateral"
            onClick={() => setSidebarOpen(true)}
            className="md:hidden inline-flex items-center justify-center w-10 h-10 rounded-md bg-white border border-gray-300 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M4 6h16M4 12h16M4 18h16" stroke={COLORS.brand} strokeWidth="2" strokeLinecap="round" />
            </svg>
          </button>
          <h1 className="font-bold text-base sm:text-lg">{headerTitle}</h1>
        </div>

        <div className="hidden md:flex">
          <Tabs vista={vista} setVista={setVista} />
        </div>
      </header>

      {/* Layout principal */}
      <div className="grid md:grid-cols-[20rem_1fr] md:gap-0">
        {/* Overlay en móvil */}
        {sidebarOpen && (
          <div
            onClick={() => setSidebarOpen(false)}
            className="fixed inset-0 bg-black/20 backdrop-blur-[1px] z-40 md:hidden"
            aria-hidden="true"
          />
        )}

        {/* Sidebar */}
        <aside
          className={`fixed md:relative z-50 md:z-10 inset-y-0 left-0 w-80 md:w-full bg-white border-r border-gray-300 flex flex-col transform transition-transform duration-300 ${
            sidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
          }`}
          aria-label="Lista de conversaciones y quejas"
        >
          <div
            className="py-3 px-4 md:px-6 font-bold text-sm md:text-lg"
            style={{ color: COLORS.brand, backgroundColor: COLORS.brandSoft }}
          >
            <div className="flex items-center gap-2">
              <Tabs vista={vista} setVista={setVista} />
              <button
                onClick={() => setSidebarOpen(false)}
                className="md:hidden ml-auto px-3 py-1 rounded-md bg-gray-200 text-gray-700 hover:bg-[#f7d4d1] focus:outline-none focus:ring-2 focus:ring-offset-2"
              >
                Cerrar
              </button>
            </div>
          </div>

          <div className="flex-grow overflow-y-auto">
            {vista === "chat" ? (
              loadingConv ? (
                <Loader label="Cargando conversaciones…" />
              ) : conversaciones.length === 0 ? (
                <EmptyState title="No hay conversaciones" />
              ) : (
                conversaciones.map((conv) => {
                  const otro = conv.participantes?.find((p) => p.id && p.id._id !== usuarioId);
                  const isActive = conv._id === conversacionId;
                  const nombre = otro ? fullName(otro.id) || "Participante desconocido" : "Participante desconocido";
                  const foto = otro?.id?.foto || null;
                  const ultimo = (conv?.ultimoMensaje || conv?.mensajes?.[conv.mensajes?.length - 1])?.contenido;

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
                      <Avatar nombre={nombre} foto={foto} size={SIZES.avatarSm} className="flex-shrink-0" />
                      <div className="min-w-0 flex-1">
                        <p className="truncate font-medium text-gray-900">{nombre}</p>
                        {ultimo && <p className="truncate text-sm text-gray-500">{ultimo}</p>}
                      </div>
                    </button>
                  );
                })
              )
            ) : loadingQuejas ? (
              <Loader label="Cargando quejas…" />
            ) : quejas.length === 0 ? (
              <EmptyState
                title={
                  emisorRol === ROLES.CLIENTE || emisorRol === ROLES.EMPRENDEDOR
                    ? "Manda una queja al administrador del sitio"
                    : "No hay quejas registradas."
                }
              />
            ) : (
              quejas.map((q) => {
                const emprendedor = q.participantes?.find((p) => p.rol === ROLES.EMPRENDEDOR)?.id;
                const admin = q.participantes?.find((p) => p.rol === ROLES.ADMIN)?.id;
                const ultimoMensaje = q.mensajes?.[q.mensajes.length - 1];
                const isSelected = quejaSeleccionada?._id === q._id;

                const nombreEmpr = fullName(emprendedor) || "Emprendedor";
                const fotoEmpr = emprendedor?.foto || null;

                return (
                  <button
                    key={q._id}
                    onClick={() => seleccionarQueja(q)}
                    className={`w-full text-left px-4 py-3 border-b border-gray-100 hover:bg-[#fceaea] flex items-start gap-3 ${
                      isSelected ? "bg-[#fceaea]" : ""
                    }`}
                  >
                    <Avatar nombre={nombreEmpr} foto={fotoEmpr} size={SIZES.avatarSm} className="mt-1 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-[#AA4A44]">Emisor: {fullName(emprendedor)}</p>
                      <p className="text-xs text-gray-600">Receptor: {fullName(admin)}</p>
                      <p className="mt-1 text-gray-800 text-sm line-clamp-2">
                        <strong>Último mensaje:</strong> {ultimoMensaje?.contenido || "Sin mensajes"}
                      </p>
                      <p className="text-[11px] text-gray-500 mt-1">
                        {q.updatedAt ? new Date(q.updatedAt).toLocaleString() : ""}
                      </p>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </aside>

        {/* Panel de mensajes */}
        <section className="flex-1 flex flex-col">
          <div
            ref={mensajesRef}
            role="log"
            aria-live="polite"
            aria-busy={loadingMsgs}
            className="flex-1 overflow-y-auto p-3 sm:p-4 bg-gray-50 space-y-3 sm:space-y-4"
          >
            {chatActivo ? (
              loadingMsgs ? (
                <Loader label="Cargando mensajes…" />
              ) : mensajesActivos.length === 0 ? (
                <EmptyState title="No hay mensajes aún." />
              ) : (
                mensajesActivos.map((msg) => {
                  // Resolver emisor
                  let emisorObj = null;
                  if (msg && typeof msg.emisor === "object" && (msg.emisor?.nombre || msg.emisor?.foto)) {
                    emisorObj = msg.emisor;
                  } else if (msg && msg._emisorObj) {
                    emisorObj = msg._emisorObj;
                  } else if (chatActivo?.participantes) {
                    const pFound = chatActivo.participantes.find((p) => {
                      const pid = typeof p.id === "object" && p.id !== null ? p.id._id : p.id;
                      return String(pid) === String(msg.emisor);
                    });
                    if (pFound?.id) {
                      emisorObj =
                        typeof pFound.id === "object" && pFound.id !== null
                          ? { _id: pFound.id._id, nombre: pFound.id.nombre, apellido: pFound.id.apellido, foto: pFound.id.foto }
                          : { _id: pFound.id, nombre: "", apellido: "", foto: null };
                    }
                  }

                  const _emisorId = emisorObj ? emisorObj._id : msg.emisor;
                  const emisorNombre = emisorObj ? fullName(emisorObj) : "";
                  const emisorFoto = emisorObj ? emisorObj.foto : null;
                  const esMio = String(_emisorId) === String(usuarioId);

                  return (
                    <MessageBubble
                      key={msg._id || msg.id}
                      esMio={esMio}
                      contenido={msg.contenido}
                      emisorRol={msg.emisorRol}
                      timestamp={msg.timestamp}
                      emisorNombre={emisorNombre}
                      emisorFoto={emisorFoto}
                    />
                  );
                })
              )
            ) : (
              <EmptyState
                title={
                  emisorRol === ROLES.CLIENTE || emisorRol === ROLES.EMPRENDEDOR
                    ? "Manda una queja al administrador del sitio"
                    : "Selecciona una queja para comenzar"
                }
              />
            )}
          </div>

          {/* Input */}
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
              onChange={(e) => (vista === "chat" ? setMensaje(e.target.value) : setMensajeQueja(e.target.value))}
              className="flex-1 border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-offset-0 text-[15px]"
              disabled={!inputEnabled}
              autoComplete="off"
            />
            <button
              type="submit"
              disabled={!inputEnabled}
              className="inline-flex items-center gap-2 text-white px-4 sm:px-6 py-2 rounded-md transition disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-offset-2"
              style={{ backgroundColor: COLORS.brand }}
              onMouseOver={(e) => (e.currentTarget.style.backgroundColor = COLORS.brandHover)}
              onMouseOut={(e) => (e.currentTarget.style.backgroundColor = COLORS.brand)}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path d="M3 20l18-8L3 4l3 7 8 1-8 1-3 7z" fill="currentColor" />
              </svg>
              <span className="hidden sm:inline">Enviar</span>
            </button>
          </form>

          {info && <div className="p-2 text-center text-red-600 font-medium">{info}</div>}
        </section>
      </div>
    </div>
  );
};

export default Chat;
