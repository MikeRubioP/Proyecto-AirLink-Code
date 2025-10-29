import { Suspense } from "react";
import { Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";

import Navbar from "./Components/Navbar";

import Home from "./Pages/Usuario/Home";
import Ofertas from "./Pages/Usuario/Ofertas";
import Cupones from "./Pages/Usuario/Cupones";
import Contacto from "./Pages/Usuario/Contacto";
import SobreNosotros from "./Pages/Usuario/SobreNosotros";
import DetalleVuelo from "./Pages/Cliente/DetalleVuelo";
import MisViajes from "./Pages/Cliente/MisViajes";
import CheckIn from "./Pages/Cliente/CheckIn";
import MiCuenta from "./Pages/Cliente/Cuenta";
import Asientos from "./Pages/Cliente/Asientos";
import VuelosLayout from "./Pages/Vuelos/VuelosLayout";
import BuscarVuelos from "./Pages/Vuelos/BuscarVuelos";
import SeleccionIda from "./Pages/Vuelos/SeleccionIda";
import SeleccionVuelta from "./Pages/Vuelos/SeleccionVuelta";
import Resumen from "./Pages/Vuelos/Resumen";
import BuscarBuses from "./Pages/Buses/BuscarBuses";
import Pago from "./Pages/Pago/Pago";

import { VueloProvider } from "./Pages/Vuelos/context/VueloContext";

export default function App() {
  return (
    <AuthProvider>
      <VueloProvider>
        <div className="min-h-screen bg-gray-50">
          <Navbar />
          <main className="max-w-7xl mx-auto px-6 py-8">
            <Suspense fallback={<div>Cargando...</div>}>
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/ofertas" element={<Ofertas />} />
                <Route path="/cupones" element={<Cupones />} />
                <Route path="/contacto" element={<Contacto />} />
                <Route path="/sobre-nosotros" element={<SobreNosotros />} />
                <Route path="/mis-viajes" element={<MisViajes />} />
                <Route path="/checkin" element={<CheckIn />} />
                <Route path="/mi-cuenta" element={<MiCuenta />} />
                <Route path="/vuelos/:id" element={<DetalleVuelo />} />
                <Route path="/asientos" element={<Asientos />} />

                <Route path="/vuelos" element={<VuelosLayout />}>
                  <Route index element={<BuscarVuelos />} />
                  <Route path="buscar" element={<BuscarVuelos />} />
                  <Route path="seleccionar-ida" element={<SeleccionIda />} />
                  <Route path="seleccionar-vuelta" element={<SeleccionVuelta />} />
                  <Route path="resumen" element={<Resumen />} />
                </Route>
                <Route path="/buses" element={<BuscarBuses />} />
                <Route path="/pago" element={<Pago />} />
              </Routes>
            </Suspense>
          </main>
        </div>
      </VueloProvider>
    </AuthProvider>
  );
}
