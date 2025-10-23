import { useNavigate } from "react-router-dom";
import { useVuelo } from "./context/VueloContext";

export default function Resumen() {
  const navigate = useNavigate();
  const { form } = useVuelo();

  const confirmar = () => {
    // llamada a API / checkout...
    navigate("/mis-viajes");
  };

  const total = (form.vueloIda?.precio || 0) + (form.vueloVuelta?.precio || 0);

  return (
    <div className="space-y-6">
      <h2 className="text-lg font-semibold">Resumen de la compra</h2>

      <div className="grid gap-4 md:grid-cols-2">
        <Card title="Datos del viaje">
          <Item k="Origen" v={form.origen} />
          <Item k="Destino" v={form.destino} />
          <Item k="Salida" v={form.fechaIda} />
          {form.fechaVuelta && <Item k="Regreso" v={form.fechaVuelta} />}
          <Item k="Pasajeros" v={form.pasajeros} />
          <Item k="Cabina" v={form.cabina} />
        </Card>

        <Card title="Vuelos seleccionados">
          <Item k="Ida" v={form.vueloIda?.id} />
          {form.fechaVuelta && <Item k="Vuelta" v={form.vueloVuelta?.id} />}
          <Item k="Total" v={`$${total}`} />
        </Card>
      </div>

      <div className="flex gap-3">
        <button
          onClick={() => navigate("/vuelos/seleccionar-ida")}
          className="px-4 py-2 rounded-lg border"
        >
          Volver
        </button>
        <button
          onClick={confirmar}
          className="px-5 py-2 rounded-lg bg-purple-600 text-white hover:bg-purple-700"
        >
          Confirmar compra
        </button>
      </div>
    </div>
  );
}

function Card({ title, children }) {
  return (
    <div className="border rounded-xl p-4">
      <h3 className="font-medium mb-3">{title}</h3>
      <div className="space-y-1 text-sm">{children}</div>
    </div>
  );
}

function Item({ k, v }) {
  return (
    <div className="flex justify-between">
      <span className="text-gray-600">{k}</span>
      <span className="font-medium">{v || "-"}</span>
    </div>
  );
}
