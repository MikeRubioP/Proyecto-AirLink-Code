import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import DestinationCard from "../../Components/DestinationCard";
import BannersHome from "../../assets/BannersHome.png";
import { useVuelo } from "../Vuelos/context/VueloContext.jsx";

export default function Home() {
  const [destinos, setDestinos] = useState([]);
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();
  const { form, setForm } = useVuelo();

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
        console.log("📦 Datos recibidos:", data);

        if (Array.isArray(data)) {
          setDestinos(data);
        } else if (Array.isArray(data.items)) {
          // ✅ tu caso
          setDestinos(data.items);
        } else {
          console.warn("⚠️ Formato inesperado en respuesta:", data);
          setDestinos([]);
        }

        setLoading(false);
      })
      .catch((err) => {
        console.error("❌ Error cargando destinos:", err);
        setDestinos([]);
        setLoading(false);
      });
  }, []);


  const handleSearch = (e) => {
    e.preventDefault();

    setForm((prev) => ({
      ...prev,
      origen: desde || "",
      destino: hacia || "",
      fechaIda: ida || "",
      fechaVuelta: tripType === "round" ? vuelta || "" : "",
      clase: clase || "",
      vueloIda: null,
      vueloVuelta: null,
    }));

    navigate("/vuelos/seleccion-ida");
  };

  return (
    <div className="bg-gray-50 min-h-screen flex flex-col">
      {/* HERO CON BUSCADOR */}
      <div
        className="relative bg-cover bg-center h-[450px] md:h-[500px] rounded-b-3xl shadow-md overflow-hidden animate-gradient"
        style={{
          backgroundImage: `linear-gradient(to right bottom, rgba(69, 13, 130, 0.75), rgba(147, 51, 234, 0.45)), url(${BannersHome})`,
          backgroundBlendMode: "overlay",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        {/* Contenido sobre el banner */}
        <div className="absolute inset-0 flex flex-col justify-center items-center text-center px-6">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-6 drop-shadow-lg animate-fade-in">
            ¿A dónde te gustaría ir?
          </h1>

          {/* CONTENEDOR BUSCADOR */}
          <form
            onSubmit={handleSearch}
            className="w-full max-w-4xl bg-white/95 backdrop-blur-md border border-purple-200 shadow-lg rounded-2xl p-4 flex flex-col md:flex-row md:flex-wrap gap-3"
          >
            {/* Tipo de viaje */}
            <div className="flex justify-center w-full gap-6 text-sm text-gray-700">
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

            {/* Campos del buscador */}
            <div className="flex flex-col md:flex-row gap-3 w-full">
              {/* Desde */}
              <select
                className="flex-1 bg-white border border-gray-300 rounded-md px-3 py-2 text-sm text-gray-700 focus:ring-2 focus:ring-purple-400 outline-none"
                value={desde}
                onChange={(e) => setDesde(e.target.value)}
                required
              >
                <option value="">Desde</option>
                <option value="SCL">Santiago</option>
                <option value="LSC">La Serena</option>
                <option value="CPO">Copiapó</option>
              </select>

              {/* Hacia */}
              <select
                className="flex-1 bg-white border border-gray-300 rounded-md px-3 py-2 text-sm text-gray-700 focus:ring-2 focus:ring-purple-400 outline-none"
                value={hacia}
                onChange={(e) => setHacia(e.target.value)}
                required
              >
                <option value="">Hacia</option>
                <option value="MIA">Miami</option>
                <option value="ANF">Antofagasta</option>
                <option value="BUE">Buenos Aires</option>
              </select>

              {/* Ida */}
              <input
                type="date"
                className="flex-1 bg-white border border-gray-300 rounded-md px-3 py-2 text-sm text-gray-700 focus:ring-2 focus:ring-purple-400 outline-none"
                value={ida}
                onChange={(e) => setIda(e.target.value)}
                required
              />

              {/* Vuelta (solo si es ida y vuelta) */}
              {tripType === "round" && (
                <input
                  type="date"
                  className="flex-1 bg-white border border-gray-300 rounded-md px-3 py-2 text-sm text-gray-700 focus:ring-2 focus:ring-purple-400 outline-none"
                  value={vuelta}
                  onChange={(e) => setVuelta(e.target.value)}
                  required
                />
              )}

              {/* Clase */}
              <select
                className="flex-1 bg-white border border-gray-300 rounded-md px-3 py-2 text-sm text-gray-700 focus:ring-2 focus:ring-purple-400 outline-none"
                value={clase}
                onChange={(e) => setClase(e.target.value)}
              >
                <option value="">Clase</option>
                <option value="eco">Económica</option>
                <option value="premium">Premium</option>
                <option value="ejec">Ejecutiva</option>
              </select>

              {/* Botón */}
              <button
                type="submit"
                className="bg-[#450d82] hover:bg-purple-800 text-white px-6 py-2 rounded-md font-medium transition-all shadow-md w-full md:w-auto"
              >
                Buscar ✈️
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* DESTINOS */}
      <section className="max-w-6xl mx-auto px-4 py-16">
        <h2 className="text-center text-3xl font-bold mb-10 text-gray-800">
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
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {destinos.slice(0, 9).map((destino) => (
              <DestinationCard
                key={destino.idDestino}
                destino={destino}
                showLink={true}
              />
            ))}
          </div>
        )}

        <div className="text-center mt-12">
          <Link
            to="/vuelos"
            className="bg-[#450d82] text-white px-8 py-3 rounded-lg shadow hover:bg-purple-800 transition-all"
          >
            Reserva tu destino ahora
          </Link>
        </div>
      </section>

      {/* RESEÑAS */}
      <section className="bg-white py-16">
        <h2 className="text-center text-3xl font-bold mb-10 text-gray-800">
          Reseñas de nuestros clientes
        </h2>

        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 px-4">
          {[
            {
              id: 1,
              nombre: "Julio Tapia.",
              cargo: "Traveler",
              texto:
                "El servicio fue excelente, el vuelo cómodo y puntual. ¡Altamente recomendado!",
              rating: 5,
            },
            {
              id: 2,
              nombre: "Alan Gajardo",
              cargo: "Traveler",
              texto:
                "Muy buena experiencia con AirLink, fácil de reservar y excelente atención.",
              rating: 4,
            },
            {
              id: 3,
              nombre: "Daniel Sepúlveda",
              cargo: "Traveler",
              texto:
                "Todo fue rápido y sin complicaciones. Definitivamente volveré a viajar con ellos.",
              rating: 5,
            },
          ].map((r) => (
            <div
              key={r.id}
              className="bg-gray-50 p-6 rounded-2xl shadow-md hover:shadow-lg transition-all"
            >
              <div className="flex items-center gap-3 mb-3">
                <img
                  src={BannersHome}
                  alt={r.nombre}
                  className="w-12 h-12 rounded-full object-cover border border-gray-300"
                />
                <div>
                  <h4 className="font-semibold">{r.nombre}</h4>
                  <p className="text-sm text-gray-500">{r.cargo}</p>
                </div>
              </div>
              <p className="text-gray-600 text-sm mb-2">{r.texto}</p>
              <div className="text-yellow-400 text-lg">
                {"★".repeat(r.rating)}
                {"☆".repeat(5 - r.rating)}
              </div>
            </div>
          ))}
        </div>
      </section>

    </div>
  );
}
