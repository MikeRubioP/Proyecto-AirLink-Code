import { Suspense } from "react";
import { Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";

import Navbar from "./Components/Navbar";

import Home from "./Pages/Usuario/Home";
import Ofertas from "./Pages/Usuario/Ofertas";
import Cupones from "./Pages/Usuario/Cupones";
import Contacto from "./Pages/Usuario/Contacto";
import SobreNosotros from "./Pages/Usuario/SobreNosotros";
import MisViajes from "./Pages/Cliente/MisViajes";
import CheckIn from "./Pages/Cliente/CheckIn";
import MiCuenta from "./Pages/Cliente/Cuenta";

function App() {
  return (
    <AuthProvider>
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
            </Routes>
          </Suspense>
        </main>
      </div>
    </AuthProvider>
  );
}

export default App;