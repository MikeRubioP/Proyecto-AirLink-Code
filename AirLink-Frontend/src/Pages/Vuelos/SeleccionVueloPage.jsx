import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { mockFlights } from "./utils/mockFlights";
import FlightResultCard from "./components/FlightResultCard";
import { useVuelo } from "./context/VueloContext";

export default function SeleccionVueloPage({ tipo }) {
  // tipo = "ida" | "vuelta"

  const navigate = useNavigate();
  const { form, setForm } = useVuelo();

  // 1. Definimos desde / hacia / fecha según si estamos escogiendo ida o vuelta
  const origen =
    tipo === "ida"
      ? form.origen || "SCL"
      : form.destino || "MIA";

  const destino =
    tipo === "ida"
      ? form.destino || "MIA"
      : form.origen || "SCL";

  const fechaViaje =
    tipo === "ida"
      ? form.fechaIda || "2025-10-23"
      : form.fechaVuelta || "2025-10-30";

  // 2. Estado interno (lo que se muestra en pantalla)
  const [items, setItems] = useState([]);
  const [expandedId, setExpandedId] = useState(null);
  const [loading, setLoading] = useState(true);

  // 3. Simular carga de vuelos
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

  // 4. Expandir/plegar detalle (tarifas)
  const handleExpand = (vueloId) => {
    setExpandedId((curr) => (curr === vueloId ? null : vueloId));
  };

  // 5. Cuando el usuario elige una tarifa de un vuelo
  const handleChooseFare = (vuelo, fare) => {
    if (tipo === "ida") {
      // Guardar vuelo de ida
      setForm((prev) => ({
        ...prev,
        vueloIda: {
          ...vuelo,
          tarifaSeleccionada: fare,
        },
      }));

      // Si hay fecha de vuelta => ir a seleccionar vuelta
      if (form.fechaVuelta) {
        navigate("/vuelos/seleccion-vuelta");
      } else {
        // Solo ida => directo al resumen
        navigate("/vuelos/resumen");
      }
    } else {
      // tipo === "vuelta"
      setForm((prev) => ({
        ...prev,
        vueloVuelta: {
          ...vuelo,
          tarifaSeleccionada: fare,
        },
      }));

      // Después de elegir la vuelta vamos al resumen sí o sí
      navigate("/vuelos/resumen");
    }
  };

  // 6. Pantallas de carga o vacío
  if (loading) {
    return (
      <div className="text-center py-10 text-gray-600">
        Cargando vuelos…
      </div>
    );
  }

  if (!items.length) {
    return (
      <div className="text-center py-10 text-gray-600">
        No hay vuelos disponibles.
      </div>
    );
  }

  // 7. Barra de pasos tipo "1 Buscar / 2 Ida / 3 Vuelta / 4 Resumen"
  const pasoActivo = tipo === "ida" ? 2 : 3;
  const hayVuelta = !!form.fechaVuelta;

  return (
    <section className="max-w-5xl mx-auto px-4 py-8 space-y-6">
      {/* Steps */}
      <div className="flex flex-wrap items-center gap-4 text-sm text-gray-700 justify-center">
        <StepCircle num={1} label="Buscar" done={pasoActivo > 1} />
        <StepCircle
          num={2}
          label="Ida"
          active={pasoActivo === 2}
          done={pasoActivo > 2}
        />
        {hayVuelta && (
          <StepCircle
            num={3}
            label="Vuelta"
            active={pasoActivo === 3}
            done={pasoActivo > 3}
          />
        )}
        <StepCircle
          num={4}
          label="Resumen"
          active={pasoActivo === 4}
          done={pasoActivo > 4}
        />
      </div>

      {/* Título */}
      <h2 className="text-center text-xl font-semibold text-gray-900">
        {tipo === "ida" ? "Elige un vuelo de ida" : "Elige un vuelo de vuelta"}
      </h2>

      {/* Lista de vuelos */}
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
  );
}

// Mini componente para el circulito numerado en los pasos
function StepCircle({ num, label, active, done }) {
  const baseCircle =
    "w-7 h-7 flex items-center justify-center rounded-full border text-sm font-medium";

  const circleClasses = done
    ? "bg-purple-600 text-white border-purple-600"
    : active
    ? "bg-purple-100 text-purple-700 border-purple-600"
    : "bg-white text-purple-700 border-purple-600";

  return (
    <div className="flex items-center gap-2">
      <div className={`${baseCircle} ${circleClasses}`}>{num}</div>
      <div className="text-xs md:text-sm text-gray-900">{label}</div>
    </div>
  );
}
