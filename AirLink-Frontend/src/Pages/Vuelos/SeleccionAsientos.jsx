import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";

export default function SeleccionAsientos() {
    const location = useLocation();
    const navigate = useNavigate();
    const datosViaje = location.state;

    const [vueloActual, setVueloActual] = useState("ida");
    const [asientosIda, setAsientosIda] = useState([]);
    const [asientosVuelta, setAsientosVuelta] = useState([]);
    const [asientosSeleccionadosIda, setAsientosSeleccionadosIda] = useState([]);
    const [asientosSeleccionadosVuelta, setAsientosSeleccionadosVuelta] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        cargarAsientos();
    }, []);

    const cargarAsientos = async () => {
        try {
            setLoading(true);

            const resIda = await fetch(
                `http://localhost:5174/api/asientos/${datosViaje.vueloIda.idViaje}`
            );
            const dataIda = await resIda.json();
            setAsientosIda(dataIda.asientos || generarAsientosMock());

            if (datosViaje.vueloVuelta) {
                const resVuelta = await fetch(
                    `http://localhost:5174/api/asientos/${datosViaje.vueloVuelta.idViaje}`
                );
                const dataVuelta = await resVuelta.json();
                setAsientosVuelta(dataVuelta.asientos || generarAsientosMock());
            }
        } catch (error) {
            console.error("Error:", error);
            setAsientosIda(generarAsientosMock());
            if (datosViaje.vueloVuelta) setAsientosVuelta(generarAsientosMock());
        } finally {
            setLoading(false);
        }
    };

    const generarAsientosMock = () => {
        const asientos = [];
        for (let fila = 1; fila <= 20; fila++) {
            for (const letra of ["A", "B", "C", "D", "E", "F"]) {
                asientos.push({
                    numero: `${fila}${letra}`,
                    disponible: Math.random() > 0.3,
                    idCabinaClase: fila <= 5 ? 3 : fila <= 10 ? 2 : 1,
                });
            }
        }
        return asientos;
    };

    const asientosActuales = vueloActual === "ida" ? asientosIda : asientosVuelta;
    const seleccionados = vueloActual === "ida" ? asientosSeleccionadosIda : asientosSeleccionadosVuelta;
    const setSeleccionados = vueloActual === "ida" ? setAsientosSeleccionadosIda : setAsientosSeleccionadosVuelta;

    const handleSeleccionAsiento = (asiento) => {
        if (!asiento.disponible) return;

        const yaSeleccionado = seleccionados.find(a => a.numero === asiento.numero);
        if (yaSeleccionado) {
            setSeleccionados(seleccionados.filter(a => a.numero !== asiento.numero));
        } else if (seleccionados.length < datosViaje.pasajeros) {
            setSeleccionados([...seleccionados, asiento]);
        }
    };

    const continuarSiguienteVuelo = () => {
        if (asientosSeleccionadosIda.length !== datosViaje.pasajeros) {
            alert(`Debes seleccionar ${datosViaje.pasajeros} asiento(s)`);
            return;
        }
        if (datosViaje.vueloVuelta) {
            setVueloActual("vuelta");
        } else {
            continuarAPasajeros();
        }
    };

    const continuarAPasajeros = () => {
        if (datosViaje.vueloVuelta && asientosSeleccionadosVuelta.length !== datosViaje.pasajeros) {
            alert(`Debes seleccionar ${datosViaje.pasajeros} asiento(s) para la vuelta`);
            return;
        }

        navigate("/pago", {
            state: {
                ...datosViaje,
                asientosIda: asientosSeleccionadosIda,
                asientosVuelta: asientosSeleccionadosVuelta,
            },
        });
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
            </div>
        );
    }

    const vueloInfo = vueloActual === "ida" ? datosViaje.vueloIda : datosViaje.vueloVuelta;

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="bg-purple-600 text-white py-6">
                <div className="max-w-7xl mx-auto px-4">
                    <h1 className="text-3xl font-bold">
                        Selección de Asientos - {vueloActual === "ida" ? "Vuelo de Ida" : "Vuelo de Vuelta"}
                    </h1>
                    <p className="text-purple-100 mt-2">
                        {vueloInfo.origenCodigo} → {vueloInfo.destinoCodigo} | Selecciona {datosViaje.pasajeros} asiento(s)
                    </p>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2">
                        <div className="bg-white rounded-lg shadow-md p-6">
                            <div className="mb-6">
                                <div className="flex justify-between items-center mb-2">
                                    <span className="font-medium">Asientos: {seleccionados.length}/{datosViaje.pasajeros}</span>
                                    <span className="text-sm text-gray-500">{seleccionados.map(a => a.numero).join(", ")}</span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-2">
                                    <div
                                        className="bg-purple-600 h-2 rounded-full transition-all"
                                        style={{ width: `${(seleccionados.length / datosViaje.pasajeros) * 100}%` }}
                                    />
                                </div>
                            </div>

                            <MapaAsientos
                                asientos={asientosActuales}
                                seleccionados={seleccionados}
                                onSelect={handleSeleccionAsiento}
                            />

                            <div className="mt-6 pt-6 border-t flex justify-center gap-4 text-sm">
                                <div className="flex items-center gap-2">
                                    <div className="w-6 h-6 rounded border-2 bg-white"></div>
                                    <span>Disponible</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="w-6 h-6 rounded bg-gray-300"></div>
                                    <span>Ocupado</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="w-6 h-6 rounded bg-purple-600"></div>
                                    <span>Seleccionado</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="lg:col-span-1">
                        <div className="bg-white rounded-lg shadow-md p-6 sticky top-6">
                            <h3 className="text-xl font-bold mb-4">Resumen</h3>

                            <div className="space-y-3 mb-6">
                                {seleccionados.length === 0 ? (
                                    <p className="text-gray-500 text-sm text-center py-4">Selecciona asientos</p>
                                ) : (
                                    seleccionados.map((asiento, i) => (
                                        <div key={asiento.numero} className="p-3 bg-purple-50 rounded-lg flex justify-between">
                                            <div>
                                                <div className="font-semibold">Pasajero {i + 1}</div>
                                                <div className="text-sm text-gray-600">Asiento {asiento.numero}</div>
                                            </div>
                                            <button onClick={() => handleSeleccionAsiento(asiento)} className="text-red-500">✕</button>
                                        </div>
                                    ))
                                )}
                            </div>

                            {datosViaje.vueloVuelta && (
                                <div className="mb-4 p-3 bg-blue-50 rounded">
                                    <div className="text-sm font-medium mb-2">
                                        {vueloActual === "ida" ? "1/2 - Ida" : "2/2 - Vuelta"}
                                    </div>
                                    <div className="flex gap-2">
                                        <div className={`flex-1 h-2 rounded ${vueloActual === "ida" ? "bg-purple-600" : "bg-purple-300"}`} />
                                        <div className={`flex-1 h-2 rounded ${vueloActual === "vuelta" ? "bg-purple-600" : "bg-gray-200"}`} />
                                    </div>
                                </div>
                            )}

                            <div className="space-y-3">
                                {vueloActual === "ida" ? (
                                    datosViaje.vueloVuelta ? (
                                        <button
                                            onClick={continuarSiguienteVuelo}
                                            disabled={seleccionados.length !== datosViaje.pasajeros}
                                            className="w-full bg-purple-600 text-white py-3 rounded-lg hover:bg-purple-700 disabled:bg-gray-300 font-semibold"
                                        >
                                            Continuar a vuelo de vuelta →
                                        </button>
                                    ) : (
                                        <button
                                            onClick={continuarAPasajeros}
                                            disabled={seleccionados.length !== datosViaje.pasajeros}
                                            className="w-full bg-purple-600 text-white py-3 rounded-lg hover:bg-purple-700 disabled:bg-gray-300 font-semibold"
                                        >
                                            Continuar →
                                        </button>
                                    )
                                ) : (
                                    <>
                                        <button
                                            onClick={continuarAPasajeros}
                                            disabled={seleccionados.length !== datosViaje.pasajeros}
                                            className="w-full bg-purple-600 text-white py-3 rounded-lg hover:bg-purple-700 disabled:bg-gray-300 font-semibold"
                                        >
                                            Continuar →
                                        </button>
                                        <button
                                            onClick={() => setVueloActual("ida")}
                                            className="w-full bg-gray-100 py-3 rounded-lg hover:bg-gray-200"
                                        >
                                            ← Volver a ida
                                        </button>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

function MapaAsientos({ asientos, seleccionados, onSelect }) {
    const LEFT = ["A", "B", "C"];
    const RIGHT = ["D", "E", "F"];

    const getAsiento = (fila, letra) => {
        const codigo = `${fila}${letra}`;
        return asientos.find(a => a.numero === codigo) || { numero: codigo, disponible: false };
    };

    const isSelected = (numero) => seleccionados.some(a => a.numero === numero);

    return (
        <div className="flex flex-col items-center gap-2">
            <div className="flex gap-2 text-xs text-gray-500 mb-2">
                {LEFT.map(l => <span key={l} className="w-9 text-center">{l}</span>)}
                <span className="w-8" />
                {RIGHT.map(l => <span key={l} className="w-9 text-center">{l}</span>)}
            </div>

            {Array.from({ length: 20 }, (_, i) => i + 1).map(fila => (
                <div key={fila} className="flex items-center gap-2">
                    <span className="text-xs text-gray-400 w-6 text-right">{fila}</span>

                    <div className="flex gap-2">
                        {LEFT.map(letra => {
                            const asiento = getAsiento(fila, letra);
                            const selected = isSelected(asiento.numero);
                            return (
                                <button
                                    key={`${fila}${letra}`}
                                    onClick={() => onSelect(asiento)}
                                    disabled={!asiento.disponible}
                                    className={`w-9 h-9 rounded text-xs font-semibold transition-all
                    ${!asiento.disponible ? "bg-gray-300 cursor-not-allowed"
                                            : selected ? "bg-purple-600 text-white scale-110"
                                                : "bg-white border-2 hover:border-purple-400"}`}
                                >
                                    {letra}
                                </button>
                            );
                        })}
                    </div>

                    <div className="w-8 flex justify-center">
                        <div className="w-0.5 h-6 bg-gray-200" />
                    </div>

                    <div className="flex gap-2">
                        {RIGHT.map(letra => {
                            const asiento = getAsiento(fila, letra);
                            const selected = isSelected(asiento.numero);
                            return (
                                <button
                                    key={`${fila}${letra}`}
                                    onClick={() => onSelect(asiento)}
                                    disabled={!asiento.disponible}
                                    className={`w-9 h-9 rounded text-xs font-semibold transition-all
                    ${!asiento.disponible ? "bg-gray-300 cursor-not-allowed"
                                            : selected ? "bg-purple-600 text-white scale-110"
                                                : "bg-white border-2 hover:border-purple-400"}`}
                                >
                                    {letra}
                                </button>
                            );
                        })}
                    </div>

                    <span className="text-xs text-gray-400 w-6 text-left">{fila}</span>
                </div>
            ))}
        </div>
    );
}