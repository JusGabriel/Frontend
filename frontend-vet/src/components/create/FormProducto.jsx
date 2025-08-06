import { useState, useEffect } from 'react'
import axios from 'axios'
import { toast } from 'react-toastify'
import storeAuth from '../../context/storeAuth'

export const FormProducto = () => {
  const { token, rol, id: emprendedorId } = storeAuth()

  const [form, setForm] = useState({
    nombre: '',
    descripcion: '',
    precio: '',
    imagen: '',
    categoria: '',
    stock: ''
  })
  const [loading, setLoading] = useState(false)
  const [productos, setProductos] = useState([])
  const [editando, setEditando] = useState(null)

  // Obtener productos del emprendedor
  const fetchMisProductos = async () => {
    if (!emprendedorId) return
    try {
      const url = `${import.meta.env.VITE_BACKEND_URL}/api/productos/emprendedor/${emprendedorId}`
      const config = { headers: { Authorization: `Bearer ${token}` } }
      const { data } = await axios.get(url, config)
      setProductos(data)
    } catch (error) {
      toast.error('Error al cargar productos')
    }
  }

  // Manejar cambios en el formulario
  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  // Registrar o actualizar producto
  const handleSubmit = async (e) => {
    e.preventDefault()

    if (rol !== 'emprendedor' && rol !== 'editor') {
      return toast.error('Solo emprendedores pueden crear productos')
    }

    const { nombre, descripcion, precio, imagen } = form
    if (!nombre || !descripcion || !precio || !imagen) {
      return toast.error('Completa todos los campos obligatorios')
    }

    const config = {
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }
    }

    const body = {
      ...form,
      precio: Number(form.precio),
      stock: form.stock ? Number(form.stock) : 0,
      categoria: form.categoria || null
    }

    try {
      setLoading(true)
      if (editando) {
        await axios.put(`${import.meta.env.VITE_BACKEND_URL}/api/productos/${editando}`, body, config)
        toast.success(`Producto actualizado ✅`)
        setEditando(null)
      } else {
        await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/productos`, body, config)
        toast.success(`Producto "${form.nombre}" registrado exitosamente ✅`)
      }
      setForm({ nombre: '', descripcion: '', precio: '', imagen: '', categoria: '', stock: '' })
      fetchMisProductos()
    } catch (err) {
      toast.error(err.response?.data?.mensaje || 'Error en la operación')
    } finally {
      setLoading(false)
    }
  }

  // Eliminar producto
  const handleDelete = async (id) => {
    if (!confirm('¿Seguro que deseas eliminar este producto?')) return
    try {
      const url = `${import.meta.env.VITE_BACKEND_URL}/api/productos/${id}`
      const config = { headers: { Authorization: `Bearer ${token}` } }
      await axios.delete(url, config)
      toast.success('Producto eliminado ✅')
      fetchMisProductos()
    } catch (err) {
      toast.error('Error al eliminar producto')
    }
  }

  // Cargar producto al formulario para editar
  const handleEdit = (producto) => {
    setForm({
      nombre: producto.nombre,
      descripcion: producto.descripcion,
      precio: String(producto.precio),
      imagen: producto.imagen,
      categoria: producto.categoria || '',
      stock: String(producto.stock || '')
    })
    setEditando(producto._id)
  }

  // Cargar productos al montar el componente
  useEffect(() => {
    if ((rol === 'emprendedor' || rol === 'editor') && emprendedorId) fetchMisProductos()
  }, [rol, emprendedorId])

  return (
    <div className="grid gap-10">
      {/* Formulario */}
      <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-md grid gap-6">
        <h2 className="text-2xl font-bold">{editando ? 'Editar producto' : 'Nuevo producto'}</h2>

        <input name='nombre' value={form.nombre} onChange={handleChange} placeholder='Nombre *' className='input' />
        <textarea name='descripcion' value={form.descripcion} onChange={handleChange} placeholder='Descripción *' rows='2' className='input' />
        <input type='number' name='precio' value={form.precio} onChange={handleChange} placeholder='Precio *' className='input' />
        <input type='number' name='stock' value={form.stock} onChange={handleChange} placeholder='Stock' className='input' />
        <input name='imagen' value={form.imagen} onChange={handleChange} placeholder='URL imagen *' className='input' />
        <input name='categoria' value={form.categoria} onChange={handleChange} placeholder='ID categoría' className='input' />

        <div className='text-right'>
          <button disabled={loading} className='btn-primary'>
            {loading ? 'Guardando...' : (editando ? 'Actualizar' : 'Registrar')}
          </button>
        </div>
      </form>

      {/* Lista de productos */}
      <div className="bg-white dark:bg-gray-900 p-6 rounded-xl shadow">
        <h2 className="text-xl font-bold mb-4">Mis productos</h2>
        {productos.length === 0 ? (
          <p className="text-gray-500">Aún no has registrado productos.</p>
        ) : (
          <div className="grid md:grid-cols-2 gap-4">
            {productos.map((prod) => (
              <div key={prod._id} className="border p-4 rounded-lg flex flex-col gap-2">
                <img src={prod.imagen} alt={prod.nombre} className="w-full h-48 object-cover rounded" />
                <h3 className="font-bold text-lg">{prod.nombre}</h3>
                <p className="text-sm">{prod.descripcion}</p>
                <p className="text-blue-500 font-semibold">${prod.precio}</p>
                <div className="flex gap-2 justify-end">
                  <button onClick={() => handleEdit(prod)} className="btn-secondary">Editar</button>
                  <button onClick={() => handleDelete(prod._id)} className="btn-danger">Eliminar</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
