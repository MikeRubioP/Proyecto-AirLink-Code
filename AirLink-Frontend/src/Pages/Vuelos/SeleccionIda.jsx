import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useVuelo } from "./context/VueloContext";
import FlightCard from "./components/FlightCard";
import { mockFlights } from "./utils/mockFlights";

export default function SeleccionIda() {
  const navigate = useNavigate();
  const { form, setForm } = useVuelo();

  const [items, setItems] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [loading, setLoading] = useState(true);

  // Cargar opciones (mock) cuando cambian los filtros
  useEffect(() => {
    setLoading(true);

    const data = mockFlights({
      origen: form.origen || "SCL",
      destino: form.destino || "MIA",
      fecha: form.fechaIda || "2025-10-23",
    });

    setItems(data);
    setLoading(false);
  }, [form.origen, form.destino, form.fechaIda]);

  const onChoose = (vuelo) => {
    setSelectedId(vuelo.id);
    setForm((s) => ({ ...s, vueloIda: vuelo }));

    if (form.fechaVuelta) {
      navigate("/vuelos/seleccionar-vuelta");
    } else {
      navigate("/vuelos/resumen");
    }
  };

  if (loading) return <div className="text-center">Cargando vuelos…</div>;
  if (!items.length) return <div className="text-center">No hay vuelos disponibles.</div>;

  return (
    <section className="space-y-4">
      <h2 className="text-center text-lg font-semibold">Elige un vuelo de ida</h2>

      <ul className="space-y-3">
        {items.map((v) => (
          <li key={v.id}>
            <FlightCard
              data={v}
              selected={selectedId === v.id}
              onChoose={() => onChoose(v)}
            />
          </li>
        ))}
      </ul>
    </section>
  );
}
