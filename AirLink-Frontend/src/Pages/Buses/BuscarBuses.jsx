import { useState } from "react";

/* ======= datos de marcas (chips) ======= */
const BRANDS = [
  { name: "FLIXBUS", color: "bg-green-500" },
  { name: "andimar", color: "bg-indigo-600" },
  { name: "turBUS", color: "bg-lime-600" },
  { name: "Pullman", color: "bg-orange-500" },
  { name: "Tal-Sur", color: "bg-red-500" },
  { name: "Santa María", color: "bg-amber-600" },
  { name: "San Andrés", color: "bg-cyan-600" },
  { name: "Entrevalles", color: "bg-emerald-600" },
];

/* ======= resultados mock para render ======= */
const SAMPLE_RESULTS = [
  {
    id: 1,
    brand: "FLIXBUS",
    outbound: { date: "Mar, 23/09", time: "07:00 AM" },
    inbound: { date: "Mar, 23/09", time: "13:35 PM" },
    cabin: ["Salón Cama", "Salón Cama (I)"],
    price: { now: 18030, old: 20090 },
    duration: "6:35 horas",
    qr: true,
  },
  {
    id: 2,
    brand: "andimar",
    outbound: { date: "Mar, 23/09", time: "07:00 AM" },
    inbound: { date: "Mar, 23/09", time: "13:35 PM" },
    cabin: ["Salón Cama", "Salón Cama (I)"],
    price: { now: 18030, old: 20090 },
    duration: "6:35 horas",
    qr: true,
  },
  {
    id: 3,
    brand: "Pullman",
    outbound: { date: "Mar, 23/09", time: "07:00 AM" },
    inbound: { date: "Mar, 23/09", time: "13:35 PM" },
    cabin: ["Salón Cama", "Salón Cama (I)"],
    price: { now: 18030, old: 20090 },
    duration: "6:35 horas",
    qr: true,
  },
  {
    id: 4,
    brand: "turBUS",
    outbound: { date: "Mar, 23/09", time: "07:00 AM" },
    inbound: { date: "Mar, 23/09", time: "13:35 PM" },
    cabin: ["Salón Cama", "Salón Cama (I)"],
    price: { now: 18030, old: 20090 },
    duration: "6:35 horas",
    qr: true,
  },
];

/* ======= UI helpers ======= */
function Step({ n, title }) {
  return (
    <div className="flex items-center gap-3 bg-white rounded-xl border p-4">
      <div className="w-8 h-8 rounded-full bg-purple-600 text-white flex items-center justify-center font-semibold">
        {n}
      </div>
      <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
    </div>
  );
}

