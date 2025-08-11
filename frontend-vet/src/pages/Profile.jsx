import CardPassword from '../components/profile/CardPassword';
import { CardProfile } from '../components/profile/CardProfile';
import FormProfile from '../components/profile/FormProfile';
import fondoBlanco from '../assets/fondoblanco.jpg'; // fondo visual profesional

const Profile = () => {
  return (
    <div
      className="relative flex flex-col min-h-screen w-full"
      style={{
        backgroundImage: `url(${fondoBlanco})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      {/* Decoración: lomo azul vertical izquierdo tipo libro */}
      <div className="hidden md:block absolute top-0 left-0 h-full w-5 bg-blue-700 rounded-tr-lg rounded-br-lg z-0" />

      {/* Decoración: línea vertical de círculos simulando orificios de encuadernación */}
      <div className="hidden md:flex flex-col absolute top-20 left-8 space-y-6 z-0">
        {[...Array(18)].map((_, i) => (
          <div
            key={i}
            className="w-3 h-3 bg-blue-300 rounded-full opacity-70"
          />
        ))}
      </div>

      {/* ENCABEZADO */}
      <main className="py-5 px-6 bg-[#F7E5D2] text-gray-900 relative z-10 w-full">
        <div className="flex flex-col md:flex-row items-center md:items-start gap-10 w-full">
          <div className="flex-1 text-center md:text-left px-2">
            <p className="text-gray-700 text-base">
              Este módulo te permite gestionar el perfil del usuario
            </p>
          </div>
        </div>
      </main>

      {/* CONTENIDO PRINCIPAL */}
      <main
        className="flex-grow px-6 md:px-16 py-10 relative z-10 w-full"
        style={{ minHeight: 'calc(100vh - 80px)' }} // ajusta según altura encabezado si quieres
      >
        <div className="flex flex-col md:flex-row gap-8 relative w-full h-full">
          {/* Línea divisoria */}
          <div className="hidden md:block absolute top-0 bottom-0 left-1/2 w-px bg-gray-300"></div>

          {/* Columna izquierda: FormProfile */}
          <div className="w-full md:w-1/2 pr-0 md:pr-10 relative z-10 h-full">
            <FormProfile />
          </div>

          {/* Columna derecha: CardProfile + CardPassword */}
          <div className="flex flex-col w-full md:w-1/2 pl-0 md:pl-10 space-y-6 relative z-10 h-full">
            <CardProfile />
            <CardPassword />
          </div>
        </div>
      </main>
    </div>
  );
};

export default Profile;
