
// src/pages/Chat.jsx
import { useState, useEffect, useRef, useMemo } from "react";
import storeAuth from "../context/storeAuth";
import { useLocation } from "react-router-dom";

/**
 * Chat con UX mejorado:
 * - Sin búsqueda en el sidebar
 * - Sin línea de “último mensaje …” bajo cada conversación
 * - Sin loop de carga (polling); sólo carga al cambiar de conversación y al enviar
 * - Espacios ajustados y estilo limpio con colores de marca
 * - Evita clases Tailwind dinámicas (usa style para colores variables)
 */

const theme = {
  brand: "#AA4A44",
  brandHover: "#8C3E39",
  brandSoft: "#FFF5F4",
  mineBubble: "#AA4A44",
  otherBubble: "#FFFFFF",
  border: "#E5E7EB",
  bg: "#F8FAFC",
  text: "#1F2937",
  subtle: "#6B7280",
};

const Avatar = ({ nombre = "", foto = null, size = 36, className = "" }) => {
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
    boxShadow: "0 1px 2px rgba(16,24,40,0.08)",
    backgroundColor: "#fff",
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
    background:
      "linear-gradient(135deg, rgba(255,221,215,1) 0%, rgba(247,229,210,1) 100%)",
    color: "#8C3E39",
    boxShadow: "0 1px 2px rgba(16,24,40,0.08)",
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
    <div style={styleDiv} className={className} aria-label={`Avatar de ${nombre}`}>
      {initials}
    </div>
  );
};

