import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";

export default function BuscarVuelos() {
  const location = useLocation();
  const navigate = useNavigate();

  const destinoInfo = location.state?.destinoInfo;

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

  // Función para obtener el código de terminal desde la ciudad
  const obtenerCodigoCiudad = async (ciudad) => {
    try {
      const response = await fetch(`http://localhost:5174/vuelos/destinos/${encodeURIComponent(ciudad)}/codigo`);
      if (response.ok) {
        const data = await response.json();
        return data.codigo;
      }
    } catch (error) {
      console.error("Error obteniendo código de ciudad:", error);
    }
    return null;
  };

  // Efecto para configurar destino desde destinoInfo
  useEffect(() => {
    const configurarDestino = async () => {
      if (destinoInfo?.ciudad) {
        const codigo = await obtenerCodigoCiudad(destinoInfo.ciudad);
        if (codigo) {
          setDestino(codigo);
        }
      }
    };
    configurarDestino();

    // Establecer fecha de hoy por defecto
    const hoy = new Date().toISOString().split('T')[0];
    setFechaIda(hoy);
  }, [destinoInfo]);

  // Efecto para buscar vuelos cuando cambian los parámetros
  useEffect(() => {
    if (origen && destino && fechaIda) {
      buscarVuelos();
    }
  }, [origen, destino, fechaIda, ordenamiento]);

  const buscarVuelos = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `http://localhost:5174/vuelos/buscar?` +
        `origen=${origen}&destino=${destino}&fecha=${fechaIda}&clase=${clase}`
      );

      if (!response.ok) {
        throw new Error('Error al buscar vuelos');
      }

      const data = await response.json();

      // Ordenar según criterio seleccionado
      let vuelosOrdenados = [...data];
      if (ordenamiento === "baratos") {
        vuelosOrdenados.sort((a, b) => a.precio - b.precio);
      } else if (ordenamiento === "rapidos") {
        vuelosOrdenados.sort((a, b) => a.duracion - b.duracion);
      } else if (ordenamiento === "temprano") {
        vuelosOrdenados.sort((a, b) => a.horaSalida.localeCompare(b.horaSalida));
      }

      setVuelos(vuelosOrdenados);
      generarFechasDisponibles();
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
        fecha: fecha.toISOString().split('T')[0],
        dia: fecha.toLocaleDateString('es-ES', { weekday: 'short' }),
        numero: fecha.getDate(),
        mes: fecha.toLocaleDateString('es-ES', { month: 'short' })
      });
    }
    setFechasDisponibles(fechas);
  };

  const seleccionarVuelo = (vuelo) => {
    // Asegúrate de incluir TODOS los datos necesarios
    const datosVuelo = {
      vueloIda: vuelo,
      origen: origen,      // Código del origen (ej: "SCL")
      destino: destino,    // Código del destino (ej: "PMC")
      fechaIda: fechaIda,  // Fecha del vuelo de ida
      clase: clase,        // Clase del vuelo (ej: "eco")
      pasajeros: pasajeros // Número de pasajeros
    };

    // Guardar en localStorage
    localStorage.setItem('vueloSeleccionado', JSON.stringify(datosVuelo));

    console.log('Datos del vuelo a enviar:', datosVuelo); // Para debugging

    if (tipoViaje === "ida-vuelta") {
      // Navegar a la selección de vuelo de vuelta
      navigate("/vuelos/vuelta", { state: datosVuelo });
    } else {
      // Navegar al home o página de confirmación
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
    if (logo.startsWith('http')) return logo;
    return `http://localhost:5174${logo}`;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header con información del destino */}
      {destinoInfo && (
        <div
          className="bg-cover bg-center py-8"
          style={{
            backgroundImage: `linear-gradient(rgba(0,0,0,0.5), rgba(0,0,0,0.5)), url(${getLogoUrl(destinoInfo.imagen)})`,
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
              Desde ${Number(destinoInfo.precio).toLocaleString('es-CL')} por persona
            </p>
          </div>
        </div>
      )}

      {/* Selector de fechas - CENTRADO */}
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
                  className={`px-6 py-3 rounded-lg border-2 transition-all ${fechaIda === f.fecha
                    ? 'border-purple-600 bg-purple-600 text-white shadow-lg transform scale-105'
                    : 'border-gray-200 hover:border-purple-300 hover:shadow-md bg-white'
                    }`}
                >
                  <div className={`text-xs mb-1 ${fechaIda === f.fecha ? 'text-purple-100' : 'text-gray-500'}`}>
                    {f.dia}
                  </div>
                  <div className="text-2xl font-bold">{f.numero}</div>
                  <div className={`text-xs mt-1 ${fechaIda === f.fecha ? 'text-purple-100' : 'text-gray-500'}`}>
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
            <p className="text-gray-500 text-lg mb-2">No se encontraron vuelos para esta búsqueda</p>
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
                        <div className="text-sm text-gray-500 mb-1">
                          Duración
                        </div>
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
                              e.target.style.display = 'none';
                            }}
                          />
                        )}
                        {/* <span className="font-medium text-gray-700">{vuelo.empresa}</span> */}
                      </div>
                      <span className="text-gray-500">• {vuelo.modelo}</span>
                      <span className="text-gray-500">• {vuelo.asientosDisponibles} asientos disponibles</span>
                    </div>
                  </div>

                  {/* Precio y selección */}
                  <div className="text-right ml-8">
                    <div className="text-sm text-gray-500 mb-1">Por persona</div>
                    <div className="text-3xl font-bold text-purple-600 mb-3">
                      ${Number(vuelo.precio).toLocaleString('es-CL')}
                    </div>
                    <button
                      onClick={() => setVueloHover(vueloHover === vuelo.idViaje ? null : vuelo.idViaje)}
                      className="bg-purple-600 text-white px-8 py-3 rounded-lg hover:bg-purple-700 transition-all font-medium shadow-md hover:shadow-lg"
                    >
                      {vueloHover === vuelo.idViaje ? 'Cerrar Tarifas' : 'Ver Tarifas'}
                    </button>
                    <div className="text-xs text-gray-500 mt-2">
                      {vuelo.tarifasDisponibles} opciones de tarifa
                    </div>

                    {vueloHover === vuelo.idViaje && (
                      <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-lg shadow-2xl border border-gray-200 z-50 p-6">
                        <div className="flex justify-between items-center mb-4 pb-3 border-b">
                          <div className="flex items-center gap-4">
                            <div className="bg-green-50 px-3 py-1 rounded-full">
                              <span className="text-green-700 text-sm font-medium">Más económico</span>
                            </div>
                            <div className="bg-blue-50 px-3 py-1 rounded-full">
                              <span className="text-blue-700 text-sm font-medium">Más rápido</span>
                            </div>
                          </div>
                          <div className="flex items-center gap-3 text-sm">
                            <span className="text-gray-600">
                              <span className="font-bold text-gray-800">{vuelo.horaSalida}</span> {vuelo.origenCodigo}
                            </span>
                            <span className="text-gray-400">Duración {formatearDuracion(vuelo.duracion)}</span>
                            <span className="text-gray-600">
                              <span className="font-bold text-gray-800">{vuelo.horaLlegada}</span> {vuelo.destinoCodigo}
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

                        <div className="text-sm font-semibold text-gray-800 mb-3">4 Tarifas disponibles</div>

                        <div className="grid grid-cols-4 gap-3">
                          {/* Tarifa Light */}
                          <div className="border rounded-lg p-4 hover:border-purple-400 transition-all">
                            <div className="flex items-center gap-2 mb-3">
                              <div className="h-1 w-8 bg-green-500 rounded"></div>
                              <h4 className="font-semibold text-sm">Light</h4>
                            </div>
                            <ul className="space-y-2 text-xs mb-4 min-h-[200px]">
                              <li className="flex items-start gap-2">
                                <span className="text-green-500 mt-0.5 flex-shrink-0">✓</span>
                                <span>Bolso o mochila</span>
                              </li>
                              <li className="flex items-start gap-2">
                                <span className="text-green-500 mt-0.5 flex-shrink-0">✓</span>
                                <span>Maleta pequeña 12 kg</span>
                              </li>
                              <li className="flex items-start gap-2">
                                <span className="text-green-500 mt-0.5 flex-shrink-0">✓</span>
                                <span>Cambio con cargo + diferencia de precio</span>
                              </li>
                            </ul>
                            <div className="border-t pt-3">
                              <div className="text-xs text-gray-500 mb-1">CLP {Number(vuelo.precio).toLocaleString('es-CL')}</div>
                              <div className="text-lg font-bold mb-2">
                                CLP {Number(vuelo.precio).toLocaleString('es-CL')}
                              </div>
                              <div className="text-xs text-gray-500 mb-3">Por pasajero<br />Incluye tasas e impuestos</div>
                              <button
                                onClick={() => seleccionarVuelo(vuelo)}
                                className="w-full border-2 border-purple-600 text-purple-600 py-2 rounded text-sm font-medium hover:bg-purple-50 transition-all"
                              >
                                Continuar con Light
                              </button>
                            </div>
                          </div>

                          {/* Tarifa Standard */}
                          <div className="border rounded-lg p-4 hover:border-purple-400 transition-all">
                            <div className="flex items-center gap-2 mb-3">
                              <div className="h-1 w-8 bg-teal-500 rounded"></div>
                              <h4 className="font-semibold text-sm">Standard</h4>
                            </div>
                            <ul className="space-y-2 text-xs mb-4 min-h-[200px]">
                              <li className="flex items-start gap-2">
                                <span className="text-green-500 mt-0.5 flex-shrink-0">✓</span>
                                <span>Bolso o mochila</span>
                              </li>
                              <li className="flex items-start gap-2">
                                <span className="text-green-500 mt-0.5 flex-shrink-0">✓</span>
                                <span>Maleta pequeña 12 kg</span>
                              </li>
                              <li className="flex items-start gap-2">
                                <span className="text-green-500 mt-0.5 flex-shrink-0">✓</span>
                                <span>1 equipaje de bodega 23 kg</span>
                              </li>
                              <li className="flex items-start gap-2">
                                <span className="text-green-500 mt-0.5 flex-shrink-0">✓</span>
                                <span>Cambio con cargo + diferencia de precio</span>
                              </li>
                              <li className="flex items-start gap-2">
                                <span className="text-green-500 mt-0.5 flex-shrink-0">✓</span>
                                <span>Postulación a UPG con tramos</span>
                              </li>
                            </ul>
                            <div className="border-t pt-3">
                              <div className="text-xs text-gray-500 mb-1">CLP {Number(vuelo.precio).toLocaleString('es-CL')}</div>
                              <div className="text-xs text-gray-500">+ CLP 37.720</div>
                              <div className="text-lg font-bold mb-2">
                                CLP {(Number(vuelo.precio) + 37720).toLocaleString('es-CL')}
                              </div>
                              <div className="text-xs text-gray-500 mb-3">Por pasajero<br />Incluye tasas e impuestos</div>
                              <button
                                onClick={() => seleccionarVuelo(vuelo)}
                                className="w-full bg-purple-600 text-white py-2 rounded text-sm font-medium hover:bg-purple-700 transition-all"
                              >
                                Elegir
                              </button>
                            </div>
                          </div>

                          {/* Tarifa Full */}
                          <div className="border rounded-lg p-4 hover:border-purple-400 transition-all">
                            <div className="flex items-center gap-2 mb-3">
                              <div className="h-1 w-8 bg-pink-500 rounded"></div>
                              <h4 className="font-semibold text-sm">Full</h4>
                            </div>
                            <ul className="space-y-2 text-xs mb-4 min-h-[200px]">
                              <li className="flex items-start gap-2">
                                <span className="text-green-500 mt-0.5 flex-shrink-0">✓</span>
                                <span>Bolso o mochila</span>
                              </li>
                              <li className="flex items-start gap-2">
                                <span className="text-green-500 mt-0.5 flex-shrink-0">✓</span>
                                <span>Maleta pequeña 12 kg</span>
                              </li>
                              <li className="flex items-start gap-2">
                                <span className="text-green-500 mt-0.5 flex-shrink-0">✓</span>
                                <span>1 equipaje de bodega 23 kg</span>
                              </li>
                              <li className="flex items-start gap-2">
                                <span className="text-green-500 mt-0.5 flex-shrink-0">✓</span>
                                <span>Cambio sin cargo + diferencia de precio</span>
                              </li>
                              <li className="flex items-start gap-2">
                                <span className="text-green-500 mt-0.5 flex-shrink-0">✓</span>
                                <span>Devolución antes de la salida del primer vuelo</span>
                              </li>
                              <li className="flex items-start gap-2">
                                <span className="text-green-500 mt-0.5 flex-shrink-0">✓</span>
                                <span>Selección de asiento Estándar</span>
                              </li>
                              <li className="flex items-start gap-2">
                                <span className="text-green-500 mt-0.5 flex-shrink-0">✓</span>
                                <span>Postulación a UPG con tramos</span>
                              </li>
                            </ul>
                            <div className="border-t pt-3">
                              <div className="text-xs text-gray-500 mb-1">CLP {Number(vuelo.precio).toLocaleString('es-CL')}</div>
                              <div className="text-xs text-gray-500">+ CLP 81.098</div>
                              <div className="text-lg font-bold mb-2">
                                CLP {(Number(vuelo.precio) + 81098).toLocaleString('es-CL')}
                              </div>
                              <div className="text-xs text-gray-500 mb-3">Por pasajero<br />Incluye tasas e impuestos</div>
                              <button
                                onClick={() => seleccionarVuelo(vuelo)}
                                className="w-full bg-purple-600 text-white py-2 rounded text-sm font-medium hover:bg-purple-700 transition-all"
                              >
                                Elegir
                              </button>
                            </div>
                          </div>

                          {/* Tarifa Premium Business */}
                          <div className="border rounded-lg p-4 bg-gradient-to-br from-gray-800 to-gray-900 text-white hover:border-purple-400 transition-all">
                            <div className="mb-3">
                              <h4 className="font-semibold text-sm">Premium Business Full</h4>
                            </div>
                            <ul className="space-y-2 text-xs mb-4 min-h-[200px]">
                              <li className="flex items-start gap-2">
                                <span className="text-green-400 mt-0.5 flex-shrink-0">✓</span>
                                <span>Bolso o mochila</span>
                              </li>
                              <li className="flex items-start gap-2">
                                <span className="text-green-400 mt-0.5 flex-shrink-0">✓</span>
                                <span>Maleta pequeña 16 kg</span>
                              </li>
                              <li className="flex items-start gap-2">
                                <span className="text-green-400 mt-0.5 flex-shrink-0">✓</span>
                                <span>2 equipajes de bodega 23 kg</span>
                              </li>
                              <li className="flex items-start gap-2">
                                <span className="text-green-400 mt-0.5 flex-shrink-0">✓</span>
                                <span>Cambio sin cargo + diferencia de precio</span>
                              </li>
                              <li className="flex items-start gap-2">
                                <span className="text-green-400 mt-0.5 flex-shrink-0">✓</span>
                                <span>Devolución antes de la salida del primer vuelo</span>
                              </li>
                              <li className="flex items-start gap-2">
                                <span className="text-green-400 mt-0.5 flex-shrink-0">✓</span>
                                <span>Asiento cama</span>
                              </li>
                              <li className="flex items-start gap-2">
                                <span className="text-green-400 mt-0.5 flex-shrink-0">✓</span>
                                <span>Mejor oferta gastronómica</span>
                              </li>
                              <li className="flex items-start gap-2">
                                <span className="text-green-400 mt-0.5 flex-shrink-0">✓</span>
                                <span>Embarque y desembarque prioritario</span>
                              </li>
                            </ul>
                            <div className="border-t border-gray-700 pt-3">
                              <div className="text-xs text-gray-400 mb-1">CLP {Number(vuelo.precio).toLocaleString('es-CL')}</div>
                              <div className="text-xs text-gray-400">+ CLP 3.456.095</div>
                              <div className="text-lg font-bold mb-2">
                                CLP {(Number(vuelo.precio) + 3456095).toLocaleString('es-CL')}
                              </div>
                              <div className="text-xs text-gray-400 mb-3">Por pasajero<br />Incluye tasas e impuestos</div>
                              <button
                                onClick={() => seleccionarVuelo(vuelo)}
                                className="w-full bg-white text-gray-900 py-2 rounded text-sm font-medium hover:bg-gray-100 transition-all"
                              >
                                Elegir
                              </button>
                            </div>
                          </div>
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