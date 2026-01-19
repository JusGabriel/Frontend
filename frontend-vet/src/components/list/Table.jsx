
// (extracto) src/components/Table.jsx
import React, { useEffect, useState } from "react";
import storeAuth from "../../context/storeAuth";

/* CONFIG */
const BASE_URLS = {
  cliente: "https://backend-production-bd1d.up.railway.app/api/clientes",
  emprendedor: "https://backend-production-bd1d.up.railway.app/api/emprendedores",
};
const API_PRODUCTOS = "https://backend-production-bd1d.up.railway.app/api/productos";
const API_EMPRENDIMIENTOS = "https://backend-production-bd1d.up.railway.app/api/emprendimientos";

/* HELPERS */
const emptyForm = { nombre: "", apellido: "", email: "", password: "", telefono: "" };
const capitalize = (str) => (str ? str.charAt(0).toUpperCase() + str.slice(1) : "");
const ESTADO_COLORS = { Correcto:"#16a34a", Activo:"#16a34a", Advertencia1:"#f59e0b", Advertencia2:"#ea580c", Advertencia3:"#dc2626", Suspendido:"#dc2626" };
const ESTADOS_EMPRENDEDOR = ["Activo","Advertencia1","Advertencia2","Advertencia3","Suspendido"];
const ESTADOS_CLIENTE = ["Correcto","Advertencia1","Advertencia2","Advertencia3","Suspendido"];

const isValidDate = (d) => d instanceof Date && !isNaN(d.getTime());
const fromObjectIdDate = (_id) => {
  if (!_id) return null;
  const s = String(_id);
  if (s.length >= 8) {
    const ts = parseInt(s.slice(0, 8), 16) * 1000;
    const d = new Date(ts);
    return isValidDate(d) ? d : null;
  }
  return null;
};
const safeDateStr = (val) => {
  if (!val) return "—";
  const d = typeof val === 'number' ? new Date(val) : new Date(val);
  return isValidDate(d) ? d.toLocaleString() : "—";
};
const safeDateStrWithFallback = (val, oid) => {
  let d = val ? new Date(val) : null;
  if (!isValidDate(d)) d = fromObjectIdDate(oid);
  return isValidDate(d) ? d.toLocaleString() : "—";
};
const displayActorName = (a) => {
  if (!a) return "—";
  if (a.creadoPorNombre && a.creadoPorNombre.trim()) return a.creadoPorNombre.trim();
  if (a.creadoPor) {
    const n = `${a.creadoPor?.nombre || ""} ${a.creadoPor?.apellido || ""}`.trim();
    if (n) return n;
  }
  return a.origen === "sistema" ? "Sistema" : "—";
};

/**
 * Convierte 'YYYY-MM-DDTHH:mm' (datetime-local) en ISO con offset local, p. ej. '2026-01-19T10:30:00-05:00'
 * Así el backend interpreta exactamente la hora que eligió el usuario, sin corrimientos.
 */
const datetimeLocalToOffsetISOString = (localStr) => {
  if (!localStr || typeof localStr !== 'string') return null;
  const [datePart, timePartRaw] = localStr.split('T');
  if (!datePart || !timePartRaw) return null;
  const timePart = timePartRaw.length === 5 ? `${timePartRaw}:00` : timePartRaw; // HH:mm -> HH:mm:ss
  const [y, m, d] = datePart.split('-').map(Number);
  const [hh, mm, ssRaw] = timePart.split(':');
  const ss = Number(ssRaw ?? 0);

  const dt = new Date(y, (m || 1) - 1, d || 1, Number(hh || 0), Number(mm || 0), ss);
  if (!isValidDate(dt)) return null;

  const pad = (n) => String(n).padStart(2, '0');
  const offsetMin = dt.getTimezoneOffset(); // minutos respecto a UTC (positivo si estás detrás de UTC)
  const sign = offsetMin > 0 ? '-' : '+';
  const abs = Math.abs(offsetMin);
  const offHH = pad(Math.floor(abs / 60));
  const offMM = pad(abs % 60);

  return `${y}-${pad(m)}-${pad(d)}T${pad(hh)}:${pad(mm)}:${pad(ss)}${sign}${offHH}:${offMM}`;
};