// Utilidades de fecha/hora
const fmtDate = (ts) =>
  new Intl.DateTimeFormat("es-EC", {
    weekday: "long",
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(ts));

const fmtTime = (ts) =>
  new Intl.DateTimeFormat("es-EC", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(ts));

const isSameDay = (aTs, bTs) => {
  const a = new Date(aTs);
  const b = new Date(bTs);
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
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
  const [showScrollBtn, setShowScrollBtn] = useState(false);

  const mensajesRef = useRef(null);
  const composerRef = useRef(null);

  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const chatUserIdParam = params.get("user");
  const productoNombreParam = params.get("productoNombre");
  const productoNombre = productoNombreParam
    ? decodeURIComponent(productoNombreParam)
    : null;

  const [chatTargetId, setChatTargetId] = useState(null);

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
    const contenido = vista === "chat" ? mensaje : mensajeQueja;
    if (!contenido.trim() || !receptorId || !receptorRol) return false;

    try {
      const url =
        vista === "chat"
          ? "https://backend-production-bd1d.up.railway.app/api/chat/mensaje"
          : "https://backend-production-bd1d.up.railway.app/api/quejas/queja";

      const body =
        vista === "chat"
          ? {
              emisorId: usuarioId,
              emisorRol,
              receptorId,
              receptorRol,
              contenido: contenido.trim(),
            }
          : {
              emisorId: usuarioId,
              emisorRol,
              contenido: contenido.trim(),
              quejaId:
                emisorRol === "Cliente" || emisorRol === "Emprendedor"
                  ? null
                  : quejaSeleccionada?._id,
              receptorId,
              receptorRol,
            };

      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await res.json();
      if (res.ok) {
        if (vista === "chat") {
          setMensaje("");
          setInfo("");
          await obtenerMensajes();
          await cargarConversaciones();
        } else {
          const nuevo =
            data?.data || {
              _id: Date.now().toString(),
              contenido: contenido.trim(),
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
        }
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

  // 👉 Sin loop: sólo carga una vez al cambiar de conversación
  useEffect(() => {
    if (vista === "chat" && conversacionId) {
      obtenerMensajes();
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

  // Auto-scroll + botón "bajar"
  useEffect(() => {
    const el = mensajesRef.current;
    if (!el) return;
    const onScroll = () => {
      const atBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 80;
      setShowScrollBtn(!atBottom);
    };
    el.addEventListener("scroll", onScroll);
    return () => el.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const el = mensajesRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [mensajes, mensajesQueja]);

  // Auto-resize del textarea
  useEffect(() => {
    const ta = composerRef.current;
    if (!ta) return;
    ta.style.height = "0px";
    ta.style.height = Math.min(160, ta.scrollHeight) + "px";
  }, [mensaje, mensajeQueja, vista]);

  // ---------------- UI/acciones ----------------
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
      const receptorId =
        emisorRol === "Cliente" || emisorRol === "Emprendedor"
          ? "6894f9c409b9687e33e57f56"
          : quejaSeleccionada?._id;

      const receptorRol =
        emisorRol === "Cliente" || emisorRol === "Emprendedor"
          ? "Administrador"
          : null;

      if (!receptorId) return;
      await handleEnviar(e, receptorId, receptorRol);
    }
  };

  const handleComposerKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (inputEnabled) handleEnviarMensaje(e);
    }
  };

  // Datos activos según vista
  const chatActivo =
    vista === "chat"
      ? conversaciones.find((c) => c._id === conversacionId)
      : quejaSeleccionada;

  const mensajesActivos = vista === "chat" ? mensajes : mensajesQueja;

  // Lista con separadores por fecha
  const mensajesConSeparadores = useMemo(() => {
    const arr = [];
    let lastDate = null;
    for (const m of mensajesActivos) {
      const t = m.timestamp || m.fecha || m.createdAt || Date.now();
      if (!lastDate || !isSameDay(lastDate, t)) {
        arr.push({ _sep: true, key: `sep-${t}`, label: fmtDate(t) });
        lastDate = t;
      }
      arr.push(m);
    }
    return arr;
  }, [mensajesActivos]);

  const HeaderTitle = () => {
    if (vista === "chat") {
      if (chatActivo) {
        const nombreReceptor =
          chatActivo.participantes.find(
            (p) => p.id && p.id._id !== usuarioId
          )?.id?.nombre || "Desconocido";
        return (
          <div className="flex items-baseline gap-2">
            <span className="font-semibold">Chat con {nombreReceptor}</span>
            {productoNombre && (
              <span
                className="text-xs px-2 py-0.5 rounded-full"
                style={{
                  color: theme.brand,
                  backgroundColor: theme.brandSoft,
                  border: `1px solid ${theme.border}`,
                }}
                title={`Sobre ${productoNombre}`}
              >
                {productoNombre}
              </span>
            )}
          </div>
        );
      }
      if (chatTargetId) {
        return (
          <div className="flex items-baseline gap-2">
            <span className="font-semibold">Chat con el emprendedor</span>
            {productoNombre && (
              <span
                className="text-xs px-2 py-0.5 rounded-full"
                style={{
                  color: theme.brand,
                  backgroundColor: theme.brandSoft,
                  border: `1px solid ${theme.border}`,
                }}
                title={`Sobre ${productoNombre}`}
              >
                {productoNombre}
              </span>
            )}
          </div>
        );
      }
      return "Selecciona una conversación";
    }
    if (vista === "quejas") {
      if (quejaSeleccionada) {
        const nombreOtro =
          quejaSeleccionada.participantes.find((p) => p.rol !== emisorRol)?.id
            ?.nombre || "Desconocido";
        return `Queja con ${nombreOtro}`;
      }
      return emisorRol === "Cliente" || emisorRol === "Emprendedor"
        ? "Manda una queja al administrador del sitio"
        : "Selecciona una queja";
    }
    return "";
  };

  return (
    <div className="min-h-[100dvh] w-full" style={{ backgroundColor: theme.bg }}>
      {/* Header */}
      <header
        className="flex items-center justify-between px-4 py-3 md:px-6 sticky top-0 z-30 border-b"
        style={{ color: theme.brand, backgroundColor: theme.brandSoft, borderColor: theme.border }}
      >
        <div className="flex items-center gap-3">
          <button
            type="button"
            aria-label="Abrir panel lateral"
            onClick={() => setSidebarOpen(true)}
            className="md:hidden inline-flex items-center justify-center w-10 h-10 rounded-md bg-white border border-gray-200 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path
                d="M4 6h16M4 12h16M4 18h16"
                stroke={theme.brand}
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
          </button>
          <div className="flex flex-col">
            <h1 className="text-base md:text-lg"><HeaderTitle /></h1>
            <span className="text-xs" style={{ color: theme.subtle }}>
              {vista === "chat" ? "Mensajería" : "Gestión de quejas"}
            </span>
          </div>
        </div>

        <div className="hidden md:flex gap-2">
          <button
            onClick={() => setVista("chat")}
            className={`px-3 py-2 rounded-md font-medium transition-colors ${
              vista === "chat" ? "text-white" : "bg-white border"
            }`}
            style={{
              backgroundColor: vista === "chat" ? theme.brand : undefined,
              borderColor: theme.border,
            }}
          >
            Chat
          </button>
          <button
            onClick={() => setVista("quejas")}
            className={`px-3 py-2 rounded-md font-medium transition-colors ${
              vista === "quejas" ? "text-white" : "bg-white border"
            }`}
            style={{
              backgroundColor: vista === "quejas" ? theme.brand : undefined,
              borderColor: theme.border,
            }}
          >
            Quejas
          </button>
        </div>
      </header>

      {/* Layout */}
      <div className="grid md:grid-cols-[22rem_1fr]">
        {/* Overlay móvil */}
        {sidebarOpen && (
          <div
            onClick={() => setSidebarOpen(false)}
            className="fixed inset-0 bg-black/30 backdrop-blur-[1px] z-40 md:hidden"
            aria-hidden="true"
          />
        )}

        {/* Sidebar */}
        <aside
          className={`fixed md:relative z-50 md:z-auto inset-y-0 left-0 w-[88%] max-w-[22rem] md:max-w-none md:w-full bg-white border-r flex flex-col transform transition-transform duration-300 ${
            sidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
          }`}
          style={{ borderColor: theme.border }}
          aria-label="Panel lateral de conversaciones"
        >
          {/* Encabezado sidebar (simple) */}
          <div
            className="px-4 py-3 md:px-6 flex items-center justify-between border-b"
            style={{ backgroundColor: theme.brandSoft, borderColor: theme.border }}
          >
            <span className="font-medium">Conversaciones</span>
            <button
              onClick={() => setSidebarOpen(false)}
              className="md:hidden px-3 py-1.5 rounded-md bg-white border text-sm"
              style={{ borderColor: theme.border }}
            >
              Cerrar
            </button>
          </div>

          {/* Lista */}
          <div className="flex-1 overflow-y-auto">
            {vista === "chat" ? (
              loadingConv ? (
                <SidebarSkeleton />
              ) : conversaciones.length === 0 ? (
                <p className="p-4 text-center" style={{ color: theme.subtle }}>
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
                      className="w-full text-left px-4 py-3 hover:bg-gray-50 flex items-center gap-3 transition-colors border-b"
                      style={{
                        backgroundColor: isActive ? "#FFF7F6" : undefined,
                        borderColor: theme.border,
                      }}
                    >
                      <Avatar nombre={nombre} foto={foto} size={40} className="flex-shrink-0" />
                      <div className="min-w-0 flex-1 flex items-center justify-between gap-3">
                        <span className="font-medium truncate">{nombre}</span>
                        {conv.ultimoTimestamp && (
                          <span className="text-xs" style={{ color: theme.subtle }}>
                            {fmtTime(conv.ultimoTimestamp)}
                          </span>
                        )}
                      </div>
                    </button>
                  );
                })
              )
            ) : loadingQuejas ? (
              <SidebarSkeleton />
            ) : quejas.length === 0 ? (
              <p className="p-4 text-center" style={{ color: theme.subtle }}>
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
                const isSelected = quejaSeleccionada?._id === q._id;

                const nombreEmpr = emprendedor
                  ? `${emprendedor.nombre || ""} ${emprendedor.apellido || ""}`.trim()
                  : "Emprendedor";
                const fotoEmpr = emprendedor?.foto || null;

                return (
                  <button
                    key={q._id}
                    onClick={() => seleccionarQueja(q)}
                    className="w-full text-left px-4 py-3 hover:bg-gray-50 flex items-center gap-3 transition-colors border-b"
                    style={{
                      backgroundColor: isSelected ? "#FFF7F6" : undefined,
                      borderColor: theme.border,
                    }}
                  >
                    <Avatar nombre={nombreEmpr} foto={fotoEmpr} size={40} className="flex-shrink-0" />
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-[#AA4A44] truncate">
                        Emisor: {emprendedor?.nombre} {emprendedor?.apellido}
                      </p>
                      <p className="text-xs truncate" style={{ color: theme.subtle }}>
                        Receptor: {admin?.nombre} {admin?.apellido}
                      </p>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </aside>

        {/* Main */}
        <section className="flex-1 flex flex-col">
          {/* Mensajes */}
          <div
            ref={mensajesRef}
            role="log"
            aria-live="polite"
            className="flex-1 overflow-y-auto p-3 sm:p-6"
            style={{
              background:
                "linear-gradient(180deg, #FFFFFF 0%, rgba(248,250,252,1) 100%)",
            }}
          >
            {!chatActivo ? (
              <div className="h-full flex items-center justify-center">
                <EmptyState
                  title={
                    emisorRol === "Cliente" || emisorRol === "Emprendedor"
                      ? "Envía una queja al administrador o elige un chat"
                      : "Selecciona una conversación o una queja"
                  }
                  description="Tus conversaciones aparecerán aquí"
                />
              </div>
            ) : loadingMsgs ? (
              <MessagesSkeleton />
            ) : mensajesConSeparadores.length === 0 ? (
              <div className="h-full flex items-center justify-center">
                <EmptyState
                  title="No hay mensajes aún"
                  description="Escribe el primero para iniciar la conversación"
                />
              </div>
            ) : (
              <div className="space-y-3 sm:space-y-4">
                {mensajesConSeparadores.map((item, idx) => {
                  if (item._sep) {
                    // Separador de fecha discreto
                    return (
                      <div key={item.key} className="flex items-center gap-3 my-1">
                        <div className="flex-1 h-px bg-gray-200" />
                        <span
                          className="text-[11px] px-2 py-0.5 rounded-full bg-gray-100 border"
                          style={{ borderColor: theme.border, color: theme.subtle }}
                        >
                          {item.label}
                        </span>
                        <div className="flex-1 h-px bg-gray-200" />
                      </div>
                    );
                  }

                  const msg = item;
                  // Resolución de emisor
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
                  const timestamp = msg.timestamp || msg.fecha || msg.createdAt;

                  return (
                    <div
                      key={msg._id || msg.id || idx}
                      className={`flex items-end gap-2 ${esMio ? "justify-end" : "justify-start"}`}
                    >
                      {!esMio && (
                        <Avatar
                          nombre={emisorNombre}
                          foto={emisorFoto}
                          size={34}
                          className="flex-shrink-0 translate-y-1"
                        />
                      )}

                      <div
                        className={`rounded-2xl px-4 py-2 shadow-sm border ${
                          esMio ? "text-white" : "text-gray-800"
                        }`}
                        style={{
                          maxWidth: "72%",
                          backgroundColor: esMio ? theme.mineBubble : theme.otherBubble,
                          borderColor: esMio ? "transparent" : theme.border,
                        }}
                        title={timestamp ? new Date(timestamp).toLocaleString() : ""}
                      >
                        <div className="whitespace-pre-wrap break-words text-[15px] leading-snug">
                          {msg.contenido}
                        </div>
                        <div
                          className="mt-1 text-[11px] text-right"
                          style={{ color: esMio ? "rgba(255,255,255,0.8)" : theme.subtle }}
                        >
                          {msg.emisorRol || ""}
                          {timestamp ? ` · ${fmtTime(timestamp)}` : ""}
                        </div>
                      </div>

                      {esMio && <div className="w-[34px]" />}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Botón bajar cuando estás arriba */}
          {showScrollBtn && (
            <button
              onClick={() => {
                const el = mensajesRef.current;
                if (el) el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
              }}
              className="absolute right-4 bottom-24 z-20 px-3 py-2 rounded-full shadow bg-white border text-sm"
              style={{ borderColor: theme.border, color: theme.text }}
              aria-label="Bajar al último mensaje"
              title="Bajar al último mensaje"
            >
              ⬇️ Nuevos
            </button>
          )}

          {/* Composer */}
          <form
            onSubmit={handleEnviarMensaje}
            className="flex items-end gap-2 p-3 sm:p-4 border-t bg-white sticky bottom-0"
            style={{ borderColor: theme.border }}
          >
            <label htmlFor="composer" className="sr-only">
              {vista === "chat"
                ? productoNombre
                  ? `Mensaje sobre "${productoNombre}"`
                  : "Escribe un mensaje…"
                : "Escribe tu respuesta…"}
            </label>

            <div className="flex-1">
              <div
                className="border rounded-xl bg-white px-3 py-2 focus-within:ring-2"
                style={{ borderColor: theme.border }}
              >
                <textarea
                  id="composer"
                  ref={composerRef}
                  value={vista === "chat" ? mensaje : mensajeQueja}
                  onChange={(e) =>
                    vista === "chat"
                      ? setMensaje(e.target.value)
                      : setMensajeQueja(e.target.value)
                  }
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      if (inputEnabled) handleEnviarMensaje(e);
                    }
                  }}
                  placeholder={
                    vista === "chat"
                      ? productoNombre
                        ? `Mensaje sobre "${productoNombre}"`
                        : "Escribe un mensaje…"
                      : "Escribe tu respuesta…"
                  }
                  rows={1}
                  className="w-full resize-none outline-none text-[15px] leading-snug"
                  style={{ maxHeight: 160 }}
                  disabled={!inputEnabled}
                  autoComplete="off"
                />
                <div className="flex items-center justify-between mt-1">
                  <span className="text-xs" style={{ color: theme.subtle }}>
                    {vista === "chat"
                      ? "Enter para enviar · Shift+Enter para nueva línea"
                      : "Responder al hilo de queja"}
                  </span>
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={!inputEnabled}
              className="inline-flex items-center gap-2 text-white px-4 sm:px-5 py-2 rounded-xl transition disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2"
              style={{ backgroundColor: theme.brand }}
              onMouseOver={(e) => (e.currentTarget.style.backgroundColor = theme.brandHover)}
              onMouseOut={(e) => (e.currentTarget.style.backgroundColor = theme.brand)}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
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

/* ---------- Componentes de apoyo (skeleton/empty) ---------- */

const SidebarSkeleton = () => (
  <div className="p-4 space-y-3">
    {[...Array(6)].map((_, i) => (
      <div key={i} className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-gray-200 animate-pulse" />
        <div className="flex-1 h-3 bg-gray-200 rounded animate-pulse" />
      </div>
    ))}
  </div>
);

const MessagesSkeleton = () => (
  <div className="space-y-4">
    {[...Array(5)].map((_, i) => (
      <div key={i} className={`flex ${i % 2 ? "justify-end" : "justify-start"}`}>
        <div className="rounded-2xl px-4 py-3 bg-gray-200 animate-pulse" style={{ maxWidth: "70%" }}>
          <div className="h-4 bg-gray-300 rounded w-48 mb-2" />
          <div className="h-3 bg-gray-300 rounded w-24" />
        </div>
      </div>
    ))}
  </div>
);

const EmptyState = ({ title, description }) => (
  <div className="text-center">
    <div className="mx-auto mb-3 w-12 h-12 rounded-full flex items-center justify-center border bg-white">
      💬
    </div>
    <h3 className="font-semibold">{title}</h3>
    <p className="text-sm text-gray-500 mt-1">{description}</p>
  </div>
);

export default Chat;
