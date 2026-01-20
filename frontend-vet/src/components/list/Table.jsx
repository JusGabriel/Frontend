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
   HELPERS & CONSTANTES
=========================== */
const emptyForm = { nombre: "", apellido: "", email: "", password: "", telefono: "" };
const capitalize = (str) => (str ? str.charAt(0).toUpperCase() + str.slice(1) : "");
const fmtUSD = new Intl.NumberFormat("es-EC", { style: "currency", currency: "USD" });

const ESTADO_COLORS = {
  Correcto: "#28a745",
  Activo: "#28a745",
  Advertencia1: "#ffc107",
  Advertencia2: "#fd7e14",
  Advertencia3: "#dc3545",
  Suspendido: "#dc3545",
};

const ESTADOS_EMPRENDEDOR = ["Activo", "Advertencia1", "Advertencia2", "Advertencia3", "Suspendido"];
const ESTADOS_CLIENTE = ["Correcto", "Advertencia1", "Advertencia2", "Advertencia3", "Suspendido"];

/* ===========================
   COMPONENTE PRINCIPAL
=========================== */
const Table = () => {
  const { id: emisorId, rol: emisorRol, token } = storeAuth() || {};

  // Estados de la lista
  const [tipo, setTipo] = useState("cliente"); 
  const [lista, setLista] = useState([]);
  const [loadingLista, setLoadingLista] = useState(false);

  // Formularios
  const [formCrear, setFormCrear] = useState(emptyForm);
  const [formEditar, setFormEditar] = useState({ id: null, ...emptyForm });

  // UI & Filtros
  const [error, setError] = useState("");
  const [mensaje, setMensaje] = useState("");
  const [expandido, setExpandido] = useState(null);
  const [search, setSearch] = useState("");
  const [confirmDelete, setConfirmDelete] = useState({ visible: false, id: null, nombre: "" });

  // Chat
  const [modalChatVisible, setModalChatVisible] = useState(false);
  const [chatUser, setChatUser] = useState(null);
  const [mensajes, setMensajes] = useState([]);
  const [mensajeChat, setMensajeChat] = useState("");
  const mensajesRef = useRef(null);

  // Sub-filtros Emprendedor
  const [rangoFechas, setRangoFechas] = useState({ from: "", to: "" });
  const [mapEmpEmprendimientos, setMapEmpEmprendimientos] = useState({});
  const [mapEmpProductos, setMapEmpProductos] = useState({});
  const [loadingNested, setLoadingNested] = useState(false);
  const [catalogoProductos, setCatalogoProductos] = useState([]);
  const [catalogoEmprendimientos, setCatalogoEmprendimientos] = useState([]);

  // Modal Cambio de Estado
  const [estadoModal, setEstadoModal] = useState({
    visible: false, item: null, nuevoEstado: null, motivo: "", suspendidoHasta: ""
  });

  /* ===========================
     LÓGICA DE DATOS
  ============================ */
  
  // Arreglado: deriveEstado ahora es más flexible para que no fallen los clientes
  const deriveEstado = (item) => {
    if (!item) return tipo === "cliente" ? "Correcto" : "Activo";
    
    if (tipo === "cliente") {
        if (item.status === false || item.estado_Cliente === "Suspendido") return "Suspendido";
        return item.estado_Cliente || item.estado || "Correcto";
    } else {
        return item.estado_Emprendedor || item.estado || "Activo";
    }
  };

  const fetchLista = async () => {
    setError("");
    setLoadingLista(true);
    try {
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      const res = await fetch(`${BASE_URLS[tipo]}/todos`, { headers });
      const data = await res.json();

      let normalizados = Array.isArray(data) ? data : [];
      
      // Mapeo seguro para asegurar que el campo "estado" exista para la UI
      normalizados = normalizados.map(item => ({
        ...item,
        estadoUI: deriveEstado(item)
      }));

      setLista(normalizados);
    } catch (e) {
      console.error(e);
      setError("No se pudo cargar el listado.");
    } finally {
      setLoadingLista(false);
    }
  };

  useEffect(() => {
    fetchLista();
    setExpandido(null);
    setSearch("");
  }, [tipo]);

  /* ===========================
     CRUD ACTIONS
  ============================ */

  const handleCrear = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${BASE_URLS[tipo]}/registro`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...(token && { Authorization: `Bearer ${token}` }) },
        body: JSON.stringify(formCrear),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.msg || "Error al crear");
      setMensaje("Creado exitosamente");
      setFormCrear(emptyForm);
      fetchLista();
    } catch (err) { setError(err.message); }
  };

  const handleActualizar = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${BASE_URLS[tipo]}/actualizar/${formEditar.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", ...(token && { Authorization: `Bearer ${token}` }) },
        body: JSON.stringify(formEditar),
      });
      if (!res.ok) throw new Error("Error al actualizar");
      setMensaje("Actualizado correctamente");
      setFormEditar({ id: null, ...emptyForm });
      fetchLista();
    } catch (err) { setError(err.message); }
  };

  const confirmarEliminar = async () => {
    try {
      const res = await fetch(`${BASE_URLS[tipo]}/eliminar/${confirmDelete.id}`, {
        method: "DELETE",
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (!res.ok) throw new Error("No se pudo eliminar");
      setMensaje("Eliminado correctamente");
      fetchLista();
    } catch (err) { setError(err.message); }
    setConfirmDelete({ visible: false, id: null, nombre: "" });
  };

  /* ===========================
     SISTEMA DE ESTADOS / ADVERTENCIAS
  ============================ */

  const openEstadoModal = (item, nuevoEstado) => {
    if (tipo === "cliente") {
      setEstadoModal({ visible: true, item, nuevoEstado, motivo: "", suspendidoHasta: "" });
    } else {
      updateEstadoEmprendedor(item, nuevoEstado);
    }
  };

  const updateEstadoClienteConfirmed = async () => {
    const { item, nuevoEstado, motivo, suspendidoHasta } = estadoModal;
    if (!motivo.trim()) return setError("El motivo es obligatorio.");

    try {
      const payload = {
        estado: nuevoEstado,
        motivo: motivo.trim(),
        ...(nuevoEstado === "Suspendido" && suspendidoHasta && { suspendidoHasta: new Date(suspendidoHasta).toISOString() })
      };

      const res = await fetch(`${BASE_URLS.cliente}/estado/${item._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", ...(token && { Authorization: `Bearer ${token}` }) },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error("Error en el servidor");
      setMensaje("Estado de cliente actualizado");
      setEstadoModal({ visible: false, item: null, nuevoEstado: null, motivo: "", suspendidoHasta: "" });
      fetchLista();
    } catch (err) { setError(err.message); }
  };

  const updateEstadoEmprendedor = async (item, nuevoEstado) => {
    try {
      const res = await fetch(`${BASE_URLS.emprendedor}/estado/${item._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", ...(token && { Authorization: `Bearer ${token}` }) },
        body: JSON.stringify({ estado_Emprendedor: nuevoEstado }),
      });
      if (!res.ok) throw new Error("Error al cambiar estado");
      setMensaje("Estado de emprendedor actualizado");
      fetchLista();
    } catch (err) { setError(err.message); }
  };

  /* ===========================
     EXPORTACIONES & CHAT
  ============================ */
  const exportCSV = (rows, filename) => {
    if (!rows.length) return setError("No hay datos");
    const cols = Object.keys(rows[0]);
    const header = cols.join(",");
    const body = rows.map(r => cols.map(c => `"${String(r[c] || "").replace(/"/g, '""')}"`).join(",")).join("\n");
    const blob = new Blob([[header, body].join("\n")], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `${filename}.csv`; a.click();
  };

  const abrirChat = (item) => {
    setChatUser({ id: item._id, rol: capitalize(tipo), nombre: item.nombre });
    setModalChatVisible(true);
    cargarMensajes(item._id);
  };

  const cargarMensajes = async (receptorId) => {
    try {
      const resConv = await fetch(`https://backend-production-bd1d.up.railway.app/api/chat/conversaciones/${emisorId}`);
      const dataConv = await resConv.json();
      const conv = dataConv.find(c => c.participantes?.some(p => p.id?._id === receptorId));
      if (conv) {
        const resMsgs = await fetch(`https://backend-production-bd1d.up.railway.app/api/chat/mensajes/${conv._id}`);
        setMensajes(await resMsgs.json());
      }
    } catch { console.error("Error chat"); }
  };

  const enviarMensaje = async (e) => {
    e.preventDefault();
    if (!mensajeChat.trim()) return;
    try {
      await fetch("https://backend-production-bd1d.up.railway.app/api/chat/mensaje", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ emisorId, emisorRol, receptorId: chatUser.id, receptorRol: chatUser.rol, contenido: mensajeChat })
      });
      setMensajeChat("");
      cargarMensajes(chatUser.id);
    } catch { setError("No se envió el mensaje"); }
  };

  /* ===========================
     RENDER UI
  ============================ */
  const listaFiltrada = lista.filter(x => 
    `${x.nombre} ${x.apellido} ${x.email} ${x.telefono}`.toLowerCase().includes(search.toLowerCase())
  );

  const EstadoBadge = ({ estado }) => (
    <span style={{ ...styles.badge, backgroundColor: ESTADO_COLORS[estado] || "#6c757d" }}>
      {estado}
    </span>
  );

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <h1 style={styles.title}>Panel de Administración</h1>
        <div style={styles.actionsBar}>
          <div style={styles.segmented}>
            <button style={tipo === "cliente" ? styles.segmentedActive : styles.segmentedBtn} onClick={() => setTipo("cliente")}>Clientes</button>
            <button style={tipo === "emprendedor" ? styles.segmentedActive : styles.segmentedBtn} onClick={() => setTipo("emprendedor")}>Emprendedores</button>
          </div>
          <input 
            style={styles.searchInput} 
            placeholder="Buscar..." 
            value={search} 
            onChange={(e) => setSearch(e.target.value)} 
          />
          <button style={styles.refreshBtn} onClick={fetchLista}>↻</button>
        </div>
      </header>

      {/* Alertas */}
      {error && <div style={{...styles.toast, backgroundColor: "#fee2e2", color: "#b91c1c"}}>{error}</div>}
      {mensaje && <div style={{...styles.toast, backgroundColor: "#dcfce7", color: "#15803d"}}>{mensaje}</div>}

      {/* Formulario Crear */}
      <section style={styles.card}>
        <h3>Crear {capitalize(tipo)}</h3>
        <form onSubmit={handleCrear} style={styles.grid2}>
          <input style={styles.input} placeholder="Nombre" value={formCrear.nombre} onChange={e => setFormCrear({...formCrear, nombre: e.target.value})} required />
          <input style={styles.input} placeholder="Apellido" value={formCrear.apellido} onChange={e => setFormCrear({...formCrear, apellido: e.target.value})} required />
          <input style={styles.input} placeholder="Email" type="email" value={formCrear.email} onChange={e => setFormCrear({...formCrear, email: e.target.value})} required />
          <input style={styles.input} placeholder="Password" type="password" value={formCrear.password} onChange={e => setFormCrear({...formCrear, password: e.target.value})} required />
          <input style={styles.input} placeholder="Teléfono" value={formCrear.telefono} onChange={e => setFormCrear({...formCrear, telefono: e.target.value})} />
          <button style={styles.btnPrimary} type="submit">Guardar</button>
        </form>
      </section>

      {/* Tabla */}
      <section style={styles.card}>
        <table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.th}>Nombre</th>
              <th style={styles.th}>Email</th>
              <th style={styles.th}>Estado</th>
              <th style={styles.th}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {loadingLista ? (
              <tr><td colSpan="4" style={styles.td}>Cargando...</td></tr>
            ) : listaFiltrada.map(item => (
              <React.Fragment key={item._id}>
                <tr>
                  <td style={styles.td} onClick={() => setExpandido(expandido === item._id ? null : item._id)}>
                    <b>{item.nombre} {item.apellido}</b>
                  </td>
                  <td style={styles.td}>{item.email}</td>
                  <td style={styles.td}>
                    <select 
                      value={item.estadoUI} 
                      onChange={(e) => openEstadoModal(item, e.target.value)}
                      style={styles.select}
                    >
                      {(tipo === "cliente" ? ESTADOS_CLIENTE : ESTADOS_EMPRENDEDOR).map(opt => (
                        <option key={opt} value={opt}>{opt}</option>
                      ))}
                    </select>
                    <EstadoBadge estado={item.estadoUI} />
                  </td>
                  <td style={styles.td}>
                    <button style={styles.btnTiny} onClick={() => abrirChat(item)}>💬</button>
                    <button style={styles.btnTinyDanger} onClick={() => setConfirmDelete({visible: true, id: item._id, nombre: item.nombre})}>🗑️</button>
                  </td>
                </tr>
                {expandido === item._id && (
                  <tr>
                    <td colSpan="4" style={styles.detailsCell}>
                      <p><b>Teléfono:</b> {item.telefono || "N/A"}</p>
                      <p><b>ID:</b> {item._id}</p>
                      <button style={styles.btnTiny} onClick={() => exportCSV([item], `perfil_${item.nombre}`)}>Exportar Datos</button>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </section>

      {/* MODAL CAMBIO DE ESTADO (CLIENTE) */}
      {estadoModal.visible && (
        <div style={styles.modalOverlay}>
          <div style={styles.modal}>
            <div style={styles.modalHeader}>Confirmar Cambio: {estadoModal.nuevoEstado}</div>
            <div style={styles.modalBody}>
              <label>Motivo del cambio:</label>
              <textarea 
                style={styles.input} 
                rows="3" 
                value={estadoModal.motivo} 
                onChange={e => setEstadoModal({...estadoModal, motivo: e.target.value})}
              />
              {estadoModal.nuevoEstado === "Suspendido" && (
                <>
                  <label>Suspender hasta:</label>
                  <input type="datetime-local" style={styles.input} onChange={e => setEstadoModal({...estadoModal, suspendidoHasta: e.target.value})} />
                </>
              )}
            </div>
            <div style={styles.modalFooter}>
              <button style={styles.btnSecondary} onClick={() => setEstadoModal({visible:false})}>Cancelar</button>
              <button style={styles.btnPrimary} onClick={updateEstadoClienteConfirmed}>Confirmar</button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL ELIMINAR */}
      {confirmDelete.visible && (
        <div style={styles.modalOverlay}>
          <div style={styles.modal}>
            <div style={styles.modalHeader}>¿Eliminar a {confirmDelete.nombre}?</div>
            <div style={styles.modalFooter}>
              <button style={styles.btnSecondary} onClick={() => setConfirmDelete({visible:false})}>No</button>
              <button style={styles.btnDanger} onClick={confirmarEliminar}>Sí, Eliminar</button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL CHAT */}
      {modalChatVisible && (
        <div style={styles.modalOverlay}>
          <div style={{...styles.modal, width: 400}}>
            <div style={styles.modalHeader}>Chat con {chatUser?.nombre} <button onClick={() => setModalChatVisible(false)}>X</button></div>
            <div style={{...styles.modalBody, height: 300, overflowY: "auto"}} ref={mensajesRef}>
              {mensajes.map((m, idx) => (
                <div key={idx} style={{ textAlign: m.emisorId === emisorId ? "right" : "left", margin: "5px 0" }}>
                  <span style={{ background: m.emisorId === emisorId ? "#0ea5e9" : "#e5e7eb", color: m.emisorId === emisorId ? "#fff" : "#000", padding: "5px 10px", borderRadius: 10 }}>
                    {m.contenido}
                  </span>
                </div>
              ))}
            </div>
            <form onSubmit={enviarMensaje} style={styles.modalFooter}>
              <input style={styles.input} value={mensajeChat} onChange={e => setMensajeChat(e.target.value)} placeholder="Mensaje..." />
              <button style={styles.btnPrimary} type="submit">Enviar</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

/* ===========================
   ESTILOS (Modernos)
=========================== */
const styles = {
  container: { maxWidth: 1000, margin: "20px auto", fontFamily: "sans-serif", padding: "0 20px" },
  header: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 },
  title: { fontSize: "24px", fontWeight: "bold" },
  actionsBar: { display: "flex", gap: "10px" },
  segmented: { display: "flex", border: "1px solid #ddd", borderRadius: "8px", overflow: "hidden" },
  segmentedBtn: { padding: "8px 15px", border: "none", background: "#fff", cursor: "pointer" },
  segmentedActive: { padding: "8px 15px", border: "none", background: "#0ea5e9", color: "#fff", fontWeight: "bold" },
  searchInput: { padding: "8px", borderRadius: "8px", border: "1px solid #ddd", width: "200px" },
  refreshBtn: { padding: "8px", cursor: "pointer", background: "#f3f4f6", border: "1px solid #ddd", borderRadius: "8px" },
  card: { background: "#fff", padding: "20px", borderRadius: "12px", border: "1px solid #e5e7eb", marginBottom: "20px", boxShadow: "0 1px 3px rgba(0,0,0,0.1)" },
  grid2: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" },
  input: { padding: "10px", borderRadius: "8px", border: "1px solid #ddd", marginBottom: "10px" },
  btnPrimary: { background: "#0ea5e9", color: "#fff", padding: "10px", border: "none", borderRadius: "8px", cursor: "pointer", fontWeight: "bold" },
  btnDanger: { background: "#dc3545", color: "#fff", padding: "10px", border: "none", borderRadius: "8px", cursor: "pointer" },
  btnSecondary: { background: "#6b7280", color: "#fff", padding: "10px", border: "none", borderRadius: "8px", cursor: "pointer" },
  table: { width: "100%", borderCollapse: "collapse" },
  th: { textAlign: "left", padding: "12px", borderBottom: "2px solid #0ea5e9", color: "#374151" },
  td: { padding: "12px", borderBottom: "1px solid #e5e7eb", fontSize: "14px" },
  badge: { padding: "3px 8px", borderRadius: "12px", color: "#fff", fontSize: "11px", marginLeft: "5px" },
  select: { padding: "5px", borderRadius: "5px", border: "1px solid #ddd" },
  btnTiny: { padding: "5px 8px", marginRight: "5px", cursor: "pointer", border: "none", background: "#f3f4f6", borderRadius: "4px" },
  btnTinyDanger: { padding: "5px 8px", cursor: "pointer", border: "none", background: "#fee2e2", color: "#b91c1c", borderRadius: "4px" },
  detailsCell: { background: "#f9fafb", padding: "15px", borderBottom: "1px solid #ddd" },
  modalOverlay: { position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 },
  modal: { background: "#fff", padding: "20px", borderRadius: "12px", width: "450px" },
  modalHeader: { fontWeight: "bold", fontSize: "18px", marginBottom: "15px", display: "flex", justifyContent: "space-between" },
  modalBody: { marginBottom: "15px" },
  modalFooter: { display: "flex", justifyContent: "flex-end", gap: "10px" },
  toast: { padding: "12px", borderRadius: "8px", marginBottom: "15px", fontWeight: "bold" }
};

export default Table;
