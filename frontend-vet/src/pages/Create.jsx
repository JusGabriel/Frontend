import { FormProducto } from '../components/create/FormProducto';

const Create = () => {
  return (
    <section className='p-8 max-w-3xl mx-auto'>
      <h1 className='text-3xl md:text-4xl font-black text-gray-800 dark:text-gray-200 mb-2'>
        Agregar Producto
      </h1>
      <hr className='border-b-2 border-blue-500 w-24 mb-4' />
      <p className='text-gray-600 dark:text-gray-300 mb-8'>
        Completa el formulario para registrar un nuevo producto en tu catálogo.
      </p>

      <FormProducto />
    </section>
  )
}

export default Create