function ClockIcon({ className = "w-5 h-5" }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className={className}>
      <circle cx="12" cy="12" r="9" strokeWidth="1.5" />
      <path d="M12 7v5l3 3" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

function SwapIcon({ className = "w-5 h-5" }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className={className}>
      <path d="M7 7h11M7 7l2-2M7 7l2 2" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M17 17H6m11 0-2-2m2 2-2 2" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

/* ======= tarjeta de resultado ======= */
function BusCard({ item }) {
  const brand = BRANDS.find(
    (b) => b.name.toLowerCase() === item.brand.toLowerCase()
  );
  return (
    <div className="rounded-2xl border bg-white overflow-hidden shadow-sm">
      {/* franja superior de marca */}
      <div className={`h-2 ${brand?.color || "bg-gray-300"}`} />

      <div className="p-4 md:p-5 flex flex-col gap-4">
        <div className="grid grid-cols-1 md:grid-cols-[auto_1fr_auto] gap-4 items-center">
          {/* horas/fechas */}
          <div className="flex flex-col text-sm text-gray-700">
            <div className="flex items-center gap-2">
              <span className="text-gray-500">{item.outbound.date}</span>
              <span className="font-semibold">{item.outbound.time}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-gray-500">{item.inbound.date}</span>
              <span className="font-semibold">{item.inbound.time}</span>
            </div>
          </div>

          {/* cabina */}
          <div className="text-sm text-gray-700">
            {item.cabin.map((c, i) => (
              <div key={i}>{c}</div>
            ))}
          </div>

          {/* precio + CTA */}
          <div className="flex items-center gap-4">
            <div className="text-right">
              <div className="text-lg font-bold">
                ${item.price.now.toLocaleString("es-CL")}
              </div>
              <div className="text-gray-400 line-through">
                ${item.price.old.toLocaleString("es-CL")}
              </div>
            </div>
            <button className="bg-purple-600 text-white px-5 py-2 rounded-lg hover:bg-purple-700 transition shadow">
              Comprar
            </button>
          </div>
        </div>

        {/* pie tarjeta */}
        <div className="flex items-center justify-between text-sm text-gray-600">
          <div className="flex items-center gap-2">
            <ClockIcon className="w-4 h-4" /> {item.duration}
          </div>
          {item.qr && (
            <label className="inline-flex items-center gap-2">
              <input type="checkbox" className="accent-purple-600" defaultChecked />
              <span>Ticket con QR</span>
            </label>
          )}
        </div>
      </div>
    </div>
  );
}

/* ======= Página principal (SIN Header) ======= */
export default function BuscarBuses() {
  const [origin, setOrigin] = useState("");
  const [dest, setDest] = useState("");
  const [date, setDate] = useState("");

  const onSearch = (e) => {
    e.preventDefault();
    // Aquí conectas con tu backend /buses/search
    console.log("Buscar:", { origin, dest, date });
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      <main className="max-w-6xl mx-auto px-4 py-6 space-y-6">
        {/* Paso 1 */}
        <Step n={1} title="Pasajero" />

        {/* Paso 2: Buses */}
        <section className="bg-white rounded-2xl border p-4 md:p-6 space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-purple-600 text-white grid place-items-center font-semibold">
              2
            </div>
            <h2 className="text-lg md:text-xl font-semibold">Buses</h2>
          </div>

          {/* marcas */}
          <div className="flex flex-wrap items-center gap-2 md:gap-3">
            {BRANDS.map((b) => (
              <span
                key={b.name}
                className={`text-xs md:text-sm ${b.color} text-white px-3 py-1 rounded-full shadow-sm`}
              >
                {b.name}
              </span>
            ))}
          </div>

          {/* barra de búsqueda */}
          <form
            onSubmit={onSearch}
            className="mt-2 grid grid-cols-1 md:grid-cols-[1fr_auto_1fr_auto_auto] gap-3"
          >
            <div className="relative">
              <label className="text-xs text-gray-500">Origen</label>
              <input
                value={origin}
                onChange={(e) => setOrigin(e.target.value)}
                placeholder="Origen"
                className="mt-1 w-full border rounded-lg px-3 py-2"
              />
            </div>

            <div className="hidden md:flex items-end justify-center pb-2">
              <SwapIcon className="w-6 h-6 text-gray-400" />
            </div>

            <div className="relative">
              <label className="text-xs text-gray-500">Destino</label>
              <input
                value={dest}
                onChange={(e) => setDest(e.target.value)}
                placeholder="Destino"
                className="mt-1 w-full border rounded-lg px-3 py-2"
              />
            </div>

            <div className="relative">
              <label className="text-xs text-gray-500">Fecha de ida</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="mt-1 w-full border rounded-lg px-3 py-2"
              />
            </div>

            <div className="flex items-end">
              <button
                type="submit"
                className="w-full md:w-auto bg-purple-600 hover:bg-purple-700 text-white font-medium px-5 py-2 rounded-lg shadow"
              >
                Buscar
              </button>
            </div>
          </form>

          {/* resultados */}
          <div className="space-y-4 mt-2">
            {SAMPLE_RESULTS.map((r) => (
              <BusCard key={r.id} item={r} />
            ))}
          </div>
        </section>

        {/* Paso 3 */}
        <Step n={3} title="Pago" />
      </main>
    </div>
  );
}
