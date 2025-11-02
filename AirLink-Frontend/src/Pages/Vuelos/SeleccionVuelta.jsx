// src/Pages/Vuelos/SeleccionVuelta.jsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { useVuelo } from "./context/VueloContext";
import { mockFlights } from "./utils/mockFlights";
import FlightResultCard from "./components/FlightResultCard";
import StepsBar from "./components/StepsBar";

export default function SeleccionVuelta() {
  const navigate = useNavigate();
  const { form, setForm } = useVuelo();

  // Para la vuelta invertimos origen y destino
  const origenVuelta = form?.destino || "MIA";
  const destinoVuelta = form?.origen || "SCL";
  const fechaViaje = form?.fechaVuelta || "2025-10-30";

  const roundTrip = !!form?.fechaVuelta; // debería ser true aquí

  const [items, setItems] = useState([]);
  const [expandedId, setExpandedId] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);

    const data = mockFlights({
      origen: origenVuelta,
      destino: destinoVuelta,
      fecha: fechaViaje,
    });

    setItems(data);
    setLoading(false);
  }, [origenVuelta, destinoVuelta, fechaViaje]);

  const handleExpand = (vueloId) => {
    setExpandedId((curr) => (curr === vueloId ? null : vueloId));
  };

  const handleChooseFare = (vuelo, fare) => {
    // Guardamos la selección de la vuelta
    setForm((prev) => ({
      ...prev,
      vueloVuelta: {
        ...vuelo,
        tarifaSeleccionada: fare,
      },
    }));

    // Después de elegir la vuelta → ir al resumen
    navigate("/vuelos/resumen");
  };

  if (loading) {
    return (
      <>
        <StepsBar currentStep={3} roundTrip={roundTrip} />
        <div className="max-w-5xl mx-auto px-4 py-10 text-center text-gray-600">
          Cargando vuelos de vuelta…
        </div>
      </>
    );
  }

  if (!items.length) {
    return (
      <>
        <StepsBar currentStep={3} roundTrip={roundTrip} />
        <div className="max-w-5xl mx-auto px-4 py-10 text-center text-gray-600">
          No hay vuelos de vuelta disponibles.
        </div>
      </>
    );
  }

  return (
    <>
      {/* Barra de pasos */}
      <StepsBar currentStep={3} roundTrip={roundTrip} />

      {/* Título */}
      <div className="bg-gray-50 border-b border-gray-200">
        <h2 className="max-w-5xl mx-auto px-4 py-6 text-center text-xl font-semibold text-gray-900">
          Elige un vuelo de vuelta
        </h2>
      </div>

      {/* Resultados */}
      <section className="max-w-5xl mx-auto px-4 py-8 space-y-4">
        <ul className="space-y-4">
          {items.map((vuelo) => (
            <li key={vuelo.id}>
              <FlightResultCard
                vuelo={vuelo}
                expanded={expandedId === vuelo.id}
                onExpand={() => handleExpand(vuelo.id)}
                onChooseFare={(fare) => handleChooseFare(vuelo, fare)}
              />
            </li>
          ))}
        </ul>
      </section>
    </>
  );
}
