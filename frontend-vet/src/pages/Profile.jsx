import CardPassword from '../components/profile/CardPassword';
import { CardProfile } from '../components/profile/CardProfile';
import FormProfile from '../components/profile/FormProfile';
import fondoBlanco from '../assets/fondoblanco.jpg';

const Profile = () => {
  return (
    <div
      className="flex flex-col min-h-screen w-full"
      style={{
        backgroundImage: `url(${fondoBlanco})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      {/* Texto introductorio */}
      <main className="py-6 px-4 bg-[#F7E5D2] text-gray-900 w-full">
        <div className="flex flex-col md:flex-row items-center md:items-start gap-10 w-full">
          <div className="flex-1 text-center md:text-left px-2">
            <p className="text-gray-700 text-base">
              Aquí puedes actualizar tus datos personales, contraseña y la información de tu negocio.
            </p>
          </div>
        </div>
      </main>

      {/* Contenedor Principal */}
      <main className="flex-grow px-4 md:px-6 py-10 w-full">
        <div className="flex flex-col md:flex-row gap-8 relative w-full">
          {/* Línea vertical divisoria */}
          <div className="hidden md:block absolute top-0 bottom-0 left-1/2 w-px bg-gray-300"></div>

          {/* Columna izquierda: CardProfile + CardPassword */}
          <div className="flex flex-col w-full md:w-1/2 pr-0 md:pr-6 space-y-6">
            <CardProfile />
            <CardPassword />
          </div>

          {/* Columna derecha: FormProfile */}
          <div className="w-full md:w-1/2 pl-0 md:pl-6">
            <FormProfile />
          </div>
        </div>
      </main>
    </div>
  );
};

export default Profile;
