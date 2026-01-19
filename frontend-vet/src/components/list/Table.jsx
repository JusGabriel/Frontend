
import React, { useEffect, useState, useRef } from "react";
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

    let untilISO;
    if (nuevoEstado === "Suspendido" && suspendidoHasta && suspendidoHasta.trim()) {
      const d = new Date(suspendidoHasta);
      if (isNaN(d.getTime())) return setError("La fecha/hora de suspensión no es válida.");
      untilISO = d.toISOString();
    }

    try {
      const res = await fetch(`${BASE_URLS["cliente"]}/estado/${item._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}) },
        body: JSON.stringify({ estado: nuevoEstado, motivo: motivo.trim(), ...(untilISO ? { suspendidoHasta: untilISO } : {}) }),
      });
      const data = isJsonResponse(res) ? await res.json() : null;
      if (!res.ok) {
        // ✅ no lanzamos throw; solo mostramos
        setError((data && (data.msg || data.error)) || `HTTP ${res.status}` || "No se pudo actualizar el estado.");
        return;
      }
      setMensaje(`Estado actualizado a: ${nuevoEstado}`);
      closeEstadoModal();
      await fetchLista();
      if (expandido === item._id && tipo === "cliente") cargarAuditoriaCliente(item._id, mapAuditoria[item._id]?.page || 1, mapAuditoria[item._id]?.limit || 10);
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

  /* === Auditoría: ARREGLADO setState === */
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

  const listaFiltrada = lista.filter((x) => {
    const q = search.toLowerCase();
    if (!q) return true;
    const campos = [x.nombre, x.apellido, x.email, x.telefono].map((v) => String(v || "").toLowerCase());
    return campos.some((c) => c.includes(q));
  });

  return (
    <div className="wrap">
      <style>{css}</style>

      <header className="hdr">
        <div>
          <h1 className="ttl">Panel de Administración</h1>
          <div className="subTtl">{capitalize(tipo)}s • {loadingLista ? "Cargando…" : `${listaFiltrada.length} resultados`}</div>
        </div>
        <div className="toolbar">
          <div role="tablist" aria-label="Tipo de listado" className="segmented">
            <button role="tab" aria-selected={tipo === "cliente"} className={tipo === "cliente" ? "segBtn active" : "segBtn"} onClick={() => setTipo("cliente")}>👥 Clientes</button>
            <button role="tab" aria-selected={tipo === "emprendedor"} className={tipo === "emprendedor" ? "segBtn active" : "segBtn"} onClick={() => setTipo("emprendedor")}>🧑‍💼 Emprendedores</button>
          </div>
          <div className="searchBox">
            <input type="search" placeholder={`Buscar ${capitalize(tipo)} por nombre, apellido, email o teléfono…`} value={searchInput} onChange={(e) => setSearchInput(e.target.value)} className="searchInput" />
            <button className="btn ghost" onClick={fetchLista} title="Actualizar listado">↻</button>
          </div>
        </div>
      </header>

      <div className="toastRegion" aria-live="polite" aria-atomic="true">
        {error && <div className="toast toastErr">⚠️ {error}</div>}
        {mensaje && <div className="toast toastOk">✅ {mensaje}</div>}
      </div>

      {/* Tabla (desktop) */}
      <section className="card">
        <div className="cardHeader"><h2 className="cardTitle">Listado de {capitalize(tipo)}s</h2></div>
        <div className="tableWrap hideOnMobile">
          <table className="table">
            <thead>
              <tr>
                <th className="th">#</th><th className="th">Nombre</th><th className="th">Apellido</th>
                <th className="th">Email</th><th className="th">Teléfono</th><th className="th">Estado</th><th className="th">Acciones</th>
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
                <tr><td colSpan="7" className="emptyCell">No hay {capitalize(tipo)}s para mostrar.</td></tr>
              )}

              {!loadingLista && listaFiltrada.map((item, i) => (
                <React.Fragment key={item._id || `${i}`}>
                  <tr className={`row ${expandido === item._id ? "rowActive" : ""}`} onClick={() => toggleExpandido(item._id, item)} aria-expanded={expandido === item._id}>
                    <td className="td">{i + 1}</td>
                    <td className="td"><span className="nameStrong">{item.nombre}</span> <EstadoBadge estado={getEstado(item)} /></td>
                    <td className="td">{item.apellido}</td>
                    <td className="td">{item.email}</td>
                    <td className="td">{item.telefono || "N/A"}</td>
                    <td className="td">
                      <div className="inline">
                        <label className="labelInlineSmall">Estado:</label>
                        <select value={getEstado(item)} onChange={(e) => { e.stopPropagation(); openEstadoModal(item, e.target.value); }} className="select" onClick={(e) => e.stopPropagation()}>
                          {getEstadosPermitidos().map((opt) => <option key={opt} value={opt}>{opt}</option>)}
                        </select>
                      </div>
                    </td>
                    <td className="td">
                      <div className="actions">
                        <button className="btn tiny" onClick={(e) => { e.stopPropagation(); prepararEditar(item); }}>✏️ Editar</button>
                        <button className="btn tiny danger" onClick={(e) => { e.stopPropagation(); solicitarEliminar(item); }}>🗑️ Eliminar</button>
                        <button className={`btn tiny ${getEstado(item) === "Suspendido" ? "disabled" : "warn"}`}
                          disabled={getEstado(item) === "Suspendido"}
                          onClick={(e) => { e.stopPropagation(); openEstadoModal(item, siguienteAdvertencia(getEstado(item))); }}>
                          ⚠️ Advertencia
                        </button>
                      </div>
                    </td>
                  </tr>
                  {expandido === item._id && (
                    <tr>
                      <td colSpan="7" className="detailsCell">
                        <div className="detailsGrid">
                          <div className="detailItem"><div className="detailLabel">Nombre completo</div><div className="detailValue">{item.nombre} {item.apellido}</div></div>
                          <div className="detailItem"><div className="detailLabel">Email</div><div className="detailValue">{item.email}</div></div>
                          <div className="detailItem"><div className="detailLabel">Teléfono</div><div className="detailValue">{item.telefono || "N/A"}</div></div>
                          <div className="detailItem"><div className="detailLabel">Creado</div><div className="detailValue">{safeDateStrWithFallback(item.createdAt, item._id)}</div></div>
                          <div className="detailItem"><div className="detailLabel">Actualizado</div><div className="detailValue">{safeDateStrWithFallback(item.updatedAt, item._id)}</div></div>
                        </div>

                        {/* Historial */}
                        <div className="histWrap">
                          <div className="sectionHeader">
                            <h4 className="sectionTitle">Historial de Advertencias / Suspensiones</h4>
                            <div className="inline">
                              <button className="btn tiny" onClick={async (e) => { e.stopPropagation(); await cargarAuditoriaCliente(item._id, mapAuditoria[item._id]?.page || 1, mapAuditoria[item._id]?.limit || 10); setMensaje("Historial actualizado"); }}>↻</button>
                            </div>
                          </div>
                          <div className="tableWrap">
                            <table className="table mt8">
                              <thead>
                                <tr><th className="th">Fecha</th><th className="th">Tipo</th><th className="th">Motivo</th><th className="th">Origen</th><th className="th">Modificado por</th></tr>
                              </thead>
                              <tbody>
                                {mapAuditoria[item._id]?.loading && <tr><td colSpan="5" className="emptyCell">Cargando historial…</td></tr>}
                                {!mapAuditoria[item._id]?.loading && (mapAuditoria[item._id]?.items || []).length === 0 && <tr><td colSpan="5" className="emptyCell">Sin registros.</td></tr>}
                                {!mapAuditoria[item._id]?.loading && (mapAuditoria[item._id]?.items || []).map((a, idx) => (
                                  <tr key={`${a._id || idx}`}>
                                    <td className="td">{safeDateStr(a.fecha)}</td>
                                    <td className="td">{a.tipo || "—"}</td>
                                    <td className="td">{a.motivo || "—"}</td>
                                    <td className="td">{a.origen || "—"}</td>
                                    <td className="td">{displayActorName(a)}</td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                          <div className="paginate">
                            <button className="btn tiny" onClick={(e) => { e.stopPropagation(); onPaginarAud(item._id, -1); }}>◀ Anterior</button>
                            <span className="muted">{mapAuditoria[item._id]?.page || 1} / {Math.max(1, Math.ceil((mapAuditoria[item._id]?.total || 0) / (mapAuditoria[item._id]?.limit || 10)))}</span>
                            <button className="btn tiny" onClick={(e) => { e.stopPropagation(); onPaginarAud(item._id, +1); }}>Siguiente ▶</button>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* MODAL Estado Cliente */}
      {estadoModal.visible && tipo === "cliente" && (
        <div className="modalOverlay">
          <div className="modal" role="dialog" aria-modal="true" aria-label="Confirmar cambio de estado">
            <div className="modalHeader">
              <h3 className="modalTitle">Cambiar estado: <span className="pill soft">{estadoModal.item ? getEstado(estadoModal.item) : "—"} → {estadoModal.nuevoEstado || "—"}</span></h3>
              <button className="btn close" onClick={closeEstadoModal} aria-label="Cerrar">✖</button>
            </div>
            <div className="modalBody">
              <div className="formGroup">
                <label className="label">Motivo <span className="req">*</span></label>
                <textarea rows={4} value={estadoModal.motivo} onChange={(e) => setEstadoModal((s) => ({ ...s, motivo: e.target.value }))} className="input" />
              </div>
              {estadoModal.nuevoEstado === "Suspendido" && (
                <div className="formGroup">
                  <label className="label">Suspensión hasta (opcional)</label>
                  <input type="datetime-local" value={estadoModal.suspendidoHasta} onChange={(e) => setEstadoModal((s) => ({ ...s, suspendidoHasta: e.target.value }))} className="input" />
                  <small className="muted">Si lo dejas vacío, la suspensión será indefinida hasta reactivación manual.</small>
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

      {/* MODAL Confirmar Eliminación */}
      {confirmDelete.visible && (
        <div className="modalOverlay">
          <div className="modal" role="dialog" aria-modal="true" aria-label="Confirmar eliminación">
            <div className="modalHeader"><h3 className="modalTitle">Confirmar eliminación</h3><button className="btn close" onClick={cancelarEliminar} aria-label="Cerrar">✖</button></div>
            <div className="modalBody"><p>¿Eliminar {capitalize(tipo)} <strong>{confirmDelete.nombre}</strong>? Esta acción no se puede deshacer.</p></div>
            <div className="modalFooter"><button className="btn secondary" onClick={cancelarEliminar}>Cancelar</button><button className="btn danger" onClick={confirmarEliminar}>Eliminar</button></div>
          </div>
        </div>
      )}
    </div>
  );
};

const css = `
:root{
  --bg:#f8fafc; --card:#ffffff; --bd:#e2e8f0; --bd-strong:#0ea5e9; --txt:#1f2937; --muted:#64748b;
  --muted2:#475569; --ok:#0ea5e9; --ok-strong:#0284c7; --warn:#f59e0b; --danger:#dc2626; --success:#16a34a;
  --shadow:0 1px 4px rgba(0,0,0,0.05); --shadow-lg:0 10px 25px rgba(0,0,0,0.15); --radius:12px; --radius-sm:8px;
}
*{box-sizing:border-box}
.wrap{max-width:1100px;margin:auto;padding:16px;font-family:'Segoe UI',Arial,sans-serif;color:var(--txt);}
.hdr{display:grid;grid-template-columns:1fr auto;gap:12px;align-items:center;margin-bottom:16px;}
.ttl{margin:0;font-size:24px;font-weight:800;}
.subTtl{margin-top:4px;color:var(--muted);font-size:13px;}
.toolbar{display:flex;gap:12px;align-items:center;justify-content:flex-end;flex-wrap:wrap;}
.segmented{display:inline-flex;border:1px solid var(--bd);border-radius:8px;overflow:hidden;background:#fff;}
.segBtn{padding:8px 12px;background:#fff;color:#334155;border:none;cursor:pointer;font-weight:700;}
.segBtn.active{background:var(--ok);color:#fff;}
.searchBox{display:flex;gap:8px;align-items:center;}
.searchInput{width:280px;max-width:60vw;padding:8px 10px;border-radius:8px;border:1px solid var(--bd);outline:none;}
.toastRegion{position:fixed;top:14px;right:14px;display:grid;gap:8px;z-index:10000;}
.toast{padding:10px 12px;border-radius:10px;box-shadow:var(--shadow);font-size:13px;min-width:240px;}
.toastErr{background:#ffe8e6;color:#a33;} .toastOk{background:#e7f9ed;color:#1e7e34;}
.card{margin-bottom:16px;padding:16px;border:1px solid var(--bd);border-radius:12px;background:#fff;box-shadow:var(--shadow);}
.cardHeader{display:flex;align-items:center;justify-content:space-between;margin-bottom:8px;}
.cardTitle{margin:0;font-size:18px;font-weight:800;}
.tableWrap{overflow-x:auto;}
.table{width:100%;border-collapse:collapse;}
.th{border-bottom:2px solid var(--bd-strong);padding:10px;text-align:left;background:#eaf7ff;font-weight:800;font-size:13px;color:var(--txt);position:sticky;top:0;z-index:1;}
.td{border-bottom:1px solid #e5e7eb;padding:10px;vertical-align:top;font-size:14px;}
.row{background:#fff;cursor:pointer;} .row:hover{background:#f8fbff;} .rowActive{background:#f5faff;}
.nameStrong{font-weight:800;margin-right:6px;}
.select{padding:8px 10px;border-radius:8px;border:1px solid var(--bd);background:#fff;}
.actions{display:flex;gap:6px;flex-wrap:wrap;}
.emptyCell{text-align:center;padding:20px;color:#666;font-size:14px;}
.detailsCell{padding:12px;background:#f7fbff;border-top:1px solid #e6eef8;}
.detailsGrid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:12px;}
.detailItem{padding:10px;border:1px solid var(--bd);border-radius:10px;background:#fff;}
.detailLabel{font-size:12px;color:var(--muted);font-weight:700;margin-bottom:4px;}
.detailValue{font-size:14px;color:var(--txt);}
.sectionHeader{display:flex;justify-content:space-between;align-items:center;}
.sectionTitle{margin:0;color:var(--ok);}
.muted{color:var(--muted);font-size:13px;}
.paginate{display:flex;align-items:center;justify-content:space-between;margin-top:10px;}
.pill{display:inline-block;margin-left:6px;padding:2px 10px;border-radius:999px;font-size:12px;color:#fff;line-height:18px;}
.pill.soft{background:#0ea5e922;color:#0ea5e9;border:1px solid #0ea5e944;padding:2px 8px;}
.skl{height:14px;width:100%;background:linear-gradient(90deg,#f1f5f9 25%,#e2e8f0 37%,#f1f5f9 63%);background-size:400% 100%;animation:shimmer 1.4s ease infinite;border-radius:6px;}
.skl.w40{width:40px;} .skl.w80{width:80px;} .skl.w120{width:120px;}
@keyframes shimmer{0%{background-position:100% 0}100%{background-position:0 0}}
.hideOnMobile{display:block;} .showOnMobile{display:none;}
.modalOverlay{position:fixed;inset:0;background:rgba(0,0,0,.45);display:flex;justify-content:center;align-items:center;z-index:9999;padding:12px;}
.modal{background:#fff;border-radius:12px;width:520px;max-width:95%;box-shadow:0 10px 25px rgba(0,0,0,0.15);display:flex;flex-direction:column;overflow:hidden;}
.modalHeader{padding:12px 16px;background:#0ea5e9;color:#fff;display:flex;justify-content:space-between;align-items:center;font-weight:800;font-size:16px;}
.modalTitle{margin:0;} .modalBody{padding:16px;min-height:120px;font-size:14px;color:#333;overflow-y:auto;} .modalFooter{padding:12px;border-top:1px solid var(--bd);display:flex;justify-content:flex-end;gap:8px;}
.btn{padding:10px 16px;border-radius:8px;border:none;cursor:pointer;font-weight:700;background:#fff;color:#0ea5e9;border:1px solid #0ea5e9;}
.btn.primary{background:#0ea5e9;color:#fff;border:none;} .btn.secondary{background:#64748b;color:#fff;} .btn.ghost{background:#fff;color:#0ea5e9;border:1px solid #0ea5e9;} .btn.danger{background:#dc2626;color:#fff;border:none;}
.btn.warn{background:#f59e0b;color:#fff;border:none;} .btn.disabled{opacity:.5;cursor:not-allowed;} .btn.tiny{padding:6px 10px;border-radius:6px;font-size:13px;} .btn.close{background:#ef4444;color:#fff;border:none;padding:6px 10px;border-radius:8px;font-weight:800;}
@media (max-width:768px){ .hdr{grid-template-columns:1fr;} .hideOnMobile{display:none;} .showOnMobile{display:block;} .detailsGrid{grid-template-columns:1fr;} .searchInput{width:100%;max-width:100%;} }
`;

export default Table;
