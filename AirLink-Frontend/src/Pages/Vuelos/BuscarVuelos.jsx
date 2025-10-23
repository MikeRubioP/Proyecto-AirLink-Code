import { useNavigate } from "react-router-dom";
import { useVuelo } from "./context/VueloContext";

export default function BuscarVuelos() {
  const navigate = useNavigate();
  const { form, setForm } = useVuelo();

  const onChange = (e) => setForm((s) => ({ ...s, [e.target.name]: e.target.value }));

  const buscar = (e) => {
    e.preventDefault();
    navigate("/vuelos/seleccionar-ida");
  };

  return (
    <form onSubmit={buscar} className="grid gap-4 md:grid-cols-2">
      <Input label="Origen" name="origen" value={form.origen} onChange={onChange} placeholder="SCL - Santiago" />
      <Input label="Destino" name="destino" value={form.destino} onChange={onChange} placeholder="MAD - Madrid" />
      <Input label="Salida" type="date" name="fechaIda" value={form.fechaIda} onChange={onChange} />
      <Input label="Regreso" type="date" name="fechaVuelta" value={form.fechaVuelta} onChange={onChange} />
      <Select label="Pasajeros" name="pasajeros" value={form.pasajeros} onChange={onChange} options={["1","2","3","4","5","6"]} />
      <Select label="Cabina" name="cabina" value={form.cabina} onChange={onChange} options={["Económica","Premium Eco","Business","First"]} />
      <div className="md:col-span-2">
        <button type="submit" className="w-full md:w-auto px-6 py-3 rounded-xl bg-purple-600 text-white hover:bg-purple-700">
          Buscar vuelos
        </button>
      </div>
    </form>
  );
}

function Input({ label, ...rest }) {
  return (
    <label className="text-sm">
      <span className="block mb-1 text-gray-600">{label}</span>
      <input {...rest} className="w-full border rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-200" />
    </label>
  );
}
function Select({ label, options = [], ...rest }) {
  return (
    <label className="text-sm">
      <span className="block mb-1 text-gray-600">{label}</span>
      <select {...rest} className="w-full border rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-200">
        {options.map((o) => <option key={o} value={o}>{o}</option>)}
      </select>
    </label>
  );
}
