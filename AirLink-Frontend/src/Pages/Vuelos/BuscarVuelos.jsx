import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";

export default function BuscarVuelos() {
  const location = useLocation();
  const navigate = useNavigate();

  const destinoInfo = location.state?.destinoInfo; // si vienes desde una tarjeta
  const searchState = location.state?.search;      // si vienes desde Home (navigate con state)

  // Estados para el formulario de búsqueda
  const [origen, setOrigen] = useState("SCL");
  const [destino, setDestino] = useState("");
  const [fechaIda, setFechaIda] = useState("");
  const [fechaVuelta, setFechaVuelta] = useState("");
  const [pasajeros, setPasajeros] = useState(1);
  const [tipoViaje, setTipoViaje] = useState("solo-ida");
  const [clase, setClase] = useState("eco");
  const [vueloHover, setVueloHover] = useState(null);

  // Estados para resultados
  const [vuelos, setVuelos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [ordenamiento, setOrdenamiento] = useState("baratos");
  const [error, setError] = useState(null);

  // Estados para el calendario de fechas
  const [fechasDisponibles, setFechasDisponibles] = useState([]);

  // ---- helpers ----
  const fmtCLP = (n) =>
    Number(n || 0).toLocaleString("es-CL", {
      style: "currency",
      currency: "CLP",
      maximumFractionDigits: 0,
    });

  // Función para obtener el código de terminal desde la ciudad
  const obtenerCodigoCiudad = async (ciudad) => {
    try {
      const response = await fetch(
        `http://localhost:5174/vuelos/destinos/${encodeURIComponent(ciudad)}/codigo`
      );
      if (response.ok) {
        const data = await response.json();
        return data.codigo;
      }
    } catch (error) {
      console.error("Error obteniendo código de ciudad:", error);
    }
    return null;
  };

  // Inicializa desde state (Home) o desde destinoInfo o fecha por defecto
  useEffect(() => {
    const init = async () => {
      if (searchState) {
        setOrigen(searchState.origen ?? "SCL");
        setDestino(searchState.destino ?? "");
        setFechaIda(searchState.fechaIda ?? new Date().toISOString().split("T")[0]);
        setFechaVuelta(searchState.fechaVuelta ?? "");
        setTipoViaje(searchState.tipoViaje ?? "solo-ida");
        setClase(searchState.clase ?? "eco");
        setPasajeros(searchState.pasajeros ?? 1);
      } else {
        if (destinoInfo?.ciudad) {
          const codigo = await obtenerCodigoCiudad(destinoInfo.ciudad);
          if (codigo) setDestino(codigo);
        }
        setFechaIda((prev) => prev || new Date().toISOString().split("T")[0]);
      }
    };
    init();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.state]);

  // Buscar cuando cambian parámetros relevantes
  useEffect(() => {
    if (origen && destino && fechaIda) {
      buscarVuelos();
      generarFechasDisponibles();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [origen, destino, fechaIda, clase, ordenamiento]);

  // ---- API: buscar vuelos y adjuntar tarifas ----
  const buscarVuelos = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `http://localhost:5174/vuelos/buscar?origen=${origen}&destino=${destino}&fecha=${fechaIda}&clase=${clase}`
      );

      if (!response.ok) {
        throw new Error("Error al buscar vuelos");
      }

      const data = await response.json();

      // Trae tarifas por cada vuelo en paralelo y calcula precioDesde (mínimo)
      const withTarifas = await Promise.all(
        data.map(async (v) => {
          try {
            const r = await fetch(`http://localhost:5174/vuelos/viajes/${v.idViaje}/tarifas`);
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

      // Ordenar según criterio seleccionado
      let vuelosOrdenados = [...withTarifas];
      if (ordenamiento === "baratos") {
        vuelosOrdenados.sort((a, b) => a.precioDesde - b.precioDesde);
      } else if (ordenamiento === "rapidos") {
        vuelosOrdenados.sort((a, b) => a.duracion - b.duracion);
      } else if (ordenamiento === "temprano") {
        vuelosOrdenados.sort((a, b) => a.horaSalida.localeCompare(b.horaSalida));
      }

      setVuelos(vuelosOrdenados);
    } catch (error) {
      console.error("Error buscando vuelos:", error);
      setError("No se pudieron cargar los vuelos. Intenta nuevamente.");
      setVuelos([]);
    } finally {
      setLoading(false);
    }
  };

  const generarFechasDisponibles = () => {
    const fechas = [];
    const fechaBase = new Date(fechaIda);

    for (let i = -3; i <= 3; i++) {
      const fecha = new Date(fechaBase);
      fecha.setDate(fechaBase.getDate() + i);
      fechas.push({
        fecha: fecha.toISOString().split("T")[0],
        dia: fecha.toLocaleDateString("es-ES", { weekday: "short" }),
        numero: fecha.getDate(),
        mes: fecha.toLocaleDateString("es-ES", { month: "short" }),
      });
    }
    setFechasDisponibles(fechas);
  };

  // Actualizado para aceptar vuelo con tarifaElegida
  const seleccionarVuelo = (vueloConTarifa) => {
    const t = vueloConTarifa?.tarifaElegida;

    const datosVuelo = {
      vueloIda: vueloConTarifa,
      tarifaIda: t
        ? {
            idTarifa: t.idTarifa,
            nombre: t.nombre || t.nombreTarifa,
            precio: Number(t.precio),
            moneda: t.moneda,
            cupos: t.cupos,
          }
        : null,
      origen,
      destino,
      fechaIda,
      fechaVuelta,
      clase,
      pasajeros,
    };

    localStorage.setItem("vueloSeleccionado", JSON.stringify(datosVuelo));

    if (tipoViaje === "ida-vuelta") {
      navigate("/vuelos/vuelta", { state: datosVuelo });
    } else {
      navigate("/vuelos/detalleviaje", { state: datosVuelo });
    }
  };

  const formatearDuracion = (minutos) => {
    const horas = Math.floor(minutos / 60);
    const mins = minutos % 60;
    return `${horas}h ${mins}min`;
  };

  // Función para obtener URL completa del logo
  const getLogoUrl = (logo) => {
    if (!logo) return null;
    if (logo.startsWith("http")) return logo;
    return `http://localhost:5174${logo}`;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header con información del destino */}
      {destinoInfo && (
        <div
          className="bg-cover bg-center py-8"
          style={{
            backgroundImage: `linear-gradient(rgba(0,0,0,0.5), rgba(0,0,0,0.5)), url(${getLogoUrl(
              destinoInfo.imagen
            )})`,
          }}
        >
          <div className="max-w-7xl mx-auto px-4">
            <h1 className="text-white text-3xl font-bold mb-2">
              {destinoInfo.nombre}
            </h1>
            <p className="text-white text-lg">
              {destinoInfo.ciudad}, {destinoInfo.pais}
            </p>
            <p className="text-white/90 text-sm mt-2">
              Desde {fmtCLP(destinoInfo.precio)} por persona
            </p>
          </div>
        </div>
      )}

      {/* Selector de fechas */}
      {fechasDisponibles.length > 0 && (
        <div className="bg-white border-b py-6">
          <div className="max-w-4xl mx-auto px-4">
            <h3 className="text-center text-sm font-medium text-gray-600 mb-4">
              Selecciona una fecha
            </h3>
            <div className="flex justify-center gap-2 flex-wrap">
              {fechasDisponibles.map((f) => (
                <button
                  key={f.fecha}
                  onClick={() => setFechaIda(f.fecha)}
                  className={`px-6 py-3 rounded-lg border-2 transition-all ${
                    fechaIda === f.fecha
                      ? "border-purple-600 bg-purple-600 text-white shadow-lg transform scale-105"
                      : "border-gray-200 hover:border-purple-300 hover:shadow-md bg-white"
                  }`}
                >
                  <div
                    className={`text-xs mb-1 ${
                      fechaIda === f.fecha ? "text-purple-100" : "text-gray-500"
                    }`}
                  >
                    {f.dia}
                  </div>
                  <div className="text-2xl font-bold">{f.numero}</div>
                  <div
                    className={`text-xs mt-1 ${
                      fechaIda === f.fecha ? "text-purple-100" : "text-gray-500"
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
            Vuelos disponibles {origen} → {destino}
          </h2>
          <div className="flex items-center gap-4">
            {/* Selector de tipo de viaje */}
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">Tipo de viaje:</span>
              <select
                value={tipoViaje}
                onChange={(e) => setTipoViaje(e.target.value)}
                className="border rounded-lg px-4 py-2 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="solo-ida">Solo ida</option>
                <option value="ida-vuelta">Ida y vuelta</option>
              </select>
            </div>

            {/* Selector de ordenamiento */}
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">Ordenar por:</span>
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
          </div>
        </div>

        {/* Mensaje de error */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
            {error}
          </div>
        )}

        {/* Lista de vuelos */}
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-purple-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Buscando vuelos disponibles...</p>
          </div>
        ) : vuelos.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">✈️</div>
            <p className="text-gray-500 text-lg mb-2">
              No se encontraron vuelos para esta búsqueda
            </p>
            <p className="text-gray-400 text-sm">Intenta con otras fechas o destinos</p>
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
                      {/* Hora salida */}
                      <div>
                        <div className="text-3xl font-bold text-gray-800">
                          {vuelo.horaSalida}
                        </div>
                        <div className="text-sm text-gray-500 font-medium">
                          {vuelo.origenCodigo}
                        </div>
                      </div>

                      {/* Duración */}
                      <div className="flex-1 text-center">
                        <div className="text-sm text-gray-500 mb-1">Duración</div>
                        <div className="flex items-center justify-center gap-2">
                          <div className="h-px bg-gray-300 flex-1"></div>
                          <span className="text-sm font-medium text-gray-700">
                            {formatearDuracion(vuelo.duracion)}
                          </span>
                          <div className="h-px bg-gray-300 flex-1"></div>
                        </div>
                        <div className="text-xs text-purple-600 mt-1 font-medium">
                          Directo
                        </div>
                      </div>

                      {/* Hora llegada */}
                      <div>
                        <div className="text-3xl font-bold text-gray-800">
                          {vuelo.horaLlegada}
                        </div>
                        <div className="text-sm text-gray-500 font-medium">
                          {vuelo.destinoCodigo}
                        </div>
                      </div>
                    </div>

                    {/* Información adicional */}
                    <div className="mt-4 flex items-center gap-4 text-sm">
                      <div className="flex items-center gap-2 bg-gray-50 px-3 py-2 rounded-lg border border-gray-200">
                        {vuelo.empresaLogo && (
                          <img
                            src={getLogoUrl(vuelo.empresaLogo)}
                            alt={vuelo.empresa}
                            className="h-8 w-auto object-contain"
                            onError={(e) => {
                              console.error(`Error cargando logo: ${vuelo.empresaLogo}`);
                              e.currentTarget.style.display = "none";
                            }}
                          />
                        )}
                      </div>
                      <span className="text-gray-500">• {vuelo.modelo}</span>
                      <span className="text-gray-500">
                        • {vuelo.asientosDisponibles} asientos disponibles
                      </span>
                    </div>
                  </div>

                  {/* Precio y selección */}
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

                    {/* Panel de tarifas */}
                    {vueloHover === vuelo.idViaje && (
                      <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-lg shadow-2xl border border-gray-200 z-50 p-6">
                        <div className="flex justify-between items-center mb-4 pb-3 border-b">
                          <div className="flex items-center gap-4">
                            <div className="bg-green-50 px-3 py-1 rounded-full">
                              <span className="text-green-700 text-sm font-medium">
                                Más económico
                              </span>
                            </div>
                            <div className="bg-blue-50 px-3 py-1 rounded-full">
                              <span className="text-blue-700 text-sm font-medium">
                                Más rápido
                              </span>
                            </div>
                          </div>
                          <div className="flex items-center gap-3 text-sm">
                            <span className="text-gray-600">
                              <span className="font-bold text-gray-800">{vuelo.horaSalida}</span>{" "}
                              {vuelo.origenCodigo}
                            </span>
                            <span className="text-gray-400">
                              Duración {formatearDuracion(vuelo.duracion)}
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

                        <div className="mb-3">
                          <span className="text-sm text-gray-600">Directo</span>
                          <div className="text-xs text-gray-500 mt-1">
                            Operado por <span className="text-purple-600">🛩️ {vuelo.empresa}</span>
                          </div>
                          <div className="text-xs text-gray-500">
                            {vuelo.modelo} incluye <span className="font-medium">✈️ 🍷 📶 💺 📺</span>
                          </div>
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
                                  {!premium && (
                                    <div className="h-1 w-8 rounded bg-green-500"></div>
                                  )}
                                  <h4
                                    className={`font-semibold text-sm ${
                                      premium ? "text-white" : ""
                                    }`}
                                  >
                                    {nombre}
                                  </h4>
                                </div>

                                {/* bullets rápidos por tipo */}
                                <ul
                                  className={`space-y-2 text-xs mb-4 min-h-[200px] ${
                                    premium ? "text-gray-200" : "text-gray-700"
                                  }`}
                                >
                                  {light && (
                                    <>
                                      <li className="flex gap-2">
                                        <span className="text-green-500">✓</span>Bolso o mochila
                                      </li>
                                      <li className="flex gap-2">
                                        <span className="text-green-500">✓</span>Maleta pequeña 12 kg
                                      </li>
                                      <li className="flex gap-2">
                                        <span className="text-green-500">✓</span>Cambio con cargo + diferencia
                                      </li>
                                    </>
                                  )}
                                  {standard && (
                                    <>
                                      <li className="flex gap-2">
                                        <span className="text-green-500">✓</span>Bolso o mochila
                                      </li>
                                      <li className="flex gap-2">
                                        <span className="text-green-500">✓</span>Maleta pequeña 12 kg
                                      </li>
                                      <li className="flex gap-2">
                                        <span className="text-green-500">✓</span>1 equipaje de bodega 23 kg
                                      </li>
                                      <li className="flex gap-2">
                                        <span className="text-green-500">✓</span>Cambio con cargo + diferencia
                                      </li>
                                    </>
                                  )}
                                  {full && (
                                    <>
                                      <li className="flex gap-2">
                                        <span className="text-green-500">✓</span>Bolso o mochila
                                      </li>
                                      <li className="flex gap-2">
                                        <span className="text-green-500">✓</span>Maleta pequeña 12 kg
                                      </li>
                                      <li className="flex gap-2">
                                        <span className="text-green-500">✓</span>1 equipaje de bodega 23 kg
                                      </li>
                                      <li className="flex gap-2">
                                        <span className="text-green-500">✓</span>Cambio sin cargo + diferencia
                                      </li>
                                      <li className="flex gap-2">
                                        <span className="text-green-500">✓</span>Selección de asiento Estándar
                                      </li>
                                    </>
                                  )}
                                  {premium && (
                                    <>
                                      <li className="flex gap-2">
                                        <span className="text-green-400">✓</span>2 equipajes de bodega 23 kg
                                      </li>
                                      <li className="flex gap-2">
                                        <span className="text-green-400">✓</span>Asiento cama
                                      </li>
                                      <li className="flex gap-2">
                                        <span className="text-green-400">✓</span>Embarque prioritario
                                      </li>
                                    </>
                                  )}
                                </ul>

                                <div className={`${premium ? "border-gray-700" : ""} border-t pt-3`}>
                                  <div className={`${premium ? "text-gray-300" : "text-gray-500"} text-xs mb-1`}>
                                    {t.moneda} {Number(t.precio).toLocaleString("es-CL")}
                                  </div>
                                  <div className={`text-lg font-bold mb-2 ${premium ? "text-white" : ""}`}>
                                    {t.moneda} {Number(t.precio).toLocaleString("es-CL")}
                                  </div>
                                  <div className={`${premium ? "text-gray-300" : "text-gray-500"} text-xs mb-3`}>
                                    Por pasajero<br />Incluye tasas e impuestos
                                  </div>

                                  <button
                                    onClick={() =>
                                      seleccionarVuelo({
                                        ...vuelo,
                                        tarifaElegida: {
                                          idTarifa: t.idTarifa,
                                          nombre: nombre,
                                          precio: Number(t.precio),
                                          moneda: t.moneda,
                                          cupos: t.cupos,
                                        },
                                      })
                                    }
                                    className={`w-full py-2 rounded text-sm font-medium transition-all ${
                                      premium
                                        ? "bg-white text-gray-900 hover:bg-gray-100"
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
