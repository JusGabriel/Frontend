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
  Activo: "#28a745",
  Inactivo: "#6c757d",
  Suspendido: "#dc3545",
  Advertencia1: "#ffc107",
  Advertencia2: "#fd7e14",
  Advertencia3: "#dc3545",
};

/* Estados permitidos (editable si quieres acotarlos) */
const ESTADOS_EMPRENDEDOR = ["Activo", "Advertencia1", "Advertencia2", "Advertencia3", "Suspendido"];
const ESTADOS_CLIENTE = ["Activo", "Inactivo", "Suspendido", "Advertencia1", "Advertencia2", "Advertencia3"];

/* ===========================
   COMPONENTE
=========================== */
const Table = () => {
  /* --------- Contexto Auth --------- */
  const { id: emisorId, rol: emisorRol, token } = storeAuth() || {};

  /* --------- Estado principal --------- */
  const [tipo, setTipo] = useState("cliente"); // 'cliente' | 'emprendedor'
  const [lista, setLista] = useState([]);
  const [formCrear, setFormCrear] = useState(emptyForm);
  const [formEditar, setFormEditar] = useState({ id: null, ...emptyForm });
  const [error, setError] = useState("");
  const [mensaje, setMensaje] = useState("");
  const [expandido, setExpandido] = useState(null);

  /* --------- Chat --------- */
  const [modalChatVisible, setModalChatVisible] = useState(false);
  const [chatUser, setChatUser] = useState(null);
  const [mensajes, setMensajes] = useState([]);
  const [mensajeChat, setMensajeChat] = useState("");
  const mensajesRef = useRef(null);

  /* --------- Sub-filtros por fecha para Emprendedor --------- */
  const [rangoFechas, setRangoFechas] = useState({ from: "", to: "" });
  const [mapEmpEmprendimientos, setMapEmpEmprendimientos] = useState({}); // {emprendedorId: array}
  const [mapEmpProductos, setMapEmpProductos] = useState({});             // {emprendedorId: array}
  const [loadingNested, setLoadingNested] = useState(false);

  /* --------- Catálogos generales (fallback) --------- */
  const [catalogoProductos, setCatalogoProductos] = useState([]);
  const [catalogoEmprendimientos, setCatalogoEmprendimientos] = useState([]);

  /* ===========================
     CARGA DE LISTAS
  ============================ */
  const fetchLista = async () => {
    setError("");
    setMensaje("");
    try {
      const res = await fetch(`${BASE_URLS[tipo]}/todos`, {
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      });
      const data = await res.json();
      setLista(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error(e);
      setError("Error cargando datos");
    }
  };

  // Catálogos para fallback en filtros por fecha (emprendimientos/productos)
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
  }, [tipo]);

  /* ===========================
     CRUD BÁSICO: CREAR/EDITAR/ELIMINAR
  ============================ */
  const handleCrear = async (e) => {
    e.preventDefault();
    setError("");
    setMensaje("");
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
      if (!res.ok) setError(data.msg || "Error al crear");
      else {
        setMensaje(`${capitalize(tipo)} creado`);
        setFormCrear(emptyForm);
        fetchLista();
      }
    } catch {
      setError("Error al crear");
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
  };

  const handleActualizar = async (e) => {
    e.preventDefault();
    setError("");
    setMensaje("");
    const { id, nombre, apellido, email, password, telefono } = formEditar;
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
      if (!res.ok) setError(data.msg || "Error al actualizar");
      else {
        setMensaje(`${capitalize(tipo)} actualizado`);
        setFormEditar({ id: null, ...emptyForm });
        fetchLista();
      }
    } catch {
      setError("Error al actualizar");
    }
  };

  const handleEliminar = async (id) => {
    if (!window.confirm(`¿Eliminar este ${tipo}?`)) return;
    setError("");
    setMensaje("");
    try {
      const res = await fetch(`${BASE_URLS[tipo]}/eliminar/${id}`, {
        method: "DELETE",
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      });
      const data = await res.json();
      if (!res.ok) setError(data.msg || "Error al eliminar");
      else {
        setMensaje(`${capitalize(tipo)} eliminado`);
        fetchLista();
      }
    } catch {
      setError("Error al eliminar");
    }
  };

  /* ===========================
     ESTADO (Cliente/Emprendedor)
  ============================ */
  const getEstado = (item) =>
    tipo === "emprendedor"
      ? item.estado_Emprendedor || "Activo"
      : item.estado_Cliente ?? item.estado ?? "Activo";

  const getEstadosPermitidos = () =>
    tipo === "emprendedor" ? ESTADOS_EMPRENDEDOR : ESTADOS_CLIENTE;

  const updateEstado = async (item, nuevoEstado) => {
    try {
      setMensaje("");
      setError("");

      // 1) Si tienes endpoint dedicado de estado, úsalo:
      //   - Emprendedor: PUT /api/emprendedores/estado/:id  { estado_Emprendedor: nuevoEstado }
      //   - Cliente:     PUT /api/clientes/estado/:id        { estado_Cliente: nuevoEstado }
      // 2) Fallback: reusa actualizar/:id enviando el campo del estado.
      const urlEstado =
        tipo === "emprendedor"
          ? `${BASE_URLS[tipo]}/estado/${item._id}`
          : `${BASE_URLS[tipo]}/estado/${item._id}`;

      const bodyPayload =
        tipo === "emprendedor"
          ? { estado_Emprendedor: nuevoEstado }
          : { estado_Cliente: nuevoEstado, estado: nuevoEstado };

      // Intento #1: endpoint dedicado
      let res = await fetch(urlEstado, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(bodyPayload),
      });

      // Si no existe, intento Fallback actualizar/:id
      if (!res.ok) {
        res = await fetch(`${BASE_URLS[tipo]}/actualizar/${item._id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          body: JSON.stringify(bodyPayload),
        });
      }

      const data = await res.json();
      if (!res.ok) throw new Error(data?.msg || "Error actualizando estado");
      setMensaje(`Estado actualizado a: ${nuevoEstado}`);
      fetchLista();
    } catch (e) {
      console.error(e);
      setError(e.message || "No se pudo actualizar el estado");
    }
  };

  const renderAdvertenciaBadge = (item) => {
    const estado = getEstado(item);
    const bg = ESTADO_COLORS[estado] || "#6c757d";
    return (
      <span
        style={{
          display: "inline-block",
          marginLeft: 8,
          padding: "2px 8px",
          borderRadius: 12,
          fontSize: 12,
          color: "white",
          backgroundColor: bg,
        }}
        title={`Estado/Advertencia: ${estado}`}
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

  // Intenta endpoints específicos; si no, filtra catálogos locales por owner + rango de fechas
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
        return null; // fallback
      }
    };

    // Emprendimientos por emprendedor
    const urlEmps = `${API_EMPRENDIMIENTOS}/by-emprendedor/${emprendedor._id}${from || to ? `?from=${from}&to=${to}` : ""}`;
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

    // Productos por emprendedor
    const urlProds = `${API_PRODUCTOS}/by-emprendedor/${emprendedor._id}${from || to ? `?from=${from}&to=${to}` : ""}`;
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
     EXPORTS
  ============================ */
  const exportCSV = (rows, filename) => {
    if (!Array.isArray(rows) || rows.length === 0) {
      alert("No hay datos para exportar");
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
  };

  const exportPDF = (htmlTitle, rows, mapper) => {
    const win = window.open("", "_blank");
    const now = new Date().toLocaleString();
    const tableRows = rows
      .map((r) => `<tr>${mapper(r).map((cell) => `<td style="padding:8px;border:1px solid #ddd">${cell}</td>`).join("")}</tr>`)
      .join("");
    win.document.write(`
      <html><head><title>${htmlTitle}</title></head>
      <body style="font-family:Segoe UI,Arial,sans-serif">
        <h2>${htmlTitle}</h2>
        <p style="color:#666;font-size:12px">Generado: ${now}</p>
        <table style="border-collapse:collapse;width:100%;font-size:13px">
          <thead>
            <tr style="background:#e9f0ff">
              ${mapper({header:true}).map(h => `<th style="padding:8px;border:1px solid #bbb;text-align:left">${h}</th>`).join("")}
            </tr>
          </thead>
          <tbody>${tableRows}</tbody>
        </table>
      </body></html>
    `);
    win.document.close();
    win.focus();
    win.print();
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
     CHAT (igual que tu versión)
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
      setError("Error cargando mensajes");
    }
  };
  const enviarMensaje = async (e) => {
    e.preventDefault();
    if (!mensajeChat.trim() || !chatUser || !emisorId || !emisorRol) return;
    try {
      const res = await fetch(
        "https://backend-production-bd1d.up.railway.app/api/chat/mensaje",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            emisorId,
            emisorRol,
            receptorId: chatUser.id,
            receptorRol: chatUser.rol,
            contenido: mensajeChat.trim(),
          }),
        }
      );
      const data = await res.json();
      if (res.ok) {
        setMensajeChat("");
        cargarMensajes(chatUser.id);
      } else {
        setError(data.mensaje || "Error enviando mensaje");
      }
    } catch (error) {
      setError("Error de red: " + error.message);
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
     RENDER
  ============================ */
  return (
    <div style={styles.container}>

      {/* ====== TITULO + GUÍA RÁPIDA ====== */}
      <header style={{ marginBottom: 16 }}>
        <h1 style={{ textAlign: "center", margin: 0 }}>Panel de Administración</h1>
        <p style={{ textAlign: "center", color: "#555", marginTop: 6 }}>
          <strong>Guía rápida:</strong> 1) Selecciona arriba <em>Clientes</em> o <em>Emprendedores</em>. 2) Crea/edita/elimina desde los formularios. 3) Haz clic en una fila para ver detalles. En Emprendedores podrás filtrar sus <em>Emprendimientos</em> y <em>Productos</em> por fecha y exportar.
        </p>
      </header>

      {/* ====== TOGGLE CLIENTES / EMPRENDEDORES ====== */}
      <div style={styles.toggleContainer} aria-label="Seleccionar tipo de usuario">
        <button
          style={tipo === "cliente" ? styles.toggleActive : styles.toggle}
          onClick={() => setTipo("cliente")}
          title="Ver Clientes"
        >
          Clientes
        </button>
        <button
          style={tipo === "emprendedor" ? styles.toggleActive : styles.toggle}
          onClick={() => setTipo("emprendedor")}
          title="Ver Emprendedores"
        >
          Emprendedores
        </button>
      </div>

      {/* ====== ESTADOS DE ALERTA ====== */}
      {error && <p style={{ color: "red", textAlign: "center" }}>{error}</p>}
      {mensaje && <p style={{ color: "green", textAlign: "center" }}>{mensaje}</p>}

      {/* ====== FORM: CREAR ====== */}
      <section style={styles.form} aria-label="Crear usuario">
        <h2 style={{ marginTop: 0 }}>Crear {capitalize(tipo)}</h2>
        <p style={{ marginTop: -6, color: "#666" }}>
          Completa los campos y presiona <strong>Crear</strong>. El correo debe ser único.
        </p>

        {/* Inputs */}
        <>
          <input
            style={styles.input}
            placeholder="Nombre"
            value={formCrear.nombre}
            onChange={(e) => setFormCrear({ ...formCrear, nombre: e.target.value })}
            required
          />
          <input
            style={styles.input}
            placeholder="Apellido"
            value={formCrear.apellido}
            onChange={(e) => setFormCrear({ ...formCrear, apellido: e.target.value })}
            required
          />
          <input
            style={styles.input}
            type="email"
            placeholder="Email"
            value={formCrear.email}
            onChange={(e) => setFormCrear({ ...formCrear, email: e.target.value })}
            required
          />
          <input
            style={styles.input}
            type="password"
            placeholder="Password"
            value={formCrear.password}
            onChange={(e) => setFormCrear({ ...formCrear, password: e.target.value })}
            required
          />
          <input
            style={styles.input}
            placeholder="Teléfono"
            value={formCrear.telefono}
            onChange={(e) => setFormCrear({ ...formCrear, telefono: e.target.value })}
          />
        </>
        <button style={styles.btnCrear} type="submit" onClick={handleCrear}>
          Crear
        </button>
      </section>

      {/* ====== FORM: EDITAR ====== */}
      {formEditar.id && (
        <section style={styles.form} aria-label="Editar usuario">
          <h2 style={{ marginTop: 0 }}>Editar {capitalize(tipo)}</h2>
          <p style={{ marginTop: -6, color: "#666" }}>
            Modifica solo los campos necesarios. Para cambiar <strong>estado/advertencia</strong>, usa el selector de la tabla.
          </p>

          <>
            <input
              style={styles.input}
              placeholder="Nombre"
              value={formEditar.nombre}
              onChange={(e) => setFormEditar({ ...formEditar, nombre: e.target.value })}
              required
            />
            <input
              style={styles.input}
              placeholder="Apellido"
              value={formEditar.apellido}
              onChange={(e) => setFormEditar({ ...formEditar, apellido: e.target.value })}
              required
            />
            <input
              style={styles.input}
              type="email"
              placeholder="Email"
              value={formEditar.email}
              onChange={(e) => setFormEditar({ ...formEditar, email: e.target.value })}
              required
            />
            <input
              style={styles.input}
              type="password"
              placeholder="Password (opcional)"
              value={formEditar.password}
              onChange={(e) => setFormEditar({ ...formEditar, password: e.target.value })}
            />
            <input
              style={styles.input}
              placeholder="Teléfono"
              value={formEditar.telefono}
              onChange={(e) => setFormEditar({ ...formEditar, telefono: e.target.value })}
            />
          </>
          <div>
            <button style={styles.btnActualizar} type="submit" onClick={handleActualizar}>
              Actualizar
            </button>
            <button
              style={styles.btnCancelar}
              type="button"
              onClick={() => setFormEditar({ id: null, ...emptyForm })}
            >
              Cancelar
            </button>
          </div>
        </section>
      )}

      {/* ====== TABLA PRINCIPAL ====== */}
      <section aria-label="Listado principal">
        <h2 style={{ margin: "12px 0" }}>Listado de {capitalize(tipo)}s</h2>
        <p style={{ marginTop: -6, color: "#666" }}>
          <strong>Tip:</strong> Haz clic sobre una fila para mostrar los detalles. En <em>Emprendedores</em> verás además sus Emprendimientos y Productos filtrables por fecha y exportables.
        </p>

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
            {lista.length === 0 && (
              <tr>
                <td colSpan="7" style={{ textAlign: "center", padding: 20 }}>
                  No hay {capitalize(tipo)}s
                </td>
              </tr>
            )}

            {lista.map((item, i) => (
              <React.Fragment key={item._id}>
                <tr
                  style={{
                    backgroundColor: expandido === item._id ? "#f0f8ff" : "white",
                    cursor: "pointer",
                  }}
                  onClick={() => toggleExpandido(item._id, item)}
                  title="Clic para ver detalles"
                >
                  <td style={styles.td}>{i + 1}</td>
                  <td style={styles.td}>
                    {item.nombre}
                    {renderAdvertenciaBadge(item)}
                  </td>
                  <td style={styles.td}>{item.apellido}</td>
                  <td style={styles.td}>{item.email}</td>
                  <td style={styles.td}>{item.telefono || "N/A"}</td>

                  {/* ESTADO editable inline */}
                  <td style={styles.td}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <select
                        aria-label="Cambiar estado/advertencia"
                        title="Cambiar estado/advertencia"
                        value={getEstado(item)}
                        onChange={(e) => updateEstado(item, e.target.value)}
                        style={{
                          padding: "6px 8px",
                          borderRadius: 6,
                          border: "1px solid #ccc",
                          backgroundColor: "#fff",
                        }}
                        onClick={(e) => e.stopPropagation()}
                      >
                        {getEstadosPermitidos().map((opt) => (
                          <option key={opt} value={opt}>{opt}</option>
                        ))}
                      </select>
                      {/* Badge actual */}
                      {renderAdvertenciaBadge(item)}
                    </div>
                  </td>

                  {/* ACCIONES */}
                  <td style={styles.td}>
                    <button
                      style={styles.btnSmall}
                      onClick={(e) => {
                        e.stopPropagation();
                        prepararEditar(item);
                      }}
                      title={`Editar ${capitalize(tipo)}`}
                    >
                      Editar
                    </button>{" "}
                    <button
                      style={styles.btnSmallDelete}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEliminar(item._id);
                      }}
                      title={`Eliminar ${capitalize(tipo)}`}
                    >
                      Eliminar
                    </button>{" "}
                    <button
                      style={{
                        ...styles.btnSmall,
                        backgroundColor: "#28a745",
                        padding: "7px 14px",
                        fontWeight: "600",
                        borderRadius: 5,
                        boxShadow: "0 2px 6px rgba(40,167,69,0.4)",
                        transition: "background-color 0.3s ease",
                      }}
                      onClick={(e) => {
                        e.stopPropagation();
                        abrirChat(item);
                      }}
                      onMouseEnter={(e) =>
                        (e.currentTarget.style.backgroundColor = "#218838")
                      }
                      onMouseLeave={(e) =>
                        (e.currentTarget.style.backgroundColor = "#28a745")
                      }
                      title={`Chatear con ${item.nombre}`}
                    >
                      Chatear
                    </button>
                  </td>
                </tr>

                {/* DETALLES BÁSICOS */}
                {expandido === item._id && (
                  <>
                    <tr style={{ backgroundColor: "#eef6ff" }}>
                      <td colSpan="7" style={{ padding: 10 }}>
                        <strong>Detalles:</strong>{" "}
                        <span style={{ color: "#666" }}>
                          Para cerrar, haz clic otra vez sobre la fila.
                        </span>
                        <div>Nombre completo: {item.nombre} {item.apellido}</div>
                        <div>Email: {item.email}</div>
                        <div>Teléfono: {item.telefono || "N/A"}</div>
                        <div>Creado: {item.createdAt ? new Date(item.createdAt).toLocaleString() : "—"}</div>
                        <div>Actualizado: {item.updatedAt ? new Date(item.updatedAt).toLocaleString() : "—"}</div>
                      </td>
                    </tr>

                    {/* PANEL ANIDADO SOLO para EMPRENDEDORES */}
                    {tipo === "emprendedor" && (
                      <tr>
                        <td colSpan="7" style={{ padding: 12, backgroundColor: "#f9fbff" }}>
                          <div style={{ display: "flex", gap: 12, alignItems: "center", marginBottom: 12 }}>
                            <strong>Filtrar por fecha:</strong>
                            <label>
                              Desde{" "}
                              <input
                                type="date"
                                value={rangoFechas.from}
                                onChange={(e) =>
                                  setRangoFechas((s) => ({ ...s, from: e.target.value }))
                                }
                                title="Fecha inicial"
                              />
                            </label>
                            <label>
                              Hasta{" "}
                              <input
                                type="date"
                                value={rangoFechas.to}
                                onChange={(e) =>
                                  setRangoFechas((s) => ({ ...s, to: e.target.value }))
                                }
                                title="Fecha final"
                              />
                            </label>
                            <button
                              style={styles.btnSmall}
                              onClick={(e) => {
                                e.stopPropagation();
                                cargarNestedParaEmprendedor(item);
                              }}
                              title="Aplicar filtro de fechas"
                            >
                              Aplicar filtro
                            </button>
                            <button
                              style={styles.btnSmall}
                              onClick={(e) => {
                                e.stopPropagation();
                                setRangoFechas({ from: "", to: "" });
                              }}
                              title="Limpiar filtro"
                            >
                              Limpiar
                            </button>
                          </div>

                          {/* Emprendimientos */}
                          <div style={{ marginBottom: 18 }}>
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                              <h4 style={{ margin: 0, color: "#007bff" }}>
                                Emprendimientos del emprendedor
                              </h4>
                              <div style={{ display: "flex", gap: 8 }}>
                                <button
                                  style={styles.btnSmall}
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
                                  title="Exportar emprendimientos a CSV"
                                >
                                  Exportar CSV
                                </button>
                                <button
                                  style={styles.btnSmall}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    const emps = mapEmpEmprendimientos[item._id] || [];
                                    exportPDF(
                                      `Emprendimientos de ${item.nombre} ${item.apellido}`,
                                      emps,
                                      mapperEmprendimientos
                                    );
                                  }}
                                  title="Exportar emprendimientos a PDF"
                                >
                                  Exportar PDF
                                </button>
                              </div>
                            </div>

                            {loadingNested ? (
                              <p style={{ color: "#666" }}>Cargando emprendimientos…</p>
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
                                    <tr><td colSpan="3" style={{ padding: 10, textAlign: "center", color: "#666" }}>Sin emprendimientos en el rango</td></tr>
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
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                              <h4 style={{ margin: 0, color: "#007bff" }}>
                                Productos del emprendedor
                              </h4>
                              <div style={{ display: "flex", gap: 8 }}>
                                <button
                                  style={styles.btnSmall}
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
                                  title="Exportar productos a CSV"
                                >
                                  Exportar CSV
                                </button>
                                <button
                                  style={styles.btnSmall}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    const prods = mapEmpProductos[item._id] || [];
                                    exportPDF(
                                      `Productos de ${item.nombre} ${item.apellido}`,
                                      prods,
                                      mapperProductos
                                    );
                                  }}
                                  title="Exportar productos a PDF"
                                >
                                  Exportar PDF
                                </button>
                              </div>
                            </div>

                            {loadingNested ? (
                              <p style={{ color: "#666" }}>Cargando productos…</p>
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
                                    <tr><td colSpan="5" style={{ padding: 10, textAlign: "center", color: "#666" }}>Sin productos en el rango</td></tr>
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
      </section>

      {/* ====== MODAL CHAT ====== */}
      {modalChatVisible && chatUser && (
        <div style={styles.modalOverlay}>
          <div style={styles.modal}>
            <div style={styles.modalHeader}>
              <h3>
                Chat con {chatUser.nombre} ({chatUser.rol})
              </h3>
              <button style={styles.btnCerrar} onClick={cerrarChat}>
                Cerrar
              </button>
            </div>
            <div style={styles.modalBody} ref={mensajesRef}>
              {mensajes.length === 0 && (
                <p style={{ textAlign: "center", color: "#666" }}>
                  No hay mensajes aún
                </p>
              )}
              {mensajes.map((m) => {
                const esEmisor = m.emisorId === emisorId;
                return (
                  <div
                    key={m._id}
                    style={{
                      marginBottom: 10,
                      textAlign: esEmisor ? "right" : "left",
                    }}
                  >
                    <span
                      style={{
                        display: "inline-block",
                        backgroundColor: esEmisor ? "#007bff" : "#e4e6eb",
                        color: esEmisor ? "white" : "black",
                        padding: "8px 12px",
                        borderRadius: 15,
                        maxWidth: "70%",
                        wordWrap: "break-word",
                      }}
                    >
                      {m.contenido}
                    </span>
                    <br />
                    <small style={{ fontSize: 10, color: "#999" }}>
                      {new Date(m.createdAt).toLocaleTimeString()}
                    </small>
                  </div>
                );
              })}
            </div>
            <form style={styles.modalFooter} onSubmit={enviarMensaje}>
              <input
                type="text"
                placeholder="Escribe un mensaje..."
                value={mensajeChat}
                onChange={(e) => setMensajeChat(e.target.value)}
                style={{
                  flexGrow: 1,
                  padding: 8,
                  borderRadius: 5,
                  border: "1px solid #ccc",
                  marginRight: 8,
                  fontSize: 14,
                }}
                autoFocus
              />
              <button
                type="submit"
                style={{
                  backgroundColor: "#007bff",
                  color: "white",
                  border: "none",
                  padding: "8px 16px",
                  borderRadius: 5,
                  fontWeight: "bold",
                  cursor: "pointer",
                }}
              >
                Enviar
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

/* ===========================
   ESTILOS INLINE
=========================== */
const styles = {
  container: {
    maxWidth: 1080,
    margin: "auto",
    padding: 20,
    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
  },
  toggleContainer: {
    display: "flex",
    justifyContent: "center",
    marginBottom: 12,
    gap: 8,
  },
  toggle: {
    backgroundColor: "#ddd",
    border: "none",
    padding: "10px 20px",
    cursor: "pointer",
    fontWeight: "bold",
    borderRadius: 5,
    transition: "background-color 0.3s",
  },
  toggleActive: {
    backgroundColor: "#007bff",
    color: "white",
    border: "none",
    padding: "10px 20px",
    cursor: "pointer",
    fontWeight: "bold",
    borderRadius: 5,
    transition: "background-color 0.3s",
  },
  form: {
    marginBottom: 20,
    padding: 15,
    border: "1px solid #ccc",
    borderRadius: 5,
    backgroundColor: "#f9f9f9",
  },
  input: {
    width: "100%",
    padding: 8,
    marginBottom: 10,
    borderRadius: 4,
    border: "1px solid #ccc",
    boxSizing: "border-box",
  },
  btnCrear: {
    padding: "10px 20px",
    backgroundColor: "#28a745",
    color: "white",
    border: "none",
    borderRadius: 5,
    cursor: "pointer",
    fontWeight: "bold",
  },
  btnActualizar: {
    padding: "10px 20px",
    backgroundColor: "#007bff",
    color: "white",
    border: "none",
    borderRadius: 5,
    cursor: "pointer",
    fontWeight: "bold",
    marginRight: 10,
  },
  btnCancelar: {
    padding: "10px 20px",
    backgroundColor: "#6c757d",
    color: "white",
    border: "none",
    borderRadius: 5,
    cursor: "pointer",
    fontWeight: "bold",
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
  },
  th: {
    borderBottom: "2px solid #007bff",
    padding: 10,
    textAlign: "left",
    backgroundColor: "#e9f0ff",
  },
  td: {
    borderBottom: "1px solid #ddd",
    padding: 10,
    verticalAlign: "top",
  },
  btnSmall: {
    padding: "5px 10px",
    marginRight: 5,
    backgroundColor: "#007bff",
    color: "white",
    border: "none",
    borderRadius: 3,
    cursor: "pointer",
  },
  btnSmallDelete: {
    padding: "5px 10px",
    backgroundColor: "#dc3545",
    color: "white",
    border: "none",
    borderRadius: 3,
    cursor: "pointer",
  },
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
  },
  modal: {
    backgroundColor: "white",
    borderRadius: 10,
    width: 380,
    maxWidth: "95%",
    boxShadow: "0 5px 15px rgba(0,0,0,0.3)",
    display: "flex",
    flexDirection: "column",
    overflow: "hidden",
  },
  modalHeader: {
    padding: "10px 15px",
    backgroundColor: "#007bff",
    color: "white",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    fontWeight: "bold",
    fontSize: 18,
  },
  btnCerrar: {
    backgroundColor: "#dc3545",
    border: "none",
    color: "white",
    fontWeight: "bold",
    cursor: "pointer",
    padding: "5px 10px",
    borderRadius: 5,
  },
  modalBody: {
    padding: 15,
    minHeight: 150,
    fontSize: 14,
    color: "#333",
    overflowY: "auto",
  },
  modalFooter: {
    padding: 10,
    borderTop: "1px solid #ddd",
    display: "flex",
    justifyContent: "flex-end",
  },
};

export default Table;
