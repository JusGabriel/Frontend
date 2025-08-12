import React, { useEffect, useState, useRef } from "react";
import storeAuth from "../../context/storeAuth";

const BASE_URLS = {
  cliente: "https://backend-production-bd1d.up.railway.app/api/clientes",
  emprendedor: "https://backend-production-bd1d.up.railway.app/api/emprendedores",
};

const CHAT_API_BASE = "https://backend-production-bd1d.up.railway.app/api/chat";

const emptyForm = {
  nombre: "",
  apellido: "",
  email: "",
  password: "",
  telefono: "",
};

const Table = () => {
  const { id: usuarioId, rol: emisorRol } = storeAuth();

  const [tipo, setTipo] = useState("cliente");
  const [lista, setLista] = useState([]);
  const [formCrear, setFormCrear] = useState(emptyForm);
  const [formEditar, setFormEditar] = useState({ id: null, ...emptyForm });
  const [error, setError] = useState("");
  const [mensaje, setMensaje] = useState("");
  const [expandido, setExpandido] = useState(null);

  // Estados para chat
  const [modalChatVisible, setModalChatVisible] = useState(false);
  const [chatUser, setChatUser] = useState(null);
  const [conversacionId, setConversacionId] = useState(null);
  const [mensajes, setMensajes] = useState([]);
  const [mensajeTexto, setMensajeTexto] = useState("");
  const mensajesRef = useRef(null);

  // Carga lista (clientes o emprendedores)
  const fetchLista = async () => {
    setError("");
    setMensaje("");
    try {
      const res = await fetch(`${BASE_URLS[tipo]}/todos`);
      const data = await res.json();
      setLista(data);
    } catch {
      setError("Error cargando datos");
    }
  };

  useEffect(() => {
    fetchLista();
    setFormCrear(emptyForm);
    setFormEditar({ id: null, ...emptyForm });
    setExpandido(null);
    setError("");
    setMensaje("");
  }, [tipo]);

  // Métodos creación/edición/eliminación: ... (igual que tu código)

  // Toggle fila expandida
  const toggleExpandido = (id) => {
    setExpandido(expandido === id ? null : id);
  };

  // Abrir chat: crea o carga la conversación
  const abrirChat = async (item) => {
    setChatUser({ id: item._id, rol: capitalize(tipo), nombre: item.nombre });
    setModalChatVisible(true);

    // Cargar conversaciones del usuario logueado
    try {
      const resConv = await fetch(`${CHAT_API_BASE}/conversaciones/${usuarioId}`);
      const dataConv = await resConv.json();

      // Buscar si ya existe conversación con el chatUser
      const convExistente = dataConv.find((conv) =>
        conv.participantes.some((p) => p.id && p.id._id === item._id)
      );

      if (convExistente) {
        setConversacionId(convExistente._id);
        await cargarMensajes(convExistente._id);
      } else {
        // Crear nueva conversación
        const resCrear = await fetch(`${CHAT_API_BASE}/conversacion`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            participantes: [
              { id: usuarioId, rol: emisorRol },
              { id: item._id, rol: capitalize(tipo) },
            ],
          }),
        });

        if (!resCrear.ok) throw new Error("Error creando conversación");

        const dataNuevaConv = await resCrear.json();
        setConversacionId(dataNuevaConv._id);
        setMensajes([]);
      }
    } catch (error) {
      setError("Error cargando conversación: " + error.message);
    }
  };

  // Cargar mensajes de una conversación
  const cargarMensajes = async (convId) => {
    try {
      const res = await fetch(`${CHAT_API_BASE}/mensajes/${convId}`);
      if (!res.ok) throw new Error("Error cargando mensajes");
      const data = await res.json();
      setMensajes(data);
    } catch (error) {
      setError("Error cargando mensajes: " + error.message);
    }
  };

  // Enviar mensaje
  const enviarMensaje = async (e) => {
    e.preventDefault();
    if (!mensajeTexto.trim() || !conversacionId || !chatUser) return;

    try {
      const res = await fetch(`${CHAT_API_BASE}/mensaje`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          emisorId: usuarioId,
          emisorRol,
          receptorId: chatUser.id,
          receptorRol: chatUser.rol,
          contenido: mensajeTexto.trim(),
        }),
      });

      const data = await res.json();

      if (res.ok) {
        setMensajeTexto("");
        await cargarMensajes(conversacionId);
      } else {
        setError("Error enviando mensaje: " + (data.mensaje || "Error desconocido"));
      }
    } catch (error) {
      setError("Error de red al enviar mensaje: " + error.message);
    }
  };

  // Polling para refrescar mensajes cada 3 segundos cuando el modal está abierto
  useEffect(() => {
    if (!modalChatVisible || !conversacionId) return;

    const intervalo = setInterval(() => {
      cargarMensajes(conversacionId);
    }, 3000);

    return () => clearInterval(intervalo);
  }, [modalChatVisible, conversacionId]);

  // Auto scroll cuando cambian mensajes
  useEffect(() => {
    if (mensajesRef.current) {
      mensajesRef.current.scrollTop = mensajesRef.current.scrollHeight;
    }
  }, [mensajes]);

  // Cerrar modal chat
  const cerrarChat = () => {
    setModalChatVisible(false);
    setChatUser(null);
    setConversacionId(null);
    setMensajes([]);
    setMensajeTexto("");
    setError("");
  };

  // Capitaliza
  const capitalize = (str) => str.charAt(0).toUpperCase() + str.slice(1);

  // El resto de funciones para CRUD igual...

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

      {/* Formularios y tabla (igual que tu código) */}
      {/* ... */}
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
                onClick={() => toggleExpandido(item._id)}
              >
                <td style={styles.td}>{i + 1}</td>
                <td style={styles.td}>{item.nombre}</td>
                <td style={styles.td}>{item.apellido}</td>
                <td style={styles.td}>{item.email}</td>
                <td style={styles.td}>{item.telefono || "N/A"}</td>
                <td style={styles.td}>
                  {/* Otros botones */}
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
              {expandido === item._id && (
                <tr style={{ backgroundColor: "#eef6ff" }}>
                  <td colSpan="6" style={{ padding: 10 }}>
                    <strong>Detalles:</strong>
                    <div>
                      Nombre completo: {item.nombre} {item.apellido}
                    </div>
                    <div>Email: {item.email}</div>
                    <div>Teléfono: {item.telefono || "N/A"}</div>
                    <div>Creado: {new Date(item.createdAt).toLocaleString()}</div>
                    <div>Actualizado: {new Date(item.updatedAt).toLocaleString()}</div>
                  </td>
                </tr>
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
                X
              </button>
            </div>
            <div
              style={{
                ...styles.modalBody,
                display: "flex",
                flexDirection: "column",
                justifyContent: "flex-end",
                height: 300,
              }}
            >
              <div
                ref={mensajesRef}
                style={{ flex: 1, overflowY: "auto", marginBottom: 10 }}
              >
                {mensajes.length === 0 && (
                  <p style={{ color: "#888", textAlign: "center" }}>
                    No hay mensajes aún.
                  </p>
                )}
                {mensajes.map((msg) => {
                  const esMio = msg.emisorId === usuarioId || msg.emisor === usuarioId;
                  return (
                    <div
                      key={msg._id || msg.id}
                      style={{
                        textAlign: esMio ? "right" : "left",
                        marginBottom: 5,
                      }}
                    >
                      <span
                        style={{
                          display: "inline-block",
                          padding: "6px 10px",
                          borderRadius: 15,
                          backgroundColor: esMio ? "#28a745" : "#e2e2e2",
                          color: esMio ? "white" : "black",
                          maxWidth: "80%",
                          wordWrap: "break-word",
                        }}
                      >
                        {msg.contenido}
                      </span>
                    </div>
                  );
                })}
              </div>

              <form onSubmit={enviarMensaje} style={{ display: "flex" }}>
                <input
                  type="text"
                  value={mensajeTexto}
                  onChange={(e) => setMensajeTexto(e.target.value)}
                  placeholder="Escribe un mensaje..."
                  style={{
                    flex: 1,
                    padding: "8px 12px",
                    borderRadius: "20px 0 0 20px",
                    border: "1px solid #ccc",
                    outline: "none",
                  }}
                  autoComplete="off"
                />
                <button
                  type="submit"
                  style={{
                    backgroundColor: "#28a745",
                    color: "white",
                    border: "none",
                    borderRadius: "0 20px 20px 0",
                    padding: "0 16px",
                    cursor: "pointer",
                    fontWeight: "bold",
                  }}
                >
                  Enviar
                </button>
              </form>
            </div>
            <div style={styles.modalFooter}>
              <button style={styles.btnCerrar} onClick={cerrarChat}>
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const styles = {
  container: {
    maxWidth: 900,
    margin: "auto",
    padding: 20,
    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
  },
  toggleContainer: {
    display: "flex",
    justifyContent: "center",
    marginBottom: 15,
  },
  toggle: {
    backgroundColor: "#ddd",
    border: "none",
    padding: "10px 20px",
    cursor: "pointer",
    fontWeight: "bold",
    margin: "0 5px",
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
    margin: "0 5px",
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

  // Estilos modal y overlay
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
    width: 350,
    maxWidth: "90%",
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
  },
  modalFooter: {
    padding: 10,
    borderTop: "1px solid #ddd",
    display: "flex",
    justifyContent: "flex-end",
  },
};
export default Table;
