import { useMemo, useState } from "react";

/* ──────────────────────────────────────────────────────────────────────────
   Componentes UI
────────────────────────────────────────────────────────────────────────── */

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

function Method({ id, label, selected, onSelect, brandClass }) {
  return (
    <button
      type="button"
      onClick={() => onSelect(id)}
      className={`relative w-full sm:w-56 h-14 rounded-xl border shadow-sm text-white font-semibold
        ${selected ? "ring-2 ring-purple-300" : "opacity-95"}
        ${brandClass}`}
      aria-pressed={selected}
    >
      {label}
      <span className="absolute -right-4 inset-y-0 hidden sm:block w-8">
        <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-3 h-3 rounded-full border border-gray-300 bg-white" />
      </span>
    </button>
  );
}

function Badge({ children }) {
  return (
    <span className="text-[10px] uppercase font-semibold bg-purple-100 text-purple-700 px-2 py-0.5 rounded">
      {children}
    </span>
  );
}

function SummaryCard({ title, items, footerLeft, footerRight }) {
  return (
    <div className="bg-white border rounded-2xl shadow-sm p-4 w-full">
      <div className="text-sm font-semibold text-gray-800 mb-3">
        {title}
      </div>
      <div className="space-y-2 text-sm text-gray-700">
        {items.map((it, idx) => (
          <div key={idx} className="leading-5">
            {it.title && <div className="font-semibold">{it.title}</div>}
            {it.lines?.map((ln, i) => (
              <div key={i} className={ln.muted ? "text-gray-500" : ""}>
                {ln.text}
              </div>
            ))}
          </div>
        ))}
      </div>

      <div className="mt-3 pt-3 border-t flex items-center justify-between text-sm">
        <div className="text-gray-600">{footerLeft}</div>
        <div className="font-semibold">{footerRight}</div>
      </div>
    </div>
  );
}

/* ──────────────────────────────────────────────────────────────────────────
   Página de Pago
────────────────────────────────────────────────────────────────────────── */

export default function Pago() {
  const [method, setMethod] = useState("stripe");

  // Mock de datos (cámbialos por datos reales del contexto/checkout)
  const resumenAvion = useMemo(
    () => ({
      title: (
        <div className="flex items-center gap-2">
          <Badge>ida</Badge>
          <Badge>vuelta</Badge>
          <span>Detalles de la compra “Avión”</span>
        </div>
      ),
      items: [
        {
          title: "AirLink",
          lines: [
            { text: "Mar, 23 Sep, 2025" },
            { text: "Santiago, Chile", muted: true },
            { text: "Aeropuerto de Santiago 10:30AM", muted: true },
            { text: "La Serena, Chile", muted: true },
            { text: "Aeropuerto La Florida 11:35AM", muted: true },
          ],
        },
      ],
      footerLeft: "1 x A",
      footerRight: "CLP $80.000",
    }),
    []
  );

  const resumenBus = useMemo(
    () => ({
      title: (
        <div className="flex items-center gap-2">
          <Badge>ida</Badge>
          <span>Detalles de la compra “BUS”</span>
        </div>
      ),
      items: [
        {
          title: "Pullman Bus",
          lines: [
            { text: "Mar, 23 Sep, 2025" },
            { text: "La Serena, Chile", muted: true },
            { text: "Terminal La Serena. 02:00 AM", muted: true },
            { text: "Coquimbo, Chile", muted: true },
            { text: "Terminal de Buses de Coquimbo 02:20AM", muted: true },
            { text: "6:35 horas", muted: true },
          ],
        },
      ],
      footerLeft: "1 x Salón Cama",
      footerRight: "CLP $10.000",
    }),
    []
  );

  const total = useMemo(() => 80000 + 10000, []);

  const pagar = () => {
    // Aquí rediriges o llamas a tu backend: /payments/checkout
    // payload sugerido:
    // { method, items: [...], totals: { total } }
    console.log("Pagar →", { method, total });
    alert(`Simulación de pago con ${method.toUpperCase()} por CLP $${total.toLocaleString("es-CL")}`);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="max-w-6xl mx-auto px-4 py-6 space-y-6">
        {/* Pasos 1 y 2 en “estado” colapsado para el flujo visual */}
        <Step n={1} title="Pasajero" />
        <Step n={2} title="Buses" />

        {/* Paso 3: Pago */}
        <section className="bg-white rounded-2xl border p-4 md:p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 rounded-full bg-purple-600 text-white grid place-items-center font-semibold">
              3
            </div>
            <h2 className="text-lg md:text-xl font-semibold">Pago</h2>
          </div>

          {/* Métodos de pago */}
          <div className="flex flex-col sm:flex-row gap-4 mb-5">
            <Method
              id="stripe"
              label="stripe"
              selected={method === "stripe"}
              onSelect={setMethod}
              brandClass="bg-indigo-600"
            />
            <Method
              id="mercadopago"
              label="mercado pago"
              selected={method === "mercadopago"}
              onSelect={setMethod}
              brandClass="bg-sky-500"
            />
            <Method
              id="paypal"
              label="PayPal"
              selected={method === "paypal"}
              onSelect={setMethod}
              brandClass="bg-cyan-600"
            />
          </div>

          {/* Resúmenes */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            <SummaryCard
              title={resumenAvion.title}
              items={resumenAvion.items}
              footerLeft={resumenAvion.footerLeft}
              footerRight={resumenAvion.footerRight}
            />
            <SummaryCard
              title={resumenBus.title}
              items={resumenBus.items}
              footerLeft={resumenBus.footerLeft}
              footerRight={resumenBus.footerRight}
            />
          </div>

          {/* Total + botón pagar */}
          <div className="mt-8 flex flex-col items-center gap-3">
            <div className="text-sm text-gray-600">
              Total a pagar: <span className="font-semibold text-gray-900">CLP ${total.toLocaleString("es-CL")}</span>
            </div>
            <button
              onClick={pagar}
              className="w-full md:w-80 bg-purple-600 hover:bg-purple-700 text-white font-semibold tracking-wide py-3 rounded-xl shadow"
            >
              PAGAR
            </button>
          </div>
        </section>
      </main>

      {/* Footer de tu layout global puede ir fuera si ya existe */}
    </div>
  );
}
