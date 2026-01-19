
// src/components/Table.jsx
import React, { useEffect, useState } from "react";
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

/* Siguiente advertencia */
const siguienteAdvertencia = (estadoActual) => {
  switch (estadoActual) {
    case "Correcto": return "Advertencia1";
    case "Advertencia1": return "Advertencia2";
    case "Advertencia2": return "Advertencia3";
    case "Advertencia3": return "Suspendido";
    default: return "Suspendido";
  }
};

const safeDateStr = (val) => {
  if (!val) return "—";
  const d = new Date(val);
  return isNaN(d.getTime()) ? "—" : d.toLocaleString();
};

/* ===========================
   COMPONENTE
=========================== */
const Table = () => {
  const { token } = storeAuth() || {};

  /* --------- Estado principal --------- */
  const [tipo, setTipo] = useState("cliente");
  const [lista, setLista] = useState([]);
  const [loadingLista, setLoadingLista] = useState(false);

  /* --------- Formularios --------- */
  const [formCrear, setFormCrear] = useState(emptyForm);
  const [formEditar, setFormEditar] = useState({ id: null, ...emptyForm });

  /* --------- Mensajes --------- */
  const [error, setError] = useState("");
  const [mensaje, setMensaje] = useState("");

  useEffect(() => {
    const t = setTimeout(() => { setError(""); setMensaje(""); }, 3000);
    return () => clearTimeout(t);
  }, [error, mensaje]);

  /* --------- UI --------- */
  const [expandido, setExpandido] = useState(null);
  const [searchInput, setSearchInput] = useState("");
  const search = searchInput.trim().toLowerCase();

  /* --------- Auditoría (Cliente) --------- */
  const [mapAuditoria, setMapAuditoria] = useState({});

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

  useEffect(() => {
    fetchLista();
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
    if (!formCrear.password || !formCrear.password.trim()) {
      setError("El password es obligatorio.");
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
      const ct = res.headers.get("content-type") || "";
      if (ct.includes("application/json")) data = await res.json();

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

  const solicitarEliminar = (item) => {
    if (!window.confirm(`¿Eliminar ${capitalize(tipo)} ${item.nombre} ${item.apellido}?`)) return;
    confirmarEliminar(item._id);
  };

  const confirmarEliminar = async (id) => {
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
     ESTADOS y MODAL
  ============================ */
  const getEstado = (item) =>
    tipo === "emprendedor"
      ? item.estado || item.estado_Emprendedor || "Activo"
      : item.estado_Cliente ?? item.estado ?? deriveEstadoCliente(item);

  const getEstadosPermitidos = () =>
    tipo === "emprendedor" ? ESTADOS_EMPRENDEDOR : ESTADOS_CLIENTE;

  const [estadoModal, setEstadoModal] = useState({
    visible: false,
    mode: 'estado',          // 'estado' | 'advertir'
    item: null,
    nuevoEstado: null,
    motivo: "",
    suspendidoHasta: ""
  });

  const openEstadoModal = (item, nuevoEstado, mode = 'estado') => {
    if (tipo === "cliente") {
      const actual = getEstado(item);
      const proximo =
        (nuevoEstado && ESTADOS_CLIENTE.includes(nuevoEstado))
          ? nuevoEstado
          : siguienteAdvertencia(actual);

      setEstadoModal({
        visible: true,
        mode,
        item,
        nuevoEstado: proximo,
        motivo: "",
        suspendidoHasta: ""
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
    visible: false, mode: 'estado', item: null, nuevoEstado: null, motivo: "", suspendidoHasta: ""
  });

  const updateEstadoClienteConfirmed = async () => {
    const { item, nuevoEstado, motivo, suspendidoHasta, mode } = estadoModal;
    try {
      setMensaje(""); setError("");

      if (!motivo || !motivo.trim()) {
        setError("Debes ingresar un motivo.");
        return;
      }

      const headers = {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      };

      // Modo ADVERTIR (progresión Adv1->Adv2->Adv3->Suspendido)
      if (mode === 'advertir') {
        let untilISO;
        if (nuevoEstado === "Suspendido" && suspendidoHasta && suspendidoHasta.trim()) {
          const d = new Date(suspendidoHasta);
          if (isNaN(d.getTime())) {
            setError("La fecha/hora de suspensión no es válida.");
            return;
          }
          untilISO = d.toISOString();
        }

        const url = `${BASE_URLS["cliente"]}/estado/${item._id}/advertir`;
        const body = {
          motivo: motivo.trim(),
          ...(untilISO ? { suspendidoHasta: untilISO } : {})
        };

        const res = await fetch(url, { method: "PUT", headers, body: JSON.stringify(body) });
        const raw = await res.text(); let data = null; try { data = raw ? JSON.parse(raw) : null; } catch {}
        if (!res.ok) throw new Error(data?.msg || data?.error || raw || `HTTP ${res.status}`);

        setMensaje(`Advertencia aplicada${data?.estadoUI ? `: ${data.estadoUI}` : ""}`);
        closeEstadoModal();
        await fetchLista();
        return;
      }

      // Modo CAMBIO DE ESTADO manual
      const actualUI = getEstado(item);
      const estadoToSend =
        (nuevoEstado && ESTADOS_CLIENTE.includes(nuevoEstado))
          ? nuevoEstado
          : siguienteAdvertencia(actualUI);

      let untilISO;
      if (estadoToSend === "Suspendido" && suspendidoHasta && suspendidoHasta.trim()) {
        const d = new Date(suspendidoHasta);
        if (isNaN(d.getTime())) {
          setError("La fecha/hora de suspensión no es válida.");
          return;
        }
        untilISO = d.toISOString();
      }

      const urlEstado = `${BASE_URLS["cliente"]}/estado/${item._id}`;
      const body = {
        estado: estadoToSend,
        motivo: motivo.trim(),
        ...(untilISO ? { suspendidoHasta: untilISO } : {}),
      };

      const res = await fetch(urlEstado, { method: "PUT", headers, body: JSON.stringify(body) });
      const raw = await res.text(); let data = null; try { data = raw ? JSON.parse(raw) : null; } catch {}
      if (!res.ok) throw new Error(data?.msg || data?.error || raw || `HTTP ${res.status}`);

      setMensaje(`Estado actualizado a: ${estadoToSend}`);
      closeEstadoModal();
      await fetchLista();
    } catch (e) {
      console.error(e);
      setError(e.message || "Error al actualizar el estado.");
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
        const ct = res.headers.get("content-type") || "";
        if (ct.includes("application/json")) data = await res.json();
        const detail = data?.msg || `HTTP ${res.status}`;
        throw new Error(detail);
      }

      setMensaje(`Estado actualizado a: ${nuevoEstado}`);
      fetchLista();
    } catch (e) {
      console.error(e);
      setError(e.message || "Error al actualizar el estado.");
    }
  };

  /* ===========================
     AUDITORÍA (carga para detalles si quieres expandir)
  ============================ */
  const cargarAuditoriaCliente = async (clienteId, page = 1, limit = 10) => {
    setMapAuditoria((prev) => ({
      ...prev,
      [clienteId]: { ...(prev[clienteId] || {}), loading: true, lastError: null },
    }));
    try {
      const url = `${BASE_URLS["cliente"]}/estado/${clienteId}/auditoria?page=${page}&limit=${limit}`;
      const res = await fetch(url, {
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      });

      if (!res.ok) {
        setMapAuditoria((prev) => ({
          ...prev,
          [clienteId]: { ...(prev[clienteId] || {}), items: [], total: 0, page, limit, loading: false, lastError: `HTTP ${res.status}` },
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
          lastError: null,
        },
      }));
    } catch (e) {
      console.error(e);
      setMapAuditoria((prev) => ({
        ...prev,
        [clienteId]: { items: [], total: 0, page, limit, loading: false, lastError: e.message || "error" },
      }));
    }
  };

  /* ===========================
     LISTA FILTRADA
  ============================ */
  const listaFiltrada = lista.filter((x) => {
    if (!search) return true;
    const campos = [x.nombre, x.apellido, x.email, x.telefono].map((v) => String(v || "").toLowerCase());
    return campos.some((c) => c.includes(search));
  });

  /* ===========================
     RENDER
  ============================ */
  return (
    <div className="wrap">
      <style>{css}</style>

      <header className="hdr">
        <div>
          <h1 className="ttl">Panel de Administración</h1>
          <div className="subTtl">
            {capitalize(tipo)}s • {loadingLista ? "Cargando…" : `${listaFiltrada.length} resultados`}
          </div>
        </div>

        <div className="toolbar">
          <div role="tablist" aria-label="Tipo de listado" className="segmented">
            <button
              role="tab"
              aria-selected={tipo === "cliente"}
              className={tipo === "cliente" ? "segBtn active" : "segBtn"}
              onClick={() => setTipo("cliente")}
            >
              👥 Clientes
            </button>
            <button
              role="tab"
              aria-selected={tipo === "emprendedor"}
              className={tipo === "emprendedor" ? "segBtn active" : "segBtn"}
              onClick={() => setTipo("emprendedor")}
            >
              🧑‍💼 Emprendedores
            </button>
          </div>

          <div className="searchBox">
            <input
              aria-label="Buscar en el listado"
              type="search"
              placeholder={`Buscar ${capitalize(tipo)} por nombre, apellido, email o teléfono…`}
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="searchInput"
            />
            <button className="btn ghost" onClick={fetchLista} title="Actualizar listado">↻</button>
          </div>
        </div>
      </header>

      <div className="toastRegion" aria-live="polite" aria-atomic="true">
        {error && <div className="toast toastErr">⚠️ {error}</div>}
        {mensaje && <div className="toast toastOk">✅ {mensaje}</div>}
      </div>

      {/* ====== FORM: CREAR (clientes) ====== */}
      {tipo === "cliente" && (
        <section className="card" aria-label="Crear">
          <div className="cardHeader">
            <h2 className="cardTitle">Crear {capitalize(tipo)}</h2>
          </div>
          <form onSubmit={handleCrear}>
            <div className="grid2">
              <div className="formGroup">
                <label className="label">Nombre</label>
                <input className="input" value={formCrear.nombre} onChange={(e) => setFormCrear({ ...formCrear, nombre: e.target.value })} required />
              </div>
              <div className="formGroup">
                <label className="label">Apellido</label>
                <input className="input" value={formCrear.apellido} onChange={(e) => setFormCrear({ ...formCrear, apellido: e.target.value })} required />
              </div>
              <div className="formGroup">
                <label className="label">Email</label>
                <input className="input" type="email" value={formCrear.email} onChange={(e) => setFormCrear({ ...formCrear, email: e.target.value })} required />
              </div>
              <div className="formGroup">
                <label className="label">Password</label>
                <input className="input" type="password" value={formCrear.password} onChange={(e) => setFormCrear({ ...formCrear, password: e.target.value })} required />
              </div>
              <div className="formGroup">
                <label className="label">Teléfono</label>
                <input className="input" value={formCrear.telefono} onChange={(e) => setFormCrear({ ...formCrear, telefono: e.target.value })} />
              </div>
            </div>

            <div className="cardFooter">
              <button className="btn primary" type="submit">Crear</button>
              <button className="btn ghost" type="button" onClick={() => setFormCrear(emptyForm)}>Limpiar</button>
            </div>
          </form>
        </section>
      )}

      {/* ====== FORM: EDITAR ====== */}
      {formEditar.id && (
        <section className="card" aria-label="Editar">
          <div className="cardHeader">
            <h2 className="cardTitle">Editar {capitalize(tipo)}</h2>
          </div>
          <form onSubmit={handleActualizar}>
            <div className="grid2">
              <div className="formGroup">
                <label className="label">Nombre</label>
                <input className="input" value={formEditar.nombre} onChange={(e) => setFormEditar({ ...formEditar, nombre: e.target.value })} required />
              </div>
              <div className="formGroup">
                <label className="label">Apellido</label>
                <input className="input" value={formEditar.apellido} onChange={(e) => setFormEditar({ ...formEditar, apellido: e.target.value })} required />
              </div>
              <div className="formGroup">
                <label className="label">Email</label>
                <input className="input" type="email" value={formEditar.email} onChange={(e) => setFormEditar({ ...formEditar, email: e.target.value })} required />
              </div>
              <div className="formGroup">
                <label className="label">Password (opcional)</label>
                <input className="input" type="password" value={formEditar.password} onChange={(e) => setFormEditar({ ...formEditar, password: e.target.value })} />
              </div>
              <div className="formGroup">
                <label className="label">Teléfono</label>
                <input className="input" value={formEditar.telefono} onChange={(e) => setFormEditar({ ...formEditar, telefono: e.target.value })} />
              </div>
            </div>

            <div className="cardFooter">
              <button className="btn primary" type="submit">Actualizar</button>
              <button className="btn secondary" type="button" onClick={() => setFormEditar({ id: null, ...emptyForm })}>Cancelar</button>
            </div>
          </form>
        </section>
      )}

      {/* ====== LISTADO ====== */}
      <section aria-label="Listado principal" className="card">
        <div className="cardHeader">
          <h2 className="cardTitle">Listado de {capitalize(tipo)}s</h2>
        </div>

        <div className="tableWrap">
          <table className="table">
            <thead>
              <tr>
                <th className="th">#</th>
                <th className="th">Nombre</th>
                <th className="th">Apellido</th>
                <th className="th">Email</th>
                <th className="th">Teléfono</th>
                <th className="th">Estado</th>
                <th className="th">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {loadingLista && Array.from({ length: 6 }).map((_, idx) => (
                <tr key={`skeleton-${idx}`}>
                  <td className="td"><div className="skl w40" /></td>
                  <td className="td"><div className="skl" /></td>
                  <td className="td"><div className="skl" /></td>
                  <td className="td"><div className="skl" /></td>
                  <td className="td"><div className="skl w80" /></td>
                  <td className="td"><div className="skl w80" /></td>
                  <td className="td"><div className="skl w120" /></td>
                </tr>
              ))}

              {!loadingLista && listaFiltrada.length === 0 && (
                <tr>
                  <td colSpan="7" className="emptyCell">
                    <div style={{ fontSize: 24 }}>🗂️</div>
                    <div style={{ color: "#666" }}>No hay {capitalize(tipo)}s para mostrar.</div>
                  </td>
                </tr>
              )}

              {!loadingLista && listaFiltrada.map((item, i) => (
                <tr
                  key={item._id}
                  className={`row ${expandido === item._id ? "rowActive" : ""}`}
                  onClick={() => setExpandido(expandido === item._id ? null : item._id)}
                  aria-expanded={expandido === item._id}
                >
                  <td className="td">{i + 1}</td>
                  <td className="td">
                    <span className="nameStrong">{item.nombre}</span>
                    <span className="pill" style={{ backgroundColor: ESTADO_COLORS[getEstado(item)] || "#6b7280", marginLeft: 6 }}>
                      {getEstado(item)}
                    </span>
                  </td>
                  <td className="td">{item.apellido}</td>
                  <td className="td">{item.email}</td>
                  <td className="td">{item.telefono || "N/A"}</td>

                  <td className="td">
                    <div className="inline">
                      <label className="labelInlineSmall">Estado:</label>
                      <select
                        aria-label="Cambiar estado/advertencia"
                        value={getEstado(item)}
                        onChange={(e) => { e.stopPropagation(); openEstadoModal(item, e.target.value, 'estado'); }}
                        className="select"
                        onClick={(e) => e.stopPropagation()}
                      >
                        {getEstadosPermitidos().map((opt) => (
                          <option key={opt} value={opt}>{opt}</option>
                        ))}
                      </select>
                    </div>
                  </td>

                  <td className="td">
                    <div className="actions">
                      <button className="btn tiny" onClick={(e) => { e.stopPropagation(); prepararEditar(item); }}>✏️ Editar</button>
                      <button className="btn tiny danger" onClick={(e) => { e.stopPropagation(); solicitarEliminar(item); }}>🗑️ Eliminar</button>
                      <button
                        className={`btn tiny ${getEstado(item) === "Suspendido" ? "disabled" : "warn"}`}
                        disabled={getEstado(item) === "Suspendido"}
                        title={getEstado(item) === "Suspendido" ? "Ya está suspendido" : "Aplicar siguiente advertencia"}
                        onClick={(e) => { e.stopPropagation(); const next = siguienteAdvertencia(getEstado(item)); openEstadoModal(item, next, 'advertir'); }}
                      >
                        ⚠️ Advertencia
                      </button>
                    </div>

                    {/* Detalles expandibles simples */}
                    {expandido === item._id && (
                      <div style={{ marginTop: 8, color: "#475569" }}>
                        <div><strong>Creado:</strong> {safeDateStr(item.createdAt)}</div>
                        <div><strong>Actualizado:</strong> {safeDateStr(item.updatedAt)}</div>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* ====== MODAL: CAMBIO DE ESTADO / ADVERTENCIA ====== */}
      {estadoModal.visible && tipo === "cliente" && (
        <div className="modalOverlay" onKeyDown={(e) => e.key === "Escape" && closeEstadoModal()}>
          <div className="modal" role="dialog" aria-modal="true" aria-label="Confirmar">
            <div className="modalHeader">
              <h3 className="modalTitle">
                {estadoModal.mode === 'advertir' ? 'Aplicar advertencia' : 'Cambiar estado'}:&nbsp;
                <span className="pill soft">
                  {estadoModal.item ? getEstado(estadoModal.item) : "—"} → {estadoModal.nuevoEstado || "—"}
                </span>
              </h3>
              <button className="btn close" onClick={closeEstadoModal} aria-label="Cerrar">✖</button>
            </div>

            <div className="modalBody">
              <div className="formGroup">
                <label className="label">Motivo <span className="req">*</span></label>
                <textarea
                  rows={4}
                  value={estadoModal.motivo}
                  onChange={(e) => setEstadoModal((s) => ({ ...s, motivo: e.target.value }))}
                  placeholder="Describe brevemente el motivo…"
                  className="input"
                  style={{ resize: "vertical" }}
                />
              </div>

              {estadoModal.nuevoEstado === "Suspendido" && (
                <div className="formGroup">
                  <label className="label">Suspensión hasta (opcional)</label>
                  <input
                    type="datetime-local"
                    value={estadoModal.suspendidoHasta}
                    onChange={(e) => setEstadoModal((s) => ({ ...s, suspendidoHasta: e.target.value }))}
                    className="input"
                  />
                  <small className="muted">
                    Si lo dejas vacío: suspensión indefinida hasta reactivación manual o automática al vencer.
                  </small>
                </div>
              )}
            </div>

            <div className="modalFooter">
              <button className="btn secondary" onClick={closeEstadoModal}>Cancelar</button>
              <button className="btn primary" onClick={updateEstadoClienteConfirmed}>Confirmar</button>
            </div>
          </div>
        </div>
      )}

      {/* CSS inline */}
      <style>{css}</style>
    </div>
  );
};

/* ===========================
   CSS
=========================== */
const css = `
:root{
  --bg:#f8fafc; --card:#ffffff; --bd:#e2e8f0; --bd-strong:#0ea5e9;
  --txt:#1f2937; --muted:#64748b; --muted2:#475569;
  --ok:#0ea5e9; --ok-strong:#0284c7; --warn:#f59e0b; --danger:#dc2626; --success:#16a34a;
  --shadow:0 1px 4px rgba(0,0,0,0.05); --shadow-lg:0 10px 25px rgba(0,0,0,0.15);
  --radius:12px; --radius-sm:8px; --space:16px;
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
.btn{
  padding:10px 16px; border-radius: var(--radius-sm); border: none; cursor: pointer; font-weight:700;
  background:#fff; color:#0ea5e9; border:1px solid var(--ok);
}
.btn.primary{ background: var(--ok); color:#fff; border:none; }
.btn.primary:hover{ background: var(--ok-strong); }
.btn.secondary{ background:#64748b; color:#fff; }
.btn.ghost{ background:#ffffff; color:var(--ok); border:1px solid var(--ok); }
.btn.danger{ background: var(--danger); color:#fff; border:none; }
.btn.warn{ background: var(--warn); color:#fff; border:none; }
.btn.disabled{ opacity:.5; cursor:not-allowed; }
.btn.tiny{ padding:6px 10px; border-radius:6px; font-size:13px; }
.tableWrap{ overflow-x:auto; }
.table{ width:100%; border-collapse: collapse; }
.th{
  border-bottom: 2px solid var(--bd-strong); padding:10px; text-align:left; background:#eaf7ff;
  font-weight:800; font-size:13px; color:var(--txt); position:sticky; top:0; z-index:1;
}
.td{ border-bottom:1px solid #e5e7eb; padding:10px; vertical-align: top; font-size:14px; }
.row{ background:#fff; cursor:pointer; }
.row:hover{ background:#f8fbff; }
.rowActive{ background:#f5faff; }
.pill{ display:inline-block; margin-left:6px; padding:2px 10px; border-radius:999px; font-size:12px; color:#fff; line-height:18px; }
.pill.soft{ background:#0ea5e922; color:#0ea5e9; border:1px solid #0ea5e944; padding:2px 8px; }
.emptyCell{ text-align:center; padding:20px; color:#666; font-size:14px; }
.skl{ height:14px; width:100%; background:linear-gradient(90deg, #f1f5f9 25%, #e2e8f0 37%, #f1f5f9 63%); background-size:400% 100%; animation:shimmer 1.4s ease infinite; border-radius:6px; }
.skl.w40{ width:40px; } .skl.w80{ width:80px; } .skl.w120{ width:120px; }
.modalOverlay{ position:fixed; inset:0; background:rgba(0,0,0,.45); display:flex; justify-content:center; align-items:center; z-index:9999; padding:12px; }
.modal{ background:#fff; border-radius: var(--radius); width:520px; max-width:95%; box-shadow: var(--shadow-lg); display:flex; flex-direction:column; overflow:hidden; }
.modalHeader{ padding:12px 16px; background: var(--ok); color:#fff; display:flex; justify-content:space-between; align-items:center; font-weight:800; font-size:16px; }
.modalTitle{ margin:0; }
.modalBody{ padding:16px; min-height:120px; font-size:14px; color:#333; overflow-y:auto; }
.modalFooter{ padding:12px; border-top:1px solid var(--bd); display:flex; justify-content:flex-end; gap:8px; }
.req{ color:#dc2626; }
`;

export default Table;
