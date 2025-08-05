import logoDogCatMain from '../assets/dogmain.png'
import logoDog from '../assets/dog-hand.webp'
import { Link } from 'react-router'
import { MdDashboard } from "react-icons/md";
import { FaRobot } from "react-icons/fa";
import { BsCashCoin } from "react-icons/bs";
import { FaCommentSms } from "react-icons/fa6";
import { TbDog } from "react-icons/tb";
import { FaUserDoctor } from "react-icons/fa6";
import { GiMedicines } from "react-icons/gi";
import { FaFacebook } from "react-icons/fa";
import { FaSquareInstagram } from "react-icons/fa6";
import { FaXTwitter } from "react-icons/fa6";


export const Home = () => {
    return (
        <>
            <header className="container mx-auto py-4 md:flex justify-between items-center px-4 md:h-20">
  <h1 className='font-extrabold text-3xl text-[#50BEE4]'>Quito<span className='text-[#10394D]'>Emprende</span></h1>
  <ul className='flex gap-5 justify-center my-4 flex-wrap'>
    <li><a href="#" className='font-medium text-[#10394D] hover:text-[#98C73D] hover:underline'>Inicio</a></li>
    <li><a href="#" className='font-medium text-[#10394D] hover:text-[#98C73D] hover:underline'>Nosotros</a></li>
    <li><a href="#" className='font-medium text-[#10394D] hover:text-[#98C73D] hover:underline'>Servicios</a></li>
    <li><a href="#" className='font-medium text-[#10394D] hover:text-[#98C73D] hover:underline'>Contacto</a></li>
    <li>
      <Link to="/login" className='font-medium text-[#10394D] hover:text-[#98C73D] hover:underline'>
        Inicio de sesión
      </Link>
    </li>
  </ul>
</header>

<main className='text-center py-10 px-6 bg-gradient-to-br from-[#E6E61F] to-[#FFFFFF] md:text-left md:flex justify-between items-center gap-10'>
  <div>
    <h1 className='font-extrabold text-[#10394D] uppercase text-4xl my-4 md:text-5xl tracking-tight'>Conecta, vende y crece</h1>
    <p className='font-semibold text-left my-6 md:text-xl text-[#10394D]'>QuitoEmprende: Tu espacio digital</p>
    <p className='text-lg my-6 text-[#10394D]'>Un lugar donde los emprendedores promocionan sus productos y reciben su propia página web con URL personalizada.</p>


    
  </div>

  <div className='hidden md:block'>
    <img src={logoDogCatMain} alt="QuitoEmprende App" />
  </div>
</main>

<section className='container mx-auto px-4'>
  <div className='container mx-auto relative mt-10'>
    <h2 className='font-bold text-3xl relative z-10 w-max mx-auto bg-white text-[#10394D]'>¿Quiénes somos?</h2>
    <div className='bg-[#50BEE4] h-[2px] absolute top-1/2 w-full z-0' />
  </div>

  <div className='my-10 flex flex-col gap-10 items-center sm:flex-row sm:justify-around sm:items-center'>
    <div className='sm:w-1/2'>
      <img src={logoDog} alt="Aplicación QuitoEmprende" className='w-full h-full object-cover rounded-xl shadow-lg' />
    </div>

    <div className='px-10 sm:w-1/2'>
      <p className='my-4 text-[#10394D]'>QuitoEmprende ofrece una plataforma para que los emprendedores gestionen, vendan y se den a conocer digitalmente.</p>
      <ul className='space-y-4 text-[#10394D]'>
        <li><MdDashboard className='inline text-2xl mr-2 text-[#50BEE4]' /> Panel de control</li>
        <li><BsCashCoin className='inline text-2xl mr-2 text-[#50BEE4]' /> Pasarela de pagos</li>
        <li><FaCommentSms className='inline text-2xl mr-2 text-[#50BEE4]' /> Chat con clientes</li>
        <li><TbDog className='inline text-2xl mr-2 text-[#50BEE4]' /> Gestión de productos</li>
        <li><FaUserDoctor className='inline text-2xl mr-2 text-[#50BEE4]' /> Registro de usuarios</li>
        <li><GiMedicines className='inline text-2xl mr-2 text-[#50BEE4]' /> Control de inventario</li>
      </ul>
      <p className='my-4 text-[#10394D]'>Incluye hosting y una URL personalizada para cada emprendedor.</p>
    </div>
  </div>
</section>

<section className='container mx-auto px-4'>
  <div className='container mx-auto relative mt-10'>
    <h2 className='font-bold text-3xl relative z-10 w-max mx-auto bg-white text-[#10394D]'>Servicios</h2>
    <div className='bg-[#50BEE4] h-[2px] absolute top-1/2 w-full z-0' />
  </div>

  <div className='my-10 flex justify-between flex-wrap gap-6'>
    <div className="text-center bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-all sm:flex-1">
      <FaUserDoctor className='inline text-5xl text-[#98C73D]' />
      <h4 className="text-xl font-bold py-4 text-[#10394D]">Gestión de Usuarios</h4>
      <p className="text-[#10394D]">Registra y administra tus clientes desde una sola plataforma.</p>
    </div>

    <div className="text-center bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-all sm:flex-1">
      <TbDog className='inline text-5xl text-[#98C73D]' />
      <h4 className="text-xl font-bold py-4 text-[#10394D]">Gestión de Productos</h4>
      <p className="text-[#10394D]">Crea tu tienda online en segundos, sube imágenes y precios.</p>
    </div>

    <div className="text-center bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-all sm:flex-1">
      <GiMedicines className='inline text-5xl text-[#98C73D]' />
      <h4 className="text-xl font-bold py-4 text-[#10394D]">Inventario Inteligente</h4>
      <p className="text-[#10394D]">Controla tu stock fácilmente con alertas y reportes.</p>
    </div>

    <div className="text-center bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-all sm:flex-1">
      <FaCommentSms className='inline text-5xl text-[#98C73D]' />
      <h4 className="text-xl font-bold py-4 text-[#10394D]">Comunicación Directa</h4>
      <p className="text-[#10394D]">Chatea con tus clientes en tiempo real.</p>
    </div>
  </div>
</section>

<footer className='text-center bg-[#10394D] p-6 sm:px-20 sm:py-10 mt-20 rounded-tr-3xl rounded-tl-3xl space-y-8 text-white'>
  <p>&copy; 2025 QuitoEmprende. Todos los derechos reservados.</p>
  <div className="flex justify-center gap-4 text-[#E6E61F] text-2xl">
    <FaFacebook />
    <FaSquareInstagram />
    <FaXTwitter />
  </div>
</footer>

        </>
    )
}

