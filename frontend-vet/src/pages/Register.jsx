import { useState } from "react";
import { Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export const Register = () => {
    const [showPassword, setShowPassword] = useState(false);
    const { register, handleSubmit, formState: { errors } } = useForm();

    // URLs backend Google OAuth
    const GOOGLE_CLIENT_URL = "https://backend-production-bd1d.up.railway.app/auth/google/cliente";
    const GOOGLE_EMPRENDEDOR_URL = "https://backend-production-bd1d.up.railway.app/auth/google/emprendedor";

    const registro = async (data) => {
        try {
            let url = "";

            if (data.role === "editor") {
                url = "https://backend-production-bd1d.up.railway.app/api/emprendedores/registro";
            } else if (data.role === "user") {
                url = "https://backend-production-bd1d.up.railway.app/api/clientes/registro";
            } else {
                toast.error("Selecciona un rol válido");
                return;
            }

            const payload = {
                nombre: data.nombre,
                apellido: data.apellido,
                email: data.email,
                password: data.password,
                telefono: data.celular
            };

            const respuesta = await axios.post(url, payload);
            toast.success(respuesta.data.msg);
        } catch (error) {
            toast.error(error?.response?.data?.msg || "Error al registrar");
        }
    };

    // Funciones para login con Google
    const loginGoogleCliente = () => {
        window.location.href = GOOGLE_CLIENT_URL;
    };

    const loginGoogleEmprendedor = () => {
        window.location.href = GOOGLE_EMPRENDEDOR_URL;
    };

    return (
        <div className="flex flex-col sm:flex-row h-screen bg-gray-50">

            <ToastContainer />

            <div className="w-full sm:w-1/2 h-screen bg-white flex justify-center items-center px-6">
                <div className="md:w-4/5 sm:w-full max-w-md">
                    <h1 className="text-3xl font-semibold mb-2 text-center uppercase text-gray-700">Bienvenido(a)</h1>
                    <small className="text-gray-500 block my-4 text-center text-sm">Por favor ingresa tus datos</small>

                    

                    <form onSubmit={handleSubmit(registro)}>

                        {/* Nombre */}
                        <div className="mb-4">
                            <label className="mb-2 block text-sm font-semibold text-gray-700">Nombre</label>
                            <input 
                                type="text" 
                                placeholder="Ingresa tu nombre" 
                                className={`block w-full rounded-md border border-gray-300 focus:border-purple-700 focus:outline-none focus:ring-1 focus:ring-purple-700 py-2 px-3 text-gray-700 ${errors.nombre ? 'border-red-600' : ''}`}
                                {...register("nombre", { required: "El nombre es obligatorio" })}
                            />
                            {errors.nombre && <p className="text-red-600 text-sm mt-1">{errors.nombre.message}</p>}
                        </div>

                        {/* Apellido */}
                        <div className="mb-4">
                            <label className="mb-2 block text-sm font-semibold text-gray-700">Apellido</label>
                            <input 
                                type="text" 
                                placeholder="Ingresa tu apellido" 
                                className={`block w-full rounded-md border border-gray-300 focus:border-purple-700 focus:outline-none focus:ring-1 focus:ring-purple-700 py-2 px-3 text-gray-700 ${errors.apellido ? 'border-red-600' : ''}`}
                                {...register("apellido", { required: "El apellido es obligatorio" })}
                            />
                            {errors.apellido && <p className="text-red-600 text-sm mt-1">{errors.apellido.message}</p>}
                        </div>

                        {/* Celular */}
                        <div className="mb-4">
                            <label className="mb-2 block text-sm font-semibold text-gray-700">Celular</label>
                            <input 
                                type="number" 
                                placeholder="Ingresa tu celular" 
                                className={`block w-full rounded-md border border-gray-300 focus:border-purple-700 focus:outline-none focus:ring-1 focus:ring-purple-700 py-2 px-3 text-gray-700 ${errors.celular ? 'border-red-600' : ''}`}
                                {...register("celular", { required: "El celular es obligatorio" })}
                            />
                            {errors.celular && <p className="text-red-600 text-sm mt-1">{errors.celular.message}</p>}
                        </div>

                        {/* Email */}
                        <div className="mb-4">
                            <label className="mb-2 block text-sm font-semibold text-gray-700">Correo electrónico</label>
                            <input 
                                type="email" 
                                placeholder="Ingresa tu correo electrónico" 
                                className={`block w-full rounded-md border border-gray-300 focus:border-purple-700 focus:outline-none focus:ring-1 focus:ring-purple-700 py-2 px-3 text-gray-700 ${errors.email ? 'border-red-600' : ''}`}
                                {...register("email", { required: "El correo electrónico es obligatorio" })}
                            />
                            {errors.email && <p className="text-red-600 text-sm mt-1">{errors.email.message}</p>}
                        </div>

                        {/* Contraseña */}
                        <div className="mb-4 relative">
                            <label className="mb-2 block text-sm font-semibold text-gray-700">Contraseña</label>
                            <div className="relative">
                                <input
                                    type={showPassword ? "text" : "password"}
                                    placeholder="********************"
                                    className={`block w-full rounded-md border border-gray-300 focus:border-purple-700 focus:outline-none focus:ring-1 focus:ring-purple-700 py-2 px-3 text-gray-700 pr-10 ${errors.password ? 'border-red-600' : ''}`}
                                    {...register("password", { required: "La contraseña es obligatoria" })}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute top-2 right-3 text-gray-500 hover:text-gray-700 focus:outline-none"
                                    aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                                >
                                    {showPassword ? (
                                        <svg className="w-5 h-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A9.956 9.956 0 0112 19c-4.418 0-8.165-2.928-9.53-7a10.005 10.005 0 0119.06 0 9.956 9.956 0 01-1.845 3.35M9.9 14.32a3 3 0 114.2-4.2m.5 3.5l3.8 3.8m-3.8-3.8L5.5 5.5" />
                                        </svg>
                                    ) : (
                                        <svg className="w-5 h-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0zm-9.95 0a9.96 9.96 0 0119.9 0m-19.9 0a9.96 9.96 0 0119.9 0M3 3l18 18" />
                                        </svg>
                                    )}
                                </button>
                                {errors.password && <p className="text-red-600 text-sm mt-1">{errors.password.message}</p>}
                            </div>
                        </div>

                        {/* Rol */}
                        <div className="mb-6">
                            <label htmlFor="role" className="mb-2 block text-sm font-semibold text-gray-700">Selecciona tu rol</label>
                            <select
                                id="role"
                                className={`block w-full rounded-md border border-gray-300 focus:border-purple-700 focus:outline-none focus:ring-1 focus:ring-purple-700 py-2 px-3 text-gray-700 ${errors.role ? 'border-red-600' : ''}`}
                                {...register("role", { required: "El rol es obligatorio" })}
                            >
                                <option value="">Selecciona un rol</option>
                                <option value="editor">Emprendedor</option>
                                <option value="user">Cliente</option>
                            </select>
                            {errors.role && <p className="text-red-600 text-sm mt-1">{errors.role.message}</p>}
                        </div>
                        {/* Botones para registro con Google */}
                    <option value="">Registrate con Google</option>

                    <div className="flex flex-col sm:flex-row justify-center gap-4 mb-8">
                        <button 
                            onClick={loginGoogleCliente}
                            className="flex items-center justify-center gap-2 bg-red-600 text-white px-6 py-3 rounded-lg shadow-md hover:bg-red-700 transition duration-300 font-semibold text-sm sm:flex-1"
                            aria-label="Registrarse con Google como Cliente"
                            type="button"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 48 48" >
                                <path fill="#EA4335" d="M24 9.5c3.54 0 6.24 1.52 7.68 2.8l5.7-5.69C32.44 3.75 28.6 2 24 2 14.75 2 7.1 7.73 3.67 15.56l6.6 5.12C12.6 14.3 17.6 9.5 24 9.5z"/>
                                <path fill="#4285F4" d="M46.5 24.5c0-1.6-.15-2.77-.47-4.06H24v7.69h12.7c-.56 3.08-2.9 5.9-6.25 7.1l6.3 4.9c3.65-3.36 5.75-8.32 5.75-15.63z"/>
                                <path fill="#FBBC05" d="M10.27 28.68a14.66 14.66 0 01-.77-4.68c0-1.63.27-3.2.77-4.69v-7.23H3.66A23.99 23.99 0 002 24c0 3.7.91 7.2 2.66 10.25l7.6-5.57z"/>
                                <path fill="#34A853" d="M24 46c6.12 0 11.25-2.02 15-5.5l-7.3-5.7c-2.1 1.43-4.82 2.3-7.7 2.3-6.4 0-11.4-4.8-12.45-11.2l-7.6 5.56C7.1 40.27 14.75 46 24 46z"/>
                                <path fill="none" d="M2 2h44v44H2z"/>
                            </svg>
                            Cliente
                        </button>

                        <button 
                            onClick={loginGoogleEmprendedor}
                            className="flex items-center justify-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg shadow-md hover:bg-blue-700 transition duration-300 font-semibold text-sm sm:flex-1"
                            aria-label="Registrarse con Google como Emprendedor"
                            type="button"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 48 48" >
                                <path fill="#EA4335" d="M24 9.5c3.54 0 6.24 1.52 7.68 2.8l5.7-5.69C32.44 3.75 28.6 2 24 2 14.75 2 7.1 7.73 3.67 15.56l6.6 5.12C12.6 14.3 17.6 9.5 24 9.5z"/>
                                <path fill="#4285F4" d="M46.5 24.5c0-1.6-.15-2.77-.47-4.06H24v7.69h12.7c-.56 3.08-2.9 5.9-6.25 7.1l6.3 4.9c3.65-3.36 5.75-8.32 5.75-15.63z"/>
                                <path fill="#FBBC05" d="M10.27 28.68a14.66 14.66 0 01-.77-4.68c0-1.63.27-3.2.77-4.69v-7.23H3.66A23.99 23.99 0 002 24c0 3.7.91 7.2 2.66 10.25l7.6-5.57z"/>
                                <path fill="#34A853" d="M24 46c6.12 0 11.25-2.02 15-5.5l-7.3-5.7c-2.1 1.43-4.82 2.3-7.7 2.3-6.4 0-11.4-4.8-12.45-11.2l-7.6 5.56C7.1 40.27 14.75 46 24 46z"/>
                                <path fill="none" d="M2 2h44v44H2z"/>
                            </svg>
                            Emprendedor
                        </button>
                    </div>                
                        {/* Botón */}
                        <div className="mb-3">
                            <button 
                                type="submit"
                                className="bg-gray-700 text-white border border-gray-700 py-3 w-full rounded-xl mt-3 hover:scale-105 duration-300 hover:bg-gray-900"
                            >
                                Registrarse
                            </button>
                        </div>
                    </form>

                    <div className="mt-6 text-xs border-b-2 py-4"></div>

                    <div className="mt-3 text-sm flex justify-between items-center">
                        <p className="text-gray-600">¿Ya posees una cuenta?</p>
                        <div className="flex gap-2">
                            <Link 
                                to="/login" 
                                className="underline text-sm text-gray-500 hover:text-gray-900"
                            >
                                Regresar
                            </Link>
                            <Link 
                                to="/login" 
                                className="py-2 px-5 bg-gray-700 text-white border rounded-xl hover:scale-110 duration-300 hover:bg-gray-900"
                            >
                                Iniciar sesión
                            </Link>
                        </div>
                    </div>
                </div>
            </div>

            {/* Imagen derecha */}
            <div className="w-full sm:w-1/2 h-1/3 sm:h-screen bg-[url('/public/images/dogregister.jpg')] bg-no-repeat bg-cover bg-center sm:block hidden"></div>
        </div>
    );
};
