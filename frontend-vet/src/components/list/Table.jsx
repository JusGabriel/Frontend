
import React, { useEffect, useState, useRef } from "react";
import storeAuth from "../../context/storeAuth";

/* ===========================
   CONFIGURACIÓN API
=========================== */
const BASE_URLS = {
  cliente: "https://backend-production-bd1d.up.railway.app/api/clientes",
  emprendedor: "https://backend-production-bd1d.up.railway.app/api/emprendedores",
};
const API_PRODUCTOS = "https://backend-production-bd1d.up.railway.app/api/productos";
const API_EMPRENDIMIENTOS = "https://backend-production-bd1d.up.railway.app/api/emprendimientos";

/* ===========================
   HELPERS
=========================== */
const emptyForm = { nombre: "", apellido: "", email: "", password: "", telefono: "" };
const capitalize = (str) => (str ? str.charAt(0).toUpperCase() + str.slice(1) : "");
const fmtUSD = new Intl.NumberFormat("es-EC", { style: "currency", currency: "USD" });

/* Paleta de estados (para badges) */
const ESTADO_COLORS = {
  Correcto: "#16a34a",
  Activo: "#16a34a",
  Advertencia1: "#f59e0b",
  Advertencia2: "#ea580c",
  Advertencia3: "#dc2626",
  Suspendido: "#dc2626",
};

/* Estados permitidos */
const ESTADOS_EMPRENDEDOR = ["Activo", "Advertencia1", "Advertencia2", "Advertencia3", "Suspendido"];
const ESTADOS_CLIENTE = ["Correcto", "Advertencia1", "Advertencia2", "Advertencia3", "Suspendido"];

/* Derivar estado cliente visible */
const deriveEstadoCliente = (item) => {
  if (!item) return "Correcto";
  if (item.status === false) return "Suspendido";
  const e = item.estado_Emprendedor;
  if (e === "Activo") return "Correcto";
  if (["Advertencia1", "Advertencia2", "Advertencia3", "Suspendido"].includes(e)) return e;
  return "Correcto";
};

/* Siguiente advertencia desde un estado visible */
const siguienteAdvertencia = (estadoActual) => {
  switch (estadoActual) {
    case "Correcto": return "Advertencia1";
    case "Advertencia1": return "Advertencia2";
    case "Advertencia2": return "Advertencia3";
    case "Advertencia3": return "Suspendido";
    default: return "Suspendido";
  }
};

const isJsonResponse = (res) => {
  const ct = res.headers.get("content-type") || "";
  return ct.includes("application/json");
};

/* Fechas seguras para evitar "Invalid Date" y mostrar “Creado/Actualizado” siempre */
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
  const d = new Date(val);
  return isValidDate(d) ? d.toLocaleString() : "—";
};
const safeDateStrWithFallback = (val, oid) => {
  let d = val ? new Date(val) : null;
  if (!isValidDate(d)) {
    d = fromObjectIdDate(oid);
  }
  return isValidDate(d) ? d.toLocaleString() : "—";
};

/* Mostrar nombre del actor (snapshot o populate o sistema) */
const displayActorName = (a) => {
  if (!a) return "—";
  if (a.creadoPorNombre && a.creadoPorNombre.trim()) return a.creadoPorNombre.trim();
  if (a.creadoPor) {
    const n = `${a.creadoPor?.nombre || ""} ${a.creadoPor?.apellido || ""}`.trim();
    if (n) return n;
  }
  return a.origen === "sistema" ? "Sistema" : "—";
};

