import React, { useState, useEffect } from "react";
import axios from "axios";
import storeAuth from "../../context/storeAuth";

export const FormProducto = () => {
  const { token, id: emprendedorId } = storeAuth();
  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    nombre: "",
    descripcion: "",
    precio: "",
    imagen: "",
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

  useEffect(() => {
    cargarProductos();
  }, [emprendedorId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

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
      setError(err.response?.data?.mensaje || "Error al crear producto");
    }
  };

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

  const handleSubmit = (e) => {
    e.preventDefault();
    if (modoEdicion) {
      actualizarProducto();
    } else {
      crearProducto();
    }
  };

  return (
    <>
      {/* FORMULARIO */}
      <div
        style={{
          background: "#ffffff",
          padding: "1.5rem",
          borderRadius: "15px",
          boxShadow: "0 10px 30px rgba(0,0,0,0.15)",
          width: "100%",
          maxWidth: "750px",
          marginLeft: 0,
          fontFamily: "'Playfair Display', serif",
        }}
      >
        <h2
          style={{
            fontSize: "1.6rem",
            fontWeight: "600",
            color: "#3B2F2F",
            marginBottom: "1rem",
            textAlign: "center",
          }}
        >
          {modoEdicion ? "Editar Producto" : "Crear Producto"}
        </h2>

        <hr
          style={{
            border: "none",
            borderTop: "2px solid #ccc",
            marginBottom: "1rem",
          }}
        />

        {error && (
          <p
            style={{
              backgroundColor: "#fee2e2",
              color: "#b91c1c",
              padding: "0.75rem",
              borderRadius: "8px",
              marginBottom: "1rem",
              fontFamily: "'Arial', sans-serif",
            }}
          >
            {error}
          </p>
        )}

        <form
          onSubmit={handleSubmit}
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "0.8rem",
            fontFamily: "'Arial', sans-serif",
            color: "#333",
          }}
        >
          <input
            type="text"
            name="nombre"
            placeholder="Nombre"
            value={form.nombre}
            onChange={handleChange}
            required
            style={{
              padding: "0.5rem",
              border: "1px solid #ccc",
              borderRadius: "10px",
              fontSize: "1rem",
            }}
          />

          <input
            type="text"
            name="descripcion"
            placeholder="Descripción"
            value={form.descripcion}
            onChange={handleChange}
            style={{
              padding: "0.5rem",
              border: "1px solid #ccc",
              borderRadius: "10px",
              fontSize: "1rem",
            }}
          />

          <input
            type="number"
            name="precio"
            placeholder="Precio"
            step="0.01"
            value={form.precio}
            onChange={handleChange}
            required
            min="0"
            style={{
              padding: "0.5rem",
              border: "1px solid #ccc",
              borderRadius: "10px",
              fontSize: "1rem",
            }}
          />

          <input
            type="text"
            name="imagen"
            placeholder="URL Imagen"
            value={form.imagen}
            onChange={handleChange}
            style={{
              padding: "0.5rem",
              border: "1px solid #ccc",
              borderRadius: "10px",
              fontSize: "1rem",
            }}
          />

          <input
            type="number"
            name="stock"
            placeholder="Stock"
            value={form.stock}
            onChange={handleChange}
            min="0"
            style={{
              padding: "0.5rem",
              border: "1px solid #ccc",
              borderRadius: "10px",
              fontSize: "1rem",
            }}
          />

          <div
            style={{
              display: "flex",
              justifyContent: "flex-end",
              gap: "1rem",
              marginTop: "1rem",
            }}
          >
            <button
              type="submit"
              style={{
                padding: "0.5rem 1.5rem",
                backgroundColor: "#AA4A44",
                color: "white",
                border: "none",
                borderRadius: "25px",
                fontSize: "1rem",
                cursor: "pointer",
                transition: "background-color 0.3s",
              }}
              onMouseOver={(e) =>
                (e.currentTarget.style.backgroundColor = "#8C3E39")
              }
              onMouseOut={(e) =>
                (e.currentTarget.style.backgroundColor = "#AA4A44")
              }
            >
              {modoEdicion ? "Actualizar" : "Crear"}
            </button>

            {modoEdicion && (
              <button
                type="button"
                onClick={resetForm}
                style={{
                  padding: "0.5rem 1.5rem",
                  backgroundColor: "#ccc",
                  color: "#333",
                  border: "none",
                  borderRadius: "25px",
                  fontSize: "1rem",
                  cursor: "pointer",
                  transition: "background-color 0.3s",
                }}
                onMouseOver={(e) =>
                  (e.currentTarget.style.backgroundColor = "#aaa")
                }
                onMouseOut={(e) =>
                  (e.currentTarget.style.backgroundColor = "#ccc")
                }
              >
                Cancelar
              </button>
            )}
          </div>
        </form>
      </div>

      {/* LISTA DE PRODUCTOS */}
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
                  <img src={prod.imagen} alt={prod.nombre} style={styles.imagen} />
                )}
                <p>
                  Categoría:{" "}
                  {prod.categoria ? prod.categoria.nombre || prod.categoria : "N/A"}
                </p>
              </div>
              <div style={styles.buttonsCard}>
                <button style={styles.buttonEdit} onClick={() => editarProducto(prod)}>
                  Editar
                </button>
                <button style={styles.buttonDelete} onClick={() => eliminarProducto(prod._id)}>
                  Borrar
                </button>
                <button
                  style={styles.buttonBuy}
                  onClick={() => alert(`Comprando: ${prod.nombre}`)}
                >
                  Comprar
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </>
  );
};

const styles = {
  listaContainer: {
    maxWidth: 750,
    margin: "1.5rem auto 0 auto",
    padding: 15,
    display: "flex",
    flexWrap: "wrap", // para permitir varias filas
    gap: 15,
    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
    justifyContent: "space-between",
  },
  productoCard: {
    flex: "1 1 calc(25% - 15px)", // ancho aprox 25% menos espacio de gap
    boxSizing: "border-box",
    display: "flex",
    flexDirection: "column",
    border: "1px solid #ddd",
    borderRadius: 6,
    padding: 15,
    boxShadow: "0 1px 4px rgba(0,0,0,0.1)",
    backgroundColor: "#fff",
    maxWidth: "calc(25% - 15px)", // para no crecer demasiado
    minWidth: "180px",
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
  buttonBuy: {
    backgroundColor: "#4a9716ff",
    color: "white",
    border: "none",
    padding: "8px 12px",
    borderRadius: 4,
    cursor: "pointer",
  },
};
