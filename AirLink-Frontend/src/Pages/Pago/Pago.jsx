import React, { useState, useEffect, useMemo } from "react";
import { CreditCard, Building2, Wallet, AlertCircle, Clock, MapPin } from "lucide-react";
import axios from "axios";

const CLP = (n) =>
  new Intl.NumberFormat("es-CL", {
    style: "currency",
    currency: "CLP",
    minimumFractionDigits: 0,
  }).format(Number(n || 0));

const safeParse = (k) => {
  try {
    return JSON.parse(localStorage.getItem(k));
  } catch {
    return null;
  }
};

const pickFirst = (...vals) => vals.find(Boolean) || null;

const Pago = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [passengerData, setPassengerData] = useState({
    nombre: "",
    apellido: "",
    fechaNacimiento: "",
    genero: "",
    tipoDocumento: "DNI",
    numeroDocumento: "",
    correo: "",
    telefono: "",
  });

  const vueloSeleccionado = useMemo(
    () =>
      pickFirst(
        safeParse("airlink_viaje"),
        safeParse("selectedFlight"),
        safeParse("vueloSeleccionado"),
        safeParse("flight")
      ),
    []
  );

  const tarifaSeleccionada = useMemo(
    () =>
      pickFirst(
        safeParse("airlink_tarifa"),
        safeParse("selectedFare"),
        safeParse("tarifaSeleccionada"),
        safeParse("fare")
      ),
    []
  );

  const vueloNorm = useMemo(() => {
    if (!vueloSeleccionado) return null;
    return {
      idViaje: vueloSeleccionado.idViaje ?? vueloSeleccionado.id ?? null,
      empresa: vueloSeleccionado.empresa ?? vueloSeleccionado.airline ?? "—",
      origen: vueloSeleccionado.origenCodigo ?? vueloSeleccionado.origen ?? vueloSeleccionado.from ?? "—",
      destino: vueloSeleccionado.destinoCodigo ?? vueloSeleccionado.destino ?? vueloSeleccionado.to ?? "—",
      horaSalida: vueloSeleccionado.horaSalida || "",
      horaLlegada: vueloSeleccionado.horaLlegada || "",
      fechaSalida: vueloSeleccionado.fechaSalida || vueloSeleccionado.salida?.split(' ')[0] || "",
      duracion: vueloSeleccionado.duracion || "",
    };
  }, [vueloSeleccionado]);

  const tarifaNorm = useMemo(() => {
    if (!tarifaSeleccionada) return null;
    return {
      nombreTarifa: tarifaSeleccionada.nombreTarifa ?? tarifaSeleccionada.nombre ?? "Tarifa",
      precio: Number(tarifaSeleccionada.precio || 0),
    };
  }, [tarifaSeleccionada]);

  const totalVuelo = tarifaNorm?.precio || 0;

  const [selectedBuses, setSelectedBuses] = useState([]);
  const [availableBuses, setAvailableBuses] = useState([]);
  const [skipBus, setSkipBus] = useState(Boolean(safeParse("airlink_skip_bus")));

  useEffect(() => {
    if (currentStep === 2 && vueloNorm) {
      setLoading(true);
      setError("");

      console.log('🛫 Buscando buses desde destino del vuelo:', {
        destino: vueloNorm.destino,
        llegada: vueloNorm.horaLlegada,
        fecha: vueloNorm.fechaSalida
      });

      const params = new URLSearchParams({
        origenCodigo: vueloNorm.destino,
        fecha: vueloNorm.fechaSalida,
      });

      if (vueloNorm.horaLlegada) {
        params.append('horaLlegadaVuelo', vueloNorm.horaLlegada);
      }

      axios
        .get(`http://localhost:5174/buses/disponibles?${params}`)
        .then((res) => {
          console.log('✅ Buses encontrados:', res.data.length);

          if (res.data.length > 0) {
            console.log('📋 Conexiones disponibles:',
              [...new Set(res.data.map(b => `${b.ciudadDestino} (${b.tiempoEspera || 'N/A'})`))]
            );
          }

          setAvailableBuses(res.data);

          if (res.data.length === 0) {
            setError(
              `No hay buses programados desde ${vueloNorm.destino} después de tu llegada. ` +
              `Puedes continuar sin seleccionar bus o contactar soporte.`
            );
          }
        })
        .catch((err) => {
          console.error("❌ Error al cargar buses:", err);
          console.error("Error details:", err.response?.data);
          setError("No se pudieron cargar los buses disponibles. Puedes continuar sin seleccionar bus.");
          setAvailableBuses([]);
        })
        .finally(() => setLoading(false));
    }
  }, [currentStep, vueloNorm]);

  const toggleSkipBus = () => {
    setSkipBus((prev) => {
      const next = !prev;
      localStorage.setItem("airlink_skip_bus", JSON.stringify(next));
      if (next) setSelectedBuses([]);
      return next;
    });
  };

  const handleBusSelection = (bus) => {
    if (skipBus) return;
    setSelectedBuses((prev) => {
      const exists = prev.find((b) => b.idViaje === bus.idViaje);
      if (exists) {
        const n = prev.filter((b) => b.idViaje !== bus.idViaje);
        localStorage.setItem("airlink_buses", JSON.stringify(n));
        return n;
      }
      const n = [...prev, bus];
      localStorage.setItem("airlink_buses", JSON.stringify(n));
      return n;
    });
  };

  const totalBuses = useMemo(
    () => selectedBuses.reduce((s, b) => s + Number(b.precioAdulto || 0), 0),
    [selectedBuses]
  );

  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState("stripe");

  const paymentMethods = [
    {
      id: "stripe",
      name: "Stripe",
      description: "Pago seguro con tarjeta",
      icon: <CreditCard className="w-6 h-6" />,
      color: "bg-purple-600",
    },
    {
      id: "mercadopago",
      name: "Mercado Pago",
      description: "Múltiples opciones de pago",
      icon: <Wallet className="w-6 h-6" />,
      color: "bg-blue-400",
    },
    {
      id: "paypal",
      name: "PayPal",
      description: "Pago internacional seguro",
      icon: <Building2 className="w-6 h-6" />,
      color: "bg-sky-400",
    },
  ];

  const handlePassengerInputChange = (e) => {
    const { name, value } = e.target;
    setPassengerData((prev) => ({ ...prev, [name]: value }));
    setError("");
  };

  const validatePassengerForm = () => {
    const required = ["nombre", "apellido", "fechaNacimiento", "genero", "numeroDocumento", "correo", "telefono"];
    const empty = required.filter((f) => !String(passengerData[f] || "").trim());
    if (empty.length > 0) {
      setError(`Por favor completa: ${empty.join(", ")}`);
      return false;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(passengerData.correo)) {
      setError("Correo electrónico no válido");
      return false;
    }
    if (!vueloNorm || !tarifaNorm) {
      setError("No se encontró la selección de vuelo. Vuelve a Detalle y elige una tarifa.");
      return false;
    }
    return true;
  };

  const handleContinueFromPassenger = () => {
    if (!validatePassengerForm()) return;
    setCurrentStep(2);
  };

  const handleContinueFromBuses = () => {
    if (!skipBus && selectedBuses.length === 0) {
      setError("Selecciona un bus o marca 'No gracias'.");
      return;
    }
    setCurrentStep(3);
    setError("");
  };

  const resumen = useMemo(() => {
    return {
      vuelo: vueloNorm
        ? {
          idViaje: vueloNorm.idViaje,
          empresa: vueloNorm.empresa,
          origen: vueloNorm.origen,
          destino: vueloNorm.destino,
          horaSalida: vueloNorm.horaSalida,
          horaLlegada: vueloNorm.horaLlegada,
          tarifaNombre: tarifaNorm?.nombreTarifa || "Tarifa",
          precio: totalVuelo,
        }
        : null,
      buses: skipBus ? [] : selectedBuses,
      total: totalVuelo + (skipBus ? 0 : totalBuses),
      pasajero: passengerData,
    };
  }, [vueloNorm, tarifaNorm, totalVuelo, selectedBuses, totalBuses, skipBus, passengerData]);

  const handlePayment = async () => {
    try {
      if (!resumen.vuelo) {
        setError("No se encontró la información del vuelo. Vuelve a la selección de tarifa.");
        return;
      }
      setLoading(true);
      setError("");

      // CORRECCIÓN: Enviar vuelo, buses y pasajero correctamente
      const reservaResp = await axios.post("http://localhost:5174/pagos/crear-reserva", {
        pasajero: resumen.pasajero,
        vuelo: resumen.vuelo,
        buses: resumen.buses,
        total: resumen.total,
        metodoPago: selectedPaymentMethod,
      });

      const { reservaId } = reservaResp.data;

      // Llamar al gateway de pago correspondiente
      if (selectedPaymentMethod === "stripe") {
        const r = await axios.post("http://localhost:5174/pagos/stripe/create-session", {
          vuelo: resumen.vuelo,
          buses: resumen.buses,
          reservaId,
          pasajero: resumen.pasajero,
        });
        if (r.data?.url) {
          window.location.href = r.data.url;
          return;
        }
        throw new Error("Stripe no devolvió URL de checkout.");
      }

      if (selectedPaymentMethod === "mercadopago") {
        const r = await axios.post("http://localhost:5174/pagos/mercadopago/create-preference", {
          vuelo: resumen.vuelo,
          buses: resumen.buses,
          reservaId,
          pasajero: resumen.pasajero,
        });
        if (r.data?.init_point) {
          window.location.href = r.data.init_point;
          return;
        }
        throw new Error("MercadoPago no devolvió init_point.");
      }

      if (selectedPaymentMethod === "paypal") {
        const r = await axios.post("http://localhost:5174/pagos/paypal/create-order", {
          vuelo: resumen.vuelo,
          buses: resumen.buses,
          reservaId,
          pasajero: resumen.pasajero,
        });
        if (r.data?.approveUrl) {
          window.location.href = r.data.approveUrl;
          return;
        }
        throw new Error("PayPal no devolvió approveUrl.");
      }
    } catch (e) {
      console.error(e);
      setError(e.response?.data?.error || e.message || "Error al procesar el pago");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto space-y-4">
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm text-red-800 font-medium">Error</p>
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        )}

        <div className={`bg-white rounded-2xl shadow-sm overflow-hidden border-2 ${currentStep === 1 ? "border-purple-600" : "border-gray-200"}`}>
          <button onClick={() => currentStep > 1 && setCurrentStep(1)} className="w-full flex items-center gap-3 p-4 text-left hover:bg-gray-50">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-semibold text-sm ${currentStep >= 1 ? "bg-purple-600 text-white" : "bg-gray-300"}`}>1</div>
            <h2 className="text-lg font-bold text-gray-900">Pasajero</h2>
          </button>

          {currentStep === 1 && (
            <div className="px-4 pb-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <input type="text" name="nombre" placeholder="Nombre" value={passengerData.nombre} onChange={handlePassengerInputChange} className="px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 text-sm" />
                <input type="text" name="apellido" placeholder="Apellido" value={passengerData.apellido} onChange={handlePassengerInputChange} className="px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 text-sm" />
                <input type="date" name="fechaNacimiento" value={passengerData.fechaNacimiento} onChange={handlePassengerInputChange} className="px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 text-sm" />
                <select name="genero" value={passengerData.genero} onChange={handlePassengerInputChange} className="px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 text-sm text-gray-700">
                  <option value="">Género</option>
                  <option value="Masculino">Masculino</option>
                  <option value="Femenino">Femenino</option>
                  <option value="Otro">Otro</option>
                </select>
                <input type="text" name="numeroDocumento" placeholder="Número de documento" value={passengerData.numeroDocumento} onChange={handlePassengerInputChange} className="px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 text-sm" />
                <input type="email" name="correo" placeholder="Correo" value={passengerData.correo} onChange={handlePassengerInputChange} className="px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 text-sm" />
                <input type="tel" name="telefono" placeholder="Teléfono" value={passengerData.telefono} onChange={handlePassengerInputChange} className="px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 text-sm" />
              </div>
              <button onClick={handleContinueFromPassenger} className="w-full mt-4 bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 rounded-lg">CONTINUAR CON BUSES</button>
            </div>
          )}
        </div>

        <div className={`bg-white rounded-2xl shadow-sm overflow-hidden border-2 ${currentStep === 2 ? "border-purple-600" : "border-gray-200"}`}>
          <button onClick={() => currentStep > 2 && setCurrentStep(2)} className="w-full flex items-center gap-3 p-4 text-left hover:bg-gray-50">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-semibold text-sm ${currentStep >= 2 ? "bg-purple-600 text-white" : "bg-gray-300"}`}>2</div>
            <h2 className="text-lg font-bold text-gray-900">Conexiones de Bus</h2>
          </button>

          {currentStep === 2 && (
            <div className="px-4 pb-6">
              {vueloNorm && (
                <div className="mb-4 p-4 bg-blue-50 border-l-4 border-blue-600 rounded-r-lg">
                  <div className="flex items-start gap-3">
                    <MapPin className="w-5 h-5 text-blue-600 mt-0.5" />
                    <div>
                      <p className="text-sm font-semibold text-blue-900 mb-1">
                        Tu vuelo llega a {vueloNorm.destino} a las {vueloNorm.horaLlegada}
                      </p>
                      <p className="text-xs text-blue-700">
                        Te mostramos buses que salen al menos 90 minutos después de tu llegada
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <label className="flex items-center gap-2 mb-4">
                <input type="checkbox" checked={skipBus} onChange={toggleSkipBus} className="w-4 h-4 accent-purple-600" />
                <span className="text-sm text-gray-700">No necesito transporte terrestre</span>
              </label>

              {!skipBus && (
                <>
                  {loading ? (
                    <div className="flex justify-center items-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600" />
                    </div>
                  ) : availableBuses.length === 0 ? (
                    <div className="text-center py-8">
                      <p className="text-gray-500 mb-2">No hay buses disponibles para esta conexión</p>
                      <p className="text-xs text-gray-400">Puedes continuar sin seleccionar bus</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {availableBuses.map((bus) => {
                        const selected = !!selectedBuses.find((b) => b.idViaje === bus.idViaje);
                        return (
                          <div key={bus.idViaje} className={`border rounded-xl p-4 transition-all ${selected ? "border-purple-600 bg-purple-50" : "border-gray-200 hover:border-gray-300"}`}>
                            <div className="flex items-start justify-between gap-4">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-3">
                                  <div className={`${bus.color} text-white px-3 py-1 rounded font-bold text-xs`}>
                                    {bus.empresa}
                                  </div>
                                  {bus.tiempoEspera && (
                                    <div className="flex items-center gap-1 text-xs text-gray-600 bg-gray-100 px-2 py-1 rounded">
                                      <Clock className="w-3 h-3" />
                                      {bus.tiempoEspera}
                                    </div>
                                  )}
                                </div>

                                <div className="grid grid-cols-3 gap-4 text-sm mb-2">
                                  <div>
                                    <div className="text-xs text-gray-500 mb-1">📅 {bus.fechaSalida}</div>
                                  </div>
                                  <div>
                                    <div className="font-semibold text-gray-900">{bus.horaSalida}</div>
                                    <div className="font-semibold text-gray-900">{bus.horaLlegada}</div>
                                  </div>
                                  <div>
                                    <div className="font-semibold text-gray-900">{bus.ciudadOrigen}</div>
                                    <div className="font-semibold text-gray-900">{bus.ciudadDestino}</div>
                                  </div>
                                </div>

                                <div className="flex items-center gap-4 text-xs text-gray-500">
                                  <span className="flex items-center gap-1">
                                    <span>🕐</span>
                                    <span>{bus.duracion}</span>
                                  </span>
                                  <span className="text-gray-400">{bus.cupos} asientos disponibles</span>
                                </div>
                              </div>

                              <div className="text-right">
                                <div className="text-xl font-bold text-gray-900 mb-3">{CLP(bus.precioAdulto)}</div>
                                <button
                                  onClick={() => handleBusSelection(bus)}
                                  className={`w-full px-6 py-2 font-semibold rounded-lg text-sm transition-colors ${selected
                                    ? "bg-gray-300 text-gray-700"
                                    : "bg-purple-600 text-white hover:bg-purple-700"
                                    }`}
                                >
                                  {selected ? "Seleccionado ✓" : "Seleccionar"}
                                </button>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </>
              )}

              <div className="flex gap-3 mt-4">
                <button onClick={() => setCurrentStep(1)} className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold py-2.5 rounded-lg text-sm">VOLVER</button>
                <button onClick={handleContinueFromBuses} disabled={!skipBus && selectedBuses.length === 0} className="flex-1 bg-purple-600 hover:bg-purple-700 text-white font-semibold py-2.5 rounded-lg text-sm disabled:opacity-50 disabled:cursor-not-allowed">CONTINUAR A PAGO</button>
              </div>
            </div>
          )}
        </div>

        <div className={`bg-white rounded-2xl shadow-sm overflow-hidden border-2 ${currentStep === 3 ? "border-purple-600" : "border-gray-200"}`}>
          <button className="w-full flex items-center gap-3 p-4 text-left">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-semibold text-sm ${currentStep >= 3 ? "bg-purple-600 text-white" : "bg-gray-300"}`}>3</div>
            <h2 className="text-lg font-bold text-gray-900">Pago</h2>
          </button>

          {currentStep === 3 && (
            <div className="px-4 pb-6 space-y-4">
              {resumen.vuelo && (
                <div className="border-2 border-purple-600 rounded-2xl p-4 flex items-start justify-between">
                  <div className="space-y-1">
                    <div className="text-sm font-semibold text-gray-900">{resumen.vuelo.empresa} · {resumen.vuelo.origen} → {resumen.vuelo.destino}</div>
                    <div className="text-xs text-gray-600">{resumen.vuelo.horaSalida} — {resumen.vuelo.horaLlegada} · Tarifa: {resumen.vuelo.tarifaNombre}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs text-gray-500 mb-1">Vuelo</div>
                    <div className="text-lg font-bold text-gray-900">{CLP(resumen.vuelo.precio)}</div>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {paymentMethods.map((method) => (
                  <button key={method.id} onClick={() => setSelectedPaymentMethod(method.id)} className={`relative p-4 rounded-xl border-2 transition-all text-left ${selectedPaymentMethod === method.id ? "border-purple-600 bg-purple-50" : "border-gray-200 hover:border-gray-300"}`}>
                    <div className={`${method.color} text-white rounded-lg p-2.5 inline-flex mb-2`}>{method.icon}</div>
                    <div className="font-semibold text-gray-900 text-sm">{method.name}</div>
                    <div className="text-xs text-gray-600 mt-1">{method.description}</div>
                    {selectedPaymentMethod === method.id && (
                      <div className="absolute top-2 right-2 w-5 h-5 bg-purple-600 rounded-full flex items-center justify-center">
                        <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                      </div>
                    )}
                  </button>
                ))}
              </div>

              <div className="bg-gray-50 rounded-xl p-4">
                <h3 className="font-bold text-gray-900 mb-3">Resumen de tu reserva</h3>
                <div className="space-y-2 text-sm">
                  {resumen.vuelo && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Vuelo – {resumen.vuelo.origen} → {resumen.vuelo.destino} · {resumen.vuelo.tarifaNombre}</span>
                      <span className="font-semibold">{CLP(resumen.vuelo.precio)}</span>
                    </div>
                  )}
                  {!skipBus && resumen.buses.map((b, idx) => (
                    <div key={idx} className="flex justify-between">
                      <span className="text-gray-600">{b.empresa} – {b.ciudadOrigen || b.origen} → {b.ciudadDestino || b.destino}</span>
                      <span className="font-semibold">{CLP(b.precioAdulto)}</span>
                    </div>
                  ))}
                  <div className="border-t pt-2 mt-2 flex justify-between text-lg font-bold">
                    <span>Total</span>
                    <span className="text-purple-600">{CLP(resumen.total)}</span>
                  </div>
                </div>
              </div>

              <button onClick={handlePayment} disabled={loading || !resumen.vuelo} className="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 rounded-lg flex items-center justify-center gap-2 disabled:opacity-50">
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" />
                    <span>Procesando…</span>
                  </>
                ) : (
                  <span>PAGAR {CLP(resumen.total)}</span>
                )}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Pago;