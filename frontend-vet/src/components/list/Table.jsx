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
   COMPONENTE
=========================== */
const Table = () => {
  /* --------- Contexto Auth --------- */
  const { id: emisorId, rol: emisorRol, token } = storeAuth() || {};

  /* --------- Estado principal --------- */
  const [tipo, setTipo] = useState("cliente"); // 'cliente' | 'emprendedor'
  const [lista, setLista] = useState([]);
  const [loadingLista, setLoadingLista] = useState(false);

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
    const e = item.estado_Emprendedor;
    if (e === "Activo") return "Correcto";
    if (["Advertencia1", "Advertencia2", "Advertencia3", "Suspendido"].includes(e)) return e;
    return "Correcto";
  };

  /* ===========================
     CARGA DE LISTAS
  ============================ */
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
  }, [tipo]);

  /* ===========================
     CRUD: CREAR / EDITAR / ELIMINAR
  ============================ */
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
  ============================ */

  const getEstado = (item) =>
    tipo === "emprendedor"
      ? item.estado || item.estado_Emprendedor || "Activo"
      : item.estado_Cliente ?? item.estado ?? deriveEstadoCliente(item);

  const getEstadosPermitidos = () =>
    tipo === "emprendedor" ? ESTADOS_EMPRENDEDOR : ESTADOS_CLIENTE;

  // --- Modal cambio de estado (Cliente) ---
  const [estadoModal, setEstadoModal] = useState({
    visible: false,
    item: null,
    nuevoEstado: null,
    motivo: "",
    suspendidoHasta: ""
  });

  // ---------- NUEVO: cambio DIRECTO para clientes (igual que emprendedor) ----------
  const updateEstadoClienteDirect = async (item, nuevoEstado) => {
    try {
      setMensaje("");
      setError("");

      if (!ESTADOS_CLIENTE.includes(nuevoEstado)) {
        setError("Estado inválido para cliente.");
        return;
      }

      const urlEstado = `${BASE_URLS["cliente"]}/estado/${item._id}`;
      // payload mínimo: solo estado (backend ahora acepta sin motivo)
      const payload = { estado: nuevoEstado };

      let res = await fetch(urlEstado, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(payload),
      });

      // Si el endpoint dedicado falla (por permisos o versiones), fallback al actualizar/:id
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

  // Abre modal solo para cliente si quisieras (ahora NO lo usamos; cambio directo)
  const openEstadoModal = (item, nuevoEstado) => {
    if (tipo === "cliente") {
      // Cambio DIRECTO: no abrimos modal, llamamos al endpoint igual que en Emprendedor
      updateEstadoClienteDirect(item, nuevoEstado);
    } else {
      // Emprendedor: comportamiento previo (sin motivo)
      updateEstadoEmprendedor(item, nuevoEstado);
    }
  };

  const closeEstadoModal = () => setEstadoModal({
    visible: false, item: null, nuevoEstado: null, motivo: "", suspendidoHasta: ""
  });

  // (Dejo la función original por compatibilidad si necesitas aplicar advertencias manuales con motivo)
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
          : {})
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
  ============================ */
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
            : (!!ts &&
               (!from || ts >= new Date(from).getTime()) &&
               (!to || ts <= new Date(to).getTime()));
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
            : (!!ts &&
               (!from || ts >= new Date(from).getTime()) &&
               (!to || ts <= new Date(to).getTime()));
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
    r?.header
      ? ["Nombre Comercial", "Ciudad", "Creado"]
      : [
          r.nombreComercial || "",
          r.ubicacion?.ciudad || "",
          r.createdAt ? new Date(r.createdAt).toLocaleString() : "",
        ];

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
        ? dataConv.find((conv) =>
            conv.participantes?.some((p) => p.id && p.id._id === receptorId)
          )
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
     RENDER
  ============================ */
  return (
    <div style={styles.container}>
      {/* ====== ENCABEZADO ====== */}
      <header style={styles.header}>
        <div>
          <h1 style={styles.title}>Panel de Administración</h1>
          <div style={styles.subTitle}>
            {capitalize(tipo)}s • {loadingLista ? "Cargando…" : `${listaFiltrada.length} resultados`}
          </div>
        </div>

        <div style={styles.actionsBar}>
          <div role="group" aria-label="Seleccionar tipo" style={styles.segmented}>
            <button
              style={tipo === "cliente" ? styles.segmentedActive : styles.segmentedBtn}
              onClick={() => setTipo("cliente")}
            >
              Clientes
            </button>
            <button
              style={tipo === "emprendedor" ? styles.segmentedActive : styles.segmentedBtn}
              onClick={() => setTipo("emprendedor")}
            >
              Emprendedores
            </button>
          </div>

          <div style={styles.searchBox}>
            <input
              aria-label="Buscar en el listado"
              type="search"
              placeholder={`Buscar ${capitalize(tipo)} por nombre, apellido, email o teléfono…`}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={styles.searchInput}
            />
            <button style={styles.refreshBtn} onClick={fetchLista}>↻ Actualizar</button>
          </div>
        </div>
      </header>

      {/* Mensajes */}
      <div style={styles.toastRegion} aria-live="polite" aria-atomic="true">
        {error && <div style={{ ...styles.toast, backgroundColor: "#ffe8e6", color: "#a33" }}>⚠️ {error}</div>}
        {mensaje && <div style={{ ...styles.toast, backgroundColor: "#e7f9ed", color: "#1e7e34" }}>✅ {mensaje}</div>}
      </div>

      {/* ====== FORM: CREAR ====== */}
      <section style={styles.card} aria-label="Crear">
        <div style={styles.cardHeader}>
          <h2 style={styles.cardTitle}>Crear {capitalize(tipo)}</h2>
        </div>
        <form onSubmit={handleCrear}>
          <div style={styles.grid2}>
            <div style={styles.formGroup}>
              <label style={styles.label}>Nombre</label>
              <input
                style={styles.input}
                placeholder="Ej. Ana"
                value={formCrear.nombre}
                onChange={(e) => setFormCrear({ ...formCrear, nombre: e.target.value })}
                required
              />
            </div>
            <div style={styles.formGroup}>
              <label style={styles.label}>Apellido</label>
              <input
                style={styles.input}
                placeholder="Ej. Pérez"
                value={formCrear.apellido}
                onChange={(e) => setFormCrear({ ...formCrear, apellido: e.target.value })}
                required
              />
            </div>
            <div style={styles.formGroup}>
              <label style={styles.label}>Email</label>
              <input
                style={styles.input}
                type="email"
                placeholder="nombre@dominio.com"
                value={formCrear.email}
                onChange={(e) => setFormCrear({ ...formCrear, email: e.target.value })}
                required
              />
            </div>
            <div style={styles.formGroup}>
              <label style={styles.label}>Password</label>
              <input
                style={styles.input}
                type="password"
                placeholder="••••••••"
                value={formCrear.password}
                onChange={(e) => setFormCrear({ ...formCrear, password: e.target.value })}
                required
              />
            </div>
            <div style={styles.formGroup}>
              <label style={styles.label}>Teléfono</label>
              <input
                style={styles.input}
                placeholder="Ej. 0999999999"
                value={formCrear.telefono}
                onChange={(e) => setFormCrear({ ...formCrear, telefono: e.target.value })}
              />
            </div>
          </div>

          <div style={styles.cardFooter}>
            <button style={styles.btnPrimary} type="submit">Crear</button>
            <button
              style={styles.btnGhost}
              type="button"
              onClick={() => setFormCrear(emptyForm)}
              title="Limpiar formulario"
            >
              Limpiar
            </button>
          </div>
        </form>
      </section>

      {/* ====== FORM: EDITAR ====== */}
      {formEditar.id && (
        <section style={styles.card} aria-label="Editar">
          <div style={styles.cardHeader}>
            <h2 style={styles.cardTitle}>Editar {capitalize(tipo)}</h2>
          </div>
          <form onSubmit={handleActualizar}>
            <div style={styles.grid2}>
              <div style={styles.formGroup}>
                <label style={styles.label}>Nombre</label>
                <input
                  style={styles.input}
                  value={formEditar.nombre}
                  onChange={(e) => setFormEditar({ ...formEditar, nombre: e.target.value })}
                  required
                />
              </div>
              <div style={styles.formGroup}>
                <label style={styles.label}>Apellido</label>
                <input
                  style={styles.input}
                  value={formEditar.apellido}
                  onChange={(e) => setFormEditar({ ...formEditar, apellido: e.target.value })}
                  required
                />
              </div>
              <div style={styles.formGroup}>
                <label style={styles.label}>Email</label>
                <input
                  style={styles.input}
                  type="email"
                  value={formEditar.email}
                  onChange={(e) => setFormEditar({ ...formEditar, email: e.target.value })}
                  required
                />
              </div>
              <div style={styles.formGroup}>
                <label style={styles.label}>Password (opcional)</label>
                <input
                  style={styles.input}
                  type="password"
                  value={formEditar.password}
                  onChange={(e) => setFormEditar({ ...formEditar, password: e.target.value })}
                />
              </div>
              <div style={styles.formGroup}>
                <label style={styles.label}>Teléfono</label>
                <input
                  style={styles.input}
                  value={formEditar.telefono}
                  onChange={(e) => setFormEditar({ ...formEditar, telefono: e.target.value })}
                />
              </div>
            </div>

            <div style={styles.cardFooter}>
              <button style={styles.btnPrimary} type="submit">Actualizar</button>
              <button
                style={styles.btnSecondary}
                type="button"
                onClick={() => setFormEditar({ id: null, ...emptyForm })}
              >
                Cancelar
              </button>
            </div>
          </form>
        </section>
      )}

      {/* ====== TABLA PRINCIPAL ====== */}
      <section aria-label="Listado principal" style={styles.card}>
        <div style={styles.cardHeader}>
          <h2 style={styles.cardTitle}>Listado de {capitalize(tipo)}s</h2>
        </div>

        <div style={{ overflowX: "auto" }}>
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>#</th>
                <th style={styles.th}>Nombre</th>
                <th style={styles.th}>Apellido</th>
                <th style={styles.th}>Email</th>
                <th style={styles.th}>Teléfono</th>
                <th style={styles.th}>Estado</th>
                <th style={styles.th}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {loadingLista && (
                <tr>
                  <td colSpan="7" style={styles.emptyCell}>Cargando datos…</td>
                </tr>
              )}

              {!loadingLista && listaFiltrada.length === 0 && (
                <tr>
                  <td colSpan="7" style={styles.emptyCell}>
                    <div style={{ fontSize: 24 }}>🗂️</div>
                    <div style={{ color: "#666" }}>No hay {capitalize(tipo)}s para mostrar.</div>
                  </td>
                </tr>
              )}

              {!loadingLista &&
                listaFiltrada.map((item, i) => (
                  <React.Fragment key={item._id}>
                    <tr
                      style={{
                        backgroundColor: expandido === item._id ? "#f5faff" : "white",
                        cursor: "pointer",
                      }}
                      onClick={() => toggleExpandido(item._id, item)}
                      aria-expanded={expandido === item._id}
                    >
                      <td style={styles.td}>{i + 1}</td>
                      <td style={styles.td}>
                        <span style={{ fontWeight: 600 }}>{item.nombre}</span>
                        <EstadoBadge estado={getEstado(item)} />
                      </td>
                      <td style={styles.td}>{item.apellido}</td>
                      <td style={styles.td}>{item.email}</td>
                      <td style={styles.td}>{item.telefono || "N/A"}</td>

                      {/* ESTADO editable inline */}
                      <td style={styles.td}>
                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                          <select
                            aria-label="Cambiar estado/advertencia"
                            value={getEstado(item)}
                            onChange={(e) => { e.stopPropagation(); openEstadoModal(item, e.target.value); }}
                            style={styles.select}
                            onClick={(e) => e.stopPropagation()}
                          >
                            {getEstadosPermitidos().map((opt) => (
                              <option key={opt} value={opt}>{opt}</option>
                            ))}
                          </select>
                          <EstadoBadge estado={getEstado(item)} />
                        </div>
                      </td>

                      {/* ACCIONES */}
                      <td style={styles.td}>
                        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                          <button
                            style={styles.btnTiny}
                            onClick={(e) => {
                              e.stopPropagation();
                              prepararEditar(item);
                            }}
                          >
                            ✏️ Editar
                          </button>
                          <button
                            style={styles.btnTinyDanger}
                            onClick={(e) => {
                              e.stopPropagation();
                              solicitarEliminar(item);
                            }}
                          >
                            🗑️ Eliminar
                          </button>
                          <button
                            style={styles.btnTinySuccess}
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

                    {/* DETALLES */}
                    {expandido === item._id && (
                      <>
                        <tr>
                          <td colSpan="7" style={styles.detailsCell}>
                            <div style={styles.detailsGrid}>
                              <div style={styles.detailItem}>
                                <div style={styles.detailLabel}>Nombre completo</div>
                                <div style={styles.detailValue}>{item.nombre} {item.apellido}</div>
                              </div>
                              <div style={styles.detailItem}>
                                <div style={styles.detailLabel}>Email</div>
                                <div style={styles.detailValue}>{item.email}</div>
                              </div>
                              <div style={styles.detailItem}>
                                <div style={styles.detailLabel}>Teléfono</div>
                                <div style={styles.detailValue}>{item.telefono || "N/A"}</div>
                              </div>
                              <div style={styles.detailItem}>
                                <div style={styles.detailLabel}>Creado</div>
                                <div style={styles.detailValue}>{item.createdAt ? new Date(item.createdAt).toLocaleString() : "—"}</div>
                              </div>
                              <div style={styles.detailItem}>
                                <div style={styles.detailLabel}>Actualizado</div>
                                <div style={styles.detailValue}>{item.updatedAt ? new Date(item.updatedAt).toLocaleString() : "—"}</div>
                              </div>
                            </div>
                          </td>
                        </tr>

                        {tipo === "emprendedor" && (
                          <tr>
                            <td colSpan="7" style={{ padding: 16, backgroundColor: "#fafcff", borderTop: "1px solid #e6eef8" }}>
                              {/* Filtros de fecha */}
                              <div style={styles.filtersRow}>
                                <div style={{ fontWeight: 600 }}>Filtrar por fecha</div>
                                <div style={styles.filtersGroup}>
                                  <label style={styles.labelInline}>
                                    Desde
                                    <input
                                      type="date"
                                      value={rangoFechas.from}
                                      onChange={(e) => setRangoFechas((s) => ({ ...s, from: e.target.value }))}
                                      style={styles.inputInline}
                                    />
                                  </label>
                                  <label style={styles.labelInline}>
                                    Hasta
                                    <input
                                      type="date"
                                      value={rangoFechas.to}
                                      onChange={(e) => setRangoFechas((s) => ({ ...s, to: e.target.value }))}
                                      style={styles.inputInline}
                                    />
                                  </label>
                                  <button
                                    style={styles.btnTiny}
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      const emp = lista.find((x) => x._id === expandido);
                                      if (emp) cargarNestedParaEmprendedor(emp);
                                    }}
                                  >
                                    Aplicar
                                  </button>
                                  <button
                                    style={styles.btnTiny}
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
                                <div style={styles.sectionHeader}>
                                  <h4 style={styles.sectionTitle}>Emprendimientos</h4>
                                  <div style={{ display: "flex", gap: 8 }}>
                                    <button
                                      style={styles.btnTiny}
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
                                      style={styles.btnTiny}
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
                                  <div style={styles.emptyCell}>Cargando emprendimientos…</div>
                                ) : (
                                  <table style={{ ...styles.table, marginTop: 8 }}>
                                    <thead>
                                      <tr>
                                        <th style={styles.th}>Nombre Comercial</th>
                                        <th style={styles.th}>Ciudad</th>
                                        <th style={styles.th}>Creado</th>
                                      </tr>
                                    </thead>
                                    <tbody>
                                      {(mapEmpEmprendimientos[item._id] || []).length === 0 ? (
                                        <tr><td colSpan="3" style={styles.emptyCell}>Sin emprendimientos en el rango.</td></tr>
                                      ) : (
                                        (mapEmpEmprendimientos[item._id] || []).map((e) => (
                                          <tr key={e._id}>
                                            <td style={styles.td}>{e.nombreComercial}</td>
                                            <td style={styles.td}>{e?.ubicacion?.ciudad || "—"}</td>
                                            <td style={styles.td}>{e.createdAt ? new Date(e.createdAt).toLocaleString() : "—"}</td>
                                          </tr>
                                        ))
                                      )}
                                    </tbody>
                                  </table>
                                )}
                              </div>

                              {/* Productos */}
                              <div>
                                <div style={styles.sectionHeader}>
                                  <h4 style={styles.sectionTitle}>Productos</h4>
                                  <div style={{ display: "flex", gap: 8 }}>
                                    <button
                                      style={styles.btnTiny}
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        const prods = mapEmpProductos[item._id] || [];
                                        exportCSV(
                                          prods.map((p) => ({
                                            producto: p.nombre || "",
                                            precio: typeof p.precio === "number" ? p.precio : "",
                                            stock: p.stock ?? "",
                                            emprendimiento: p.empNombreComercial || p?.emprendimiento?.nombreComercial || "",
                                            creado: p.createdAt ? new Date(p.createdAt).toLocaleString() : "",
                                          })),
                                          `productos_${item.nombre}_${item.apellido}`
                                        );
                                      }}
                                    >
                                      Exportar CSV
                                    </button>
                                    <button
                                      style={styles.btnTiny}
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
                                  <div style={styles.emptyCell}>Cargando productos…</div>
                                ) : (
                                  <table style={{ ...styles.table, marginTop: 8 }}>
                                    <thead>
                                      <tr>
                                        <th style={styles.th}>Producto</th>
                                        <th style={styles.th}>Precio</th>
                                        <th style={styles.th}>Stock</th>
                                        <th style={styles.th}>Emprendimiento</th>
                                        <th style={styles.th}>Creado</th>
                                      </tr>
                                    </thead>
                                    <tbody>
                                      {(mapEmpProductos[item._id] || []).length === 0 ? (
                                        <tr><td colSpan="5" style={styles.emptyCell}>Sin productos en el rango.</td></tr>
                                      ) : (
                                        (mapEmpProductos[item._id] || []).map((p) => (
                                          <tr key={p._id}>
                                            <td style={styles.td}>{p.nombre}</td>
                                            <td style={styles.td}>
                                              {typeof p.precio === "number" ? fmtUSD.format(p.precio) : "—"}
                                            </td>
                                            <td style={styles.td}>{p.stock ?? "—"}</td>
                                            <td style={styles.td}>
                                              {p.empNombreComercial || p?.emprendimiento?.nombreComercial || "—"}
                                            </td>
                                            <td style={styles.td}>
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
      </section>

      {/* ====== MODAL: CAMBIO DE ESTADO CLIENTE (motivo, suspendidoHasta) ======
          Nota: lo dejo en el código por compatibilidad, pero ya no se abre
          porque los cambios de estado para cliente son DIRECTOS (igual que emprendedor).
      */}
      {estadoModal.visible && tipo === "cliente" && (
        <div style={styles.modalOverlay} onKeyDown={(e) => e.key === "Escape" && closeEstadoModal()}>
          <div style={styles.modal} role="dialog" aria-modal="true" aria-label="Confirmar cambio de estado">
            <div style={styles.modalHeader}>
              <h3 style={{ margin: 0 }}>
                Cambiar estado a {estadoModal.nuevoEstado}
              </h3>
              <button style={styles.btnClose} onClick={closeEstadoModal}>Cerrar</button>
            </div>

            <div style={styles.modalBody}>
              <div style={{ marginBottom: 10 }}>
                <label style={{ fontWeight: 600, fontSize: 14, color: "#374151" }}>
                  Motivo <span style={{ color: "#dc2626" }}>*</span>
                </label>
                <textarea
                  rows={4}
                  value={estadoModal.motivo}
                  onChange={(e) => setEstadoModal((s) => ({ ...s, motivo: e.target.value }))}
                  placeholder="Describe brevemente el motivo…"
                  style={{
                    width: "100%",
                    marginTop: 6,
                    padding: 10,
                    borderRadius: 8,
                    border: "1px solid #cbd5e1",
                    resize: "vertical"
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
                    onChange={(e) => setEstadoModal((s) => ({ ...s, suspendidoHasta: e.target.value }))}
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

            <div style={styles.modalFooter}>
              <button style={styles.btnSecondary} onClick={closeEstadoModal}>Cancelar</button>
              <button style={styles.btnPrimary} onClick={updateEstadoClienteConfirmed}>
                Confirmar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ====== MODAL CONFIRM ELIMINACIÓN ====== */}
      {confirmDelete.visible && (
        <div style={styles.modalOverlay}>
          <div style={styles.modal} role="dialog" aria-modal="true" aria-label="Confirmar eliminación">
            <div style={styles.modalHeader}>
              <h3 style={{ margin: 0 }}>Confirmar eliminación</h3>
              <button style={styles.btnClose} onClick={cancelarEliminar}>Cerrar</button>
            </div>
            <div style={styles.modalBody}>
              <p style={{ marginTop: 0 }}>
                ¿Eliminar {capitalize(tipo)} <strong>{confirmDelete.nombre}</strong>? Esta acción no se puede deshacer.
              </p>
            </div>
            <div style={styles.modalFooter}>
              <button style={styles.btnSecondary} onClick={cancelarEliminar}>Cancelar</button>
              <button style={styles.btnDanger} onClick={confirmarEliminar}>Eliminar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

/* ===========================
   ESTILOS
=========================== */
const styles = {
  container: {
    maxWidth: 1080,
    margin: "auto",
    padding: 20,
    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
    color: "#1f2937",
  },
  header: {
    display: "grid",
    gridTemplateColumns: "1fr auto",
    gap: 12,
    alignItems: "center",
    marginBottom: 16,
  },
  title: { margin: 0, fontSize: 24, fontWeight: 800 },
  subTitle: { marginTop: 4, color: "#64748b", fontSize: 13 },
  actionsBar: { display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap", justifyContent: "flex-end" },

  segmented: {
    display: "inline-flex",
    border: "1px solid #cbd5e1",
    borderRadius: 8,
    overflow: "hidden",
    background: "#fff",
  },
  segmentedBtn: {
    padding: "8px 12px",
    backgroundColor: "#fff",
    color: "#334155",
    border: "none",
    cursor: "pointer",
    fontWeight: 600,
  },
  segmentedActive: {
    padding: "8px 12px",
    backgroundColor: "#0ea5e9",
    color: "white",
    border: "none",
    cursor: "pointer",
    fontWeight: 700,
  },

  searchBox: { display: "flex", gap: 8, alignItems: "center" },
  searchInput: {
    width: 280,
    maxWidth: "60vw",
    padding: "8px 10px",
    borderRadius: 8,
    border: "1px solid #cbd5e1",
    outline: "none",
  },
  refreshBtn: {
    padding: "8px 10px",
    borderRadius: 8,
    border: "1px solid #cbd5e1",
    background: "#fff",
    cursor: "pointer",
    fontWeight: 600,
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
    padding: 16,
    border: "1px solid #e2e8f0",
    borderRadius: 12,
    backgroundColor: "#ffffff",
    boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
  },
  cardHeader: { display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 },
  cardTitle: { margin: 0, fontSize: 18, fontWeight: 700 },
  cardFooter: { display: "flex", gap: 8, marginTop: 8 },

  grid2: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 },
  formGroup: { display: "flex", flexDirection: "column", gap: 6 },
  label: { fontSize: 13, color: "#475569", fontWeight: 600 },
  input: {
    width: "100%",
    padding: 10,
    borderRadius: 8,
    border: "1px solid #cbd5e1",
    boxSizing: "border-box",
    outline: "none",
  },

  btnPrimary: {
    padding: "10px 16px",
    backgroundColor: "#0ea5e9",
    color: "white",
    border: "none",
    borderRadius: 8,
    cursor: "pointer",
    fontWeight: 700,
  },
  btnSecondary: {
    padding: "10px 16px",
    backgroundColor: "#64748b",
    color: "white",
    border: "none",
    borderRadius: 8,
    cursor: "pointer",
    fontWeight: 700,
  },
  btnGhost: {
    padding: "10px 16px",
    backgroundColor: "#ffffff",
    color: "#0ea5e9",
    border: "1px solid #0ea5e9",
    borderRadius: 8,
    cursor: "pointer",
    fontWeight: 700,
  },

  table: {
    width: "100%",
    borderCollapse: "collapse",
  },
  th: {
    borderBottom: "2px solid #0ea5e9",
    padding: 10,
    textAlign: "left",
    backgroundColor: "#eaf7ff",
    fontWeight: 700,
    fontSize: 13,
    color: "#1f2937",
    position: "sticky",
    top: 0,
    zIndex: 1,
  },
  td: {
    borderBottom: "1px solid #e5e7eb",
    padding: 10,
    verticalAlign: "top",
    fontSize: 14,
  },

  select: {
    padding: "8px 10px",
    borderRadius: 8,
    border: "1px solid #cbd5e1",
    backgroundColor: "#fff",
  },

  btnTiny: {
    padding: "6px 10px",
    backgroundColor: "#0ea5e9",
    color: "white",
    border: "none",
    borderRadius: 6,
    cursor: "pointer",
    fontSize: 13,
    fontWeight: 700,
  },
  btnTinyDanger: {
    padding: "6px 10px",
    backgroundColor: "#dc3545",
    color: "white",
    border: "none",
    borderRadius: 6,
    cursor: "pointer",
    fontSize: 13,
    fontWeight: 700,
  },
  btnTinySuccess: {
    padding: "6px 10px",
    backgroundColor: "#22c55e",
    color: "white",
    border: "none",
    borderRadius: 6,
    cursor: "pointer",
    fontSize: 13,
    fontWeight: 700,
  },

  emptyCell: {
    textAlign: "center",
    padding: 20,
    color: "#666",
    fontSize: 14,
  },

  detailsCell: {
    padding: 12,
    backgroundColor: "#f7fbff",
    borderTop: "1px solid #e6eef8",
  },
  detailsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
    gap: 12,
  },
  detailItem: {
    padding: 10,
    border: "1px solid #e2e8f0",
    borderRadius: 10,
    background: "#fff",
  },
  detailLabel: { fontSize: 12, color: "#64748b", fontWeight: 600, marginBottom: 4 },
  detailValue: { fontSize: 14, color: "#1f2937" },

  filtersRow: { display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 },
  filtersGroup: { display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" },
  labelInline: { display: "inline-flex", alignItems: "center", gap: 6, fontSize: 13, color: "#475569", fontWeight: 600 },
  inputInline: {
    padding: "6px 8px",
    borderRadius: 8,
    border: "1px solid #cbd5e1",
    backgroundColor: "#fff",
    outline: "none",
  },

  sectionHeader: { display: "flex", justifyContent: "space-between", alignItems: "center" },
  sectionTitle: { margin: 0, color: "#0ea5e9" },

  modalOverlay: {
    position: "fixed",
    top: 0, left: 0, right: 0, bottom: 0,
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
    width: 520,
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
    fontSize: 16,
  },
  btnClose: {
    backgroundColor: "#dc3545",
    border: "none",
    color: "white",
    fontWeight: "bold",
    cursor: "pointer",
    padding: "6px 10px",
    borderRadius: 8,
  },
  modalBody: {
    padding: 16,
    minHeight: 120,
    fontSize: 14,
    color: "#333",
    overflowY: "auto",
  },
  modalFooter: {
    padding: 12,
    borderTop: "1px solid #e5e7eb",
    display: "flex",
    justifyContent: "flex-end",
    gap: 8,
  },
  btnDanger: {
    padding: "10px 16px",
    backgroundColor: "#dc3545",
    color: "white",
    border: "none",
    borderRadius: 8,
    cursor: "pointer",
    fontWeight: 700,
  },
};

export default Table;
