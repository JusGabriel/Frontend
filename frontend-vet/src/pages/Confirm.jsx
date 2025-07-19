import axios from 'axios'
import logoDog from '../assets/dog-hand.webp'
import { Link, useParams } from 'react-router-dom'
import { useEffect, useState } from 'react'

export const Confirm = () => {
  const { token } = useParams()
  const [verificado, setVerificado] = useState(false)

  const verifyToken = async () => {
    const roles = ['administradores', 'clientes', 'emprendedores']

    for (const role of roles) {
      try {
        const url = `${import.meta.env.VITE_BACKEND_URL}/${role}/confirmar/${token}`
        const respuesta = await axios.get(url)

        if (respuesta?.data?.msg) {
          // toast.success(respuesta.data.msg)
        }

        setVerificado(true)
        return // Salimos del bucle al primer éxito
      } catch (error) {
        // Continuamos con el siguiente endpoint si hay error
        continue
      }
    }

    // Si llegamos aquí es porque ninguno funcionó
    if (!verificado) {
      // toast.error('Token no válido o ya confirmado')
      setVerificado(true)
    }
  }

  useEffect(() => {
    verifyToken()
  }, [token])

  return (
    <div className="flex flex-col items-center justify-center h-screen">
      {/* <ToastContainer /> */}
      <img
        className="object-cover h-80 w-80 rounded-full border-4 border-solid border-slate-600"
        src={logoDog}
        alt="image description"
      />
      <div className="flex flex-col items-center justify-center">
        <p className="text-3xl md:text-4xl lg:text-5xl text-gray-800 mt-12">
          Muchas gracias
        </p>
        <p className="md:text-lg lg:text-xl text-gray-600 mt-8">
          Ya puedes iniciar sesión
        </p>
        <Link
          to="/login"
          className="p-3 m-5 w-full text-center bg-gray-600 text-slate-300 border rounded-xl hover:scale-110 duration-300 hover:bg-gray-900 hover:text-white"
        >
          Acceso
        </Link>
      </div>
    </div>
  )
}
