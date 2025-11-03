import { Outlet } from "react-router-dom";
import bannerVuelo from "../../assets/BannersVuelo.png";

export default function VuelosLayout() {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* Banner superior */}
      <section className="relative w-full h-48 md:h-64 overflow-hidden rounded-b-3xl shadow-md">
        <img
          src={bannerVuelo}
          alt="Banner de vuelos"
          className="w-full h-full object-cover rounded-b-3xl"
        />
      </section>

      {/* Título bajo el banner */}
      <section className="text-center mt-10 px-4">
        <h1 className="text-3xl md:text-4xl font-extrabold text-gray-800">
          Vuelos AirLink
        </h1>
        <p className="mt-2 text-gray-600 text-sm md:text-base max-w-2xl mx-auto">
          Explora, selecciona y disfruta de tu próximo destino ✈️  
          Encuentra las mejores opciones de vuelo en segundos.
        </p>
      </section>

      {/* Contenido dinámico */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 md:px-8 py-10">
        <div className="bg-white rounded-3xl shadow-sm p-6 md:p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
