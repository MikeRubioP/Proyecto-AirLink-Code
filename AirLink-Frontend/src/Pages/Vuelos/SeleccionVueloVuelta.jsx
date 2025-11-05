import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

const API_BASE = "http://localhost:5174";

// Helpers compartidos
const toISO = (val) => {
  const d = val instanceof Date ? val : new Date(val);
  return isNaN(d) ? null : d.toISOString().split("T")[0];
};
const fmtCLP = (n) =>
  Number(n || 0).toLocaleString("es-CL", {
    style: "currency",
    currency: "CLP",
    maximumFractionDigits: 0,
  });
const getLogoUrl = (logo) => {
  if (!logo) return null;
  if (logo.startsWith("http")) return logo;
  return `${API_BASE}${logo}`;
};

export default function SeleccionVueloVuelta() {
  const location = useLocation();
  const navigate = useNavigate();

  const ida = location.state; // viene de BuscarVuelos con vueloIda + tarifaIda

  const [fechaVuelta, setFechaVuelta] = useState("");
  const [fechasDisponibles, setFechasDisponibles] = useState([]);
  const [ordenamiento, setOrdenamiento] = useState("baratos");
  const [vuelos, setVuelos] = useState([]);
  const [vueloHover, setVueloHover] = useState(null);
  const [loading, setLoading] = useState(false);

  // Si no hay datos, redirige
  useEffect(() => {
    if (!ida) {
      navigate("/vuelos/buscar");
      return;
    }
  }, [ida, navigate]);

  // Inicializa fecha de vuelta = ida + 1 día
  useEffect(() => {
    if (!ida) return;
    const base = new Date(ida.fechaIda);
    if (isNaN(base)) return;
    base.setDate(base.getDate() + 1);
    const iso = toISO(base);
    setFechaVuelta(iso ?? toISO(new Date()));
  }, [ida]);

  // Buscar vuelos y generar fechas
  useEffect(() => {
    if (!ida) return;
    const iso = toISO(fechaVuelta);
    if (!iso) return;

    buscarVuelosVuelta(ida.destino, ida.origen, iso, ida.clase);
    generarFechasDisponibles(iso, ida.fechaIda);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fechaVuelta, ordenamiento]);

  const buscarVuelosVuelta = async (org, dest, fechaISO, claseSel) => {
    setLoading(true);
    try {
      const url = `${API_BASE}/vuelos/buscar?origen=${org}&destino=${dest}&fecha=${fechaISO}&clase=${claseSel}`;
      const response = await fetch(url);
      if (!response.ok) throw new Error("Error al buscar vuelos");
      const data = await response.json();

      // Cargar tarifas y precioDesde como en ida
      const withTarifas = await Promise.all(
        data.map(async (v) => {
          try {
            const r = await fetch(`${API_BASE}/vuelos/viajes/${v.idViaje}/tarifas`);
            const tarifas = r.ok ? await r.json() : [];
            const minTarifa = tarifas.length
              ? Math.min(...tarifas.map((t) => Number(t.precio)))
              : Number(v.precio || 0);
            return { ...v, tarifas, precioDesde: minTarifa };
          } catch {
            return { ...v, tarifas: [], precioDesde: Number(v.precio || 0) };
          }
        })
      );

      let vuelosOrdenados = [...withTarifas];
      if (ordenamiento === "baratos") {
        vuelosOrdenados.sort((a, b) => a.precioDesde - b.precioDesde);
      } else if (ordenamiento === "rapidos") {
        vuelosOrdenados.sort((a, b) => a.duracion - b.duracion);
      } else if (ordenamiento === "temprano") {
        vuelosOrdenados.sort((a, b) => a.horaSalida.localeCompare(b.horaSalida));
      }

      setVuelos(vuelosOrdenados);
    } catch (e) {
      console.error(e);
      setVuelos([]);
    } finally {
      setLoading(false);
    }
  };

  const generarFechasDisponibles = (baseISO, fechaIdaISO) => {
    const fechas = [];
    if (!baseISO) return;

    const fechaBase = new Date(baseISO);
    const fechaIda = new Date(fechaIdaISO);
    for (let i = -3; i <= 3; i++) {
      const d = new Date(fechaBase);
      d.setDate(fechaBase.getDate() + i);
      // La vuelta no puede ser el mismo día ni antes que la ida
      if (!(d > fechaIda)) continue;
      const iso = toISO(d);
      if (!iso) continue;
      fechas.push({
        fecha: iso,
        dia: d.toLocaleDateString("es-ES", { weekday: "short" }),
        numero: d.getDate(),
        mes: d.toLocaleDateString("es-ES", { month: "short" }),
      });
    }
    setFechasDisponibles(fechas);
  };

    const seleccionarVueloVuelta = (vueloConTarifa) => {
    const t = vueloConTarifa?.tarifaElegida;

    // precios por tramo (fallback a precio base del vuelo si no hay tarifa)
    const precioIda = Number(ida?.tarifaIda?.precio ?? ida?.vueloIda?.precio ?? 0);
    const precioVuelta = Number(t?.precio ?? vueloConTarifa?.precio ?? 0);

    const pax = Number(ida?.pasajeros ?? 1);
    const totalPorPersona = precioIda + precioVuelta;
    const total = totalPorPersona * pax;

    const datos = {
      ...ida,
      vueloVuelta: vueloConTarifa,
      tarifaVuelta: t
        ? {
            idTarifa: t.idTarifa,
            nombre: t.nombre || t.nombreTarifa,
            precio: Number(t.precio),
            moneda: t.moneda,
            cupos: t.cupos,
          }
        : null,
      fechaVuelta: toISO(fechaVuelta),

      // 👇 nuevo: dejar listo para pago
      pricing: {
        moneda: (t?.moneda ?? ida?.tarifaIda?.moneda ?? "CLP"),
        pasajeros: pax,
        ida: { precio: precioIda },
        vuelta: { precio: precioVuelta },
        totalPorPersona,
        total,
      },
    };

    localStorage.setItem("vueloSeleccionado", JSON.stringify(datos));
    navigate("/vuelos/detalleviaje", { state: datos });
  };


  if (!ida) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Resumen del vuelo de ida */}
      <div className="bg-purple-600 text-white py-6">
        <div className="max-w-7xl mx-auto px-4">
          <h1 className="text-2xl font-bold mb-4">Selecciona tu vuelo de vuelta</h1>

          <div className="bg-purple-700 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm opacity-90 mb-1">Vuelo de ida seleccionado</div>
                <div className="font-semibold text-lg">
                  {ida.origen} → {ida.destino}
                </div>
                <div className="text-sm opacity-90">
                  {new Date(ida.fechaIda).toLocaleDateString("es-ES", {
                    weekday: "long",
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </div>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold">
                  {fmtCLP(ida?.tarifaIda?.precio ?? ida?.vueloIda?.precio)}
                </div>
                <div className="text-sm opacity-90">por persona</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Selector de fechas regreso */}
      {fechasDisponibles.length > 0 && (
        <div className="bg-white border-b py-6">
          <div className="max-w-4xl mx-auto px-4">
            <h3 className="text-center text-sm font-medium text-gray-600 mb-4">
              Selecciona la fecha de regreso
            </h3>
            <div className="flex justify-center gap-2 flex-wrap">
              {fechasDisponibles.map((f) => (
                <button
                  key={f.fecha}
                  onClick={() => setFechaVuelta(f.fecha)}
                  className={`px-6 py-3 rounded-lg border-2 transition-all ${
                    fechaVuelta === f.fecha
                      ? "border-purple-600 bg-purple-600 text-white shadow-lg transform scale-105"
                      : "border-gray-200 hover:border-purple-300 hover:shadow-md bg-white"
                  }`}
                >
                  <div
                    className={`text-xs mb-1 ${
                      fechaVuelta === f.fecha ? "text-purple-100" : "text-gray-500"
                    }`}
                  >
                    {f.dia}
                  </div>
                  <div className="text-2xl font-bold">{f.numero}</div>
                  <div
                    className={`text-xs mt-1 ${
                      fechaVuelta === f.fecha ? "text-purple-100" : "text-gray-500"
                    }`}
                  >
                    {f.mes}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">
            Vuelos de regreso {ida.destino} → {ida.origen}
          </h2>

          <select
            value={ordenamiento}
            onChange={(e) => setOrdenamiento(e.target.value)}
            className="border rounded-lg px-4 py-2 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            <option value="baratos">Más baratos</option>
            <option value="rapidos">Más rápidos</option>
            <option value="temprano">Más temprano</option>
          </select>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-purple-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Buscando vuelos disponibles...</p>
          </div>
        ) : vuelos.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">✈️</div>
            <p className="text-gray-500 text-lg mb-2">No se encontraron vuelos para esta fecha</p>
            <p className="text-gray-400 text-sm">Intenta con otra fecha</p>
          </div>
        ) : (
          <div className="space-y-4">
            {vuelos.map((vuelo) => (
              <div
                key={vuelo.idViaje}
                className="bg-white rounded-lg shadow hover:shadow-xl transition-all p-6 border border-gray-100 relative"
              >
                <div className="flex justify-between items-center">
                  <div className="flex-1">
                    <div className="flex items-center gap-8">
                      <div>
                        <div className="text-3xl font-bold text-gray-800">
                          {vuelo.horaSalida}
                        </div>
                        <div className="text-sm text-gray-500 font-medium">
                          {vuelo.origenCodigo}
                        </div>
                      </div>

                      <div className="flex-1 text-center">
                        <div className="text-sm text-gray-500 mb-1">Duración</div>
                        <div className="flex items-center justify-center gap-2">
                          <div className="h-px bg-gray-300 flex-1"></div>
                          <span className="text-sm font-medium text-gray-700">
                            {Math.floor(vuelo.duracion / 60)}h {vuelo.duracion % 60}min
                          </span>
                          <div className="h-px bg-gray-300 flex-1"></div>
                        </div>
                        <div className="text-xs text-purple-600 mt-1 font-medium">Directo</div>
                      </div>

                      <div>
                        <div className="text-3xl font-bold text-gray-800">
                          {vuelo.horaLlegada}
                        </div>
                        <div className="text-sm text-gray-500 font-medium">
                          {vuelo.destinoCodigo}
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 flex items-center gap-4 text-sm">
                      <div className="flex items-center gap-2 bg-gray-50 px-3 py-2 rounded-lg border border-gray-200">
                        {vuelo.empresaLogo && (
                          <img
                            src={getLogoUrl(vuelo.empresaLogo)}
                            alt={vuelo.empresa}
                            className="h-8 w-auto object-contain"
                            onError={(e) => (e.currentTarget.style.display = "none")}
                          />
                        )}
                      </div>
                      <span className="text-gray-500">• {vuelo.modelo}</span>
                      <span className="text-gray-500">
                        • {vuelo.asientosDisponibles} asientos disponibles
                      </span>
                    </div>
                  </div>

                  <div className="text-right ml-8">
                    <div className="text-sm text-gray-500 mb-1">Desde / por persona</div>
                    <div className="text-3xl font-bold text-purple-600 mb-3">
                      {fmtCLP(vuelo.precioDesde ?? vuelo.precio)}
                    </div>
                    <button
                      onClick={() =>
                        setVueloHover(vueloHover === vuelo.idViaje ? null : vuelo.idViaje)
                      }
                      className="bg-purple-600 text-white px-8 py-3 rounded-lg hover:bg-purple-700 transition-all font-medium shadow-md hover:shadow-lg"
                    >
                      {vueloHover === vuelo.idViaje ? "Cerrar Tarifas" : "Ver Tarifas"}
                    </button>
                    <div className="text-xs text-gray-500 mt-2">
                      {(vuelo.tarifas?.length ?? 0)} opciones de tarifa
                    </div>

                    {vueloHover === vuelo.idViaje && (
                      <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-lg shadow-2xl border border-gray-200 z-50 p-6">
                        <div className="flex justify-between items-center mb-4 pb-3 border-b">
                          <div className="flex items-center gap-3 text-sm">
                            <span className="text-gray-600">
                              <span className="font-bold text-gray-800">{vuelo.horaSalida}</span>{" "}
                              {vuelo.origenCodigo}
                            </span>
                            <span className="text-gray-400">
                              Duración {Math.floor(vuelo.duracion / 60)}h {vuelo.duracion % 60}min
                            </span>
                            <span className="text-gray-600">
                              <span className="font-bold text-gray-800">{vuelo.horaLlegada}</span>{" "}
                              {vuelo.destinoCodigo}
                            </span>
                          </div>
                          <button
                            onClick={() => setVueloHover(null)}
                            className="text-gray-400 hover:text-gray-600 text-xl font-bold"
                          >
                            ✕
                          </button>
                        </div>

                        <div className="text-sm font-semibold text-gray-800 mb-3">
                          {(vuelo.tarifas?.length ?? 0)} Tarifas disponibles
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                          {vuelo?.tarifas?.map((t) => {
                            const nombre = (t.nombreTarifa || t.nombre || "").toString();
                            const premium = /premium/i.test(nombre);
                            const full = /full$/i.test(nombre) && !premium;
                            const standard = /standard/i.test(nombre);
                            const light = /light/i.test(nombre);

                            const cardBase =
                              "border rounded-lg p-4 hover:border-purple-400 transition-all";
                            const cardClass = premium
                              ? "border rounded-lg p-4 bg-gradient-to-br from-gray-800 to-gray-900 text-white hover:border-purple-400 transition-all"
                              : cardBase;

                            return (
                              <div key={t.idTarifa} className={cardClass}>
                                <div className="flex items-center gap-2 mb-3">
                                  {!premium && <div className="h-1 w-8 rounded bg-green-500"></div>}
                                  <h4 className={`font-semibold text-sm ${premium ? "text-white" : ""}`}>
                                    {nombre}
                                  </h4>
                                </div>

                                <div className={`${premium ? "border-gray-700" : ""} border-t pt-3`}>
                                  <div className={`${premium ? "text-gray-300" : "text-gray-500"} text-xs mb-1`}>
                                    {t.moneda} {Number(t.precio).toLocaleString("es-CL")}
                                  </div>
                                  <div className={`text-lg font-bold mb-2 ${premium ? "text-white" : ""}`}>
                                    {t.moneda} {Number(t.precio).toLocaleString("es-CL")}
                                  </div>
                                  <div className={`${premium ? "text-gray-300" : "text-gray-500"} text-xs mb-3`}>
                                    Por pasajero<br/>Incluye tasas e impuestos
                                  </div>

                                  <button
                                    onClick={() =>
                                      seleccionarVueloVuelta({
                                        ...vuelo,
                                        tarifaElegida: {
                                          idTarifa: t.idTarifa,
                                          nombre,
                                          precio: Number(t.precio),
                                          moneda: t.moneda,
                                          cupos: t.cupos,
                                        },
                                      })
                                    }
                                    className={`w-full py-2 rounded text-sm font-medium transition-all ${
                                      premium ? "bg-white text-gray-900 hover:bg-gray-100"
                                              : "bg-purple-600 text-white hover:bg-purple-700"
                                    }`}
                                  >
                                    {light ? "Continuar con Light" : "Elegir"}
                                  </button>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
