import { Suspense } from "react";
import { Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";

import Navbar from "./Components/Navbar";
import Footer from "./Components/Footer";

import Home from "./Pages/Usuario/Home";
import Cupones from "./Pages/Usuario/Cupones";
import Contacto from "./Pages/Usuario/Contacto";
import SobreNosotros from "./Pages/Usuario/SobreNosotros";

import MisViajes from "./Pages/Cliente/MisViajes";
import CheckIn from "./Pages/Cliente/CheckIn";
import MiCuenta from "./Pages/Cliente/Cuenta";
import SeleccionAsientos from "./Pages/Vuelos/SeleccionAsientos";

import BuscarVuelos from "./Pages/Vuelos/BuscarVuelos";

import Pago from "./Pages/Pago/Pago";

import { VueloProvider } from "./Pages/Vuelos/context/VueloContext";
import SeleccionVueloVuelta from "./Pages/Vuelos/SeleccionVueloVuelta";
import DetalleViaje from "./Pages/Vuelos/DetalleViaje";
import PagoExitoso from "./Pages/Pago/PagoExitoso";
import Vuelos from "./Pages/Usuario/Vuelos";

export default function App() {
  return (
    <AuthProvider>
      <VueloProvider>
        {/* Layout de toda la app */}
        <div className="min-h-screen bg-gray-50 flex flex-col">
          {/* NAVBAR fijo arriba */}
          <Navbar />

          {/* CONTENIDO PRINCIPAL */}
          <main className="flex-1 max-w-7xl w-full mx-auto px-6 py-8">
            <Suspense fallback={<div>Cargando...</div>}>
              <Routes>
                {/* Público / usuario */}
                <Route path="/" element={<Home />} />
                <Route path="/vuelos" element={<Vuelos />} />
                <Route path="/cupones" element={<Cupones />} />
                <Route path="/contacto" element={<Contacto />} />
                <Route path="/sobre-nosotros" element={<SobreNosotros />} />

                {/* Cliente autenticado / post-compra */}
                <Route path="/mis-viajes" element={<MisViajes />} />
                <Route path="/checkin" element={<CheckIn />} />
                <Route path="/mi-cuenta" element={<MiCuenta />} />

                <Route path="/vuelos/seleccion-asiento" element={<SeleccionAsientos />} />
                <Route path="/vuelos/buscar" element={<BuscarVuelos />} />
                <Route path="/vuelos/vuelta" element={<SeleccionVueloVuelta />} />
                <Route path="/vuelos/detalleviaje" element={<DetalleViaje />} />

                {/* Pago */}
                <Route path="/pago" element={<Pago />} />
                <Route path="/pago-exitoso" element={<PagoExitoso />} />

              </Routes>
            </Suspense>
          </main>
          <Footer />
        </div>
      </VueloProvider>
    </AuthProvider >
  );
}
