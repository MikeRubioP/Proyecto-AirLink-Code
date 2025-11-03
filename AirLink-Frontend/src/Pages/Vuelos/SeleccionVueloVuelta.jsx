import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";

export default function SeleccionVueloVuelta() {
    const location = useLocation();
    const navigate = useNavigate();

    // Obtener datos del vuelo de ida
    const datosVueloIda = location.state;

    const [vuelos, setVuelos] = useState([]);
    const [loading, setLoading] = useState(false);
    const [ordenamiento, setOrdenamiento] = useState("baratos");
    const [fechaVuelta, setFechaVuelta] = useState("");
    const [fechasDisponibles, setFechasDisponibles] = useState([]);
    const [vueloHover, setVueloHover] = useState(null);

    // VALIDACIÓN: Si no hay datos, redirigir
    useEffect(() => {
        if (!datosVueloIda) {
            console.error('No hay datos del vuelo de ida');
            alert('Primero debes seleccionar un vuelo de ida');
            navigate('/vuelos/buscar');
            return;
        }

        console.log('Datos recibidos en vuelo vuelta:', datosVueloIda);
    }, [datosVueloIda, navigate]);

    useEffect(() => {
        // Solo ejecutar si tenemos datos
        if (!datosVueloIda) return;

        // Establecer fecha mínima (al menos 1 día después de la ida)
        const fechaIda = new Date(datosVueloIda.fechaIda);
        fechaIda.setDate(fechaIda.getDate() + 1);
        const fechaMin = fechaIda.toISOString().split('T')[0];
        setFechaVuelta(fechaMin);
    }, [datosVueloIda]);

    useEffect(() => {
        if (fechaVuelta && datosVueloIda) {
            buscarVuelosVuelta();
        }
    }, [fechaVuelta, ordenamiento]);

    const buscarVuelosVuelta = async () => {
        if (!datosVueloIda) return;

        setLoading(true);
        try {
            // Invertir origen y destino para el vuelo de vuelta
            const response = await fetch(
                `http://localhost:5174/vuelos/buscar?` +
                `origen=${datosVueloIda.destino}&destino=${datosVueloIda.origen}&fecha=${fechaVuelta}&clase=${datosVueloIda.clase}`
            );

            if (!response.ok) throw new Error('Error al buscar vuelos');

            const data = await response.json();

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
            setVuelos([]);
        } finally {
            setLoading(false);
        }
    };

    const generarFechasDisponibles = () => {
        if (!datosVueloIda) return;

        const fechas = [];
        const fechaBase = new Date(fechaVuelta);

        for (let i = -3; i <= 3; i++) {
            const fecha = new Date(fechaBase);
            fecha.setDate(fechaBase.getDate() + i);

            // Validar que no sea antes de la fecha de ida
            const fechaIda = new Date(datosVueloIda.fechaIda);
            if (fecha > fechaIda) {
                fechas.push({
                    fecha: fecha.toISOString().split('T')[0],
                    dia: fecha.toLocaleDateString('es-ES', { weekday: 'short' }),
                    numero: fecha.getDate(),
                    mes: fecha.toLocaleDateString('es-ES', { month: 'short' })
                });
            }
        }
        setFechasDisponibles(fechas);
    };

    const seleccionarVueloVuelta = (vueloVuelta) => {
        const datosCompletos = {
            ...datosVueloIda,
            vueloVuelta,
            fechaVuelta
        };

        console.log('Datos completos para guardar:', datosCompletos);
        localStorage.setItem('vueloSeleccionado', JSON.stringify(datosCompletos));

        // Navegar a detalle o página de pasajeros
        navigate("/vuelos/detalleviaje", { state: datosCompletos });
    };

    const formatearDuracion = (minutos) => {
        const horas = Math.floor(minutos / 60);
        const mins = minutos % 60;
        return `${horas}h ${mins}min`;
    };

    const getLogoUrl = (logo) => {
        if (!logo) return null;
        if (logo.startsWith('http')) return logo;
        return `http://localhost:5174${logo}`;
    };

    // Si no hay datos, mostrar loading (mientras se redirige)
    if (!datosVueloIda) {
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
            {/* Header con resumen del vuelo de ida */}
            <div className="bg-purple-600 text-white py-6">
                <div className="max-w-7xl mx-auto px-4">
                    <h1 className="text-2xl font-bold mb-4">Selecciona tu vuelo de vuelta</h1>

                    <div className="bg-purple-700 rounded-lg p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <div className="text-sm opacity-90 mb-1">Vuelo de ida seleccionado</div>
                                <div className="font-semibold text-lg">
                                    {datosVueloIda.origen} → {datosVueloIda.destino}
                                </div>
                                <div className="text-sm opacity-90">
                                    {new Date(datosVueloIda.fechaIda).toLocaleDateString('es-ES', {
                                        weekday: 'long',
                                        year: 'numeric',
                                        month: 'long',
                                        day: 'numeric'
                                    })}
                                </div>
                            </div>
                            <div className="text-right">
                                <div className="text-2xl font-bold">
                                    ${Number(datosVueloIda.vueloIda.precio).toLocaleString('es-CL')}
                                </div>
                                <div className="text-sm opacity-90">por persona</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Selector de fechas */}
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
                                    className={`px-6 py-3 rounded-lg border-2 transition-all ${fechaVuelta === f.fecha
                                        ? 'border-purple-600 bg-purple-600 text-white shadow-lg transform scale-105'
                                        : 'border-gray-200 hover:border-purple-300 hover:shadow-md bg-white'
                                        }`}
                                >
                                    <div className={`text-xs mb-1 ${fechaVuelta === f.fecha ? 'text-purple-100' : 'text-gray-500'}`}>
                                        {f.dia}
                                    </div>
                                    <div className="text-2xl font-bold">{f.numero}</div>
                                    <div className={`text-xs mt-1 ${fechaVuelta === f.fecha ? 'text-purple-100' : 'text-gray-500'}`}>
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
                        Vuelos de regreso {datosVueloIda.destino} → {datosVueloIda.origen}
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
                                                        {formatearDuracion(vuelo.duracion)}
                                                    </span>
                                                    <div className="h-px bg-gray-300 flex-1"></div>
                                                </div>
                                                <div className="text-xs text-purple-600 mt-1 font-medium">
                                                    Directo
                                                </div>
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
                                                    />
                                                )}
                                            </div>
                                            <span className="text-gray-500">• {vuelo.modelo}</span>
                                            <span className="text-gray-500">• {vuelo.asientosDisponibles} asientos disponibles</span>
                                        </div>
                                    </div>

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

                                        {vueloHover === vuelo.idViaje && (
                                            <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-lg shadow-2xl border border-gray-200 z-50 p-6">
                                                <div className="flex justify-between items-center mb-4 pb-3 border-b">
                                                    <h3 className="text-lg font-semibold">Selecciona tu tarifa</h3>
                                                    <button
                                                        onClick={() => setVueloHover(null)}
                                                        className="text-gray-400 hover:text-gray-600 text-xl font-bold"
                                                    >
                                                        ✕
                                                    </button>
                                                </div>

                                                <div className="grid grid-cols-4 gap-3">
                                                    {/* Tarifa Light */}
                                                    <div className="border rounded-lg p-4 hover:border-purple-400 transition-all">
                                                        <h4 className="font-semibold text-sm mb-3">Light</h4>
                                                        <div className="text-lg font-bold mb-2">
                                                            ${Number(vuelo.precio).toLocaleString('es-CL')}
                                                        </div>
                                                        <button
                                                            onClick={() => seleccionarVueloVuelta(vuelo)}
                                                            className="w-full border-2 border-purple-600 text-purple-600 py-2 rounded text-sm font-medium hover:bg-purple-50 transition-all"
                                                        >
                                                            Seleccionar
                                                        </button>
                                                    </div>

                                                    {/* Tarifa Standard */}
                                                    <div className="border rounded-lg p-4 hover:border-purple-400 transition-all">
                                                        <h4 className="font-semibold text-sm mb-3">Standard</h4>
                                                        <div className="text-lg font-bold mb-2">
                                                            ${(Number(vuelo.precio) + 37720).toLocaleString('es-CL')}
                                                        </div>
                                                        <button
                                                            onClick={() => seleccionarVueloVuelta(vuelo)}
                                                            className="w-full bg-purple-600 text-white py-2 rounded text-sm font-medium hover:bg-purple-700 transition-all"
                                                        >
                                                            Seleccionar
                                                        </button>
                                                    </div>

                                                    {/* Tarifa Full */}
                                                    <div className="border rounded-lg p-4 hover:border-purple-400 transition-all">
                                                        <h4 className="font-semibold text-sm mb-3">Full</h4>
                                                        <div className="text-lg font-bold mb-2">
                                                            ${(Number(vuelo.precio) + 81098).toLocaleString('es-CL')}
                                                        </div>
                                                        <button
                                                            onClick={() => seleccionarVueloVuelta(vuelo)}
                                                            className="w-full bg-purple-600 text-white py-2 rounded text-sm font-medium hover:bg-purple-700 transition-all"
                                                        >
                                                            Seleccionar
                                                        </button>
                                                    </div>

                                                    {/* Tarifa Premium Business */}
                                                    <div className="border rounded-lg p-4 bg-gradient-to-br from-gray-800 to-gray-900 text-white hover:border-purple-400 transition-all">
                                                        <h4 className="font-semibold text-sm mb-3">Premium Business</h4>
                                                        <div className="text-lg font-bold mb-2">
                                                            ${(Number(vuelo.precio) + 3456095).toLocaleString('es-CL')}
                                                        </div>
                                                        <button
                                                            onClick={() => seleccionarVueloVuelta(vuelo)}
                                                            className="w-full bg-white text-gray-900 py-2 rounded text-sm font-medium hover:bg-gray-100 transition-all"
                                                        >
                                                            Seleccionar
                                                        </button>
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