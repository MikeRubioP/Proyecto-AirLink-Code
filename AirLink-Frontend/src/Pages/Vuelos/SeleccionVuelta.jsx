import { useNavigate } from "react-router-dom";
import { useVuelo } from "./context/VueloContext";

export default function SeleccionVuelta() {
  const navigate = useNavigate();
  const { setForm } = useVuelo();

  const elegir = (vuelo) => {
    setForm((s) => ({ ...s, vueloVuelta: vuelo }));
    navigate("/vuelos/resumen");
  };

  const resultados = [
    { id: "VTA-1", salida: "10:10", llegada: "15:20", precio: 430 },
    { id: "VTA-2", salida: "18:55", llegada: "00:05", precio: 410 },
  ];

  return (
    <div className="space-y-6">
      <h2 className="text-lg font-semibold">Elige tu vuelo de vuelta</h2>
      <ul className="space-y-3">
        {resultados.map((v) => (
          <li key={v.id} className="border rounded-xl p-4 flex items-center justify-between">
            <div className="text-sm">
              <div className="font-medium">{v.id}</div>
              <div className="text-gray-600">{v.salida} → {v.llegada}</div>
            </div>
            <div className="flex items-center gap-4">
              <div className="font-semibold">${v.precio}</div>
              <button onClick={() => elegir(v)} className="px-4 py-2 rounded-lg bg-purple-600 text-white hover:bg-purple-700">
                Seleccionar
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
