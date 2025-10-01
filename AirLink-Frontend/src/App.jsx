import { Suspense } from "react";
import { Routes, Route } from "react-router-dom";

import Navbar from "./Components/Navbar";

import Home from "./Pages/Usuario/Home";
import Ofertas from "./Pages/Usuario/Ofertas";
import Cupones from "./Pages/Usuario/Cupones";
import Contacto from "./Pages/Usuario/Contacto";
import SobreNosotros from "./Pages/Usuario/SobreNosotros";

function App() {
  return (
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
          </Routes>
        </Suspense>
      </main>
    </div>
  )
}

export default App
