import React, { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext"; // asumiendo que exportas un hook

const BRAND = "#7C4DFF";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5174";

export default function MisViajes() {
  const { user, token } = useAuth?.() || {};
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [reservas, setReservas] = useState([]);

  // UI state
  const [q, setQ] = useState("");
  const [estado, setEstado] = useState("todos"); // proximos | pasados | todos

  useEffect(() => {
    let alive = true;
    (async () => {
      setLoading(true);
      setErr("");

      // ---- fetch real a tu backend
      try {
        const res = await fetch(`${API_URL}/api/reservas/mias`, {
          headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        if (alive) setReservas(Array.isArray(data) ? data : []);
      } catch (e) {
        // ---- mock si falla la API
        if (alive) {
          console.warn("Usando mock de MisViajes:", e?.message || e);
          setReservas(MOCK_RESERVAS);
        }
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => { alive = false; };
  }, [token]);

  const hoyISO = new Date().toISOString();

  const filtradas = useMemo(() => {
    let list = reservas.slice();

    // Filtro por búsqueda
    if (q.trim()) {
      const term = q.trim().toLowerCase();
      list = list.filter((r) =>
        [r.codigo, r.origen, r.destino, r.pasajero]
          .filter(Boolean)
          .some((s) => String(s).toLowerCase().includes(term))
      );
    }

    // Filtro por estado (fecha)
    if (estado === "proximos") {
      list = list.filter((r) => r.salidaIso > hoyISO);
    } else if (estado === "pasados") {
      list = list.filter((r) => r.salidaIso <= hoyISO);
    }

    // Orden: próximos primero
    list.sort((a, b) => a.salidaIso.localeCompare(b.salidaIso));
    return list;
  }, [reservas, q, estado, hoyISO]);

  return (
    <div className="min-h-screen bg-[#F7F7FB]">
      <header className="max-w-7xl mx-auto px-6 pt-8 pb-4">
        <h1 className="text-2xl md:text-3xl font-extrabold">Mis viajes</h1>
        <p className="text-[#5c5c66] mt-1">Consulta tus reservas, realiza check-in y descarga pases de abordar.</p>
      </header>

      <main className="max-w-7xl mx-auto px-6 pb-16">
        {/* Filtros */}
        <div className="rounded-2xl bg-white border border-[#E7E7ED] p-4 md:p-5 flex flex-col md:flex-row gap-3 md:items-center md:justify-between">
          <div className="flex gap-2">
            <button
              className={tabCls(estado === "todos")}
              onClick={() => setEstado("todos")}
            >
              Todos
            </button>
            <button
              className={tabCls(estado === "proximos")}
              onClick={() => setEstado("proximos")}
            >
              Próximos
            </button>
            <button
              className={tabCls(estado === "pasados")}
              onClick={() => setEstado("pasados")}
            >
              Pasados
            </button>
          </div>
          <div className="flex-1 md:max-w-sm">
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Buscar por código, ciudad o pasajero…"
              className="w-full border rounded-xl px-4 py-2"
            />
          </div>
        </div>

        {/* Estado de carga / error / vacío */}
        {loading && (
          <div className="mt-8 text-[#5c5c66]">Cargando tus viajes…</div>
        )}
        {!loading && err && (
          <div className="mt-8 text-red-600">Error: {err}</div>
        )}
        {!loading && !err && filtradas.length === 0 && (
          <EmptyState onIrAExplorar={() => navigate("/")} />
        )}

        {/* Lista de reservas */}
        <section className="mt-6 grid gap-4">
          {filtradas.map((r) => (
            <ReservaCard
              key={r.id}
              r={r}
              onCheckin={() => navigate("/checkin")}
              onDetalle={() => navigate(`/mis-viajes/${r.id}`)}
            />
          ))}
        </section>
      </main>
    </div>
  );
}

/* ---------------- Subcomponentes ---------------- */

function ReservaCard({ r, onCheckin, onDetalle }) {
  const esPasado = new Date(r.salidaIso) <= new Date();
  const puedeCheckin = !esPasado && r.permiteCheckin; // regla simple, ajusta según tu negocio

  return (
    <article className="rounded-3xl border border-[#E7E7ED] bg-white p-5 md:p-6 flex flex-col md:flex-row md:items-center gap-4">
      {/* Ruta + horario */}
      <div className="flex-1">
        <div className="text-sm text-[#5c5c66]">Vuelo {r.vuelo}</div>
        <div className="text-xl font-bold">
          {r.origen} → {r.destino}
        </div>
        <div className="text-sm text-[#5c5c66]">
          {fmtFecha(r.salidaIso)} · {r.hSalida} — {r.hLlegada}
        </div>
        <div className="mt-1 text-xs text-[#8A8A8E]">Código de reserva: {r.codigo}</div>
        <div className="mt-1 text-xs text-[#8A8A8E]">Pasajero: {r.pasajero}</div>
      </div>

      {/* Badges */}
      <div className="flex flex-wrap items-center gap-2">
        <Badge>{esPasado ? "Finalizado" : "Próximo"}</Badge>
        {r.equipaje && <Badge>Equipaje: {r.equipaje}</Badge>}
        {r.tarifa && <Badge>{r.tarifa}</Badge>}
      </div>

      {/* Acciones */}
      <div className="flex gap-2 md:ml-4">
        <button
          onClick={onDetalle}
          className="px-4 py-2 rounded-xl border border-[#E7E7ED] bg-white hover:bg-[#fafafe]"
        >
          Ver detalle
        </button>
        {puedeCheckin && (
          <button
            onClick={onCheckin}
            className="px-4 py-2 rounded-xl text-white"
            style={{ background: BRAND }}
          >
            Check-in
          </button>
        )}
        {r.paseUrl && (
          <a
            href={r.paseUrl}
            target="_blank"
            rel="noreferrer"
            className="px-4 py-2 rounded-xl border border-[#E7E7ED] bg-white hover:bg-[#fafafe]"
          >
            Descargar pase
          </a>
        )}
      </div>
    </article>
  );
}

function EmptyState({ onIrAExplorar }) {
  return (
    <div className="mt-10 rounded-3xl border border-[#E7E7ED] bg-white p-10 text-center">
      <div
        className="mx-auto h-12 w-12 rounded-full grid place-items-center text-white mb-3"
        style={{ background: BRAND }}
      >
        ✈
      </div>
      <h3 className="text-xl font-bold">Aún no tienes viajes</h3>
      <p className="text-[#5c5c66] mt-1">Cuando reserves, aparecerán aquí para que gestiones tu experiencia.</p>
      <button
        onClick={onIrAExplorar}
        className="mt-4 px-6 py-3 rounded-xl text-white"
        style={{ background: BRAND }}
      >
        Explorar destinos
      </button>
    </div>
  );
}

function Badge({ children }) {
  return (
    <span className="inline-flex text-xs font-semibold text-[#7C4DFF] bg-[#7C4DFF]/10 rounded-full px-2 py-0.5">
      {children}
    </span>
  );
}

function tabCls(active) {
  return `px-4 py-2 rounded-xl text-sm ${
    active
      ? "text-white"
      : "text-[#5c5c66] border border-[#E7E7ED] bg-white hover:bg-[#fafafe]"
  } ${active ? "" : ""}`.trim() + (active ? "" : "");
}
  
/* Utilidades */
function fmtFecha(iso) {
  try {
    const d = new Date(iso);
    return d.toLocaleDateString("es-CL", { weekday: "short", year: "numeric", month: "short", day: "numeric" });
  } catch {
    return iso;
  }
}

/* ---------------- Mock de datos (por si la API no está lista) ---------------- */

const MOCK_RESERVAS = [
  {
    id: 1,
    codigo: "ABCD12",
    pasajero: "Juan Pérez",
    vuelo: "AL 348",
    origen: "SCL",
    destino: "LIM",
    salidaIso: addDaysISO(3),
    hSalida: "08:30",
    hLlegada: "10:40",
    permiteCheckin: true,
    equipaje: "1× mano",
    tarifa: "Standard",
    paseUrl: null
  },
  {
    id: 2,
    codigo: "ZX98QW",
    pasajero: "Juan Pérez",
    vuelo: "AL 912",
    origen: "LIM",
    destino: "UIO",
    salidaIso: addDaysISO(-15),
    hSalida: "12:10",
    hLlegada: "14:25",
    permiteCheckin: false,
    equipaje: "1× mano, 1× bodega",
    tarifa: "Flex",
    paseUrl: "#"
  }
];

function addDaysISO(delta) {
  const d = new Date();
  d.setDate(d.getDate() + delta);
  return d.toISOString();
}
