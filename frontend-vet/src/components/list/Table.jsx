
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
  Correcto: "#28a745",
  Activo: "#28a745",
  Advertencia1: "#ffc107",
  Advertencia2: "#fd7e14",
  Advertencia3: "#dc3545",
  Suspendido: "#dc3545",
};

/* Estados permitidos */
const ESTADOS_EMPRENDEDOR = ["Activo", "Advertencia1", "Advertencia2", "Advertencia3", "Suspendido"];
const ESTADOS_CLIENTE = ["Correcto", "Advertencia1", "Advertencia2", "Advertencia3", "Suspendido"];

/* ===========================
   BREAKPOINTS / RESPONSIVE
   =========================== */
const useBreakpoint = () => {
  const getW = () => (typeof window !== "undefined" ? window.innerWidth : 1200);
  const [w, setW] = useState(getW());

  useEffect(() => {
    const on = () => setW(getW());
    window.addEventListener("resize", on);
    return () => window.removeEventListener("resize", on);
  }, []);

  const isXS = w < 480;
  const isSM = w < 640;
  const isMD = w < 768;
  const isLG = w >= 1024;

  return { w, isXS, isSM, isMD, isLG };
};

/* estilos dinámicos por breakpoint */
const getStyles = (bp) => {
  const baseFont = bp.isXS ? 12 : bp.isSM ? 13 : 14;
  const tableFont = bp.isXS ? 12 : 13;
  const headerCols = bp.isMD ? "1fr" : "1fr auto";
  const formGrid = bp.isMD ? "1fr" : "1fr 1fr";

  return {
    container: {
      maxWidth: bp.isLG ? 1080 : 980,
      margin: "auto",
      padding: bp.isXS ? 12 : 20,
      fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
      color: "#1f2937",
      fontSize: baseFont,
    },
    header: {
      display: "grid",
      gridTemplateColumns: headerCols,
      gap: 12,
      alignItems: "center",
      marginBottom: 16,
    },
    title: { margin: 0, fontSize: bp.isXS ? 18 : bp.isSM ? 20 : 24, fontWeight: 800 },
    subTitle: { marginTop: 4, color: "#64748b", fontSize: bp.isXS ? 12 : 13 },

    actionsBar: {
      display: "flex",
      gap: 12,
      alignItems: "stretch",
      flexWrap: "wrap",
      justifyContent: bp.isMD ? "stretch" : "flex-end",
      flexDirection: bp.isMD ? "column-reverse" : "row",
    },

    segmented: {
      display: "inline-flex",
      border: "1px solid #cbd5e1",
      borderRadius: 8,
      overflow: "hidden",
      background: "#fff",
      width: bp.isMD ? "100%" : "auto",
    },
    segmentedBtn: {
      padding: bp.isXS ? "8px 10px" : "8px 12px",
      backgroundColor: "#fff",
      color: "#334155",
      border: "none",
      cursor: "pointer",
      fontWeight: 600,
      flex: bp.isMD ? 1 : "initial",
    },
    segmentedActive: {
      padding: bp.isXS ? "8px 10px" : "8px 12px",
      backgroundColor: "#0ea5e9",
      color: "white",
      border: "none",
      cursor: "pointer",
      fontWeight: 700,
      flex: bp.isMD ? 1 : "initial",
    },

    searchBox: { display: "flex", gap: 8, alignItems: "center", width: bp.isMD ? "100%" : "auto" },
    searchInput: {
      width: bp.isMD ? "100%" : 280,
      maxWidth: "100%",
      padding: bp.isXS ? "8px 8px" : "8px 10px",
      borderRadius: 8,
      border: "1px solid #cbd5e1",
      outline: "none",
      fontSize: baseFont,
    },
    refreshBtn: {
      padding: bp.isXS ? "8px 10px" : "8px 10px",
      borderRadius: 8,
      border: "1px solid #cbd5e1",
      background: "#fff",
      cursor: "pointer",
      fontWeight: 600,
      fontSize: baseFont,
    },

    toastRegion: { position: "fixed", top: 14, right: 14, display: "grid", gap: 8, zIndex: 10000 },
    toast: {
      padding: "10px 12px",
      borderRadius: 10,
      boxShadow: "0 2px 10px rgba(0,0,0,0.08)",
      fontSize: 13,
      minWidth: 240,
    },

    card: {
      marginBottom: 20,
      padding: bp.isXS ? 12 : 16,
      border: "1px solid #e2e8f0",
      borderRadius: 12,
      backgroundColor: "#ffffff",
      boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
    },
    cardHeader: {
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      marginBottom: 8,
      gap: 8,
      flexWrap: "wrap",
    },
    cardTitle: { margin: 0, fontSize: bp.isXS ? 16 : 18, fontWeight: 700 },
    cardFooter: { display: "flex", gap: 8, marginTop: 8, flexWrap: "wrap" },

    grid2: { display: "grid", gridTemplateColumns: formGrid, gap: 12 },
    formGroup: { display: "flex", flexDirection: "column", gap: 6 },
    label: { fontSize: bp.isXS ? 12 : 13, color: "#475569", fontWeight: 600 },
    input: {
      width: "100%",
      padding: bp.isXS ? 8 : 10,
      borderRadius: 8,
      border: "1px solid #cbd5e1",
      boxSizing: "border-box",
      outline: "none",
      fontSize: baseFont,
    },

    btnPrimary: {
      padding: bp.isXS ? "8px 12px" : "10px 16px",
      backgroundColor: "#0ea5e9",
      color: "white",
      border: "none",
      borderRadius: 8,
      cursor: "pointer",
      fontWeight: 700,
      fontSize: baseFont,
    },
    btnSecondary: {
      padding: bp.isXS ? "8px 12px" : "10px 16px",
      backgroundColor: "#64748b",
      color: "white",
      border: "none",
      borderRadius: 8,
      cursor: "pointer",
      fontWeight: 700,
      fontSize: baseFont,
    },
    btnGhost: {
      padding: bp.isXS ? "8px 12px" : "10px 16px",
      backgroundColor: "#ffffff",
      color: "#0ea5e9",
      border: "1px solid #0ea5e9",
      borderRadius: 8,
      cursor: "pointer",
      fontWeight: 700,
      fontSize: baseFont,
    },

    /* Tabla (solo desktop/tablet) */
    tableWrap: { overflowX: "auto" },
    table: {
      width: "100%",
      borderCollapse: "collapse",
      fontSize: tableFont,
    },
    th: {
      borderBottom: "2px solid #0ea5e9",
      padding: bp.isXS ? 8 : 10,
      textAlign: "left",
      backgroundColor: "#eaf7ff",
      fontWeight: 700,
      fontSize: tableFont,
      color: "#1f2937",
      position: "sticky",
      top: 0,
      zIndex: 1,
      whiteSpace: "nowrap",
    },
    td: {
      borderBottom: "1px solid #e5e7eb",
      padding: bp.isXS ? 8 : 10,
      verticalAlign: "top",
      fontSize: tableFont,
    },

    select: {
      padding: bp.isXS ? "6px 8px" : "8px 10px",
      borderRadius: 8,
      border: "1px solid #cbd5e1",
      backgroundColor: "#fff",
      fontSize: baseFont,
      maxWidth: bp.isXS ? 140 : 180,
    },

    btnTiny: {
      padding: bp.isXS ? "6px 8px" : "6px 10px",
      backgroundColor: "#0ea5e9",
      color: "white",
      border: "none",
      borderRadius: 6,
      cursor: "pointer",
      fontSize: bp.isXS ? 12 : 13,
      fontWeight: 700,
    },
    btnTinyDanger: {
      padding: bp.isXS ? "6px 8px" : "6px 10px",
      backgroundColor: "#dc3545",
      color: "white",
      border: "none",
      borderRadius: 6,
      cursor: "pointer",
      fontSize: bp.isXS ? 12 : 13,
      fontWeight: 700,
    },
    btnTinySuccess: {
      padding: bp.isXS ? "6px 8px" : "6px 10px",
      backgroundColor: "#22c55e",
      color: "white",
      border: "none",
      borderRadius: 6,
      cursor: "pointer",
      fontSize: bp.isXS ? 12 : 13,
      fontWeight: 700,
    },

    emptyCell: {
      textAlign: "center",
      padding: bp.isXS ? 14 : 20,
      color: "#666",
      fontSize: baseFont,
    },

    detailsCell: {
      padding: bp.isXS ? 10 : 12,
      backgroundColor: "#f7fbff",
      borderTop: "1px solid #e6eef8",
    },
    detailsGrid: {
      display: "grid",
      gridTemplateColumns: bp.isMD ? "1fr" : "repeat(3, minmax(0, 1fr))",
      gap: 12,
    },
    detailItem: {
      padding: 10,
      border: "1px solid #e2e8f0",
      borderRadius: 10,
      background: "#fff",
    },
    detailLabel: { fontSize: bp.isXS ? 11 : 12, color: "#64748b", fontWeight: 600, marginBottom: 4 },
    detailValue: { fontSize: baseFont, color: "#1f2937" },

    filtersRow: {
      display: "flex",
      alignItems: "center",
      justifyContent: bp.isMD ? "stretch" : "space-between",
      marginBottom: 10,
      flexDirection: bp.isMD ? "column" : "row",
      gap: 8,
    },
    filtersGroup: { display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" },
    labelInline: {
      display: "inline-flex",
      alignItems: "center",
      gap: 6,
      fontSize: bp.isXS ? 12 : 13,
      color: "#475569",
      fontWeight: 600,
    },
    inputInline: {
      padding: bp.isXS ? "6px 6px" : "6px 8px",
      borderRadius: 8,
      border: "1px solid #cbd5e1",
      backgroundColor: "#fff",
      outline: "none",
      fontSize: baseFont,
    },

    sectionHeader: { display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8, flexWrap: "wrap" },
    sectionTitle: { margin: 0, color: "#0ea5e9" },

    modalOverlay: {
      position: "fixed",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: "rgba(0,0,0,0.4)",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      zIndex: 9999,
      padding: 12,
    },
    modal: {
      backgroundColor: "white",
      borderRadius: 12,
      width: bp.isMD ? "100%" : 520,
      maxWidth: "95%",
      boxShadow: "0 10px 25px rgba(0,0,0,0.2)",
      display: "flex",
      flexDirection: "column",
      overflow: "hidden",
    },
    modalHeader: {
      padding: "12px 16px",
      backgroundColor: "#0ea5e9",
      color: "white",
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      fontWeight: "bold",
      fontSize: bp.isXS ? 14 : 16,
    },
    btnClose: {
      backgroundColor: "#dc3545",
      border: "none",
      color: "white",
      fontWeight: "bold",
      cursor: "pointer",
      padding: bp.isXS ? "6px 8px" : "6px 10px",
      borderRadius: 8,
      fontSize: baseFont,
    },
    modalBody: {
      padding: bp.isXS ? 12 : 16,
      minHeight: 120,
      fontSize: baseFont,
      color: "#333",
      overflowY: "auto",
    },
    modalFooter: {
      padding: bp.isXS ? 10 : 12,
      borderTop: "1px solid #e5e7eb",
      display: "flex",
      justifyContent: "flex-end",
      gap: 8,
      flexWrap: "wrap",
    },
    btnDanger: {
      padding: bp.isXS ? "8px 12px" : "10px 16px",
      backgroundColor: "#dc3545",
      color: "white",
      border: "none",
      borderRadius: 8,
      cursor: "pointer",
      fontWeight: 700,
      fontSize: baseFont,
    },

    /* ===== Vista móvil (lista/cards) ===== */
    mobileList: { display: "grid", gap: 10 },
    cardRow: {
      border: "1px solid #e5e7eb",
      borderRadius: 10,
      padding: 12,
      background: "#fff",
      boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
    },
    rowHeader: {
      display: "flex",
      alignItems: "flex-start",
      justifyContent: "space-between",
      gap: 10,
      flexWrap: "wrap",
    },
    rowTitle: { fontWeight: 700, fontSize: bp.isXS ? 14 : 15 },
    rowSub: { color: "#64748b", fontSize: bp.isXS ? 12 : 13 },
    rowActions: { display: "flex", gap: 6, flexWrap: "wrap", marginTop: 10 },
    rowFooter: {
      marginTop: 10,
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      gap: 8,
      flexWrap: "wrap",
    },
    btnLink: {
      background: "transparent",
      border: "none",
      color: "#0ea5e9",
      textDecoration: "underline",
      cursor: "pointer",
      padding: 0,
      fontSize: baseFont,
    },
  };
};

/* ===========================
   COMPONENTE
   =========================== */
const Table = () => {
  const bp = useBreakpoint();
  const s = getStyles(bp);

  /* --------- Contexto Auth --------- */
  const { id: emisorId, rol: emisorRol, token } = storeAuth() || {};

  /* --------- Estado principal --------- */
  const [tipo, setTipo] = useState("cliente"); // 'cliente' | 'emprendedor'
  const [lista, setLista] = useState([]);
  const [loadingLista, setLoadingLista] = useState(false);

  /* --------- PAGINACIÓN (NUEVO) --------- */
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const PAGE_SIZE_OPTIONS = [5, 10, 25, 50];

  /* --------- Form states --------- */
  const [formCrear, setFormCrear] = useState(emptyForm);
  const [formEditar, setFormEditar] = useState({ id: null, ...emptyForm });

  /* --------- Mensajes --------- */
  const [error, setError] = useState("");
  const [mensaje, setMensaje] = useState("");
  useEffect(() => {
    if (!error && !mensaje) return;
    const t = setTimeout(() => {
      setError("");
      setMensaje("");
    }, 3000);
    return () => clearTimeout(t);
  }, [error, mensaje]);

  /* --------- UI states --------- */
  const [expandido, setExpandido] = useState(null);
  const [search, setSearch] = useState("");

  /* Reset page when tipo/search/pageSize changes */
  useEffect(() => {
    setPage(1);
  }, [tipo, search, pageSize]);

  /* --------- Confirmación de eliminación --------- */
  const [confirmDelete, setConfirmDelete] = useState({ visible: false, id: null, nombre: "" });

  /* --------- Chat --------- */
  const [modalChatVisible, setModalChatVisible] = useState(false);
  const [chatUser, setChatUser] = useState(null);
  const [mensajes, setMensajes] = useState([]);
  const [mensajeChat, setMensajeChat] = useState("");
  const mensajesRef = useRef(null);

  /* --------- Sub-filtros por fecha para Emprendedor --------- */
  const [rangoFechas, setRangoFechas] = useState({ from: "", to: "" });
  const [mapEmpEmprendimientos, setMapEmpEmprendimientos] = useState({});
  const [mapEmpProductos, setMapEmpProductos] = useState({});
  const [loadingNested, setLoadingNested] = useState(false);

  /* --------- Catálogos generales (fallback) --------- */
  const [catalogoProductos, setCatalogoProductos] = useState([]);
  const [catalogoEmprendimientos, setCatalogoEmprendimientos] = useState([]);

  /* ========= Derivar estado visible CLIENTE desde modelo ========= */
  const deriveEstadoCliente = (item) => {
    if (!item) return "Correcto";
    if (item.status === false) return "Suspendido";
    const e = item.estado_Cliente ?? item.estado_Emprendedor ?? "Activo";
    if (e === "Activo") return "Correcto";
    if (["Advertencia1", "Advertencia2", "Advertencia3", "Suspendido"].includes(e)) return e;
    return "Correcto";
  };

  /* ===========================
     CARGA DE LISTAS
  =========================== */
  const fetchLista = async () => {
    setError("");
    setMensaje("");
    setLoadingLista(true);
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
      } else if (tipo === "emprendedor") {
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
      console.warn("No se pudieron cargar catálogos generales (fallback):", e?.message);
    }
  };

  useEffect(() => {
    fetchLista();
    fetchCatalogosGenerales();
    setFormCrear(emptyForm);
    setFormEditar({ id: null, ...emptyForm });
    setExpandido(null);
    setError("");
    setMensaje("");
    setSearch("");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tipo]);

  /* ===========================
     CRUD: CREAR / EDITAR / ELIMINAR
  =========================== */
  const handleCrear = async (e) => {
    e.preventDefault();
    setError("");
    setMensaje("");

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
    setMensaje("");
    setError("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleActualizar = async (e) => {
    e.preventDefault();
    setError("");
    setMensaje("");
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

    try {
      const res = await fetch(`${BASE_URLS[tipo]}/actualizar/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ nombre, apellido, email, password, telefono }),
      });
      const data = await res.json();
      if (!res.ok) setError(data.msg || "No se pudo actualizar.");
      else {
        setMensaje(`${capitalize(tipo)} actualizado correctamente.`);
        setFormEditar({ id: null, ...emptyForm });
        fetchLista();
      }
    } catch {
      setError("Error de red al actualizar.");
    }
  };

  const solicitarEliminar = (item) => {
    setConfirmDelete({ visible: true, id: item._id, nombre: `${item.nombre} ${item.apellido}` });
  };
  const cancelarEliminar = () => setConfirmDelete({ visible: false, id: null, nombre: "" });

  const confirmarEliminar = async () => {
    const id = confirmDelete.id;
    cancelarEliminar();
    setError("");
    setMensaje("");
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
     ESTADO (Cliente/Emprendedor)
  =========================== */

  const getEstado = (item) =>
    tipo === "emprendedor"
      ? item.estado || item.estado_Emprendedor || "Activo"
      : item.estado_Cliente ?? item.estado ?? deriveEstadoCliente(item);

  const getEstadosPermitidos = () => (tipo === "emprendedor" ? ESTADOS_EMPRENDEDOR : ESTADOS_CLIENTE);

  const [estadoModal, setEstadoModal] = useState({
    visible: false,
    item: null,
    nuevoEstado: null,
    motivo: "",
    suspendidoHasta: "",
  });

  const updateEstadoClienteDirect = async (item, nuevoEstado) => {
    try {
      setMensaje("");
      setError("");

      if (!ESTADOS_CLIENTE.includes(nuevoEstado)) {
        setError("Estado inválido para cliente.");
        return;
      }

      const urlEstado = `${BASE_URLS["cliente"]}/estado/${item._id}`;
      const payload = { estado: nuevoEstado };

      let res = await fetch(urlEstado, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        res = await fetch(`${BASE_URLS["cliente"]}/actualizar/${item._id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          body: JSON.stringify({ estado_Cliente: nuevoEstado }),
        });
      }

      const data = await res.json();
      if (!res.ok) throw new Error(data.msg || "No se pudo actualizar el estado.");

      setMensaje(`Estado actualizado a: ${nuevoEstado}`);
      fetchLista();
    } catch (e) {
      console.error(e);
      setError(e.message || "Error al actualizar el estado.");
    }
  };

  const openEstadoModal = (item, nuevoEstado) => {
    if (tipo === "cliente") {
      updateEstadoClienteDirect(item, nuevoEstado);
    } else {
      updateEstadoEmprendedor(item, nuevoEstado);
    }
  };

  const closeEstadoModal = () =>
    setEstadoModal({
      visible: false,
      item: null,
      nuevoEstado: null,
      motivo: "",
      suspendidoHasta: "",
    });

  const updateEstadoClienteConfirmed = async () => {
    const { item, nuevoEstado, motivo, suspendidoHasta } = estadoModal;
    try {
      setMensaje("");
      setError("");

      if (!ESTADOS_CLIENTE.includes(nuevoEstado)) {
        setError("Estado inválido para cliente.");
        return;
      }
      if (!motivo.trim()) {
        setError("Debes ingresar un motivo para el cambio de estado.");
        return;
      }

      const urlEstado = `${BASE_URLS["cliente"]}/estado/${item._id}`;

      const payload = {
        estado: nuevoEstado,
        motivo: motivo.trim(),
        ...(nuevoEstado === "Suspendido" && suspendidoHasta
          ? { suspendidoHasta: new Date(suspendidoHasta).toISOString() }
          : {}),
      };

      let res = await fetch(urlEstado, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        res = await fetch(`${BASE_URLS["cliente"]}/actualizar/${item._id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          body: JSON.stringify({ estado: nuevoEstado, motivo: payload.motivo }),
        });
      }

      const data = await res.json();
      if (!res.ok) throw new Error(data?.msg || "No se pudo actualizar el estado.");

      setMensaje(`Estado actualizado a: ${nuevoEstado}`);
      closeEstadoModal();
      fetchLista();
    } catch (e) {
      console.error(e);
      setError(e.message || "Error al actualizar el estado.");
    }
  };

  const updateEstadoEmprendedor = async (item, nuevoEstado) => {
    try {
      setMensaje("");
      setError("");

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
        res = await fetch(`${BASE_URLS["emprendedor"]}/actualizar/${item._id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          body: JSON.stringify({ estado_Emprendedor: nuevoEstado }),
        });
      }

      const data = await res.json();
      if (!res.ok) throw new Error(data?.msg || "No se pudo actualizar el estado.");
      setMensaje(`Estado actualizado a: ${nuevoEstado}`);
      fetchLista();
    } catch (e) {
      console.error(e);
      setError(e.message || "Error al actualizar el estado.");
    }
  };

  const EstadoBadge = ({ estado }) => {
    const bg = ESTADO_COLORS[estado] || "#6c757d";
    return (
      <span
        aria-label={`Estado: ${estado}`}
        style={{
          display: "inline-block",
          marginLeft: 6,
          padding: "2px 10px",
          borderRadius: 999,
          fontSize: 12,
          color: "white",
          backgroundColor: bg,
          lineHeight: "18px",
        }}
      >
        {estado}
      </span>
    );
  };

  /* ===========================
     ANIDADOS (Emprendedor)
  =========================== */
  const toggleExpandido = async (id, item) => {
    const nuevo = expandido === id ? null : id;
    setExpandido(nuevo);
    if (nuevo && tipo === "emprendedor") {
      await cargarNestedParaEmprendedor(item);
    }
  };

  const cargarNestedParaEmprendedor = async (emprendedor) => {
    if (!emprendedor?._id) return;
    setLoadingNested(true);
    setError("");

    const from = rangoFechas.from || "";
    const to = rangoFechas.to || "";

    const tryFetch = async (url) => {
      try {
        const res = await fetch(url, {
          headers: token ? { Authorization: `Bearer ${token}` } : undefined,
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return await res.json();
      } catch {
        return null;
      }
    };

    const urlEmps = `${API_EMPRENDIMIENTOS}/by-emprendedor/${emprendedor._id}${
      from || to ? `?from=${from}&to=${to}` : ""
    }`;
    let emps = await tryFetch(urlEmps);
    if (!Array.isArray(emps)) {
      emps = catalogoEmprendimientos.filter((e) => {
        const owner = String(e?.emprendedor?._id || e?.emprendedorId || "") === String(emprendedor._id);
        const ts = e?.createdAt ? new Date(e.createdAt).getTime() : null;
        const inRange =
          !from && !to
            ? true
            : !!ts && (!from || ts >= new Date(from).getTime()) && (!to || ts <= new Date(to).getTime());
        return owner && inRange;
      });
    }

    const urlProds = `${API_PRODUCTOS}/by-emprendedor/${emprendedor._id}${
      from || to ? `?from=${from}&to=${to}` : ""
    }`;
    let prods = await tryFetch(urlProds);
    if (!Array.isArray(prods)) {
      prods = catalogoProductos.filter((p) => {
        const owner =
          String(p?.emprendimiento?.emprendedor?._id || p?.emprendimiento?.emprendedorId || "") ===
          String(emprendedor._id);
        const ts = p?.createdAt ? new Date(p.createdAt).getTime() : null;
        const inRange =
          !from && !to
            ? true
            : !!ts && (!from || ts >= new Date(from).getTime()) && (!to || ts <= new Date(to).getTime());
        return owner && inRange;
      });
    }

    setMapEmpEmprendimientos((prev) => ({ ...prev, [emprendedor._id]: emps }));
    setMapEmpProductos((prev) => ({ ...prev, [emprendedor._id]: prods }));
    setLoadingNested(false);
  };

  useEffect(() => {
    if (expandido && tipo === "emprendedor") {
      const emp = lista.find((x) => x._id === expandido);
      if (emp) cargarNestedParaEmprendedor(emp);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rangoFechas]);

  /* ===========================
     EXPORTS (CSV/PDF)
  ============================ */
  const exportCSV = (rows, filename) => {
    if (!Array.isArray(rows) || rows.length === 0) {
      setError("No hay datos para exportar.");
      return;
    }
    const cols = Object.keys(rows[0]).filter((k) => typeof rows[0][k] !== "object");
    const header = cols.join(",");
    const body = rows
      .map((r) =>
        cols
          .map((c) => {
            const val = r[c] ?? "";
            const txt = String(val).replace(/"/g, '""');
            return `"${txt}"`;
          })
          .join(",")
      )
      .join("\n");
    const csv = [header, body].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename.endsWith(".csv") ? filename : `${filename}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    setMensaje("Exportación CSV lista.");
  };

  const exportPDF = (htmlTitle, rows, mapper) => {
    if (!Array.isArray(rows) || rows.length === 0) {
      setError("No hay datos para exportar.");
      return;
    }
    const win = window.open("", "_blank");
    const now = new Date().toLocaleString();
    const tableRows = rows
      .map(
        (r) =>
          `<tr>${mapper(r)
            .map((cell) => `<td style="padding:8px;border:1px solid #ddd">${cell}</td>`)
            .join("")}</tr>`
      )
      .join("");
    win.document.write(`
      <html><head><title>${htmlTitle}</title></head>
      <body style="font-family:Segoe UI,Arial,sans-serif">
        <h2 style="margin:0 0 4px">${htmlTitle}</h2>
        <p style="color:#666;font-size:12px;margin:0 0 12px">Generado: ${now}</p>
        <table style="border-collapse:collapse;width:100%;font-size:13px">
          <thead>
            <tr style="background:#e9f0ff">
              ${mapper({header:true})
                .map((h) => `<th style="padding:8px;border:1px solid #bbb;text-align:left">${h}</th>`)
                .join("")}
            </tr>
          </thead>
          <tbody>${tableRows}</tbody>
        </table>
      </body></html>
    `);
    win.document.close();
    win.focus();
    win.print();
    setMensaje("Exportación PDF lista.");
  };

  const mapperEmprendimientos = (r) =>
    r?.header ? ["Nombre Comercial", "Ciudad", "Creado"] : [r.nombreComercial || "", r.ubicacion?.ciudad || "", r.createdAt ? new Date(r.createdAt).toLocaleString() : ""];

  const mapperProductos = (r) =>
    r?.header
      ? ["Producto", "Precio", "Stock", "Emprendimiento", "Creado"]
      : [
          r.nombre || "",
          typeof r.precio === "number" ? fmtUSD.format(r.precio) : "",
          r.stock ?? "",
          r.empNombreComercial || r.emprendimiento?.nombreComercial || "",
          r.createdAt ? new Date(r.createdAt).toLocaleString() : "",
        ];

  /* ===========================
     CHAT
  ============================ */
  const abrirChat = (item) => {
    setChatUser({ id: item._id, rol: capitalize(tipo), nombre: item.nombre });
    setModalChatVisible(true);
    cargarMensajes(item._id);
  };
  const cerrarChat = () => {
    setModalChatVisible(false);
    setChatUser(null);
    setMensajes([]);
    setMensajeChat("");
  };
  const cargarMensajes = async (receptorId) => {
    if (!receptorId) return;
    try {
      const resConv = await fetch(
        `https://backend-production-bd1d.up.railway.app/api/chat/conversaciones/${emisorId}`
      );
      const dataConv = await resConv.json();
      const conversacion = Array.isArray(dataConv)
        ? dataConv.find((conv) => conv.participantes?.some((p) => p.id && p.id._id === receptorId))
        : null;

      if (!conversacion) {
        setMensajes([]);
        return;
      }

      const resMsgs = await fetch(
        `https://backend-production-bd1d.up.railway.app/api/chat/mensajes/${conversacion._id}`
      );
      const dataMsgs = await resMsgs.json();
      setMensajes(Array.isArray(dataMsgs) ? dataMsgs : []);
    } catch (error) {
      setError("No se pudieron cargar los mensajes.");
    }
  };
  const enviarMensaje = async (e) => {
    e.preventDefault();
    if (!mensajeChat.trim() || !chatUser || !emisorId || !emisorRol) return;
    try {
      const res = await fetch("https://backend-production-bd1d.up.railway.app/api/chat/mensaje", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          emisorId,
          emisorRol,
          receptorId: chatUser.id,
          receptorRol: chatUser.rol,
          contenido: mensajeChat.trim(),
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setMensajeChat("");
        cargarMensajes(chatUser.id);
      } else {
        setError(data.mensaje || "No se pudo enviar el mensaje.");
      }
    } catch (error) {
      setError("Error de red al enviar mensaje.");
    }
  };
  useEffect(() => {
    if (mensajesRef.current) {
      mensajesRef.current.scrollTop = mensajesRef.current.scrollHeight;
    }
  }, [mensajes]);
  useEffect(() => {
    if (!modalChatVisible || !chatUser) return;
    const intervalo = setInterval(() => cargarMensajes(chatUser.id), 3000);
    return () => clearInterval(intervalo);
  }, [modalChatVisible, chatUser]);

  /* ===========================
     FILTRO LOCAL
  ============================ */
  const listaFiltrada = lista.filter((x) => {
    const q = search.toLowerCase().trim();
    if (!q) return true;
    const campos = [x.nombre, x.apellido, x.email, x.telefono].map((v) => String(v || "").toLowerCase());
    return campos.some((c) => c.includes(q));
  });

  /* ===========================
     PAGINACIÓN: calcular lista visible
  ============================ */
  const totalPages = Math.max(1, Math.ceil(listaFiltrada.length / pageSize));
  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [totalPages, page]);

  const listaPaginada = listaFiltrada.slice((page - 1) * pageSize, page * pageSize);

  /* ===========================
     RENDER AUX: Mobile row card
  ============================ */
  const MobileRow = ({ item, idx }) => {
    const estadoActual = getEstado(item);

    return (
      <div key={item._id} style={s.cardRow}>
        <div style={s.rowHeader}>
          <div>
            <div style={s.rowTitle}>
              {idx}. {item.nombre} {item.apellido} <EstadoBadge estado={estadoActual} />
            </div>
            <div style={s.rowSub}>
              {item.email} · {item.telefono || "N/A"}
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <select
              aria-label="Cambiar estado/advertencia"
              value={estadoActual}
              onChange={(e) => openEstadoModal(item, e.target.value)}
              style={s.select}
            >
              {getEstadosPermitidos().map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div style={s.rowActions}>
          <button
            style={s.btnTiny}
            onClick={(e) => {
              e.stopPropagation();
              prepararEditar(item);
            }}
          >
            ✏️ Editar
          </button>
          <button
            style={s.btnTinyDanger}
            onClick={(e) => {
              e.stopPropagation();
              solicitarEliminar(item);
            }}
          >
            🗑️ Eliminar
          </button>
          <button
            style={s.btnTinySuccess}
            onClick={(e) => {
              e.stopPropagation();
              abrirChat(item);
            }}
          >
            💬 Chatear
          </button>
        </div>

        <div style={s.rowFooter}>
          <button
            style={s.btnLink}
            onClick={() => toggleExpandido(item._id, item)}
            aria-expanded={expandido === item._id}
          >
            {expandido === item._id ? "Ocultar detalles ▲" : "Ver detalles ▼"}
          </button>
        </div>

        {expandido === item._id && (
          <div style={{ marginTop: 10 }}>
            <div style={s.detailsGrid}>
              <div style={s.detailItem}>
                <div style={s.detailLabel}>Nombre completo</div>
                <div style={s.detailValue}>
                  {item.nombre} {item.apellido}
                </div>
              </div>
              <div style={s.detailItem}>
                <div style={s.detailLabel}>Email</div>
                <div style={s.detailValue}>{item.email}</div>
              </div>
              <div style={s.detailItem}>
                <div style={s.detailLabel}>Teléfono</div>
                <div style={s.detailValue}>{item.telefono || "N/A"}</div>
              </div>
              <div style={s.detailItem}>
                <div style={s.detailLabel}>Creado</div>
                <div style={s.detailValue}>
                  {item.createdAt ? new Date(item.createdAt).toLocaleString() : "—"}
                </div>
              </div>
              <div style={s.detailItem}>
                <div style={s.detailLabel}>Actualizado</div>
                <div style={s.detailValue}>
                  {item.updatedAt ? new Date(item.updatedAt).toLocaleString() : "—"}
                </div>
              </div>
            </div>

            {tipo === "emprendedor" && (
              <div style={{ marginTop: 12 }}>
                {/* Filtros de fecha */}
                <div style={s.filtersRow}>
                  <div style={{ fontWeight: 600 }}>Filtrar por fecha</div>
                  <div style={s.filtersGroup}>
                    <label style={s.labelInline}>
                      Desde
                      <input
                        type="date"
                        value={rangoFechas.from}
                        onChange={(e) => setRangoFechas((st) => ({ ...st, from: e.target.value }))}
                        style={s.inputInline}
                      />
                    </label>
                    <label style={s.labelInline}>
                      Hasta
                      <input
                        type="date"
                        value={rangoFechas.to}
                        onChange={(e) => setRangoFechas((st) => ({ ...st, to: e.target.value }))}
                        style={s.inputInline}
                      />
                    </label>
                    <button
                      style={s.btnTiny}
                      onClick={(e) => {
                        e.stopPropagation();
                        const emp = lista.find((x) => x._id === expandido);
                        if (emp) cargarNestedParaEmprendedor(emp);
                      }}
                    >
                      Aplicar
                    </button>
                    <button
                      style={s.btnTiny}
                      onClick={(e) => {
                        e.stopPropagation();
                        setRangoFechas({ from: "", to: "" });
                      }}
                    >
                      Limpiar
                    </button>
                  </div>
                </div>

                {/* Emprendimientos */}
                <div style={{ marginBottom: 12 }}>
                  <div style={s.sectionHeader}>
                    <h4 style={s.sectionTitle}>Emprendimientos</h4>
                    <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                      <button
                        style={s.btnTiny}
                        onClick={(e) => {
                          e.stopPropagation();
                          const emps = mapEmpEmprendimientos[item._id] || [];
                          exportCSV(
                            emps.map((e) => ({
                              nombreComercial: e.nombreComercial || "",
                              ciudad: e?.ubicacion?.ciudad || "",
                              creado: e.createdAt ? new Date(e.createdAt).toLocaleString() : "",
                            })),
                            `emprendimientos_${item.nombre}_${item.apellido}`
                          );
                        }}
                      >
                        Exportar CSV
                      </button>
                      <button
                        style={s.btnTiny}
                        onClick={(e) => {
                          e.stopPropagation();
                          const emps = mapEmpEmprendimientos[item._id] || [];
                          exportPDF(`Emprendimientos de ${item.nombre} ${item.apellido}`, emps, mapperEmprendimientos);
                        }}
                      >
                        Exportar PDF
                      </button>
                    </div>
                  </div>

                  {loadingNested ? (
                    <div style={s.emptyCell}>Cargando emprendimientos…</div>
                  ) : (mapEmpEmprendimientos[item._id] || []).length === 0 ? (
                    <div style={s.emptyCell}>Sin emprendimientos en el rango.</div>
                  ) : (
                    <div style={s.mobileList}>
                      {(mapEmpEmprendimientos[item._id] || []).map((e) => (
                        <div key={e._id} style={s.detailItem}>
                          <div style={{ fontWeight: 700 }}>{e.nombreComercial}</div>
                          <div style={{ color: "#64748b" }}>{e?.ubicacion?.ciudad || "—"}</div>
                          <div style={{ color: "#64748b" }}>
                            {e.createdAt ? new Date(e.createdAt).toLocaleString() : "—"}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Productos */}
                <div>
                  <div style={s.sectionHeader}>
                    <h4 style={s.sectionTitle}>Productos</h4>
                    <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                      <button
                        style={s.btnTiny}
                        onClick={(e) => {
                          e.stopPropagation();
                          const prods = mapEmpProductos[item._id] || [];
                          exportCSV(
                            prods.map((p) => ({
                              producto: p.nombre || "",
                              precio: typeof p.precio === "number" ? p.precio : "",
                              stock: p.stock ?? "",
                              emprendimiento:
                                p.empNombreComercial || p?.emprendimiento?.nombreComercial || "",
                              creado: p.createdAt ? new Date(p.createdAt).toLocaleString() : "",
                            })),
                            `productos_${item.nombre}_${item.apellido}`
                          );
                        }}
                      >
                        Exportar CSV
                      </button>
                      <button
                        style={s.btnTiny}
                        onClick={(e) => {
                          e.stopPropagation();
                          const prods = mapEmpProductos[item._id] || [];
                          exportPDF(`Productos de ${item.nombre} ${item.apellido}`, prods, mapperProductos);
                        }}
                      >
                        Exportar PDF
                      </button>
                    </div>
                  </div>

                  {loadingNested ? (
                    <div style={s.emptyCell}>Cargando productos…</div>
                  ) : (mapEmpProductos[item._id] || []).length === 0 ? (
                    <div style={s.emptyCell}>Sin productos en el rango.</div>
                  ) : (
                    <div style={s.mobileList}>
                      {(mapEmpProductos[item._id] || []).map((p) => (
                        <div key={p._id} style={s.detailItem}>
                          <div style={{ fontWeight: 700 }}>{p.nombre}</div>
                          <div style={{ color: "#64748b" }}>
                            {typeof p.precio === "number" ? fmtUSD.format(p.precio) : "—"} · Stock:{" "}
                            {p.stock ?? "—"}
                          </div>
                          <div style={{ color: "#64748b" }}>
                            {p.empNombreComercial || p?.emprendimiento?.nombreComercial || "—"}
                          </div>
                          <div style={{ color: "#64748b" }}>
                            {p.createdAt ? new Date(p.createdAt).toLocaleString() : "—"}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  /* ===========================
     RENDER
  ============================ */
  return (
    <div style={s.container}>
      {/* ====== ENCABEZADO ====== */}
      <header style={s.header}>
        <div>
          <h1 style={s.title}>Panel de Administración</h1>
          <div style={s.subTitle}>
            {capitalize(tipo)}s • {loadingLista ? "Cargando…" : `${listaFiltrada.length} resultados`}
          </div>
        </div>

        <div style={s.actionsBar}>
          <div role="group" aria-label="Seleccionar tipo" style={s.segmented}>
            <button style={tipo === "cliente" ? s.segmentedActive : s.segmentedBtn} onClick={() => setTipo("cliente")}>
              Clientes
            </button>
            <button
              style={tipo === "emprendedor" ? s.segmentedActive : s.segmentedBtn}
              onClick={() => setTipo("emprendedor")}
            >
              Emprendedores
            </button>
          </div>

          <div style={s.searchBox}>
            <input
              aria-label="Buscar en el listado"
              type="search"
              placeholder={`Buscar ${capitalize(tipo)} por nombre, apellido, email o teléfono…`}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={s.searchInput}
            />
            <button style={s.refreshBtn} onClick={fetchLista}>
              ↻ Actualizar
            </button>
          </div>
        </div>
      </header>

      {/* Mensajes */}
      <div style={s.toastRegion} aria-live="polite" aria-atomic="true">
        {error && <div style={{ ...s.toast, backgroundColor: "#ffe8e6", color: "#a33" }}>⚠️ {error}</div>}
        {mensaje && <div style={{ ...s.toast, backgroundColor: "#e7f9ed", color: "#1e7e34" }}>✅ {mensaje}</div>}
      </div>

      {/* ====== FORM: CREAR ====== */}
      <section style={s.card} aria-label="Crear">
        <div style={s.cardHeader}>
          <h2 style={s.cardTitle}>Crear {capitalize(tipo)}</h2>
        </div>
        <form onSubmit={handleCrear}>
          <div style={s.grid2}>
            <div style={s.formGroup}>
              <label style={s.label}>Nombre</label>
              <input
                style={s.input}
                placeholder="Ej. Ana"
                value={formCrear.nombre}
                onChange={(e) => setFormCrear({ ...formCrear, nombre: e.target.value })}
                required
              />
            </div>
            <div style={s.formGroup}>
              <label style={s.label}>Apellido</label>
              <input
                style={s.input}
                placeholder="Ej. Pérez"
                value={formCrear.apellido}
                onChange={(e) => setFormCrear({ ...formCrear, apellido: e.target.value })}
                required
              />
            </div>
            <div style={s.formGroup}>
              <label style={s.label}>Email</label>
              <input
                style={s.input}
                type="email"
                placeholder="nombre@dominio.com"
                value={formCrear.email}
                onChange={(e) => setFormCrear({ ...formCrear, email: e.target.value })}
                required
              />
            </div>
            <div style={s.formGroup}>
              <label style={s.label}>Password</label>
              <input
                style={s.input}
                type="password"
                placeholder="••••••••"
                value={formCrear.password}
                onChange={(e) => setFormCrear({ ...formCrear, password: e.target.value })}
                required
              />
            </div>
            <div style={s.formGroup}>
              <label style={s.label}>Teléfono</label>
              <input
                style={s.input}
                placeholder="Ej. 0999999999"
                value={formCrear.telefono}
                onChange={(e) => setFormCrear({ ...formCrear, telefono: e.target.value })}
              />
            </div>
          </div>

          <div style={s.cardFooter}>
            <button style={s.btnPrimary} type="submit">
              Crear
            </button>
            <button style={s.btnGhost} type="button" onClick={() => setFormCrear(emptyForm)} title="Limpiar formulario">
              Limpiar
            </button>
          </div>
        </form>
      </section>

      {/* ====== FORM: EDITAR ====== */}
      {formEditar.id && (
        <section style={s.card} aria-label="Editar">
          <div style={s.cardHeader}>
            <h2 style={s.cardTitle}>Editar {capitalize(tipo)}</h2>
          </div>
          <form onSubmit={handleActualizar}>
            <div style={s.grid2}>
              <div style={s.formGroup}>
                <label style={s.label}>Nombre</label>
                <input
                  style={s.input}
                  value={formEditar.nombre}
                  onChange={(e) => setFormEditar({ ...formEditar, nombre: e.target.value })}
                  required
                />
              </div>
              <div style={s.formGroup}>
                <label style={s.label}>Apellido</label>
                <input
                  style={s.input}
                  value={formEditar.apellido}
                  onChange={(e) => setFormEditar({ ...formEditar, apellido: e.target.value })}
                  required
                />
              </div>
              <div style={s.formGroup}>
                <label style={s.label}>Email</label>
                <input
                  style={s.input}
                  type="email"
                  value={formEditar.email}
                  onChange={(e) => setFormEditar({ ...formEditar, email: e.target.value })}
                  required
                />
              </div>
              <div style={s.formGroup}>
                <label style={s.label}>Password (opcional)</label>
                <input
                  style={s.input}
                  type="password"
                  value={formEditar.password}
                  onChange={(e) => setFormEditar({ ...formEditar, password: e.target.value })}
                />
              </div>
              <div style={s.formGroup}>
                <label style={s.label}>Teléfono</label>
                <input
                  style={s.input}
                  value={formEditar.telefono}
                  onChange={(e) => setFormEditar({ ...formEditar, telefono: e.target.value })}
                />
              </div>
            </div>

            <div style={s.cardFooter}>
              <button style={s.btnPrimary} type="submit">
                Actualizar
              </button>
              <button
                style={s.btnSecondary}
                type="button"
                onClick={() => setFormEditar({ id: null, ...emptyForm })}
              >
                Cancelar
              </button>
            </div>
          </form>
        </section>
      )}

      {/* ====== LISTADO PRINCIPAL ====== */}
      <section aria-label="Listado principal" style={s.card}>
        <div style={s.cardHeader}>
          <h2 style={s.cardTitle}>Listado de {capitalize(tipo)}s</h2>
        </div>

        {/* Vista móvil: tarjetas */}
        {bp.isMD ? (
          <>
            {loadingLista && <div style={s.emptyCell}>Cargando datos…</div>}
            {!loadingLista && listaFiltrada.length === 0 && (
              <div style={s.emptyCell}>
                <div style={{ fontSize: 24 }}>🗂️</div>
                <div style={{ color: "#666" }}>No hay {capitalize(tipo)}s para mostrar.</div>
              </div>
            )}
            <div style={s.mobileList}>
              {listaPaginada.map((item, i) => (
                <MobileRow key={item._id} item={item} idx={(page - 1) * pageSize + i + 1} />
              ))}
            </div>
          </>
        ) : (
          /* Vista desktop: tabla */
          <div style={s.tableWrap}>
            <table style={s.table}>
              <thead>
                <tr>
                  <th style={s.th}>#</th>
                  <th style={s.th}>Nombre</th>
                  <th style={s.th}>Apellido</th>
                  <th style={s.th}>Email</th>
                  <th style={s.th}>Teléfono</th>
                  <th style={s.th}>Estado</th>
                  <th style={s.th}>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {loadingLista && (
                  <tr>
                    <td colSpan="7" style={s.emptyCell}>
                      Cargando datos…
                    </td>
                  </tr>
                )}

                {!loadingLista && listaFiltrada.length === 0 && (
                  <tr>
                    <td colSpan="7" style={s.emptyCell}>
                      <div style={{ fontSize: 24 }}>🗂️</div>
                      <div style={{ color: "#666" }}>No hay {capitalize(tipo)}s para mostrar.</div>
                    </td>
                  </tr>
                )}

                {!loadingLista &&
                  listaPaginada.map((item, i) => (
                    <React.Fragment key={item._id}>
                      <tr
                        style={{
                          backgroundColor: expandido === item._id ? "#f5faff" : "white",
                          cursor: "pointer",
                        }}
                        onClick={() => toggleExpandido(item._id, item)}
                        aria-expanded={expandido === item._id}
                      >
                        <td style={s.td}>{(page - 1) * pageSize + i + 1}</td>
                        <td style={s.td}>
                          <span style={{ fontWeight: 600 }}>{item.nombre}</span>
                          <EstadoBadge estado={getEstado(item)} />
                        </td>
                        <td style={s.td}>{item.apellido}</td>
                        <td style={s.td}>{item.email}</td>
                        <td style={s.td}>{item.telefono || "N/A"}</td>

                        <td style={s.td}>
                          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                            <select
                              aria-label="Cambiar estado/advertencia"
                              value={getEstado(item)}
                              onChange={(e) => {
                                e.stopPropagation();
                                openEstadoModal(item, e.target.value);
                              }}
                              style={s.select}
                              onClick={(e) => e.stopPropagation()}
                            >
                              {getEstadosPermitidos().map((opt) => (
                                <option key={opt} value={opt}>
                                  {opt}
                                </option>
                              ))}
                            </select>
                            <EstadoBadge estado={getEstado(item)} />
                          </div>
                        </td>

                        <td style={s.td}>
                          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                            <button
                              style={s.btnTiny}
                              onClick={(e) => {
                                e.stopPropagation();
                                prepararEditar(item);
                              }}
                            >
                              ✏️ Editar
                            </button>
                            <button
                              style={s.btnTinyDanger}
                              onClick={(e) => {
                                e.stopPropagation();
                                solicitarEliminar(item);
                              }}
                            >
                              🗑️ Eliminar
                            </button>
                            <button
                              style={s.btnTinySuccess}
                              onClick={(e) => {
                                e.stopPropagation();
                                abrirChat(item);
                              }}
                            >
                              💬 Chatear
                            </button>
                          </div>
                        </td>
                      </tr>

                      {expandido === item._id && (
                        <>
                          <tr>
                            <td colSpan="7" style={s.detailsCell}>
                              <div style={s.detailsGrid}>
                                <div style={s.detailItem}>
                                  <div style={s.detailLabel}>Nombre completo</div>
                                  <div style={s.detailValue}>
                                    {item.nombre} {item.apellido}
                                  </div>
                                </div>
                                <div style={s.detailItem}>
                                  <div style={s.detailLabel}>Email</div>
                                  <div style={s.detailValue}>{item.email}</div>
                                </div>
                                <div style={s.detailItem}>
                                  <div style={s.detailLabel}>Teléfono</div>
                                  <div style={s.detailValue}>{item.telefono || "N/A"}</div>
                                </div>
                                <div style={s.detailItem}>
                                  <div style={s.detailLabel}>Creado</div>
                                  <div style={s.detailValue}>
                                    {item.createdAt ? new Date(item.createdAt).toLocaleString() : "—"}
                                  </div>
                                </div>
                                <div style={s.detailItem}>
                                  <div style={s.detailLabel}>Actualizado</div>
                                  <div style={s.detailValue}>
                                    {item.updatedAt ? new Date(item.updatedAt).toLocaleString() : "—"}
                                  </div>
                                </div>
                              </div>
                            </td>
                          </tr>

                          {tipo === "emprendedor" && (
                            <tr>
                              <td
                                colSpan="7"
                                style={{
                                  padding: bp.isXS ? 12 : 16,
                                  backgroundColor: "#fafcff",
                                  borderTop: "1px solid #e6eef8",
                                }}
                              >
                                {/* Filtros de fecha */}
                                <div style={s.filtersRow}>
                                  <div style={{ fontWeight: 600 }}>Filtrar por fecha</div>
                                  <div style={s.filtersGroup}>
                                    <label style={s.labelInline}>
                                      Desde
                                      <input
                                        type="date"
                                        value={rangoFechas.from}
                                        onChange={(e) =>
                                          setRangoFechas((st) => ({ ...st, from: e.target.value }))
                                        }
                                        style={s.inputInline}
                                      />
                                    </label>
                                    <label style={s.labelInline}>
                                      Hasta
                                      <input
                                        type="date"
                                        value={rangoFechas.to}
                                        onChange={(e) =>
                                          setRangoFechas((st) => ({ ...st, to: e.target.value }))
                                        }
                                        style={s.inputInline}
                                      />
                                    </label>
                                    <button
                                      style={s.btnTiny}
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        const emp = lista.find((x) => x._id === expandido);
                                        if (emp) cargarNestedParaEmprendedor(emp);
                                      }}
                                    >
                                      Aplicar
                                    </button>
                                    <button
                                      style={s.btnTiny}
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setRangoFechas({ from: "", to: "" });
                                      }}
                                    >
                                      Limpiar
                                    </button>
                                  </div>
                                </div>

                                {/* Emprendimientos */}
                                <div style={{ marginBottom: 18 }}>
                                  <div style={s.sectionHeader}>
                                    <h4 style={s.sectionTitle}>Emprendimientos</h4>
                                    <div style={{ display: "flex", gap: 8 }}>
                                      <button
                                        style={s.btnTiny}
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          const emps = mapEmpEmprendimientos[item._id] || [];
                                          exportCSV(
                                            emps.map((e) => ({
                                              nombreComercial: e.nombreComercial || "",
                                              ciudad: e?.ubicacion?.ciudad || "",
                                              creado: e.createdAt
                                                ? new Date(e.createdAt).toLocaleString()
                                                : "",
                                            })),
                                            `emprendimientos_${item.nombre}_${item.apellido}`
                                          );
                                        }}
                                      >
                                        Exportar CSV
                                      </button>
                                      <button
                                        style={s.btnTiny}
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          const emps = mapEmpEmprendimientos[item._id] || [];
                                          exportPDF(
                                            `Emprendimientos de ${item.nombre} ${item.apellido}`,
                                            emps,
                                            mapperEmprendimientos
                                          );
                                        }}
                                      >
                                        Exportar PDF
                                      </button>
                                    </div>
                                  </div>

                                  {loadingNested ? (
                                    <div style={s.emptyCell}>Cargando emprendimientos…</div>
                                  ) : (
                                    <table style={{ ...s.table, marginTop: 8 }}>
                                      <thead>
                                        <tr>
                                          <th style={s.th}>Nombre Comercial</th>
                                          <th style={s.th}>Ciudad</th>
                                          <th style={s.th}>Creado</th>
                                        </tr>
                                      </thead>
                                      <tbody>
                                        {(mapEmpEmprendimientos[item._id] || []).length === 0 ? (
                                          <tr>
                                            <td colSpan="3" style={s.emptyCell}>
                                              Sin emprendimientos en el rango.
                                            </td>
                                          </tr>
                                        ) : (
                                          (mapEmpEmprendimientos[item._id] || []).map((e) => (
                                            <tr key={e._id}>
                                              <td style={s.td}>{e.nombreComercial}</td>
                                              <td style={s.td}>{e?.ubicacion?.ciudad || "—"}</td>
                                              <td style={s.td}>
                                                {e.createdAt ? new Date(e.createdAt).toLocaleString() : "—"}
                                              </td>
                                            </tr>
                                          ))
                                        )}
                                      </tbody>
                                    </table>
                                  )}
                                </div>

                                {/* Productos */}
                                <div>
                                  <div style={s.sectionHeader}>
                                    <h4 style={s.sectionTitle}>Productos</h4>
                                    <div style={{ display: "flex", gap: 8 }}>
                                      <button
                                        style={s.btnTiny}
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          const prods = mapEmpProductos[item._id] || [];
                                          exportCSV(
                                            prods.map((p) => ({
                                              producto: p.nombre || "",
                                              precio: typeof p.precio === "number" ? p.precio : "",
                                              stock: p.stock ?? "",
                                              emprendimiento:
                                                p.empNombreComercial ||
                                                p?.emprendimiento?.nombreComercial ||
                                                "",
                                              creado: p.createdAt
                                                ? new Date(p.createdAt).toLocaleString()
                                                : "",
                                            })),
                                            `productos_${item.nombre}_${item.apellido}`
                                          );
                                        }}
                                      >
                                        Exportar CSV
                                      </button>
                                      <button
                                        style={s.btnTiny}
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          const prods = mapEmpProductos[item._id] || [];
                                          exportPDF(
                                            `Productos de ${item.nombre} ${item.apellido}`,
                                            prods,
                                            mapperProductos
                                          );
                                        }}
                                      >
                                        Exportar PDF
                                      </button>
                                    </div>
                                  </div>

                                  {loadingNested ? (
                                    <div style={s.emptyCell}>Cargando productos…</div>
                                  ) : (
                                    <table style={{ ...s.table, marginTop: 8 }}>
                                      <thead>
                                        <tr>
                                          <th style={s.th}>Producto</th>
                                          <th style={s.th}>Precio</th>
                                          <th style={s.th}>Stock</th>
                                          <th style={s.th}>Emprendimiento</th>
                                          <th style={s.th}>Creado</th>
                                        </tr>
                                      </thead>
                                      <tbody>
                                        {(mapEmpProductos[item._id] || []).length === 0 ? (
                                          <tr>
                                            <td colSpan="5" style={s.emptyCell}>
                                              Sin productos en el rango.
                                            </td>
                                          </tr>
                                        ) : (
                                          (mapEmpProductos[item._id] || []).map((p) => (
                                            <tr key={p._id}>
                                              <td style={s.td}>{p.nombre}</td>
                                              <td style={s.td}>
                                                {typeof p.precio === "number" ? fmtUSD.format(p.precio) : "—"}
                                              </td>
                                              <td style={s.td}>{p.stock ?? "—"}</td>
                                              <td style={s.td}>
                                                {p.empNombreComercial || p?.emprendimiento?.nombreComercial || "—"}
                                              </td>
                                              <td style={s.td}>
                                                {p.createdAt ? new Date(p.createdAt).toLocaleString() : "—"}
                                              </td>
                                            </tr>
                                          ))
                                        )}
                                      </tbody>
                                    </table>
                                  )}
                                </div>
                              </td>
                            </tr>
                          )}
                        </>
                      )}
                    </React.Fragment>
                  ))}
              </tbody>
            </table>
          </div>
        )}

        {/* ===== PAGINACIÓN ===== */}
        <div
          style={{
            display: "flex",
            justifyContent: bp.isMD ? "center" : "space-between",
            alignItems: "center",
            marginTop: 12,
            gap: 10,
            flexWrap: "wrap",
          }}
        >
          <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
            <button
              style={s.btnSecondary}
              onClick={() => {
                setPage(1);
              }}
              disabled={page === 1}
            >
              ⏮ Inicio
            </button>
            <button style={s.btnSecondary} onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}>
              ← Anterior
            </button>
            <span style={{ color: "#64748b", fontSize: bp.isXS ? 12 : 14 }}>
              Página {page} de {totalPages}
            </span>
            <button
              style={s.btnSecondary}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
            >
              Siguiente →
            </button>
            <button
              style={s.btnSecondary}
              onClick={() => {
                setPage(totalPages);
              }}
              disabled={page === totalPages}
            >
              Fin ⏭
            </button>
          </div>

          <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
            <label style={{ color: "#475569", fontWeight: 600 }}>Filas por página</label>
            <select
              value={pageSize}
              onChange={(e) => setPageSize(Number(e.target.value))}
              style={{ padding: "6px 8px", borderRadius: 8, border: "1px solid #cbd5e1" }}
            >
              {PAGE_SIZE_OPTIONS.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          </div>
        </div>
      </section>

      {/* ====== MODAL: CAMBIO DE ESTADO CLIENTE (con motivo) ====== */}
      {estadoModal.visible && tipo === "cliente" && (
        <div style={s.modalOverlay} onKeyDown={(e) => e.key === "Escape" && closeEstadoModal()}>
          <div style={s.modal} role="dialog" aria-modal="true" aria-label="Confirmar cambio de estado">
            <div style={s.modalHeader}>
              <h3 style={{ margin: 0 }}>Cambiar estado a {estadoModal.nuevoEstado}</h3>
              <button style={s.btnClose} onClick={closeEstadoModal}>
                Cerrar
              </button>
            </div>

            <div style={s.modalBody}>
              <div style={{ marginBottom: 10 }}>
                <label style={{ fontWeight: 600, fontSize: 14, color: "#374151" }}>
                  Motivo <span style={{ color: "#dc2626" }}>*</span>
                </label>
                <textarea
                  rows={4}
                  value={estadoModal.motivo}
                  onChange={(e) => setEstadoModal((st) => ({ ...st, motivo: e.target.value }))}
                  placeholder="Describe brevemente el motivo…"
                  style={{
                    width: "100%",
                    marginTop: 6,
                    padding: 10,
                    borderRadius: 8,
                    border: "1px solid #cbd5e1",
                    resize: "vertical",
                  }}
                />
              </div>

              {estadoModal.nuevoEstado === "Suspendido" && (
                <div>
                  <label style={{ fontWeight: 600, fontSize: 14, color: "#374151" }}>
                    Suspensión hasta (opcional)
                  </label>
                  <input
                    type="datetime-local"
                    value={estadoModal.suspendidoHasta}
                    onChange={(e) => setEstadoModal((st) => ({ ...st, suspendidoHasta: e.target.value }))}
                    style={{
                      width: "100%",
                      marginTop: 6,
                      padding: 10,
                      borderRadius: 8,
                      border: "1px solid #cbd5e1",
                    }}
                  />
                  <small style={{ color: "#6b7280" }}>
                    Si lo dejas vacío, la suspensión será indefinida hasta reactivación manual.
                  </small>
                </div>
              )}
            </div>

            <div style={s.modalFooter}>
              <button style={s.btnSecondary} onClick={closeEstadoModal}>
                Cancelar
              </button>
              <button style={s.btnPrimary} onClick={updateEstadoClienteConfirmed}>
                Confirmar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ====== MODAL CONFIRM ELIMINACIÓN ====== */}
      {confirmDelete.visible && (
        <div style={s.modalOverlay}>
          <div style={s.modal} role="dialog" aria-modal="true" aria-label="Confirmar eliminación">
            <div style={s.modalHeader}>
              <h3 style={{ margin: 0 }}>Confirmar eliminación</h3>
              <button style={s.btnClose} onClick={cancelarEliminar}>
                Cerrar
              </button>
            </div>
            <div style={s.modalBody}>
              <p style={{ marginTop: 0 }}>
                ¿Eliminar {capitalize(tipo)} <strong>{confirmDelete.nombre}</strong>? Esta acción no se puede deshacer.
              </p>
            </div>
            <div style={s.modalFooter}>
              <button style={s.btnSecondary} onClick={cancelarEliminar}>
                Cancelar
              </button>
              <button style={s.btnDanger} onClick={confirmarEliminar}>
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Table;