const deriveEstadoCliente = (item) => {
  if (!item) return "Correcto";
  if (item.status === false) return "Suspendido";
  const e = item.estado_Emprendedor;
  if (e === "Activo") return "Correcto";
  if (["Advertencia1","Advertencia2","Advertencia3","Suspendido"].includes(e)) return e;
  return "Correcto";
};
const siguienteAdvertencia = (estadoActual) => {
  switch (estadoActual) {
    case "Correcto": return "Advertencia1";
    case "Advertencia1": return "Advertencia2";
    case "Advertencia2": return "Advertencia3";
    case "Advertencia3": return "Suspendido";
    default: return "Suspendido";
  }
};
const isJsonResponse = (res) => (res.headers.get("content-type") || "").includes("application/json");

const Table = () => {
  const { token } = storeAuth() || {};
  const [tipo, setTipo] = useState("cliente");
  const [lista, setLista] = useState([]);
  const [loadingLista, setLoadingLista] = useState(false);

  const [formCrear, setFormCrear] = useState(emptyForm);
  const [formEditar, setFormEditar] = useState({ id: null, ...emptyForm });

  const [error, setError] = useState("");
  const [mensaje, setMensaje] = useState("");
  useEffect(() => {
    if (!error && !mensaje) return;
    const t = setTimeout(() => { setError(""); setMensaje(""); }, 3000);
    return () => clearTimeout(t);
  }, [error, mensaje]);

  const [expandido, setExpandido] = useState(null);
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  useEffect(() => {
    const t = setTimeout(() => setSearch(searchInput.trim()), 250);
    return () => clearTimeout(t);
  }, [searchInput]);

  const [confirmDelete, setConfirmDelete] = useState({ visible: false, id: null, nombre: "" });

  // Auditoría
  const [mapAuditoria, setMapAuditoria] = useState({});

  const fetchLista = async () => {
    setError(""); setMensaje(""); setLoadingLista(true);
    try {
      const res = await fetch(`${BASE_URLS[tipo]}/todos`, {
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      });
      const data = await res.json();
      let normalizados = Array.isArray(data) ? data : [];
      if (tipo === "cliente") {
        normalizados = normalizados.map((c) => {
          const estadoUI = deriveEstadoCliente(c);
          return { ...c, _id: String(c._id || c.id || ""), estado: estadoUI, estado_Cliente: estadoUI };
        });
      } else {
        normalizados = normalizados.map((e) => ({ ...e, _id: String(e._id || e.id || ""), estado: e.estado_Emprendedor || "Activo" }));
      }
      setLista(normalizados);
    } catch (e) {
      console.error(e);
      setError("No se pudo cargar el listado.");
      setLista([]);
    } finally {
      setLoadingLista(false);
    }
  };

  useEffect(() => {
    fetchLista();
    setFormCrear(emptyForm);
    setFormEditar({ id: null, ...emptyForm });
    setExpandido(null);
    setError(""); setMensaje("");
  }, [tipo]);

  const handleCrear = async (e) => {
    e.preventDefault();
    setError(""); setMensaje("");
    if (!formCrear.nombre.trim() || !formCrear.apellido.trim()) return setError("Nombre y Apellido son obligatorios.");
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formCrear.email)) return setError("Ingresa un email válido.");

    try {
      const res = await fetch(`${BASE_URLS[tipo]}/registro`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}) },
        body: JSON.stringify(formCrear),
      });
      const data = await res.json();
      if (!res.ok) setError(data?.msg || "No se pudo crear.");
      else { setMensaje(`${capitalize(tipo)} creado correctamente.`); setFormCrear(emptyForm); fetchLista(); }
    } catch {
      setError("Error de red al crear.");
    }
  };

  const prepararEditar = (item) => {
    setFormEditar({ id: item._id, nombre: item.nombre || "", apellido: item.apellido || "", email: item.email || "", password: "", telefono: item.telefono || "" });
    setMensaje(""); setError("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleActualizar = async (e) => {
    e.preventDefault();
    setError(""); setMensaje("");
    const { id, nombre, apellido, email, password, telefono } = formEditar;
    if (!nombre.trim() || !apellido.trim()) return setError("Nombre y Apellido son obligatorios.");
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) return setError("Ingresa un email válido.");

    const payload = { nombre: nombre.trim(), apellido: apellido.trim(), email: email.trim() };
    if (telefono !== undefined) payload.telefono = telefono;
    if (password && password.trim()) payload.password = password;

    try {
      const res = await fetch(`${BASE_URLS[tipo]}/actualizar/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}) },
        body: JSON.stringify(payload),
      });
      const data = isJsonResponse(res) ? await res.json() : null;
      if (!res.ok) return setError((data && (data.error || data.msg)) || `HTTP ${res.status}`);
      setMensaje(`${capitalize(tipo)} actualizado correctamente.`);
      setFormEditar({ id: null, ...emptyForm });
      fetchLista();
    } catch {
      setError("Error de red al actualizar.");
    }
  };

  const solicitarEliminar = (item) => setConfirmDelete({ visible: true, id: item._id, nombre: `${item.nombre} ${item.apellido}` });
  const cancelarEliminar = () => setConfirmDelete({ visible: false, id: null, nombre: "" });
  const confirmarEliminar = async () => {
    const id = confirmDelete.id; cancelarEliminar(); setError(""); setMensaje("");
    try {
      const res = await fetch(`${BASE_URLS[tipo]}/eliminar/${id}`, { method: "DELETE", headers: token ? { Authorization: `Bearer ${token}` } : undefined });
      const data = await res.json();
      if (!res.ok) setError(data?.msg || "No se pudo eliminar.");
      else { setMensaje(`${capitalize(tipo)} eliminado.`); fetchLista(); }
    } catch { setError("Error de red al eliminar."); }
  };

  const getEstado = (item) =>
    tipo === "emprendedor"
      ? item.estado || item.estado_Emprendedor || "Activo"
      : item.estado_Cliente ?? item.estado ?? deriveEstadoCliente(item);
  const getEstadosPermitidos = () => (tipo === "emprendedor" ? ESTADOS_EMPRENDEDOR : ESTADOS_CLIENTE);

  const [estadoModal, setEstadoModal] = useState({ visible: false, item: null, nuevoEstado: null, motivo: "", suspendidoHasta: "" });
  const openEstadoModal = (item, nuevoEstado) => {
    if (tipo === "cliente") {
      const actual = getEstado(item);
      const proximo = (nuevoEstado && ESTADOS_CLIENTE.includes(nuevoEstado)) ? nuevoEstado : siguienteAdvertencia(actual);
      setEstadoModal({ visible: true, item, nuevoEstado: proximo, motivo: "", suspendidoHasta: "" });
    } else {
      if (!nuevoEstado || !ESTADOS_EMPRENDEDOR.includes(nuevoEstado)) return setError("Estado no válido para emprendedor.");
      updateEstadoEmprendedor(item, nuevoEstado);
    }
  };
  const closeEstadoModal = () => setEstadoModal({ visible: false, item: null, nuevoEstado: null, motivo: "", suspendidoHasta: "" });

  const updateEstadoClienteConfirmed = async () => {
    const { item, nuevoEstado, motivo, suspendidoHasta } = estadoModal;
    setMensaje(""); setError("");
    if (!ESTADOS_CLIENTE.includes(nuevoEstado)) return setError("Estado inválido para cliente.");
    if (!motivo.trim()) return setError("Debes ingresar un motivo para el cambio de estado.");

    let untilValue = null;
    if (nuevoEstado === "Suspendido") {
      if (suspendidoHasta && suspendidoHasta.trim()) {
        const isoWithOffset = datetimeLocalToOffsetISOString(suspendidoHasta);
        if (!isoWithOffset) return setError("La fecha/hora de suspensión no es válida.");
        untilValue = isoWithOffset; // enviamos con offset
      } else {
        untilValue = null; // suspensión indefinida hasta reactivación
      }
    } else {
      untilValue = null; // limpiar en backend
    }

    const payload = {
      estado: nuevoEstado,
      motivo: motivo.trim(),
      suspendidoHasta: untilValue, // SIEMPRE presente (null o ISO)
    };

    try {
      const res = await fetch(`${BASE_URLS["cliente"]}/estado/${item._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}) },
        body: JSON.stringify(payload),
      });
      const data = isJsonResponse(res) ? await res.json() : null;
      if (!res.ok) {
        setError((data && (data.msg || data.error)) || `HTTP ${res.status}` || "No se pudo actualizar el estado.");
        return;
      }
      setMensaje(`Estado actualizado a: ${nuevoEstado}`);
      closeEstadoModal();
      await fetchLista();
      if (expandido === item._id && tipo === "cliente")
        cargarAuditoriaCliente(item._id, mapAuditoria[item._id]?.page || 1, mapAuditoria[item._id]?.limit || 10);
    } catch {
      setError("Error de red al actualizar el estado.");
    }
  };

  const updateEstadoEmprendedor = async (item, nuevoEstado) => {
    setMensaje(""); setError("");
    if (!ESTADOS_EMPRENDEDOR.includes(nuevoEstado)) return setError("Estado inválido para emprendedor.");
    try {
      const res = await fetch(`${BASE_URLS["emprendedor"]}/estado/${item._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}) },
        body: JSON.stringify({ estado_Emprendedor: nuevoEstado }),
      });
      const data = isJsonResponse(res) ? await res.json() : null;
      if (!res.ok) { setError((data && data.msg) || `HTTP ${res.status}` || "No se pudo actualizar el estado."); return; }
      setMensaje(`Estado actualizado a: ${nuevoEstado}`);
      fetchLista();
    } catch {
      setError("Error de red al actualizar el estado.");
    }
  };

  const EstadoBadge = ({ estado }) => {
    const bg = ESTADO_COLORS[estado] || "#6b7280";
    return <span aria-label={`Estado: ${estado}`} className="pill" style={{ backgroundColor: bg }}>{estado}</span>;
  };

  /* === Auditoría === */
  const cargarAuditoriaCliente = async (clienteId, page = 1, limit = 10) => {
    setMapAuditoria(prev => ({ ...prev, [clienteId]: { ...(prev[clienteId] || {}), loading: true, lastError: null } }));
    try {
      const res = await fetch(`${BASE_URLS["cliente"]}/estado/${clienteId}/auditoria?page=${page}&limit=${limit}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      });
      if (!res.ok || !isJsonResponse(res)) {
        setMapAuditoria(prev => ({ ...prev, [clienteId]: { items: [], total: 0, page, limit, loading: false, lastError: res.ok ? null : `HTTP ${res.status}` } }));
        return;
      }
      const data = await res.json();
      setMapAuditoria(prev => ({
        ...prev,
        [clienteId]: {
          items: Array.isArray(data.items) ? data.items : [],
          total: Number(data.total || 0),
          page: Number(data.page || page),
          limit: Number(data.limit || limit),
          loading: false,
          lastError: null
        }
      }));
    } catch (e) {
      setMapAuditoria(prev => ({ ...prev, [clienteId]: { items: [], total: 0, page, limit, loading: false, lastError: e.message || "error" } }));
    }
  };
  const onPaginarAud = (clienteId, dir = 0) => {
    const info = mapAuditoria[clienteId] || { page: 1, limit: 10, total: 0 };
    const totalPages = Math.max(1, Math.ceil((info.total || 0) / (info.limit || 10)));
    const nextPage = Math.max(1, Math.min(totalPages, info.page + dir));
    if (nextPage !== info.page) cargarAuditoriaCliente(clienteId, nextPage, info.limit);
  };

  const toggleExpandido = async (id, item) => {
    const nuevo = expandido === id ? null : id;
    setExpandido(nuevo);
    if (nuevo && tipo === "cliente") await cargarAuditoriaCliente(item._id, 1, 10);
  };

  const [searchInput, setSearchInput] = useState(""); // ya estaba arriba
  const [search, setSearch] = useState("");
  const listaFiltrada = lista.filter((x) => {
    const q = search.toLowerCase();
    if (!q) return true;
    const campos = [x.nombre, x.apellido, x.email, x.telefono].map((v) => String(v || "").toLowerCase());
    return campos.some((c) => c.includes(q));
  });

  // ... (lo demás del JSX permanece igual que tu versión, usando EstadoBadge, modal, etc.)
  // (Por brevedad no repito todo el CSS/JSX ya que no requiere cambios adicionales)
  // Asegúrate de sustituir el bloque de updateEstadoClienteConfirmed y el helper nuevo.

  return (
    /* ... Aquí va TODO tu JSX EXACTO como lo tienes, 
       usando las funciones y estados actualizados de arriba ... */
    <div className="wrap">
      {/* ... el mismo contenido que compartiste ... */}
    </div>
  );
};

export default Table;
