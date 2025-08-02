import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import axios from 'axios';
import storeAuth from '../context/storeAuth';
import storeProfile from '../context/storeProfile';

const Dashboard = () => {
    const location = useLocation();
    const urlActual = location.pathname;
    const navigate = useNavigate();
    
    const { clearToken } = storeAuth();
    const { user, setUser, clearUser } = storeProfile();

    useEffect(() => {
        const obtenerUsuario = async () => {
            try {
                const res = await axios.get('https://backend-production-bd1d.up.railway.app/api/status', {
                    withCredentials: true
                });
                if (res.data.usuario) {
                    setUser(res.data.usuario);
                } else {
                    navigate('/login');
                }
            } catch (error) {
                navigate('/login');
            }
        };

        if (!user) {
            obtenerUsuario();
        }
    }, []);

    const handleLogout = async () => {
        try {
            await axios.get('https://backend-production-bd1d.up.railway.app/auth/logout', {
                withCredentials: true
            });
        } catch (error) {
            console.error("Error cerrando sesión:", error);
        }
        clearUser();
        clearToken();
        navigate('/login');
    };

    return (
        <div className='md:flex md:min-h-screen'>
            <div className='md:w-1/5 bg-gray-800 px-5 py-4'>
                <h2 className='text-[1.2rem] font-black text-center text-slate-200'>QuitoEmprende</h2>

                <img src="https://cdn-icons-png.flaticon.com/512/2138/2138508.png" alt="img-client" className="m-auto mt-8 p-1 border-2 border-slate-500 rounded-full" width={120} height={120} />
                <p className='text-slate-400 text-center my-4 text-sm'> 
                    <span className='bg-green-600 w-3 h-3 inline-block rounded-full'></span> 
                    Bienvenido - {user?.nombre}
                </p>
                <p className='text-slate-400 text-center my-4 text-sm'> Rol - {user?.rol}</p>
                <hr className="mt-5 border-slate-500" />

                <ul className="mt-5">
                    <li className="text-center">
                        <Link to='/dashboard' className={`${urlActual === '/dashboard' ? 'text-slate-200 bg-gray-900 px-3 py-2 rounded-md text-center' : 'text-slate-600'} text-xl block mt-2 hover:text-slate-600`}>
                            Perfil
                        </Link>
                    </li>
                    <li className="text-center">
                        <Link to='/dashboard/listar' className={`${urlActual === '/dashboard/listar' ? 'text-slate-200 bg-gray-900 px-3 py-2 rounded-md text-center' : 'text-slate-600'} text-xl block mt-2 hover:text-slate-600`}>
                            Listar
                        </Link>
                    </li>
                    <li className="text-center">
                        <Link to='/dashboard/crear' className={`${urlActual === '/dashboard/crear' ? 'text-slate-100 bg-gray-900 px-3 py-2 rounded-md text-center' : 'text-slate-600'} text-xl block mt-2 hover:text-slate-600`}>
                            Crear
                        </Link>
                    </li>
                    <li className="text-center">
                        <Link to='/dashboard/chat' className={`${urlActual === '/dashboard/chat' ? 'text-slate-100 bg-gray-900 px-3 py-2 rounded-md text-center' : 'text-slate-600'} text-xl block mt-2 hover:text-slate-600`}>
                            Chat
                        </Link>
                    </li>
                </ul>
            </div>

            <div className='flex-1 flex flex-col justify-between h-screen bg-gray-100'>
                <div className='bg-gray-800 py-2 flex md:justify-end items-center gap-5 justify-center'>
                    <div className='text-md font-semibold text-slate-100'>
                        Usuario - {user?.nombre}
                    </div>
                    <div>
                        <img src="https://cdn-icons-png.flaticon.com/512/4715/4715329.png" alt="img-client" className="border-2 border-green-600 rounded-full" width={50} height={50} />
                    </div>
                    <div>
                        <button 
                            className="text-white mr-3 text-md block hover:bg-red-900 text-center bg-red-800 px-4 py-1 rounded-lg"
                            onClick={handleLogout}
                        >
                            Salir
                        </button>
                    </div>
                </div>

                <div className='overflow-y-scroll p-8'>
                    <Outlet />
                </div>

                <div className='bg-gray-800 h-12'>
                    <p className='text-center text-slate-100 leading-[2.9rem] underline'>Todos los derechos reservados</p>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
