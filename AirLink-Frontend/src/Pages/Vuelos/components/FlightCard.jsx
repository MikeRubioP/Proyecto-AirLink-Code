// src/Pages/Vuelos/components/FlightCard.jsx
export default function FlightCard({ data, selected, onChoose }) {
  // Soportar tanto tu shape actual como el del mockup:
  const {
    // mockup-style
    salidaHora,
    llegadaHora,
    origen,
    destino,
    directo,
    operadoPor,

    // tus campos actuales:
    salida,
    llegada,
    duracion = "",
    escala = directo ? "Directo" : "Con escalas",
    precio = 0,
    tarifa = "Standard",
  } = data || {};

  // Intentar derivar hora + IATA si solo vienen `salida`/`llegada` en formato "11:00 SCL" o "11:00"
  const parseHoraIATA = (txt, fallbackHora, fallbackIata) => {
    if (!txt) return { hora: fallbackHora || "--:--", iata: fallbackIata || "" };
    const parts = String(txt).trim().split(/\s+/);
    if (parts.length >= 2) return { hora: parts[0], iata: parts[1] };
    return { hora: parts[0], iata: fallbackIata || "" };
  };

  const left  = parseHoraIATA(salida, salidaHora, origen);
  const right = parseHoraIATA(llegada, llegadaHora, destino);

  return (
    <button
      type="button"
      onClick={onChoose}
      className={[
        "w-full text-left rounded-2xl bg-white border p-4 md:p-5 transition",
        selected
          ? "border-purple-500 ring-2 ring-purple-200"
          : "border-gray-200 hover:border-gray-300 hover:shadow-md"
      ].join(" ")}
    >
      {/* TOP: horas + duración + línea con avión */}
      <div className="grid grid-cols-[auto_1fr_auto] items-center gap-4">
        {/* Izquierda */}
        <div className="min-w-[80px]">
          <div className="text-2xl font-semibold leading-none">{left.hora || salidaHora || "--:--"}</div>
          <div className="text-xs text-gray-500">{left.iata || origen || ""}</div>
        </div>

        {/* Centro */}
        <div className="flex flex-col items-center">
          <div className="text-xs text-gray-500 mb-1">Duración {duracion}</div>
          <PlaneDivider />
        </div>

        {/* Derecha */}
        <div className="text-right min-w-[80px]">
          <div className="text-2xl font-semibold leading-none">{right.hora || llegadaHora || "--:--"}</div>
          <div className="text-xs text-gray-500">{right.iata || destino || ""}</div>
        </div>
      </div>

      {/* BOTTOM: meta + precio/botón */}
      <div className="mt-3 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 text-sm">
          <Badge className="bg-purple-100 text-purple-700">{tarifa}</Badge>
          <span className="text-purple-600">{(directo ?? (escala === "Directo")) ? "Directo" : escala || "Con escalas"}</span>
          <span className="text-gray-500">
            Operado por{" "}
            <span className="text-purple-600 hover:underline cursor-pointer">
              {operadoPor || "AirLink"}
            </span>
          </span>
        </div>

        <div className="flex items-end gap-4">
          <div className="text-right">
            <div className="text-xs text-gray-500">Por persona</div>
            <div className="text-sm font-semibold text-purple-700">
              {formatCLP(precio)}
            </div>
          </div>

          <button
            type="button"
            onClick={onChoose}
            className={[
              "px-4 py-2 rounded-xl w-[120px]",
              selected
                ? "bg-purple-600 text-white"
                : "border border-gray-200 bg-white hover:bg-gray-50"
            ].join(" ")}
          >
            {selected ? "Elegido" : "Elegir"}
          </button>
        </div>
      </div>
    </button>
  );
}

function Badge({ children, className = "" }) {
  return (
    <span
      className={[
        "inline-flex text-xs font-semibold rounded-full px-2 py-0.5",
        className || "bg-purple-100 text-purple-700"
      ].join(" ")}
    >
      {children}
    </span>
  );
}

function PlaneDivider() {
  return (
    <div className="relative w-full max-w-[520px] h-4">
      {/* línea */}
      <div className="absolute inset-y-1 left-0 right-0">
        <div className="h-[2px] w-full bg-gradient-to-r from-transparent via-gray-300 to-transparent" />
      </div>
      {/* “avión” */}
      <div className="absolute inset-0 flex items-center justify-center">
        <svg width="18" height="18" viewBox="0 0 24 24" className="text-gray-400">
          <path fill="currentColor" d="M2.5 19l8.5-5 8.5 5-8.5-14-8.5 14z" />
        </svg>
      </div>
    </div>
  );
}

function formatCLP(num = 0) {
  try {
    return new Intl.NumberFormat("es-CL", {
      style: "currency", currency: "CLP", maximumFractionDigits: 0
    }).format(num);
  } catch {
    // fallback si Intl no forma
    return "$" + (Number(num) || 0).toLocaleString("es-CL");
  }
}
