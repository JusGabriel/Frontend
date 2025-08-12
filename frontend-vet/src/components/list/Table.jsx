import React, { useEffect, useState, useRef } from "react";
import storeAuth from "../../context/storeAuth";

const BASE_URLS = {
  cliente: "https://backend-production-bd1d.up.railway.app/api/clientes",
  emprendedor: "https://backend-production-bd1d.up.railway.app/api/emprendedores",
};

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

  // Estado para chat
  const [chatAbierto, setChatAbierto] = useState(false);
  const [chatUser, setChatUser] = useState(null);
  const [chatMensajes, setChatMensajes] = useState([]);
  const [chatNuevoMensaje, setChatNuevoMensaje] = useState("");
  const chatEndRef = useRef(null);

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

  // Chat: cargar mensajes entre yo y chatUser
  // Para demo, simulo que backend devuelve mensajes en:
  // GET /api/chat/mensajes?user1=YO_ID&user2=CHAT_USER_ID
  // Aquí usarás tu backend real

  const usuarioActual = storeAuth((state) => state.id);

  const cargarMensajes = async (userId) => {
    if (!usuarioActual || !userId) return;
    try {
      const res = await fetch(
        `https://backend-production-bd1d.up.railway.app/api/chat/mensajes?user1=${usuarioActual}&user2=${userId}`
      );
      const data = await res.json();
      setChatMensajes(data || []);
      scrollChatAbajo();
    } catch (error) {
      console.error("Error cargando mensajes de chat:", error);
    }
  };

  // Abrir chat con usuario
  const abrirChat = (user) => {
    setChatUser(user);
    setChatAbierto(true);
    cargarMensajes(user._id);
  };

  // Enviar mensaje (simulado con POST)
  const enviarMensaje = async () => {
    if (!chatNuevoMensaje.trim() || !chatUser) return;
    try {
      const res = await fetch(
        "https://backend-production-bd1d.up.railway.app/api/chat/mensaje",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            emisorId: usuarioActual,
            emisorRol: tipo === "cliente" ? "Cliente" : "Emprendedor",
            receptorId: chatUser._id,
            receptorRol: chatUser.rol || capitalize(tipo),
            contenido: chatNuevoMensaje.trim(),
          }),
        }
      );
      if (!res.ok) throw new Error("Error enviando mensaje");
      const nuevoMsg = await res.json();
      setChatMensajes((prev) => [...prev, nuevoMsg]);
      setChatNuevoMensaje("");
      scrollChatAbajo();
    } catch (error) {
      console.error("Error enviando mensaje:", error);
    }
  };

  // Scroll abajo al enviar o cargar mensajes
  const scrollChatAbajo = () => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  };

  const toggleExpandido = (id) => {
    setExpandido(expandido === id ? null : id);
  };

  const inputsForm = (form, setForm) => (
    <>
      <input
        style={styles.input}
        placeholder="Nombre"
        value={form.nombre}
        onChange={(e) => setForm({ ...form, nombre: e.target.value })}
        required
      />
      <input
        style={styles.input}
        placeholder="Apellido"
        value={form.apellido}
        onChange={(e) => setForm({ ...form, apellido: e.target.value })}
        required
      />
      <input
        style={styles.input}
        type="email"
        placeholder="Email"
        value={form.email}
        onChange={(e) => setForm({ ...form, email: e.target.value })}
        required
      />
      <input
        style={styles.input}
        type="password"
        placeholder="Password"
        value={form.password}
        onChange={(e) => setForm({ ...form, password: e.target.value })}
        required={form.id === null}
      />
      <input
        style={styles.input}
        placeholder="Teléfono"
        value={form.telefono}
        onChange={(e) => setForm({ ...form, telefono: e.target.value })}
      />
    </>
  );

  // Función para capitalizar la primera letra
  const capitalize = (str) => str.charAt(0).toUpperCase() + str.slice(1);

  return (
    <div style={styles.container}>
      <h1 style={{ textAlign: "center" }}>
        Gestión {capitalize(tipo)}s
      </h1>

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
        {inputsForm(formCrear, setFormCrear)}
        <button style={styles.btnCrear} type="submit">
          Crear
        </button>
      </form>

      {/* Form Editar */}
      {formEditar.id && (
        <form onSubmit={handleActualizar} style={styles.form}>
          <h2>Editar {capitalize(tipo)}</h2>
          {inputsForm(formEditar, setFormEditar)}
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
                onClick={() => toggleExpandido(item._id)}
              >
                <td style={styles.td}>{i + 1}</td>
                <td style={styles.td}>{item.nombre}</td>
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
                      abrirChat({ ...item, rol: capitalize(tipo) });
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

      {/* Ventana Chat */}
      {chatAbierto && (
        <div style={styles.chatOverlay} onClick={() => setChatAbierto(false)}>
          <div
            style={styles.chatContainer}
            onClick={(e) => e.stopPropagation()}
          >
            <header style={styles.chatHeader}>
              <h3>
                Chat con {chatUser?.nombre} {chatUser?.apellido}
              </h3>
              <button
                style={styles.chatCloseBtn}
                onClick={() => setChatAbierto(false)}
                aria-label="Cerrar chat"
              >
                ×
              </button>
            </header>
            <div style={styles.chatMessages}>
              {chatMensajes.length === 0 ? (
                <p style={{ color: "#666", textAlign: "center", marginTop: 20 }}>
                  No hay mensajes aún. ¡Empieza la conversación!
                </p>
              ) : (
                chatMensajes.map((msg, i) => (
                  <div
                    key={msg._id || i}
                    style={{
                      margin: "5px 0",
                      textAlign:
                        msg.emisorId === usuarioActual ? "right" : "left",
                    }}
                  >
                    <div
                      style={{
                        display: "inline-block",
                        padding: "8px 14px",
                        borderRadius: 20,
                        backgroundColor:
                          msg.emisorId === usuarioActual
                            ? "#28a745"
                            : "#e0e0e0",
                        color:
                          msg.emisorId === usuarioActual ? "white" : "black",
                        maxWidth: "70%",
                        wordBreak: "break-word",
                      }}
                    >
                      {msg.contenido}
                    </div>
                  </div>
                ))
              )}
              <div ref={chatEndRef} />
            </div>
            <form
              style={styles.chatForm}
              onSubmit={(e) => {
                e.preventDefault();
                enviarMensaje();
              }}
            >
              <input
                style={styles.chatInput}
                type="text"
                placeholder="Escribe un mensaje..."
                value={chatNuevoMensaje}
                onChange={(e) => setChatNuevoMensaje(e.target.value)}
                autoFocus
              />
              <button type="submit" style={styles.chatSendBtn}>
                Enviar
              </button>
            </form>
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
    position: "relative",
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

  // Chat overlay
  chatOverlay: {
    position: "fixed",
    top: 0,
    left: 0,
    width: "100vw",
    height: "100vh",
    backgroundColor: "rgba(0,0,0,0.3)",
    display: "flex",
    justifyContent: "flex-end",
    zIndex: 9999,
  },
  chatContainer: {
    width: 400,
    height: "100%",
    backgroundColor: "white",
    display: "flex",
    flexDirection: "column",
    boxShadow: "-3px 0 15px rgba(0,0,0,0.2)",
  },
  chatHeader: {
    padding: "15px 20px",
    borderBottom: "1px solid #ddd",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    fontWeight: "bold",
    fontSize: 18,
    backgroundColor: "#007bff",
    color: "white",
  },
  chatCloseBtn: {
    background: "transparent",
    border: "none",
    color: "white",
    fontSize: 28,
    lineHeight: 1,
    cursor: "pointer",
  },
  chatMessages: {
    flex: 1,
    padding: "15px 20px",
    overflowY: "auto",
    backgroundColor: "#f5f5f5",
  },
  chatForm: {
    display: "flex",
    padding: 15,
    borderTop: "1px solid #ddd",
  },
  chatInput: {
    flex: 1,
    padding: 10,
    borderRadius: 20,
    border: "1px solid #ccc",
    outline: "none",
  },
  chatSendBtn: {
    marginLeft: 10,
    padding: "10px 20px",
    borderRadius: 20,
    border: "none",
    backgroundColor: "#28a745",
    color: "white",
    cursor: "pointer",
    fontWeight: "bold",
  },
};

export default Table;
