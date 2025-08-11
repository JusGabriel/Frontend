import { FormProducto } from '../components/create/FormProducto';
import fondoBlanco from '../assets/fondoblanco.jpg';

const Create = () => {
  return (
    <div
      className="relative flex flex-col min-h-screen w-full"
      style={{
        backgroundImage: `url(${fondoBlanco})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      {/* ENCABEZADO */}
      <main className="py-5 px-6 bg-[#F7E5D2] text-gray-900 relative z-10 w-full max-w-3xl mx-auto">
        <hr className="border-b-2 border-[#AA4A44] w-24 mb-4" />
        <p className="text-gray-600 dark:text-gray-300">
          Completa el formulario para registrar un nuevo producto en tu catálogo.
        </p>
      </main>

      {/* CONTENIDO PRINCIPAL */}
      <main
        className="flex-grow px-6 md:px-16 py-10 relative z-10 w-full max-w-3xl mx-auto"
        style={{ minHeight: 'calc(100vh - 140px)' }} // ajusta según alto del encabezado
      >
        <FormProducto />
      </main>
    </div>
  );
};

export default Create;
