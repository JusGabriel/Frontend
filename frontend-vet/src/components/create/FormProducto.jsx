import { useState } from 'react'
import storeAuth from '../../context/storeAuth'
import storeProfile from '../../context/storeProfile'
import axios from 'axios'
import { toast } from 'react-toastify'

export const FormProducto = () => {
  const { token, rol } = storeAuth()
  const { user } = storeProfile()

  const [form, setForm] = useState({
    nombre: '',
    descripcion: '',
    precio: '',
    imagen: '',
    categoria: '',
    stock: ''
  })

  const [loading, setLoading] = useState(false)

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

const handleSubmit = async (e) => {
    e.preventDefault();

    if (rol !== 'editor') {
        toast.error('Solo los emprendedores pueden crear productos');
        return;
    }

    const { nombre, descripcion, precio, imagen, categoria, stock } = form;

    if (!nombre || !descripcion || !precio || !imagen) {
        toast.error('Por favor completa todos los campos obligatorios (*)');
        return;
    }

    if (isNaN(Number(precio)) || Number(precio) <= 0) {
        toast.error('Precio debe ser un número mayor a cero');
        return;
    }

    if (stock && (isNaN(Number(stock)) || Number(stock) < 0)) {
        toast.error('Stock debe ser un número igual o mayor a cero');
        return;
    }

    try {
        setLoading(true);

        const url = `${import.meta.env.VITE_BACKEND_URL}/api/productos`;
        const config = {
        headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
        },
        };

        const body = {
        nombre,
        descripcion,
        precio: Number(precio),
        imagen,
        categoria: categoria || null,
        stock: stock ? Number(stock) : 0,
        };

        await axios.post(url, body, config);

        toast.success('Producto registrado exitosamente');
        setForm({
        nombre: '',
        descripcion: '',
        precio: '',
        imagen: '',
        categoria: '',
        stock: '',
        });
    } catch (error) {
        toast.error(error.response?.data?.mensaje || 'Error al registrar producto');
    } finally {
        setLoading(false);
    }
    };


  return (
    <form
      onSubmit={handleSubmit}
      className='bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-md grid gap-6'
    >
      <div>
        <label className='font-semibold block mb-1'>Nombre del producto *</label>
        <input
          name='nombre'
          value={form.nombre}
          onChange={handleChange}
          className='w-full px-4 py-2 rounded-md border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-400'
        />
      </div>

      <div>
        <label className='font-semibold block mb-1'>Descripción *</label>
        <textarea
          name='descripcion'
          value={form.descripcion}
          onChange={handleChange}
          rows='3'
          className='w-full px-4 py-2 rounded-md border border-gray-300 dark:border-gray-600 resize-none focus:outline-none focus:ring-2 focus:ring-blue-400'
        />
      </div>

      <div className='grid grid-cols-2 gap-4'>
        <div>
          <label className='font-semibold block mb-1'>Precio *</label>
          <input
            type='number'
            name='precio'
            value={form.precio}
            onChange={handleChange}
            className='w-full px-4 py-2 rounded-md border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-400'
          />
        </div>

        <div>
          <label className='font-semibold block mb-1'>Stock</label>
          <input
            type='number'
            name='stock'
            value={form.stock}
            onChange={handleChange}
            className='w-full px-4 py-2 rounded-md border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-400'
          />
        </div>
      </div>

      <div>
        <label className='font-semibold block mb-1'>URL de la imagen *</label>
        <input
          name='imagen'
          value={form.imagen}
          onChange={handleChange}
          placeholder='https://...'
          className='w-full px-4 py-2 rounded-md border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-400'
        />
      </div>

      <div>
        <label className='font-semibold block mb-1'>ID Categoría</label>
        <input
          name='categoria'
          value={form.categoria}
          onChange={handleChange}
          placeholder='(Opcional)'
          className='w-full px-4 py-2 rounded-md border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-400'
        />
      </div>

      <div className='text-right'>
        <button
          type='submit'
          disabled={loading}
          className='bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:opacity-60'
        >
          {loading ? 'Guardando...' : 'Registrar Producto'}
        </button>
      </div>
    </form>
  )
}
