import React, { useState, useEffect } from 'react';
import { CreditCard, Building2, Wallet, AlertCircle } from 'lucide-react';
import axios from 'axios';
import { loadStripe } from '@stripe/stripe-js';

const stripePromise = loadStripe('pk_test_51PK44C1PdMkmVgdICZEWcEHmVWbWAqT3glYCEVDTd0GcUw76iiHPxABvZrQhVAusVVOR5pkkJuEiszKM6J5UVDht00kbFkD9mM');

const Pago = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [passengerData, setPassengerData] = useState({
    nombre: '',
    apellido: '',
    fechaNacimiento: '',
    genero: '',
    tipoDocumento: 'DNI',
    numeroDocumento: '',
    correo: '',
    telefono: ''
  });

  const [selectedBuses, setSelectedBuses] = useState([]);
  const [availableBuses, setAvailableBuses] = useState([]);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('stripe');
  const [reservationSummary, setReservationSummary] = useState(null);

  useEffect(() => {
    if (currentStep === 2) {
      loadAvailableBuses();
    }
  }, [currentStep]);

  const loadAvailableBuses = async () => {
    setAvailableBuses([
      {
        id: 1,
        empresa: 'FLIXBUS',
        color: 'bg-green-500',
        origen: 'Santiago',
        destino: 'La Serena',
        fechaSalida: 'Mar, 23/09',
        horaSalida: '07:00 AM',
        horaLlegada: '13:35 PM',
        duracion: '6 h 35 min',
        precioAdulto: 18030,
        precioNino: 20090,
        asientosDisponibles: 15
      },
      {
        id: 2,
        empresa: 'pullman',
        color: 'bg-purple-700',
        origen: 'Santiago',
        destino: 'La Serena',
        fechaSalida: 'Mar, 23/09',
        horaSalida: '08:30 AM',
        horaLlegada: '15:05 PM',
        duracion: '6 h 35 min',
        precioAdulto: 18030,
        precioNino: 13590,
        asientosDisponibles: 8
      },
      {
        id: 3,
        empresa: 'turbus',
        color: 'bg-red-600',
        origen: 'Santiago',
        destino: 'La Serena',
        fechaSalida: 'Mar, 23/09',
        horaSalida: '09:00 AM',
        horaLlegada: '15:35 PM',
        duracion: '6 h 35 min',
        precioAdulto: 18030,
        precioNino: 20090,
        asientosDisponibles: 20
      }
    ]);
  };

  const handlePassengerInputChange = (e) => {
    const { name, value } = e.target;
    setPassengerData(prev => ({
      ...prev,
      [name]: value
    }));
    setError('');
  };

  const validatePassengerForm = () => {
    const required = ['nombre', 'apellido', 'fechaNacimiento', 'genero', 'numeroDocumento', 'correo', 'telefono'];
    const empty = required.filter(field => !passengerData[field]?.trim());

    if (empty.length > 0) {
      setError(`Por favor completa: ${empty.join(', ')}`);
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(passengerData.correo)) {
      setError('Correo electrónico no válido');
      return false;
    }

    return true;
  };

  const handleContinueFromPassenger = () => {
    if (!validatePassengerForm()) return;
    setCurrentStep(2);
  };

  const handleBusSelection = (bus) => {
    setSelectedBuses(prev => {
      const exists = prev.find(b => b.id === bus.id);
      if (exists) {
        return prev.filter(b => b.id !== bus.id);
      }
      return [...prev, bus];
    });
  };

  const handleContinueFromBuses = () => {
    if (selectedBuses.length === 0) {
      setError('Por favor selecciona al menos un bus');
      return;
    }

    const total = selectedBuses.reduce((sum, bus) => sum + bus.precioAdulto, 0);
    setReservationSummary({
      pasajero: passengerData,
      buses: selectedBuses,
      total: total
    });

    setCurrentStep(3);
    setError('');
  };

  const handlePayment = async () => {
    if (!reservationSummary) {
      setError('Error: No hay información de reserva');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // 1. Crear la reserva
      console.log('Creando reserva...', {
        pasajero: reservationSummary.pasajero,
        buses: reservationSummary.buses,
        total: reservationSummary.total,
        metodoPago: selectedPaymentMethod
      });

      const reservaResponse = await axios.post('http://localhost:5174/pagos/crear-reserva', {
        pasajero: reservationSummary.pasajero,
        buses: reservationSummary.buses,
        total: reservationSummary.total,
        metodoPago: selectedPaymentMethod
      });

      console.log('Reserva creada:', reservaResponse.data);

      const { reservaId } = reservaResponse.data;

      // 2. Procesar pago según método
      if (selectedPaymentMethod === 'stripe') {
        await procesarPagoStripe(reservaId);
      } else if (selectedPaymentMethod === 'mercadopago') {
        await procesarPagoMercadoPago(reservaId);
      } else if (selectedPaymentMethod === 'paypal') {
        await procesarPagoPayPal(reservaId);
      }

    } catch (error) {
      console.error('Error al procesar el pago:', error);
      setError(error.response?.data?.error || error.message || 'Error al procesar el pago');
    } finally {
      setLoading(false);
    }
  };

  const procesarPagoStripe = async (reservaId) => {
    try {
      const response = await axios.post('http://localhost:5174/pagos/stripe/create-session', {
        buses: reservationSummary.buses,
        reservaId,
        pasajero: reservationSummary.pasajero
      });

      // Stripe ahora devuelve la URL del Checkout directamente
      const { url } = response.data;

      if (url) {
        window.location.href = url; // Redirige manualmente al Checkout
      } else {
        throw new Error('No se recibió una URL de Stripe.');
      }
    } catch (error) {
      console.error('Error en Stripe:', error);
      throw error;
    }
  };


  const procesarPagoMercadoPago = async (reservaId) => {
    try {
      const response = await axios.post('http://localhost:5174/pagos/mercadopago/create-preference', {
        buses: reservationSummary.buses,
        reservaId,
        pasajero: reservationSummary.pasajero
      });

      window.location.href = response.data.init_point;
    } catch (error) {
      console.error('Error en Mercado Pago:', error);
      throw error;
    }
  };

  const procesarPagoPayPal = async (reservaId) => {
    try {
      const response = await axios.post('http://localhost:5174/pagos/paypal/create-order', {
        buses: reservationSummary.buses,
        reservaId,
        pasajero: reservationSummary.pasajero
      });

      window.location.href = response.data.approveUrl;
    } catch (error) {
      console.error('Error en PayPal:', error);
      throw error;
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP',
      minimumFractionDigits: 0
    }).format(price);
  };

  const paymentMethods = [
    {
      id: 'stripe',
      name: 'Stripe',
      description: 'Pago seguro con tarjeta',
      icon: <CreditCard className="w-6 h-6" />,
      color: 'bg-purple-600'
    },
    {
      id: 'mercadopago',
      name: 'Mercado Pago',
      description: 'Múltiples opciones de pago',
      icon: <Wallet className="w-6 h-6" />,
      color: 'bg-blue-400'
    },
    {
      id: 'paypal',
      name: 'PayPal',
      description: 'Pago internacional seguro',
      icon: <Building2 className="w-6 h-6" />,
      color: 'bg-sky-400'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto space-y-4">

        {/* Mensaje de error global */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm text-red-800 font-medium">Error</p>
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        )}

        {/* PASO 1: PASAJERO */}
        <div className={`bg-white rounded-2xl shadow-sm overflow-hidden border-2 ${currentStep === 1 ? 'border-purple-600' : 'border-gray-200'}`}>
          <button
            onClick={() => currentStep > 1 && setCurrentStep(1)}
            className="w-full flex items-center gap-3 p-4 text-left hover:bg-gray-50 transition-colors"
          >
            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-semibold text-sm ${currentStep >= 1 ? 'bg-purple-600 text-white' : 'bg-gray-300 text-white'}`}>
              1
            </div>
            <h2 className="text-lg font-bold text-gray-900">Pasajero</h2>
          </button>

          {currentStep === 1 && (
            <div className="px-4 pb-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <input
                  type="text"
                  name="nombre"
                  placeholder="Nombre"
                  value={passengerData.nombre}
                  onChange={handlePassengerInputChange}
                  className="px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600 text-sm"
                />

                <input
                  type="text"
                  name="apellido"
                  placeholder="Apellido"
                  value={passengerData.apellido}
                  onChange={handlePassengerInputChange}
                  className="px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600 text-sm"
                />

                <input
                  type="date"
                  name="fechaNacimiento"
                  value={passengerData.fechaNacimiento}
                  onChange={handlePassengerInputChange}
                  className="px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600 text-sm"
                />

                <select
                  name="genero"
                  value={passengerData.genero}
                  onChange={handlePassengerInputChange}
                  className="px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600 text-gray-700 text-sm"
                >
                  <option value="">Género</option>
                  <option value="Masculino">Masculino</option>
                  <option value="Femenino">Femenino</option>
                  <option value="Otro">Otro</option>
                </select>

                <input
                  type="text"
                  name="numeroDocumento"
                  placeholder="Número de documento"
                  value={passengerData.numeroDocumento}
                  onChange={handlePassengerInputChange}
                  className="px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600 text-sm"
                />

                <input
                  type="email"
                  name="correo"
                  placeholder="Correo"
                  value={passengerData.correo}
                  onChange={handlePassengerInputChange}
                  className="px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600 text-sm"
                />

                <input
                  type="tel"
                  name="telefono"
                  placeholder="Teléfono"
                  value={passengerData.telefono}
                  onChange={handlePassengerInputChange}
                  className="px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600 text-sm"
                />
              </div>

              <button
                onClick={handleContinueFromPassenger}
                className="w-full mt-4 bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 rounded-lg transition-colors"
              >
                CONTINUAR CON BUSES
              </button>
            </div>
          )}
        </div>

        {/* PASO 2: BUSES */}
        <div className={`bg-white rounded-2xl shadow-sm overflow-hidden border-2 ${currentStep === 2 ? 'border-purple-600' : 'border-gray-200'}`}>
          <button
            onClick={() => currentStep > 2 && setCurrentStep(2)}
            className="w-full flex items-center gap-3 p-4 text-left hover:bg-gray-50 transition-colors"
          >
            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-semibold text-sm ${currentStep >= 2 ? 'bg-purple-600 text-white' : 'bg-gray-300 text-white'}`}>
              2
            </div>
            <h2 className="text-lg font-bold text-gray-900">Buses</h2>
          </button>

          {currentStep === 2 && (
            <div className="px-4 pb-6">
              <div className="space-y-3">
                {availableBuses.map((bus) => (
                  <div
                    key={bus.id}
                    className={`border rounded-xl p-4 transition-all ${selectedBuses.find(b => b.id === bus.id)
                      ? 'border-purple-600 bg-purple-50'
                      : 'border-gray-200 hover:border-gray-300'
                      }`}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className={`${bus.color} inline-block text-white px-3 py-1 rounded font-bold text-xs mb-3`}>
                          {bus.empresa}
                        </div>

                        <div className="grid grid-cols-3 gap-4 text-sm mb-2">
                          <div>
                            <div className="text-gray-500 text-xs mb-0.5">📅 {bus.fechaSalida}</div>
                          </div>

                          <div>
                            <div className="font-semibold text-gray-900">{bus.horaSalida}</div>
                            <div className="font-semibold text-gray-900">{bus.horaLlegada}</div>
                          </div>

                          <div>
                            <div className="font-semibold text-gray-900">{bus.origen}</div>
                            <div className="font-semibold text-gray-900">{bus.destino}</div>
                          </div>
                        </div>

                        <div className="flex items-center gap-4 text-xs text-gray-500">
                          <span className="flex items-center gap-1">
                            <span>🕐</span>
                            <span>{bus.duracion}</span>
                          </span>
                        </div>
                      </div>

                      <div className="text-right">
                        <div className="text-xl font-bold text-gray-900 mb-3">{formatPrice(bus.precioAdulto)}</div>
                        <button
                          onClick={() => handleBusSelection(bus)}
                          className={`w-full px-6 py-2 font-semibold rounded-lg transition-colors text-sm ${selectedBuses.find(b => b.id === bus.id)
                            ? 'bg-gray-300 text-gray-700'
                            : 'bg-purple-600 text-white hover:bg-purple-700'
                            }`}
                        >
                          {selectedBuses.find(b => b.id === bus.id) ? 'Seleccionado ✓' : 'Seleccionar'}
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex gap-3 mt-4">
                <button
                  onClick={() => setCurrentStep(1)}
                  className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold py-2.5 rounded-lg transition-colors text-sm"
                >
                  VOLVER
                </button>
                <button
                  onClick={handleContinueFromBuses}
                  disabled={selectedBuses.length === 0}
                  className="flex-1 bg-purple-600 hover:bg-purple-700 text-white font-semibold py-2.5 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                >
                  CONTINUAR A PAGO
                </button>
              </div>
            </div>
          )}
        </div>

        {/* PASO 3: PAGO */}
        <div className={`bg-white rounded-2xl shadow-sm overflow-hidden border-2 ${currentStep === 3 ? 'border-purple-600' : 'border-gray-200'}`}>
          <button
            className="w-full flex items-center gap-3 p-4 text-left"
          >
            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-semibold text-sm ${currentStep >= 3 ? 'bg-purple-600 text-white' : 'bg-gray-300 text-white'}`}>
              3
            </div>
            <h2 className="text-lg font-bold text-gray-900">Pago</h2>
          </button>

          {currentStep === 3 && reservationSummary && (
            <div className="px-4 pb-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-6">
                {paymentMethods.map((method) => (
                  <button
                    key={method.id}
                    onClick={() => setSelectedPaymentMethod(method.id)}
                    className={`relative p-4 rounded-xl border-2 transition-all text-left ${selectedPaymentMethod === method.id
                      ? 'border-purple-600 bg-purple-50'
                      : 'border-gray-200 hover:border-gray-300'
                      }`}
                  >
                    <div className={`${method.color} text-white rounded-lg p-2.5 inline-flex mb-2`}>
                      {method.icon}
                    </div>
                    <div className="font-semibold text-gray-900 text-sm">{method.name}</div>
                    <div className="text-xs text-gray-600 mt-1">{method.description}</div>
                    {selectedPaymentMethod === method.id && (
                      <div className="absolute top-2 right-2 w-5 h-5 bg-purple-600 rounded-full flex items-center justify-center">
                        <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                    )}
                  </button>
                ))}
              </div>

              <div className="bg-gray-50 rounded-xl p-4 mb-4">
                <h3 className="font-bold text-gray-900 mb-3">Resumen de tu reserva</h3>
                <div className="space-y-2">
                  {reservationSummary.buses.map((bus, idx) => (
                    <div key={idx} className="flex justify-between text-sm">
                      <span className="text-gray-600">{bus.empresa} - {bus.origen} → {bus.destino}</span>
                      <span className="font-semibold">{formatPrice(bus.precioAdulto)}</span>
                    </div>
                  ))}
                  <div className="border-t pt-2 mt-2">
                    <div className="flex justify-between font-bold text-lg">
                      <span>Total</span>
                      <span className="text-purple-600">{formatPrice(reservationSummary.total)}</span>
                    </div>
                  </div>
                </div>
              </div>

              <button
                onClick={handlePayment}
                disabled={loading}
                className="w-full mt-4 bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    <span>Procesando...</span>
                  </>
                ) : (
                  <span>PAGAR {formatPrice(reservationSummary.total)}</span>
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