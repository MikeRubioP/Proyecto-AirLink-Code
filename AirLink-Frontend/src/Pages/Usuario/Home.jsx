import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import DestinationCard from "../../Components/DestinationCard";
import Footer from "../../Components/Footer";


import { useVuelo } from "../Vuelos/context/VueloContext.jsx";

export default function Home() {
  const [destinos, setDestinos] = useState([]);
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();
  const { form, setForm } = useVuelo(); 

  // estado local de la barra
  const [tripType, setTripType] = useState(form.fechaVuelta ? "round" : "oneway");
  const [desde, setDesde] = useState(form.origen || "");
  const [hacia, setHacia] = useState(form.destino || "");
  const [ida, setIda] = useState(form.fechaIda || "");
  const [vuelta, setVuelta] = useState(form.fechaVuelta || "");
  const [clase, setClase] = useState(form.clase || "");

  useEffect(() => {
    fetch("http://localhost:5174/destinos")
      .then((res) => res.json())
      .then((data) => {
        setDestinos(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error cargando destinos:", err);
        setLoading(false);
      });
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();

    // Guardar los filtros en tu contexto global de vuelo
    setForm((prev) => ({
      ...prev,
      origen: desde || "",        // ej "SCL"
      destino: hacia || "",       // ej "MIA"
      fechaIda: ida || "",        // ej "2025-10-23"
      fechaVuelta: tripType === "round" ? vuelta || "" : "", // si solo ida, limpiamos
      clase: clase || "",         // Económica / Premium / etc
      vueloIda: null,             // reseteamos selección anterior
      vueloVuelta: null,          // reseteamos selección anterior
    }));

    // Redirigir a la página de SeleccionIda
    navigate("/vuelos/seleccion-ida");
  };

  const reseñas = [
    {
      id: 1,
      nombre: "John D.",
      cargo: "Traveler",
      texto:
        "El servicio fue excelente, el vuelo cómodo y puntual. ¡Altamente recomendado!",
      rating: 5,
    },
    {
      id: 2,
      nombre: "María S.",
      cargo: "Traveler",
      texto:
        "Muy buena experiencia con AirLink, fácil de reservar y excelente atención.",
      rating: 4,
    },
    {
      id: 3,
      nombre: "Carlos R.",
      cargo: "Traveler",
      texto:
        "Todo fue rápido y sin complicaciones. Definitivamente volveré a viajar con ellos.",
      rating: 5,
    },
  ];

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* HERO CON BUSCADOR */}
      <div
        className="bg-cover bg-center py-16"
        style={{
          backgroundImage:
            "linear-gradient(to right bottom, rgba(255,255,255,0.6), rgba(255,255,255,0.3)), url('https://static.vecteezy.com/system/resources/thumbnails/066/256/393/small_2x/soft-colored-dynamic-abstract-background-with-shadow-creative-premium-gradient-smart-3d-cover-design-for-business-design-eps10-vector.jpg')",
        }}
      >
        <div className="max-w-5xl mx-auto w-full px-4 py-6 bg-transparent">
          {/* título */}
          <h1 className="text-2xl font-semibold text-gray-900 mb-2">
            ¿A dónde te gustaría ir?
          </h1>

          {/* tipo de viaje */}
          <div className="flex items-center gap-4 text-sm text-gray-800 mb-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="tripType"
                value="round"
                checked={tripType === "round"}
                onChange={() => setTripType("round")}
                className="text-purple-600 focus:ring-purple-600"
              />
              <span>Ida y vuelta</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="tripType"
                value="oneway"
                checked={tripType === "oneway"}
                onChange={() => setTripType("oneway")}
                className="text-purple-600 focus:ring-purple-600"
              />
              <span>Solo ida</span>
            </label>
          </div>

          {/* barra segmentada */}
          <form
            onSubmit={handleSearch}
            className={`flex flex-col md:flex-row md:items-stretch md:flex-wrap gap-3
                        border border-purple-400 rounded-sm bg-white p-2 md:p-0`}
          >
            {/* Desde */}
            <div className="flex items-center md:border-r md:border-gray-300 px-3 py-2 flex-1 min-w-[150px]">
              <select
                className="w-full bg-transparent text-sm text-gray-800 outline-none appearance-none"
                value={desde}
                onChange={(e) => setDesde(e.target.value)}
                required
              >
                <option value="">Desde</option>
                <option value="SCL">Santiago</option>
                <option value="LSC">La Serena</option>
                <option value="CPO">Copiapó</option>
              </select>
              <span className="ml-2 text-gray-600 text-xs">▼</span>
            </div>

            {/* Hacia */}
            <div className="flex items-center md:border-r md:border-gray-300 px-3 py-2 flex-1 min-w-[150px]">
              <select
                className="w-full bg-transparent text-sm text-gray-800 outline-none appearance-none"
                value={hacia}
                onChange={(e) => setHacia(e.target.value)}
                required
              >
                <option value="">Hacia</option>
                <option value="MIA">Miami</option>
                <option value="ANF">Antofagasta</option>
                <option value="BUE">Buenos Aires</option>
              </select>
              <span className="ml-2 text-gray-600 text-xs">▼</span>
            </div>

            {/* Ida */}
            <div className="flex items-center md:border-r md:border-gray-300 px-3 py-2 flex-1 min-w-[140px]">
              <div className="flex flex-col w-full">
                <span className="text-gray-800 text-sm mb-1">Ida</span>
                <input
                  type="date"
                  className="bg-transparent outline-none text-sm text-gray-800 border border-gray-300 rounded px-2 py-1"
                  value={ida}
                  onChange={(e) => setIda(e.target.value)}
                  required
                />
              </div>
            </div>

            {/* Vuelta (solo si ida y vuelta) */}
            {tripType === "round" && (
              <div className="flex items-center md:border-r md:border-purple-500 px-3 py-2 flex-1 min-w-[140px]">
                <div className="flex flex-col w-full">
                  <span className="text-gray-800 text-sm mb-1">Vuelta</span>
                  <input
                    type="date"
                    className="bg-transparent outline-none text-sm text-gray-800 border border-gray-300 rounded px-2 py-1"
                    value={vuelta}
                    onChange={(e) => setVuelta(e.target.value)}
                    required={tripType === "round"}
                  />
                </div>
              </div>
            )}

            {/* Clase */}
            <div className="flex items-center md:border-r md:border-transparent px-3 py-2 flex-1 min-w-[130px]">
              <select
                className="w-full bg-transparent text-sm text-gray-800 outline-none appearance-none"
                value={clase}
                onChange={(e) => setClase(e.target.value)}
              >
                <option value="">Clase</option>
                <option value="eco">Económica</option>
                <option value="premium">Premium</option>
                <option value="ejec">Ejecutiva</option>
              </select>
              <span className="ml-2 text-gray-600 text-xs">▼</span>
            </div>

            {/* Botón Buscar */}
            <button
              type="submit"
              className="bg-purple-600 hover:bg-purple-700 text-white flex items-center justify-center
                         px-4 py-2 rounded-md font-medium w-full md:w-auto"
            >
              🔍
            </button>
          </form>
        </div>
      </div>

      {/* DESTINOS */}
      <section className="max-w-6xl mx-auto px-4 py-12">
        <h2 className="text-center text-2xl font-bold mb-8 text-gray-800">
          Explora el mundo con AirLink
        </h2>

        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-purple-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Cargando destinos...</p>
          </div>
        ) : destinos.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">No hay destinos disponibles</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {destinos.slice(0, 9).map((destino) => (
              <DestinationCard
                key={destino.idDestino}
                destino={destino}
                showLink={true}
              />
            ))}
          </div>
        )}

        <div className="text-center mt-10">
          <Link
            to="/offers"
            className="bg-purple-600 text-white px-6 py-3 rounded-lg shadow hover:bg-purple-700 transition"
          >
            Reserva tu destino ahora
          </Link>
        </div>
      </section>

      {/* RESEÑAS */}
      <section className="bg-white py-12">
        <h2 className="text-center text-2xl font-bold mb-8 text-gray-800">
          Reseñas de nuestros clientes
        </h2>

        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6 px-4">
          {[
            {
              id: 1,
              nombre: "John D.",
              cargo: "Traveler",
              texto:
                "El servicio fue excelente, el vuelo cómodo y puntual. ¡Altamente recomendado!",
              rating: 5,
            },
            {
              id: 2,
              nombre: "María S.",
              cargo: "Traveler",
              texto:
                "Muy buena experiencia con AirLink, fácil de reservar y excelente atención.",
              rating: 4,
            },
            {
              id: 3,
              nombre: "Carlos R.",
              cargo: "Traveler",
              texto:
                "Todo fue rápido y sin complicaciones. Definitivamente volveré a viajar con ellos.",
              rating: 5,
            },
          ].map((r) => (
            <div
              key={r.id}
              className="bg-gray-50 p-6 rounded-2xl shadow hover:shadow-md transition"
            >
              <div className="flex items-center gap-3 mb-3">
                <img
                  src={`https://randomuser.me/api/portraits/men/${r.id + 10}.jpg`}
                  alt={r.nombre}
                  className="w-12 h-12 rounded-full object-cover"
                />
                <div>
                  <h4 className="font-semibold">{r.nombre}</h4>
                  <p className="text-sm text-gray-500">{r.cargo}</p>
                </div>
              </div>
              <p className="text-gray-600 text-sm mb-2">{r.texto}</p>
              <div className="text-yellow-400">
                {"★".repeat(r.rating)}
                {"☆".repeat(5 - r.rating)}
              </div>
            </div>
          ))}
        </div>
      </section>
     {/* 🦶 Footer */}
      <Footer />
    </div>
   
 


  );
}
