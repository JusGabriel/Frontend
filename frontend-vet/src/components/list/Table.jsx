import React, { useEffect, useState, useRef } from "react";
import storeAuth from "../../context/storeAuth";

const BASE_URLS = {
  cliente: "https://backend-production-bd1d.up.railway.app/api/clientes",
  emprendedor: "https://backend-production-bd1d.up.railway.app/api/emprendedores",
};
const API_PRODUCTOS = "https://backend-production-bd1d.up.railway.app/api/productos";
const API_EMPRENDIMIENTOS = "https://backend-production-bd1d.up.railway.app/api/emprendimientos";

const emptyForm = {
  nombre: "",
  apellido: "",
  email: "",
  password: "",
  telefono: "",
};

const Table = () => {
  const [tipo, setTipo] = useState("cliente");
  const [lista, setLista] = useState([]);
  const [formCrear, setFormCrear] = useState(emptyForm);
  const [formEditar, setFormEditar] = useState({ id: null, ...emptyForm });
  const [error, setError] = useState("");
  const [mensaje, setMensaje] = useState("");
  const [expandido, setExpandido] = useState(null);

  // Modal chat y chatUser (receptor)
  const [modalChatVisible, setModalChatVisible] = useState(false);
  const [chatUser, setChatUser] = useState(null);

  // Mensajes y estado de input en el chat
  const [mensajes, setMensajes] = useState([]);
  const [mensajeChat, setMensajeChat] = useState("");
  const mensajesRef = useRef(null);

  // Filtros por fecha (por emprendedor expandido)
  const [rangoFechas, setRangoFechas] = useState({ from: "", to: "" });

  // Datos anidados por emprendedor
  const [mapEmpEmprendimientos, setMapEmpEmprendimientos] = useState({}); // {emprendedorId: array}
  const [mapEmpProductos, setMapEmpProductos] = useState({});             // {emprendedorId: array}
  const [loadingNested, setLoadingNested] = useState(false);

  // Catálogos generales (fallback para filtro local)
  const [catalogoProductos, setCatalogoProductos] = useState([]);
  const [catalogoEmprendimientos, setCatalogoEmprendimientos] = useState([]);

  // Obtener emisor del storeAuth (usuario logueado)
  const { id: emisorId, rol: emisorRol, token } = storeAuth() || {};

  const capitalize = (str) => (str ? str.charAt(0).toUpperCase() + str.slice(1) : "");

  const fmtUSD = new Intl.NumberFormat("es-EC", { style: "currency", currency: "USD" });

  /* ===================== FETCH BASICO (LISTAS) ===================== */
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

  // Catálogos generales para fallback (productos y emprendimientos)
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

  /* ===================== CRUD ===================== */
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

  /* ===================== EXPANDIR FILA Y CARGAR ANIDADOS ===================== */
  const toggleExpandido = async (id, item) => {
    const nuevo = expandido === id ? null : id;
    setExpandido(nuevo);
    if (nuevo && tipo === "emprendedor") {
      await cargarNestedParaEmprendedor(item);
    }
  };

  // Intenta endpoints específicos; si no existen, filtra local con catálogos generales
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
      } catch (e) {
        return null; // fallback
      }
    };

    // 1) Emprendimientos por emprendedor (endpoint sugerido)
    const urlEmps = `${API_EMPRENDIMIENTOS}/by-emprendedor/${emprendedor._id}${from || to ? `?from=${from}&to=${to}` : ""}`;
    let emps = await tryFetch(urlEmps);

    // Fallback: filtra catálogo general
    if (!Array.isArray(emps)) {
      emps = catalogoEmprendimientos.filter((e) => {
        const matchOwner =
          String(e?.emprendedor?._id || e?.emprendedorId || "") === String(emprendedor._id);
        const created = e?.createdAt ? new Date(e.createdAt).getTime() : null;
        const inRange =
          !from && !to
            ? true
            : (!!created &&
               (!from || created >= new Date(from).getTime()) &&
               (!to || created <= new Date(to).getTime()));
        return matchOwner && inRange;
      });
    }

    // 2) Productos por emprendedor (endpoint sugerido vía productos)
    // Nota: productos tienen emprendimiento -> emprendedor
    const urlProds = `${API_PRODUCTOS}/by-emprendedor/${emprendedor._id}${from || to ? `?from=${from}&to=${to}` : ""}`;
    let prods = await tryFetch(urlProds);

    // Fallback: filtra catálogo general por relación emprendimiento.emprendedor
    if (!Array.isArray(prods)) {
      prods = catalogoProductos.filter((p) => {
        const owner =
          String(p?.emprendimiento?.emprendedor?._id || p?.emprendimiento?.emprendedorId || "") ===
          String(emprendedor._id);
        const created = p?.createdAt ? new Date(p.createdAt).getTime() : null;
        const inRange =
          !from && !to
            ? true
            : (!!created &&
               (!from || created >= new Date(from).getTime()) &&
               (!to || created <= new Date(to).getTime()));
        return owner && inRange;
      });
    }

    setMapEmpEmprendimientos((prev) => ({ ...prev, [emprendedor._id]: emps }));
    setMapEmpProductos((prev) => ({ ...prev, [emprendedor._id]: prods }));
    setLoadingNested(false);
  };

  // Refiltra datos anidados cuando cambian las fechas (si hay fila abierta)
  useEffect(() => {
    if (expandido && tipo === "emprendedor") {
      const emp = lista.find((x) => x._id === expandido);
      if (emp) cargarNestedParaEmprendedor(emp);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rangoFechas]);

  /* ===================== EXPORTS ===================== */
  // CSV (Excel friendly)
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

  // PDF (simple: ventana imprimible)
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
    // win.close(); // si prefieres cerrar luego de imprimir
  };

  /* ===================== CHAT ===================== */
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
    const intervalo = setInterval(() => {
      cargarMensajes(chatUser.id);
    }, 3000);
    return () => clearInterval(intervalo);
  }, [modalChatVisible, chatUser]);

  /* ===================== RENDER ===================== */
  const renderAdvertenciaBadge = (item) => {
    // Emprendedor: usa estado_Emprendedor; Cliente: intenta estado o estado_Cliente si existe
    const estado =
      tipo === "emprendedor"
        ? item.estado_Emprendedor
        : (item.estado_Cliente || item.estado || null);

    if (!estado) return null;

    const palette = {
      Activo: "#28a745",
      Inactivo: "#6c757d",
      Suspendido: "#dc3545",
      Advertencia1: "#ffc107",
      Advertencia2: "#fd7e14",
      Advertencia3: "#dc3545",
    };
    const bg = palette[estado] || "#6c757d";

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
        title={`Estado: ${estado}`}
      >
        {estado}
      </span>
    );
  };

  // helpers export mappers
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

  return (
    <div style={styles.container}>
      <h1 style={{ textAlign: "center" }}>Gestión {capitalize(tipo)}s</h1>

      <div style={styles.toggleContainer}>
        <button
          style={tipo === "cliente" ? styles.toggleActive : styles.toggle}
          onClick={() => setTipo("cliente")}
        >
          Clientes
        </button>
        <button
          style={tipo === "emprendedor" ? styles.toggleActive : styles.toggle}
          onClick={() => setTipo("emprendedor")}
        >
          Emprendedores
        </button>
      </div>

      {error && <p style={{ color: "red", textAlign: "center" }}>{error}</p>}
      {mensaje && <p style={{ color: "green", textAlign: "center" }}>{mensaje}</p>}

      {/* Form Crear */}
      <form onSubmit={handleCrear} style={styles.form}>
        <h2>Crear {capitalize(tipo)}</h2>
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
            required={true}
          />
          <input
            style={styles.input}
            placeholder="Teléfono"
            value={formCrear.telefono}
            onChange={(e) => setFormCrear({ ...formCrear, telefono: e.target.value })}
          />
        </>
        <button style={styles.btnCrear} type="submit">
          Crear
        </button>
      </form>

      {/* Form Editar */}
      {formEditar.id && (
        <form onSubmit={handleActualizar} style={styles.form}>
          <h2>Editar {capitalize(tipo)}</h2>
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
              required={false}
            />
            <input
              style={styles.input}
              placeholder="Teléfono"
              value={formEditar.telefono}
              onChange={(e) => setFormEditar({ ...formEditar, telefono: e.target.value })}
            />
          </>
          <button style={styles.btnActualizar} type="submit">
            Actualizar
          </button>
          <button
            style={styles.btnCancelar}
            type="button"
            onClick={() => setFormEditar({ id: null, ...emptyForm })}
          >
            Cancelar
          </button>
        </form>
      )}

      {/* Tabla */}
      <table style={styles.table}>
        <thead>
          <tr>
            <th style={styles.th}>#</th>
            <th style={styles.th}>Nombre</th>
            <th style={styles.th}>Apellido</th>
            <th style={styles.th}>Email</th>
            <th style={styles.th}>Teléfono</th>
            <th style={styles.th}>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {lista.length === 0 && (
            <tr>
              <td colSpan="6" style={{ textAlign: "center", padding: 20 }}>
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
              >
                <td style={styles.td}>{i + 1}</td>
                <td style={styles.td}>
                  {item.nombre}
                  {renderAdvertenciaBadge(item)}
                </td>
                <td style={styles.td}>{item.apellido}</td>
                <td style={styles.td}>{item.email}</td>
                <td style={styles.td}>{item.telefono || "N/A"}</td>
                <td style={styles.td}>
                  <button
                    style={styles.btnSmall}
                    onClick={(e) => {
                      e.stopPropagation();
                      prepararEditar(item);
                    }}
                  >
                    Editar
                  </button>{" "}
                  <button
                    style={styles.btnSmallDelete}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleEliminar(item._id);
                    }}
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
                  >
                    Chatear
                  </button>
                </td>
              </tr>

              {/* Detalles básicos */}
              {expandido === item._id && (
                <>
                  <tr style={{ backgroundColor: "#eef6ff" }}>
                    <td colSpan="6" style={{ padding: 10 }}>
                      <strong>Detalles:</strong>
                      <div>Nombre completo: {item.nombre} {item.apellido}</div>
                      <div>Email: {item.email}</div>
                      <div>Teléfono: {item.telefono || "N/A"}</div>
                      <div>Creado: {item.createdAt ? new Date(item.createdAt).toLocaleString() : "—"}</div>
                      <div>Actualizado: {item.updatedAt ? new Date(item.updatedAt).toLocaleString() : "—"}</div>
                    </td>
                  </tr>

                  {/* Panel filtros y anidados SOLO para emprendedores */}
                  {tipo === "emprendedor" && (
                    <tr>
                      <td colSpan="6" style={{ padding: 10, backgroundColor: "#f9fbff" }}>
                        <div style={{ display: "flex", gap: 12, alignItems: "center", marginBottom: 12 }}>
                          <strong>Rango de fechas:</strong>
                          <label>
                            Desde{" "}
                            <input
                              type="date"
                              value={rangoFechas.from}
                              onChange={(e) =>
                                setRangoFechas((s) => ({ ...s, from: e.target.value }))
                              }
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
                            />
                          </label>
                          <button
                            style={styles.btnSmall}
                            onClick={(e) => {
                              e.stopPropagation();
                              cargarNestedParaEmprendedor(item);
                            }}
                          >
                            Aplicar filtro
                          </button>
                          <button
                            style={styles.btnSmall}
                            onClick={(e) => {
                              e.stopPropagation();
                              setRangoFechas({ from: "", to: "" });
                            }}
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

      {/* MODAL CHAT */}
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
                        backgroundColor: esElEmisor(esEmisor),
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

// Helper para color de burbuja de chat
function esElEmisor(isSender) {
  return isSender ? "#007bff" : "#e4e6eb";
}

const styles = {
  container: {
    maxWidth: 1000,
    margin: "auto",
    padding: 20,
    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
  },
  toggleContainer: {
    display: "flex",
    justifyContent: "center",
    marginBottom: 15,
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
    marginBottom: 30,
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
