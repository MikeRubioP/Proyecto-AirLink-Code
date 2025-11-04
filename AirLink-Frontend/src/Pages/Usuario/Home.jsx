import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import DestinationCard from "../../Components/DestinationCard";
import BannersHome from "../../assets/BannersHome.png";
import { useVuelo } from "../Vuelos/context/VueloContext.jsx";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5174";

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
    let isMounted = true;

    (async () => {
      try {
        // p.ej. traemos sólo activos
        const res = await fetch(`${API_URL}/destinos?activo=1`);
        const json = await res.json();

        // Asegurar que sea SIEMPRE un array
        const list =
          Array.isArray(json) ? json :
          Array.isArray(json?.data) ? json.data :
          Array.isArray(json?.items) ? json.items : [];

        if (isMounted) setDestinos(list);
      } catch (err) {
        console.error("Error cargando destinos:", err);
        if (isMounted) setDestinos([]);
      } finally {
        if (isMounted) setLoading(false);
      }
    })();

    return () => { isMounted = false; };
  }, []);


  const handleSearch = (e) => {
    e.preventDefault();

    setForm((prev) => ({
      ...prev,
      origen: desde || "",
      destino: hacia || "",
      fechaIda: ida || "",
      fechaVuelta: tripType === "round" ? (vuelta || "") : "",
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
        <div className="absolute inset-0 flex flex-col justify-center items-center text-center px-6">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-6 drop-shadow-lg animate-fade-in">
            ¿A dónde te gustaría ir?
          </h1>

          {/* BUSCADOR */}
          <form
            onSubmit={handleSearch}
            className="w-full max-w-4xl bg-white/95 backdrop-blur-md border border-purple-200 shadow-lg rounded-2xl p-4 flex flex-col md:flex-row md:flex-wrap gap-3"
          >
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

            <div className="flex flex-col md:flex-row gap-3 w-full">
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

              <input
                type="date"
                className="flex-1 bg-white border border-gray-300 rounded-md px-3 py-2 text-sm text-gray-700 focus:ring-2 focus:ring-purple-400 outline-none"
                value={ida}
                onChange={(e) => setIda(e.target.value)}
                required
              />

              {tripType === "round" && (
                <input
                  type="date"
                  className="flex-1 bg-white border border-gray-300 rounded-md px-3 py-2 text-sm text-gray-700 focus:ring-2 focus:ring-purple-400 outline-none"
                  value={vuelta}
                  onChange={(e) => setVuelta(e.target.value)}
                  required
                />
              )}

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
        ) : (destinos ?? []).length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">No hay destinos disponibles</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {(destinos ?? []).slice(0, 9).map((destino) => (
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
          {[/* ... tus reseñas estáticas ... */].map((r) => (
            <div
              key={r.id}
              className="bg-gray-50 p-6 rounded-2xl shadow-md hover:shadow-lg transition-all"
            >
              {/* contenido de reseña */}
            </div>
          ))}
        </div>
      </section>

      <Footer />
    </div>
  );
}
