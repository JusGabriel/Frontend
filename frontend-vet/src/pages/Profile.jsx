import CardPassword from '../components/profile/CardPassword';
import { CardProfile } from '../components/profile/CardProfile';
import FormProfile from '../components/profile/FormProfile';
import Footer from '../components/footer/FooterGeneral';
import fondoBlanco from '../assets/fondoblanco.jpg';

const Profile = () => {
  return (
    <div
      className="flex flex-col min-h-screen"
      style={{
        backgroundImage: `url(${fondoBlanco})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      {/* Si no tienes header, lo omitimos */}

      {/* HERO / HEADER */}
      <main className="py-5 px-6 bg-[#F7E5D2] text-gray-900">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center md:items-start gap-10">
          <div className="flex-1 text-center md:text-left">
            <p className="max-w-3xl mx-auto text-center text-gray-700 text-base">
              Aquí puedes actualizar tus datos personales, contraseña y la información de tu negocio.
            </p>
          </div>
        </div>
      </main>

      {/* Contenedor Principal */}
      <main className="flex-grow px-6 md:px-16 py-10">
        <div className="flex flex-col md:flex-row gap-8 relative">
          {/* Línea vertical divisoria */}
          <div className="hidden md:block absolute top-0 bottom-0 left-1/2 w-px bg-gray-300"></div>

          {/* Columna izquierda: CardProfile + CardPassword */}
          <div className="flex flex-col w-full md:w-1/2 pr-0 md:pr-10 space-y-6">
            <CardProfile />
            <CardPassword />
          </div>

          {/* Columna derecha: FormProfile */}
          <div className="w-full md:w-1/2 pl-0 md:pl-10">
            <FormProfile />
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Profile;
