import { Outlet } from "react-router-dom";
import Navbar from "../../Components/Navbar";
import Footer from "../../Components/Footer";

export default function VuelosLayout() {
  return (
    <div className="bg-gray-50 min-h-screen flex flex-col">

      {/* Contenido dinámico de cada paso (BuscarVuelos, SeleccionIda, etc.) */}
      <main className="flex-1">
        <Outlet />
      </main>

      {/* Footer global del sitio */}
      <Footer />
    </div>
  );
}
