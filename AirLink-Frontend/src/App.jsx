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

// ⬇️ Importa los guards
import {
  RequireSearch,
  RequireFlightOut,
  RequireReturnIfRoundTrip,
  RequireCheckoutReady,
  RequireAuth,
} from "./Components/Guards";

export default function App() {
  return (
    <AuthProvider>
      <VueloProvider>
        <div className="min-h-screen bg-gray-50 flex flex-col">
          <Navbar />
          <main className="flex-1 max-w-7xl w-full mx-auto px-6 py-8">
            <Suspense fallback={<div>Cargando...</div>}>
              <Routes>
                {/* Público */}
                <Route path="/" element={<Home />} />
                <Route path="/vuelos" element={<Vuelos />} />
                <Route path="/cupones" element={<Cupones />} />
                <Route path="/contacto" element={<Contacto />} />
                <Route path="/sobre-nosotros" element={<SobreNosotros />} />

                {/* Cliente autenticado / post-compra */}
                <Route
                  path="/mis-viajes"
                  element={
                    <RequireAuth>
                      <MisViajes />
                    </RequireAuth>
                  }
                />
                <Route
                  path="/checkin"
                  element={
                    <RequireAuth>
                      <CheckIn />
                    </RequireAuth>
                  }
                />
                <Route
                  path="/mi-cuenta"
                  element={
                    <RequireAuth>
                      <MiCuenta />
                    </RequireAuth>
                  }
                />

                {/* Flujo de vuelos */}
                <Route path="/vuelos/buscar" element={<BuscarVuelos />} />

                {/* Para ver la vuelta: requiere haber hecho búsqueda + tener vuelo de ida */}
                <Route
                  path="/vuelos/vuelta"
                  element={
                    <RequireSearch>
                      <RequireFlightOut>
                        <SeleccionVueloVuelta />
                      </RequireFlightOut>
                    </RequireSearch>
                  }
                />

                {/* Detalle del viaje: requiere búsqueda, ida y (si aplica) vuelta */}
                <Route
                  path="/vuelos/detalleviaje"
                  element={
                    <RequireSearch>
                      <RequireFlightOut>
                        <RequireReturnIfRoundTrip>
                          <DetalleViaje />
                        </RequireReturnIfRoundTrip>
                      </RequireFlightOut>
                    </RequireSearch>
                  }
                />

                {/* Selección de asientos: requiere al menos vuelo seleccionado */}
                <Route
                  path="/vuelos/seleccion-asiento"
                  element={
                    <RequireFlightOut>
                      <SeleccionAsientos />
                    </RequireFlightOut>
                  }
                />

                {/* Pago: requiere login + estar listo para pagar */}
                <Route
                  path="/pago"
                  element={
                    <RequireAuth>
                      <RequireCheckoutReady>
                        <Pago />
                      </RequireCheckoutReady>
                    </RequireAuth>
                  }
                />

                {/* Público (post transacción) */}
                <Route path="/pago-exitoso" element={<PagoExitoso />} />
              </Routes>
            </Suspense>
          </main>
          <Footer />
        </div>
      </VueloProvider>
    </AuthProvider>
  );
}
