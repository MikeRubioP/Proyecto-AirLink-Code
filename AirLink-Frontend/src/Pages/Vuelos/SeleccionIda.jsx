// src/Pages/Vuelos/SeleccionIda.jsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { useVuelo } from "./context/VueloContext";
import { mockFlights } from "./utils/mockFlights";
import FlightResultCard from "./components/FlightResultCard";
import StepsBar from "./components/StepsBar";

export default function SeleccionIda() {
  const navigate = useNavigate();
  const { form, setForm } = useVuelo();

  const [items, setItems] = useState([]);
  const [expandedId, setExpandedId] = useState(null);
  const [loading, setLoading] = useState(true);

  // origen/destino/fecha desde el contexto
  const origen = form?.origen || "SCL";
  const destino = form?.destino || "MIA";
  const fechaViaje = form?.fechaIda || "2025-10-23";

  const roundTrip = !!form?.fechaVuelta; // true si el usuario seleccionó vuelta

  useEffect(() => {
    setLoading(true);

    const data = mockFlights({
      origen,
      destino,
      fecha: fechaViaje,
    });

    setItems(data);
    setLoading(false);
  }, [origen, destino, fechaViaje]);

  const handleExpand = (vueloId) => {
    setExpandedId((curr) => (curr === vueloId ? null : vueloId));
  };

  const handleChooseFare = (vuelo, fare) => {
    // Guardar selección
    setForm((prev) => ({
      ...prev,
      vueloIda: {
        ...vuelo,
        tarifaSeleccionada: fare,
      },
    }));

    // Flujo: si hay vuelta -> ir a SeleccionVuelta
    // si no hay vuelta -> ir a Resumen
    if (roundTrip) {
      navigate("/vuelos/seleccion-vuelta");
    } else {
      navigate("/vuelos/resumen");
    }
  };

  if (loading) {
    return (
      <>
        <StepsBar currentStep={2} roundTrip={roundTrip} />
        <div className="max-w-5xl mx-auto px-4 py-10 text-center text-gray-600">
          Cargando vuelos de ida…
        </div>
      </>
    );
  }

  if (!items.length) {
    return (
      <>
        <StepsBar currentStep={2} roundTrip={roundTrip} />
        <div className="max-w-5xl mx-auto px-4 py-10 text-center text-gray-600">
          No hay vuelos de ida disponibles.
        </div>
      </>
    );
  }

  return (
    <>
      {/* Barra de pasos */}
      <StepsBar currentStep={2} roundTrip={roundTrip} />

      {/* Título */}
      <div className="bg-gray-50 border-b border-gray-200">
        <h2 className="max-w-5xl mx-auto px-4 py-6 text-center text-xl font-semibold text-gray-900">
          Elige un vuelo de ida
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
