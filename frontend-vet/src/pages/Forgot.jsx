import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import axios from 'axios';
import { toast, Toaster } from 'react-hot-toast';

export const Forgot = () => {
  const { register, handleSubmit, formState: { errors } } = useForm();

  const onSubmit = async (data) => {
    const { email, role } = data;

    let endpoint = '';
    switch (role) {
      case 'admin':
        endpoint = 'http://localhost:3000/api/administradores/recuperarpassword';
        break;
      case 'editor':
        endpoint = 'http://localhost:3000/api/emprendedores/recuperarpassword';
        break;
      case 'user':
        endpoint = 'http://localhost:3000/api/clientes/recuperar-password';
        break;
      default:
        toast.error("Selecciona un rol válido");
        return;
    }

    try {
      await axios.post(endpoint, { email });
      toast.success("Correo de recuperación enviado");
    } catch (error) {
      toast.error("Error: " + (error.response?.data?.message || error.message));
    }
  };

  return (
    <>
      <Toaster position="top-right" reverseOrder={false} />
      <div className="flex flex-col sm:flex-row h-screen">
        <div className="w-full sm:w-1/2 h-screen bg-white flex justify-center items-center">
          <div className="md:w-4/5 sm:w-full">
            <h1 className="text-3xl font-semibold mb-2 text-center uppercase text-gray-500">¡Olvidaste tu contraseña!</h1>
            <small className="text-gray-400 block my-4 text-sm">No te preocupes</small>

            <form onSubmit={handleSubmit(onSubmit)}>
              {/* Email */}
              <div className="mb-3">
                <label className="mb-2 block text-sm font-semibold">Correo electrónico</label>
                <input
                  type="email"
                  placeholder="Ingresa un correo electrónico válido"
                  className="block w-full rounded-md border border-gray-300 focus:border-purple-700 focus:outline-none focus:ring-1 focus:ring-purple-700 py-1 px-1.5 text-gray-500"
                  {...register("email", { required: "El correo es obligatorio" })}
                />
                {errors.email && <p className="text-red-800 text-sm">{errors.email.message}</p>}
              </div>

              {/* Rol */}
              <div className="mb-3">
                <label htmlFor="role" className="mb-2 block text-sm font-semibold">Selecciona tu rol</label>
                <select
                  id="role"
                  className="block w-full rounded-md border border-gray-300 focus:border-purple-700 focus:outline-none focus:ring-1 focus:ring-purple-700 py-1 px-2 text-gray-500"
                  {...register("role", { required: "El rol es obligatorio" })}
                >
                  <option value="">Selecciona un rol</option>
                  <option value="admin">Administrador</option>
                  <option value="editor">Emprendedor</option>
                  <option value="user">Cliente</option>
                </select>
                {errors.role && <p className="text-red-800 text-sm">{errors.role.message}</p>}
              </div>

              <div className="mb-3">
                <button
                  type="submit"
                  className="bg-gray-600 text-slate-300 border py-2 w-full rounded-xl mt-5 hover:scale-105 duration-300 hover:bg-gray-900 hover:text-white"
                >
                  Enviar correo
                </button>
              </div>
            </form>

            <div className="mt-5 text-xs border-b-2 py-4"></div>

            <div className="mt-3 text-sm flex justify-between items-center">
              <p>¿Ya posees una cuenta?</p>
              <Link to="/login" className="py-2 px-5 bg-gray-600 text-slate-300 border rounded-xl hover:scale-110 duration-300 hover:bg-gray-900 hover:text-white">
                Iniciar sesión
              </Link>
            </div>
          </div>
        </div>

        <div
          className="w-full sm:w-1/2 h-1/3 sm:h-screen bg-no-repeat bg-cover bg-center sm:block hidden"
          style={{ backgroundImage: "url('/images/catforgot.jpg')" }}
        />
      </div>
    </>
  );
};
