import { useState, useEffect, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import DestinationCard from "../../Components/DestinationCard";
import BannersHome from "../../assets/BannersHome.png";

export default function Home() {
  // Hoy en ISO (para min en date)
  const hoyISO = new Date().toISOString().split("T")[0];

  // Navegación
  const navigate = useNavigate();

  // Catálogo de destinos (tarjetas de abajo)
  const [destinos, setDestinos] = useState([]);
  const [loadingDestinos, setLoadingDestinos] = useState(true);

  // Terminales para selects (cargados desde BD)
  const [terminales, setTerminales] = useState([]);
  const [loadingTerminales, setLoadingTerminales] = useState(true);

  // Estado del buscador
  const [tripType, setTripType] = useState("round");
  const [desde, setDesde] = useState("SCL"); // default SCL
  const [hacia, setHacia] = useState("");
  const [ida, setIda] = useState(hoyISO);
  const [vuelta, setVuelta] = useState("");

  // Preview de vuelos en Home (desde la BD)
  const [vuelosPreview, setVuelosPreview] = useState([]);
  const [loadingVuelosPreview, setLoadingVuelosPreview] = useState(false);
  const [errorPreview, setErrorPreview] = useState(null);

  // Helpers
  const fmtCLP = (n) =>
    Number(n || 0).toLocaleString("es-CL", {
      style: "currency",
      currency: "CLP",
      maximumFractionDigits: 0,
    });

  const getLogoUrl = (logo) => {
    if (!logo) return null;
    if (logo.startsWith("http")) return logo;
    return `http://localhost:5174${logo}`;
  };

  // ==== CARGA DE TERMINALES PARA SELECTS (BD) ====
  useEffect(() => {
<<<<<<< HEAD
    const loadTerminales = async () => {
      setLoadingTerminales(true);
      try {
        const res = await fetch("http://localhost:5174/vuelos/destinos");
        const data = await res.json();
        const list = Array.isArray(data) ? data : Array.isArray(data.items) ? data.items : [];
        setTerminales(list);
      } catch (e) {
        setTerminales([]);
      } finally {
        setLoadingTerminales(false);
      }
    };
    loadTerminales();
=======
    fetch("http://localhost:5174/destinos")
      .then((res) => res.json())
      .then((data) => {
        console.log("📦 Datos recibidos:", data);
<<<<<<< HEAD

        if (Array.isArray(data)) {
          setDestinos(data);
        } else if (Array.isArray(data.items)) {
          // ✅ tu caso
=======
        if (Array.isArray(data)) {
          setDestinos(data);
        } else if (Array.isArray(data.items)) {
>>>>>>> bf6e12329deec9573a3055a7bd8584461acecf66
          setDestinos(data.items);
        } else {
          console.warn("⚠️ Formato inesperado en respuesta:", data);
          setDestinos([]);
        }
<<<<<<< HEAD

=======
>>>>>>> bf6e12329deec9573a3055a7bd8584461acecf66
        setLoading(false);
      })
      .catch((err) => {
        console.error("❌ Error cargando destinos:", err);
        setDestinos([]);
        setLoading(false);
      });
>>>>>>> 476c486927240a7135d8d34eea26a478a8eea084
  }, []);

  // ==== CARGA DE DESTINOS PARA TARJETAS (ya lo usabas) ====
  useEffect(() => {
    const loadDestinos = async () => {
      setLoadingDestinos(true);
      try {
        const res = await fetch("http://localhost:5174/destinos");
        const data = await res.json();
        const list = Array.isArray(data) ? data : Array.isArray(data.items) ? data.items : [];
        setDestinos(list);
      } catch (e) {
        setDestinos([]);
      } finally {
        setLoadingDestinos(false);
      }
    };
    loadDestinos();
  }, []);

  // ==== PREVIEW DE VUELOS (cuando hay origen, destino y fecha) ====
  const puedeBuscarPreview = useMemo(
    () => Boolean(desde && hacia && ida),
    [desde, hacia, ida]
  );

  useEffect(() => {
    const fetchPreview = async () => {
      if (!puedeBuscarPreview) {
        setVuelosPreview([]);
        return;
      }
      setLoadingVuelosPreview(true);
      setErrorPreview(null);
      try {
        const url = `http://localhost:5174/vuelos/buscar?origen=${encodeURIComponent(
          desde
        )}&destino=${encodeURIComponent(hacia)}&fecha=${encodeURIComponent(
          ida
        )}&clase=eco`;

        const r = await fetch(url);
        if (!r.ok) throw new Error("Error al buscar vuelos");

        const data = await r.json();

        // Si quieres ordenar por precio desde
        const enriched = await Promise.all(
          data.map(async (v) => {
            try {
              const tr = await fetch(`http://localhost:5174/vuelos/viajes/${v.idViaje}/tarifas`);
              const tarifas = tr.ok ? await tr.json() : [];
              const precioDesde = tarifas.length
                ? Math.min(...tarifas.map((t) => Number(t.precio)))
                : Number(v.precio || 0);
              return { ...v, tarifas, precioDesde };
            } catch {
              return { ...v, tarifas: [], precioDesde: Number(v.precio || 0) };
            }
          })
        );

        // Mostrar máximo 6 para no saturar la portada
        enriched.sort((a, b) => a.precioDesde - b.precioDesde);
        setVuelosPreview(enriched.slice(0, 6));
      } catch (e) {
        setErrorPreview("No se pudieron cargar vuelos para la combinación elegida.");
        setVuelosPreview([]);
      } finally {
        setLoadingVuelosPreview(false);
      }
    };

    fetchPreview();
  }, [desde, hacia, ida, puedeBuscarPreview]);

  // ==== SUBMIT BUSCADOR → a la página de resultados ====
  const handleSearch = (e) => {
    e.preventDefault();

    const payload = {
      origen: desde || "SCL",
      destino: hacia || "",
<<<<<<< HEAD
      fechaIda: ida || hoyISO,
      fechaVuelta: tripType === "round" ? vuelta || "" : "",
=======
      fechaIda: ida || "",
<<<<<<< HEAD
      fechaVuelta: tripType === "round" ? vuelta || "" : "",
=======
      fechaVuelta: tripType === "round" ? (vuelta || "") : "",
      clase: clase || "eco",
>>>>>>> 476c486927240a7135d8d34eea26a478a8eea084
      tipoViaje: tripType === "round" ? "ida-vuelta" : "solo-ida",
      pasajeros: 1,
      clase: "eco",
    };

<<<<<<< HEAD
=======
    // Guardar también en contexto si lo usas en otros pasos
    setForm((prev) => ({
      ...prev,
      ...payload,
>>>>>>> bf6e12329deec9573a3055a7bd8584461acecf66
      vueloIda: null,
      vueloVuelta: null,
    }));

<<<<<<< HEAD
    navigate("/vuelos/buscar");
=======
    // 🔁 redirige a la página de búsqueda con los datos
>>>>>>> 476c486927240a7135d8d34eea26a478a8eea084
    navigate("/vuelos/buscar", { state: { search: payload } });
>>>>>>> bf6e12329deec9573a3055a7bd8584461acecf66
  };

  // ==== RENDER ====
  return (
    <div className="bg-gray-50 min-h-screen flex flex-col">
      {/* HERO CON BUSCADOR */}
      <div
        className="relative bg-cover bg-center h-[450px] md:h-[500px] rounded-b-3xl shadow-md overflow-hidden"
        style={{
          backgroundImage: `linear-gradient(to right bottom, rgba(69, 13, 130, 0.75), rgba(147, 51, 234, 0.45)), url(${BannersHome})`,
          backgroundBlendMode: "overlay",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        {/* Contenido sobre el banner */}
        <div className="absolute inset-0 flex flex-col justify-center items-center text-center px-6">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-6 drop-shadow-lg">
            ¿A dónde te gustaría ir?
          </h1>

          {/* CONTENEDOR BUSCADOR (rectángulo blanco) */}
          <form
            onSubmit={handleSearch}
            className="w-full max-w-5xl bg-white/95 backdrop-blur-md border border-purple-200 shadow-lg rounded-2xl p-5"
          >
            {/* Tipo de viaje */}
            <div className="flex justify-center w-full gap-6 text-sm text-gray-700 mb-4">
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
                  onChange={() => {
                    setTripType("oneway");
                    setVuelta("");
                  }}
                  className="text-purple-600 focus:ring-purple-600"
                />
                <span>Solo ida</span>
              </label>
            </div>

            {/* Fila de controles + botón dentro del mismo contenedor */}
            <div className="grid grid-cols-1 md:grid-cols-[1fr_1fr_1fr_1fr_auto] gap-3 items-stretch">
              {/* Desde */}
              <select
                className="h-12 bg-white border border-gray-300 rounded-xl px-3 text-sm text-gray-700 focus:ring-2 focus:ring-purple-400 outline-none"
                value={desde}
                onChange={(e) => setDesde(e.target.value)}
                required
              >
                {/* Opciones desde BD */}
                {loadingTerminales ? (
                  <option value="">Cargando orígenes…</option>
                ) : (
                  <>
                    {/* Valor por defecto si no viene SCL en BD */}
                    {!terminales.some((t) => t.codigo === "SCL") && (
                      <option value="SCL">Santiago (SCL)</option>
                    )}
                    {terminales.map((t) => (
                      <option key={`o-${t.idTerminal || t.codigo}`} value={t.codigo}>
                        {t.ciudad} ({t.codigo})
                      </option>
                    ))}
                  </>
                )}
              </select>

              {/* Hacia */}
              <select
                className="h-12 bg-white border border-gray-300 rounded-xl px-3 text-sm text-gray-700 focus:ring-2 focus:ring-purple-400 outline-none"
                value={hacia}
                onChange={(e) => setHacia(e.target.value)}
                required
              >
                <option value="">{loadingTerminales ? "Cargando destinos…" : "Hacia"}</option>
                {!loadingTerminales &&
                  terminales
                    .filter((t) => t.codigo !== desde) // evitar mismo código
                    .map((t) => (
                      <option key={`d-${t.idTerminal || t.codigo}`} value={t.codigo}>
                        {t.ciudad} ({t.codigo})
                      </option>
                    ))}
              </select>

              {/* Ida */}
              <input
                type="date"
                min={hoyISO}
                className="h-12 bg-white border border-gray-300 rounded-xl px-3 text-sm text-gray-700 focus:ring-2 focus:ring-purple-400 outline-none"
                value={ida}
                onChange={(e) => {
                  setIda(e.target.value);
                  if (vuelta && e.target.value && e.target.value > vuelta) {
                    setVuelta("");
                  }
                }}
                required
              />

<<<<<<< HEAD
              {/* Vuelta (solo si es ida y vuelta) */}
=======
              {/* Vuelta (solo round trip) */}
<<<<<<< HEAD
              {tripType === "round" ? (
=======
>>>>>>> bf6e12329deec9573a3055a7bd8584461acecf66
              {tripType === "round" && (
>>>>>>> 476c486927240a7135d8d34eea26a478a8eea084
                <input
                  type="date"
                  min={ida || hoyISO}
                  className="h-12 bg-white border border-gray-300 rounded-xl px-3 text-sm text-gray-700 focus:ring-2 focus:ring-purple-400 outline-none"
                  value={vuelta}
                  onChange={(e) => setVuelta(e.target.value)}
                  required
                />
              ) : (
                <div className="hidden md:block" />
              )}

<<<<<<< HEAD
              {/* Botón Buscar */}
=======
<<<<<<< HEAD
=======
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

>>>>>>> bf6e12329deec9573a3055a7bd8584461acecf66
              {/* Botón */}
>>>>>>> 476c486927240a7135d8d34eea26a478a8eea084
              <button
                type="submit"
                className="h-12 px-6 bg-[#6b21a8] hover:bg-[#581c87] text-white rounded-xl font-medium shadow-md flex items-center justify-center gap-2"
                title="Buscar vuelos"
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

        {loadingDestinos ? (
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
                key={destino.idDestino ?? destino.idTerminal ?? `${destino.ciudad}-${destino.codigo}`}
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
<<<<<<< HEAD
=======

      {/* RESEÑAS */}
      <section className="bg-white py-16">
        <h2 className="text-center text-3xl font-bold mb-10 text-gray-800">
          Reseñas de nuestros clientes
        </h2>

        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 px-4">
<<<<<<< HEAD
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
=======
          {[ /* ...tus reseñas... */ ].map((r) => (
            <div key={r.id} className="bg-gray-50 p-6 rounded-2xl shadow-md hover:shadow-lg transition-all">
              {/* ... */}
>>>>>>> bf6e12329deec9573a3055a7bd8584461acecf66
            </div>
          ))}
        </div>
      </section>
<<<<<<< HEAD

=======
>>>>>>> bf6e12329deec9573a3055a7bd8584461acecf66
>>>>>>> 476c486927240a7135d8d34eea26a478a8eea084
    </div>
  );
}