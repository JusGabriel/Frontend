import React, { useState, useEffect } from "react";
import axios from "axios";
import storeAuth from "../../context/storeAuth"; // ajusta la ruta si es necesario

export const FormProducto = () => {
  const { token, id: emprendedorId } = storeAuth();
  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    nombre: "",
    descripcion: "",
    precio: "",
    imagen: "",
    // categoria: "",  <-- eliminado por ahora
    stock: "",
  });
  const [modoEdicion, setModoEdicion] = useState(false);
  const [productoEditId, setProductoEditId] = useState(null);
  const [error, setError] = useState(null);

  // Cargar productos del emprendedor
  const cargarProductos = async () => {
    if (!emprendedorId) return;
    setLoading(true);
    setError(null);
    try {
      const res = await axios.get(
        `https://backend-production-bd1d.up.railway.app/api/productos/emprendedor/${emprendedorId}`
      );
      setProductos(res.data);
    } catch (err) {
      setError("Error al cargar productos");
    } finally {
      setLoading(false);
    }
  };

  // Cargar productos al iniciar o cuando cambia emprendedorId
  useEffect(() => {
    cargarProductos();
  }, [emprendedorId]);

  // Manejar cambio en inputs
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  // Resetear formulario y estados
  const resetForm = () => {
    setForm({
      nombre: "",
      descripcion: "",
      precio: "",
      imagen: "",
      stock: "",
    });
    setModoEdicion(false);
    setProductoEditId(null);
    setError(null);
  };

  // Crear nuevo producto
  const crearProducto = async () => {
    if (!token) {
      setError("No autenticado");
      return;
    }
    try {
      await axios.post(
        "https://backend-production-bd1d.up.railway.app/api/productos",
        {
          ...form,
          categoria: null, // mantenemos null si no se usa categoria
          precio: Number(form.precio),
          stock: Number(form.stock),
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      cargarProductos();
      resetForm();
    } catch (err) {
      setError(err.response?.data?.mensaje || "Error al crear producto");
    }
  };

  // Preparar formulario para editar producto existente
  const editarProducto = (producto) => {
    setModoEdicion(true);
    setProductoEditId(producto._id);
    setForm({
      nombre: producto.nombre || "",
      descripcion: producto.descripcion || "",
      precio: producto.precio || "",
      imagen: producto.imagen || "",
      stock: producto.stock || "",
    });
    setError(null);
  };

  // Actualizar producto
  const actualizarProducto = async () => {
    if (!token || !productoEditId) {
      setError("No autenticado o producto inválido");
      return;
    }
    try {
      await axios.put(
        `https://backend-production-bd1d.up.railway.app/api/productos/${productoEditId}`,
        {
          ...form,
          categoria: null,
          precio: Number(form.precio),
          stock: Number(form.stock),
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      cargarProductos();
      resetForm();
    } catch (err) {
      setError(err.response?.data?.mensaje || "Error al actualizar producto");
    }
  };

  // Eliminar producto
  const eliminarProducto = async (id) => {
    if (!token) {
      setError("No autenticado");
      return;
    }
    if (!window.confirm("¿Estás seguro de eliminar este producto?")) return;

    try {
      await axios.delete(
        `https://backend-production-bd1d.up.railway.app/api/productos/${id}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      cargarProductos();
    } catch (err) {
      setError(err.response?.data?.mensaje || "Error al eliminar producto");
    }
  };

  // Enviar formulario
  const handleSubmit = (e) => {
    e.preventDefault();
    if (modoEdicion) {
      actualizarProducto();
    } else {
      crearProducto();
    }
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>Mis Productos</h2>

      {/* Formulario Crear/Editar */}
      <form onSubmit={handleSubmit} style={styles.form}>
        {error && <p style={styles.error}>{error}</p>}

        <input
          style={styles.input}
          name="nombre"
          placeholder="Nombre"
          value={form.nombre}
          onChange={handleChange}
          required
        />
        <input
          style={styles.input}
          name="descripcion"
          placeholder="Descripción"
          value={form.descripcion}
          onChange={handleChange}
        />
        <input
          style={styles.input}
          name="precio"
          placeholder="Precio"
          type="number"
          step="0.01"
          value={form.precio}
          onChange={handleChange}
          required
          min="0"
        />
        <input
          style={styles.input}
          name="imagen"
          placeholder="URL Imagen"
          value={form.imagen}
          onChange={handleChange}
        />
        <input
          style={styles.input}
          name="stock"
          placeholder="Stock"
          type="number"
          value={form.stock}
          onChange={handleChange}
          min="0"
        />

        <div style={styles.buttons}>
          <button type="submit" style={styles.buttonPrimary}>
            {modoEdicion ? "Actualizar" : "Crear"}
          </button>
          {modoEdicion && (
            <button
              type="button"
              style={styles.buttonSecondary}
              onClick={resetForm}
            >
              Cancelar
            </button>
          )}
        </div>
      </form>

      {/* Lista de productos */}
      <div style={styles.listaContainer}>
        {loading ? (
          <p>Cargando productos...</p>
        ) : productos.length === 0 ? (
          <p>No tienes productos aún.</p>
        ) : (
          productos.map((prod) => (
            <div key={prod._id} style={styles.productoCard}>
              <div style={styles.productoInfo}>
                <strong>{prod.nombre}</strong>
                <p>{prod.descripcion}</p>
                <p>
                  Precio: <b>${prod.precio.toFixed(2)}</b>
                </p>
                <p>Stock: {prod.stock}</p>
                {prod.imagen && (
                  <img
                    src={prod.imagen}
                    alt={prod.nombre}
                    style={styles.imagen}
                  />
                )}
                <p>
                  Categoría:{" "}
                  {prod.categoria ? prod.categoria.nombre || prod.categoria : "N/A"}
                </p>
              </div>
              <div style={styles.buttonsCard}>
                <button
                  style={styles.buttonEdit}
                  onClick={() => editarProducto(prod)}
                >
                  Editar
                </button>
                <button
                  style={styles.buttonDelete}
                  onClick={() => eliminarProducto(prod._id)}
                >
                  Borrar
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

const styles = {
  container: {
    maxWidth: 700,
    margin: "auto",
    padding: 15,
    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
  },
  title: {
    textAlign: "center",
    marginBottom: 20,
  },
  form: {
    display: "flex",
    flexWrap: "wrap",
    gap: 10,
    marginBottom: 30,
    backgroundColor: "#f7f7f7",
    padding: 15,
    borderRadius: 6,
    boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
  },
  input: {
    flex: "1 1 45%",
    padding: 10,
    fontSize: 14,
    borderRadius: 4,
    border: "1px solid #ccc",
  },
  buttons: {
    width: "100%",
    display: "flex",
    justifyContent: "flex-end",
    gap: 10,
  },
  buttonPrimary: {
    backgroundColor: "#0a74da",
    color: "white",
    padding: "10px 16px",
    border: "none",
    borderRadius: 4,
    cursor: "pointer",
  },
  buttonSecondary: {
    backgroundColor: "#aaa",
    color: "white",
    padding: "10px 16px",
    border: "none",
    borderRadius: 4,
    cursor: "pointer",
  },
  listaContainer: {
    display: "flex",
    flexDirection: "column",
    gap: 15,
  },
  productoCard: {
    display: "flex",
    flexDirection: "column",
    border: "1px solid #ddd",
    borderRadius: 6,
    padding: 15,
    boxShadow: "0 1px 4px rgba(0,0,0,0.1)",
    backgroundColor: "#fff",
  },
  productoInfo: {
    marginBottom: 10,
  },
  imagen: {
    maxWidth: "100%",
    height: "auto",
    borderRadius: 6,
    marginTop: 10,
  },
  buttonsCard: {
    display: "flex",
    justifyContent: "flex-end",
    gap: 10,
  },
  buttonEdit: {
    backgroundColor: "#ffc107",
    border: "none",
    padding: "8px 12px",
    borderRadius: 4,
    cursor: "pointer",
  },
  buttonDelete: {
    backgroundColor: "#dc3545",
    color: "white",
    border: "none",
    padding: "8px 12px",
    borderRadius: 4,
    cursor: "pointer",
  },
};
