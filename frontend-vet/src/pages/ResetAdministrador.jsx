import logoDog from '../assets/dog-hand.webp'
import { ToastContainer, toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import axios from 'axios'

const ResetAdministrador = () => {
  const { token } = useParams()
  const navigate = useNavigate()
  const [tokenValid, setTokenValid] = useState(false)
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  useEffect(() => {
    const verifyToken = async () => {
      try {
        const url = `${import.meta.env.VITE_BACKEND_URL}/administradores/recuperarpassword/${token}`
        await axios.get(url)
        setTokenValid(true)
      } catch {
        toast.error('Token no válido o expirado')
      }
    }

    verifyToken()
  }, [token])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (password.trim() !== confirmPassword.trim()) {
      toast.error('Las contraseñas no coinciden')
      return
    }

    try {
      const url = `${import.meta.env.VITE_BACKEND_URL}/administradores/nuevopassword/${token}`
      const { data } = await axios.post(url, {
        password: password.trim(),
        confirmpassword: confirmPassword.trim(),
      })
      toast.success(data.msg || 'Contraseña actualizada correctamente')
      setTimeout(() => navigate('/login'), 2000)
    } catch (error) {
      toast.error(error.response?.data?.msg || 'No se pudo actualizar la contraseña')
    }
  }

  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <ToastContainer />
      <h1 className="text-3xl font-semibold mb-2 text-center text-gray-500">Restablece tu contraseña (Admin)</h1>
      <small className="text-gray-400 block my-4 text-sm">Ingresa y confirma tu nueva contraseña</small>
      <img
        className="object-cover h-80 w-80 rounded-full border-4 border-solid border-slate-600"
        src={logoDog}
        alt="logo"
      />
      {tokenValid && (
        <form className="w-80" onSubmit={handleSubmit}>
          <div className="mb-1 relative">
            <label className="mb-2 block text-sm font-semibold">Nueva contraseña</label>
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Ingresa tu nueva contraseña"
              className="block w-full rounded-md border border-gray-300 focus:border-purple-700 focus:outline-none focus:ring-1 focus:ring-purple-700 py-1 px-1.5 text-gray-500"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-2 top-[38px] text-sm text-gray-600 hover:text-gray-900"
            >
              {showPassword ? 'Ocultar' : 'Mostrar'}
            </button>
          </div>

          <div className="mb-1 relative mt-4">
            <label className="mb-2 block text-sm font-semibold">Confirmar contraseña</label>
            <input
              type={showConfirmPassword ? 'text' : 'password'}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Repite tu contraseña"
              className="block w-full rounded-md border border-gray-300 focus:border-purple-700 focus:outline-none focus:ring-1 focus:ring-purple-700 py-1 px-1.5 text-gray-500"
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-2 top-[38px] text-sm text-gray-600 hover:text-gray-900"
            >
              {showConfirmPassword ? 'Ocultar' : 'Mostrar'}
            </button>
          </div>

          <div className="mb-3">
            <button className="bg-gray-600 text-slate-300 border py-2 w-full rounded-xl mt-5 hover:scale-105 duration-300 hover:bg-gray-900 hover:text-white">
              Reestablecer
            </button>
          </div>
        </form>
      )}
    </div>
  )
}

export default ResetAdministrador