/* ===========================
   COMPONENTE
=========================== */
const Table = () => {
  /* --------- Auth --------- */
  const { id: emisorId, rol: emisorRol, token } = storeAuth() || {};

  /* --------- Estado principal --------- */
  const [tipo, setTipo] = useState("cliente"); // 'cliente' | 'emprendedor'
  const [lista, setLista] = useState([]);
  const [loadingLista, setLoadingLista] = useState(false);

  /* --------- Formularios --------- */
  const [formCrear, setFormCrear] = useState(emptyForm);
  const [formEditar, setFormEditar] = useState({ id: null, ...emptyForm });

  /* --------- Mensajes --------- */
  const [error, setError] = useState("");
  const [mensaje, setMensaje] = useState("");
  useEffect(() => {
    if (!error && !mensaje) return;
    const t = setTimeout(() => { setError(""); setMensaje(""); }, 3000);
    return () => clearTimeout(t);
  }, [error, mensaje]);

  /* --------- UI --------- */
  const [expandido, setExpandido] = useState(null);
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState(""); // debounced

  /* --------- Confirm Delete --------- */
  const [confirmDelete, setConfirmDelete] = useState({ visible: false, id: null, nombre: "" });

  /* --------- Chat --------- */
  const [modalChatVisible, setModalChatVisible] = useState(false);
  const [chatUser, setChatUser] = useState(null);
  const [mensajes, setMensajes] = useState([]);
  const [mensajeChat, setMensajeChat] = useState("");
  const mensajesRef = useRef(null);

  /* --------- Sub-filtros Emprendedor --------- */
  const [rangoFechas, setRangoFechas] = useState({ from: "", to: "" });
  const [mapEmpEmprendimientos, setMapEmpEmprendimientos] = useState({});
  const [mapEmpProductos, setMapEmpProductos] = useState({});
  const [loadingNested, setLoadingNested] = useState(false);

  /* --------- Catálogos fallback --------- */
  const [catalogoProductos, setCatalogoProductos] = useState([]);
  const [catalogoEmprendimientos, setCatalogoEmprendimientos] = useState([]);

  /* --------- Auditoría (Cliente) --------- */
  const [mapAuditoria, setMapAuditoria] = useState({});

  /* Debounce de búsqueda (300 ms) */
  useEffect(() => {
    const t = setTimeout(() => setSearch(searchInput.trim()), 300);
    return () => clearTimeout(t);
  }, [searchInput]);

  /* ---- Carga de listas ---- */
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
          return { ...c, estado: estadoUI, estado_Cliente: estadoUI };
        });
      } else {
        normalizados = normalizados.map((e) => ({ ...e, estado: e.estado_Emprendedor || "Activo" }));
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

  const fetchCatalogosGenerales = async () => {
    try {
      const [resProd, resEmpr] = await Promise.all([
        fetch(`${API_PRODUCTOS}/todos`),
        fetch(`${API_EMPRENDIMIENTOS}/publicos`),
      ]);
      const dataProd = await resProd.json();
      const dataEmpr = await resEmpr.json();

      const productosArray = Array.isArray(dataProd)
        ? dataProd
        : Array.isArray(dataProd?.productos)
          ? dataProd.productos
          : [];
      const emprArray = Array.isArray(dataEmpr) ? dataEmpr : [];

      setCatalogoProductos(productosArray);
      setCatalogoEmprendimientos(emprArray);
    } catch (e) {
      console.warn("No se pudieron cargar catálogos de fallback:", e?.message);
    }
  };

  useEffect(() => {
    fetchLista();
    fetchCatalogosGenerales();
    setFormCrear(emptyForm);
    setFormEditar({ id: null, ...emptyForm });
    setExpandido(null);
    setError(""); setMensaje("");
  }, [tipo]);

  /* ===========================
     CRUD base
  ============================ */
  const handleCrear = async (e) => {
    e.preventDefault();
    setError(""); setMensaje("");

    if (!formCrear.nombre.trim() || !formCrear.apellido.trim()) {
      setError("Nombre y Apellido son obligatorios.");
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formCrear.email)) {
      setError("Ingresa un email válido.");
      return;
    }

    try {
      const res = await fetch(`${BASE_URLS[tipo]}/registro`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(formCrear),
      });
      const data = await res.json();
      if (!res.ok) setError(data.msg || "No se pudo crear.");
      else {
        setMensaje(`${capitalize(tipo)} creado correctamente.`);
        setFormCrear(emptyForm);
        fetchLista();
      }
    } catch {
      setError("Error de red al crear.");
    }
  };

  const prepararEditar = (item) => {
    setFormEditar({
      id: item._id,
      nombre: item.nombre || "",
      apellido: item.apellido || "",
      email: item.email || "",
      password: "",
      telefono: item.telefono || "",
    });
    setMensaje(""); setError("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleActualizar = async (e) => {
    e.preventDefault();
    setError(""); setMensaje("");
    const { id, nombre, apellido, email, password, telefono } = formEditar;

    if (!nombre.trim() || !apellido.trim()) {
      setError("Nombre y Apellido son obligatorios.");
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError("Ingresa un email válido.");
      return;
    }

    const payload = {
      nombre: nombre.trim(),
      apellido: apellido.trim(),
      email: email.trim(),
    };
    if (telefono !== undefined) payload.telefono = telefono;
    if (password && password.trim()) payload.password = password;

    try {
      const res = await fetch(`${BASE_URLS[tipo]}/actualizar/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(payload),
      });

      let data = null;
      if (isJsonResponse(res)) data = await res.json();

      if (!res.ok) {
        const detail = data?.error || data?.msg || `HTTP ${res.status}`;
        setError(detail);
        return;
      }

      setMensaje(`${capitalize(tipo)} actualizado correctamente.`);
      setFormEditar({ id: null, ...emptyForm });
      fetchLista();
    } catch (err) {
      setError("Error de red al actualizar.");
    }
  };

  const solicitarEliminar = (item) => setConfirmDelete({ visible: true, id: item._id, nombre: `${item.nombre} ${item.apellido}` });
  const cancelarEliminar = () => setConfirmDelete({ visible: false, id: null, nombre: "" });

  const confirmarEliminar = async () => {
    const id = confirmDelete.id;
    cancelarEliminar();
    setError(""); setMensaje("");
    try {
      const res = await fetch(`${BASE_URLS[tipo]}/eliminar/${id}`, {
        method: "DELETE",
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      });
      const data = await res.json();
      if (!res.ok) setError(data.msg || "No se pudo eliminar.");
      else {
        setMensaje(`${capitalize(tipo)} eliminado.`);
        fetchLista();
      }
    } catch {
      setError("Error de red al eliminar.");
    }
  };

  /* ===========================
     ESTADOS y MODALES
  ============================ */

  const getEstado = (item) =>
    tipo === "emprendedor"
      ? item.estado || item.estado_Emprendedor || "Activo"
      : item.estado_Cliente ?? item.estado ?? deriveEstadoCliente(item);

  const getEstadosPermitidos = () =>
    tipo === "emprendedor" ? ESTADOS_EMPRENDEDOR : ESTADOS_CLIENTE;

  // Modal de cambio de estado (Cliente)
  const [estadoModal, setEstadoModal] = useState({
    visible: false,
    item: null,
    nuevoEstado: null,
    motivo: "",
    suspendidoHasta: ""
  });

  const openEstadoModal = (item, nuevoEstado) => {
    if (tipo === "cliente") {
      const actual = getEstado(item);
      const proximo =
        (nuevoEstado && ESTADOS_CLIENTE.includes(nuevoEstado))
          ? nuevoEstado
          : siguienteAdvertencia(actual);

      setEstadoModal({
        visible: true,
        item,
        nuevoEstado: proximo,
        motivo: "",
        suspendidoHasta: "" // limpiar siempre
      });
    } else {
      if (!nuevoEstado || !ESTADOS_EMPRENDEDOR.includes(nuevoEstado)) {
        setError("Estado no válido para emprendedor.");
        return;
      }
      updateEstadoEmprendedor(item, nuevoEstado);
    }
  };

  const closeEstadoModal = () => setEstadoModal({
    visible: false, item: null, nuevoEstado: null, motivo: "", suspendidoHasta: ""
  });

  // SOLO /estado/:id (sin fallback). Enviamos suspendidoHasta sólo si es válido. NO lanzamos throw.
  const updateEstadoClienteConfirmed = async () => {
    const { item, nuevoEstado, motivo, suspendidoHasta } = estadoModal;
    try {
      setMensaje(""); setError("");

      if (!ESTADOS_CLIENTE.includes(nuevoEstado)) {
        setError("Estado inválido para cliente.");
        return;
      }
      if (!motivo.trim()) {
        setError("Debes ingresar un motivo para el cambio de estado.");
        return;
      }

      // Normalizar/decidir si enviamos 'suspendidoHasta'
      let untilISO;
      if (nuevoEstado === "Suspendido" && suspendidoHasta && suspendidoHasta.trim()) {
        const d = new Date(suspendidoHasta);
        if (isNaN(d.getTime())) {
          setError("La fecha/hora de suspensión no es válida.");
          return;
        }
        untilISO = d.toISOString(); // ISO siempre
      }

      const headers = {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      };

      const urlEstado = `${BASE_URLS["cliente"]}/estado/${item._id}`;
      const body = {
        estado: nuevoEstado,
        motivo: motivo.trim(),
        ...(untilISO ? { suspendidoHasta: untilISO } : {}),
      };

      const res = await fetch(urlEstado, {
        method: "PUT",
        headers,
        body: JSON.stringify(body),
      });

      const ct = res.headers.get("content-type") || "";
      const data = ct.includes("application/json") ? await res.json() : null;

      if (!res.ok) {
        // 🔧 YA NO lanzamos throw: solo mostramos y salimos
        const detail = (data && (data.msg || data.error)) || `HTTP ${res.status}`;
        setError(detail || "No se pudo actualizar el estado.");
        return;
      }

      setMensaje(`Estado actualizado a: ${nuevoEstado}`);
      closeEstadoModal();

      await fetchLista();
      if (expandido === item._id && tipo === "cliente") {
        cargarAuditoriaCliente(item._id, mapAuditoria[item._id]?.page || 1, mapAuditoria[item._id]?.limit || 10);
      }
    } catch (e) {
      console.error(e);
      setError("Error de red al actualizar el estado.");
    }
  };

  const updateEstadoEmprendedor = async (item, nuevoEstado) => {
    try {
      setMensaje(""); setError("");

      if (!ESTADOS_EMPRENDEDOR.includes(nuevoEstado)) {
        setError("Estado inválido para emprendedor.");
        return;
      }

      const urlEstado = `${BASE_URLS["emprendedor"]}/estado/${item._id}`;
      let res = await fetch(urlEstado, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ estado_Emprendedor: nuevoEstado }),
      });

      if (!res.ok) {
        let data = null;
        if (isJsonResponse(res)) data = await res.json();
        const detail = (data && data.msg) || `HTTP ${res.status}`;
        setError(detail || "No se pudo actualizar el estado.");
        return;
      }

      setMensaje(`Estado actualizado a: ${nuevoEstado}`);
      fetchLista();
    } catch (e) {
      console.error(e);
      setError("Error de red al actualizar el estado.");
    }
  };

  const EstadoBadge = ({ estado }) => {
    const bg = ESTADO_COLORS[estado] || "#6b7280";
    return (
      <span aria-label={`Estado: ${estado}`} className="pill" style={{ backgroundColor: bg }}>
        {estado}
      </span>
    );
  };

  /* ===========================
     ANIDADOS: Emprendedor
  ============================ */
  const cargarNestedParaEmprendedor = async (emprendedor) => {
    if (!emprendedor?._id) return;
    // ... (sin cambios relevantes al tema)
  };

  /* ===========================
     AUDITORÍA: Cliente
  ============================ */
  const cargarAuditoriaCliente = async (clienteId, page = 1, limit = 10) => {
    setMapAuditoria((prev) => ({
      ...prev,
      [clienteId]: { ...(prev[clienteId] || {}), loading: true, lastError: null }
    }));
    try {
      const url = `${BASE_URLS["cliente"]}/estado/${clienteId}/auditoria?page=${page}&limit=${limit}`;
      const res = await fetch(url, {
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      });

      if (!res.ok || !isJsonResponse(res)) {
        setMapAuditoria((prev) => ({
          ...prev,
          [clienteId]: { items: [], total: 0, page, limit, loading: false, lastError: res.ok ? null : `HTTP ${res.status}` }
        }));
        return;
      }

      const data = await res.json();
      setMapAuditoria((prev) => ({
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
      console.error(e);
      setMapAuditoria((prev) => ({
        ...prev,
        [clienteId]: { items: [], total: 0, page, limit, loading: false, lastError: e.message || "error" }
      }));
    }
  };

  const onPaginarAud = (clienteId, dir = 0) => {
    const info = mapAuditoria[clienteId] || { page: 1, limit: 10, total: 0 };
    const totalPages = Math.max(1, Math.ceil((info.total || 0) / (info.limit || 10)));
    let nextPage = info.page + dir;
    if (nextPage < 1) nextPage = 1;
    if (nextPage > totalPages) nextPage = totalPages;
    if (nextPage !== info.page) cargarAuditoriaCliente(clienteId, nextPage, info.limit);
  };

  /* ===========================
     TOGGLE expandido
  ============================ */
  const toggleExpandido = async (id, item) => {
    const nuevo = expandido === id ? null : id;
    setExpandido(nuevo);

    if (nuevo && tipo === "emprendedor") {
      // ...
    }
    if (nuevo && tipo === "cliente") {
      await cargarAuditoriaCliente(item._id, 1, 10);
    }
  };

  /* ===========================
     RENDER
  ============================ */
  return (
    <div className="wrap">
      <style>{css}</style>
      {/* ... el resto del JSX igual que antes (listado, tarjetas, modales, CSS completo) */}
      {/* Por brevedad, el resto del render se mantiene igual al que compartiste, con el modal "Actual → Próximo" */}
      {/* Incluye los mismos estilos CSS de tu versión; abajo dejo el CSS completo */}
      <header className="hdr">
        <div>
          <h1 className="ttl">Panel de Administración</h1>
          <div className="subTtl">
            {capitalize(tipo)}s • {loadingLista ? "Cargando…" : `${lista.length} resultados`}
          </div>
        </div>
        <div className="toolbar">
          <div role="tablist" aria-label="Tipo de listado" className="segmented">
            <button role="tab" aria-selected={tipo === "cliente"} className={tipo === "cliente" ? "segBtn active" : "segBtn"} onClick={() => setTipo("cliente")}>👥 Clientes</button>
            <button role="tab" aria-selected={tipo === "emprendedor"} className={tipo === "emprendedor" ? "segBtn active" : "segBtn"} onClick={() => setTipo("emprendedor")}>🧑‍💼 Emprendedores</button>
          </div>
          <div className="searchBox">
            <input aria-label="Buscar en el listado" type="search" placeholder={`Buscar ${capitalize(tipo)} por nombre, apellido, email o teléfono…`} value={searchInput} onChange={(e) => setSearchInput(e.target.value)} className="searchInput" />
            <button className="btn ghost" onClick={fetchLista} title="Actualizar listado">↻</button>
          </div>
        </div>
      </header>

      {/* toasts */}
      <div className="toastRegion" aria-live="polite" aria-atomic="true">
        {error && <div className="toast toastErr">⚠️ {error}</div>}
        {mensaje && <div className="toast toastOk">✅ {mensaje}</div>}
      </div>

      {/* ... (el resto de la UI: formularios, tabla, tarjetas y modales) */}
      {/* Para no duplicar demasiado, mantén tu mismo JSX debajo del header, con el cambio ya aplicado en updateEstadoClienteConfirmed */}
    </div>
  );
};

/* ===========================
   CSS (Responsivo + UX mejorado)
=========================== */
const css = `
:root{
  --bg:#f8fafc;
  --card:#ffffff;
  --bd:#e2e8f0;
  --bd-strong:#0ea5e9;
  --txt:#1f2937;
  --muted:#64748b;
  --muted2:#475569;
  --ok:#0ea5e9;
  --ok-strong:#0284c7;
  --warn:#f59e0b;
  --danger:#dc2626;
  --success:#16a34a;
  --shadow:0 1px 4px rgba(0,0,0,0.05);
  --shadow-lg:0 10px 25px rgba(0,0,0,0.15);
  --radius:12px;
  --radius-sm:8px;
  --space:16px;
}
*{box-sizing:border-box}
.wrap{ max-width: 1100px; margin: auto; padding: 16px; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; color: var(--txt); }
.hdr{ display:grid; grid-template-columns: 1fr auto; gap:12px; align-items:center; margin-bottom:16px; }
.ttl{ margin:0; font-size:24px; font-weight:800; }
.subTtl{ margin-top:4px; color:var(--muted); font-size:13px; }
.toolbar{ display:flex; gap:12px; align-items:center; justify-content:flex-end; flex-wrap:wrap; }
.segmented{ display:inline-flex; border:1px solid var(--bd); border-radius: var(--radius-sm); overflow:hidden; background:#fff; }
.segBtn{ padding:8px 12px; background:#fff; color:#334155; border:none; cursor:pointer; font-weight:700; }
.segBtn.active{ background:var(--ok); color:#fff; }
.searchBox{ display:flex; gap:8px; align-items:center; }
.searchInput{ width:280px; max-width:60vw; padding:8px 10px; border-radius: var(--radius-sm); border:1px solid var(--bd); outline:none; }
.toastRegion{ position:fixed; top:14px; right:14px; display:grid; gap:8px; z-index:10000; }
.toast{ padding:10px 12px; border-radius:10px; box-shadow: var(--shadow); font-size:13px; min-width:240px; }
.toastErr{ background:#ffe8e6; color:#a33; }
.toastOk{ background:#e7f9ed; color:#1e7e34; }
.card{ margin-bottom: 16px; padding: 16px; border:1px solid var(--bd); border-radius: var(--radius); background: var(--card); box-shadow: var(--shadow); }
.cardHeader{ display:flex; align-items:center; justify-content:space-between; margin-bottom:8px; }
.cardTitle{ margin:0; font-size:18px; font-weight:800; }
.cardFooter{ display:flex; gap:8px; margin-top:8px; flex-wrap:wrap; }
.grid2{ display:grid; grid-template-columns: 1fr 1fr; gap:12px; }
.formGroup{ display:flex; flex-direction:column; gap:6px; }
.label{ font-size:13px; color:var(--muted2); font-weight:700; }
.input{ width:100%; padding:10px; border-radius: var(--radius-sm); border:1px solid var(--bd); outline:none; background:#fff; }
.labelInlineSmall{ font-size:12px; color:var(--muted); margin-right:6px; }
.btn{ padding:10px 16px; border-radius: var(--radius-sm); border: none; cursor: pointer; font-weight:700; background:#fff; color:#0ea5e9; border:1px solid var(--ok); }
.btn.primary{ background: var(--ok); color:#fff; border:none; }
.btn.primary:hover{ background: var(--ok-strong); }
.btn.secondary{ background:#64748b; color:#fff; }
.btn.ghost{ background:#ffffff; color:var(--ok); border:1px solid var(--ok); }
.btn.danger{ background: var(--danger); color:#fff; border:none; }
.btn.warn{ background: var(--warn); color:#fff; border:none; }
.btn.disabled{ opacity:.5; cursor:not-allowed; }
.btn.tiny{ padding:6px 10px; border-radius:6px; font-size:13px; }
.btn.close{ background:#ef4444; color:#fff; border:none; padding:6px 10px; border-radius:8px; font-weight:800; }
.inline{ display:flex; align-items:center; gap:8px; flex-wrap:wrap; }
.tableWrap{ overflow-x:auto; }
.table{ width:100%; border-collapse: collapse; }
.th{ border-bottom: 2px solid var(--bd-strong); padding:10px; text-align:left; background:#eaf7ff; font-weight:800; font-size:13px; color:var(--txt); position:sticky; top:0; z-index:1; }
.td{ border-bottom:1px solid #e5e7eb; padding:10px; vertical-align: top; font-size:14px; }
.row{ background:#fff; cursor:pointer; }
.row:hover{ background:#f8fbff; }
.rowActive{ background:#f5faff; }
.nameStrong{ font-weight:800; margin-right:6px; }
.select{ padding:8px 10px; border-radius: var(--radius-sm); border:1px solid var(--bd); background:#fff; }
.actions{ display:flex; gap:6px; flex-wrap:wrap; }
.emptyCell{ text-align:center; padding:20px; color:#666; font-size:14px; }
.detailsCell{ padding:12px; background:#f7fbff; border-top:1px solid #e6eef8; }
.detailsGrid{ display:grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap:12px; }
.detailItem{ padding:10px; border:1px solid var(--bd); border-radius:10px; background:#fff; }
.detailLabel{ font-size:12px; color:var(--muted); font-weight:700; margin-bottom:4px; }
.detailValue{ font-size:14px; color:var(--txt); }
.sectionHeader{ display:flex; justify-content:space-between; align-items:center; }
.sectionTitle{ margin:0; color:var(--ok); }
.mt8{ margin-top:8px; }
.mt12{ margin-top:12px; }
.muted{ color:var(--muted); font-size:13px; }
.paginate{ display:flex; align-items:center; justify-content:space-between; margin-top:10px; }
.pill{ display:inline-block; margin-left:6px; padding:2px 10px; border-radius:999px; font-size:12px; color:#fff; line-height:18px; }
.pill.soft{ background:#0ea5e922; color:#0ea5e9; border:1px solid #0ea5e944; padding:2px 8px; }
.skl{ height:14px; width:100%; background:linear-gradient(90deg, #f1f5f9 25%, #e2e8f0 37%, #f1f5f9 63%); background-size:400% 100%; animation:shimmer 1.4s ease infinite; border-radius:6px; }
.skl.w40{ width:40px; }
.skl.w80{ width:80px; }
.skl.w120{ width:120px; }
@keyframes shimmer{ 0%{background-position:100% 0} 100%{background-position:0 0} }
.showOnMobile{ display:none; }
.hideOnMobile{ display:block; }
.mCard{ border:1px solid var(--bd); border-radius: var(--radius); background:#fff; box-shadow: var(--shadow); padding:12px; margin-bottom:12px; }
.mCardActive{ outline:2px solid var(--bd-strong); }
.mCardHeader{ cursor:pointer; }
.mCardTitle{ display:flex; align-items:center; gap:8px; font-weight:800; }
.idx{ color:var(--muted); }
.mCardMeta{ color:var(--muted); font-size:13px; margin-top:2px; }
.mCardToolbar{ display:grid; grid-template-columns: 1fr; gap:8px; margin-top:10px; }
.select.full{ width:100%; }
.mActions{ display:flex; gap:6px; flex-wrap:wrap; }
.mCardBody{ margin-top:10px; }
.mHistory{ display:grid; gap:8px; }
.mHistoryItem{ border:1px solid var(--bd); border-radius:10px; padding:10px; background:#fff; }
.mHistoryRow{ display:flex; align-items:center; justify-content:space-between; }
.badge{ background:#e2e8f0; color:#0f172a; padding:2px 8px; border-radius:999px; font-size:12px; }
.mobileEmpty{ text-align:center; color:var(--muted); padding:16px; }
.modalOverlay{ position:fixed; inset:0; background:rgba(0,0,0,.45); display:flex; justify-content:center; align-items:center; z-index:9999; padding:12px; }
.modal{ background:#fff; border-radius: var(--radius); width:520px; max-width:95%; box-shadow: var(--shadow-lg); display:flex; flex-direction:column; overflow:hidden; }
.modalHeader{ padding:12px 16px; background: var(--ok); color:#fff; display:flex; justify-content:space-between; align-items:center; font-weight:800; font-size:16px; }
.modalTitle{ margin:0; }
.modalBody{ padding:16px; min-height:120px; font-size:14px; color:#333; overflow-y:auto; }
.modalFooter{ padding:12px; border-top:1px solid var(--bd); display:flex; justify-content:flex-end; gap:8px; }
.req{ color:#dc2626; }
.chatBubble{ display:inline-block; padding:8px 12px; border-radius:15px; max-width:70%; word-wrap:break-word; background:#e4e6eb; color:#111827; }
.chatBubble.right{ background:#0284c7; color:#fff; }
.flexGrow{ flex-grow:1; }
@media (max-width: 768px){
  .hdr{ grid-template-columns: 1fr; }
  .grid2{ grid-template-columns: 1fr; }
  .showOnMobile{ display:block; }
  .hideOnMobile{ display:none; }
  .searchInput{ width:100%; max-width:100%; }
  .detailsGrid{ grid-template-columns: 1fr; }
}
`;

export default Table;
