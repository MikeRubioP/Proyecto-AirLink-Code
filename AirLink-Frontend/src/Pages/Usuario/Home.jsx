import { Link } from "react-router-dom";

export default function Home() {
  const destinos = [
    { id: 1, nombre: "Valdivia", precio: "$20.000", img: "https://source.unsplash.com/600x400/?valdivia,city" },
    { id: 2, nombre: "Coquimbo", precio: "$21.000", img: "https://source.unsplash.com/600x400/?coquimbo,chile" },
    { id: 3, nombre: "Chillán", precio: "$17.000", img: "https://source.unsplash.com/600x400/?chillan,chile" },
    { id: 4, nombre: "Buenos Aires, Argentina", precio: "$59.000", img: "https://source.unsplash.com/600x400/?buenosaires,argentina" },
    { id: 5, nombre: "São Paulo, Brasil", precio: "$70.000", img: "https://source.unsplash.com/600x400/?saopaulo,brazil" },
    { id: 6, nombre: "Lima, Perú", precio: "$29.000", img: "https://source.unsplash.com/600x400/?lima,peru" },
    { id: 7, nombre: "Ciudad de México, México", precio: "$60.000", img: "https://source.unsplash.com/600x400/?mexico,city" },
    { id: 8, nombre: "Bogotá, Colombia", precio: "$42.000", img: "https://source.unsplash.com/600x400/?bogota,colombia" },
    { id: 9, nombre: "Quito, Ecuador", precio: "$37.000", img: "https://source.unsplash.com/600x400/?quito,ecuador" },
  ];

  const reseñas = [
    { id: 1, nombre: "John D.", cargo: "Traveler", texto: "El servicio fue excelente, el vuelo cómodo y puntual. ¡Altamente recomendado!", rating: 5 },
    { id: 2, nombre: "John D.", cargo: "Traveler", texto: "Muy buena experiencia con AirLink, fácil de reservar y excelente atención.", rating: 4 },
    { id: 3, nombre: "John D.", cargo: "Traveler", texto: "Todo fue rápido y sin complicaciones. Definitivamente volveré a viajar con ellos.", rating: 5 },
  ];

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* 🔍 Barra de búsqueda */}
     <div
  className="bg-cover bg-center py-16"
  style={{
    backgroundImage:
      "url('https://static.vecteezy.com/system/resources/thumbnails/066/256/393/small_2x/soft-colored-dynamic-abstract-background-with-shadow-creative-premium-gradient-smart-3d-cover-design-for-business-design-eps10-vector.jpg')",
  }}
>

        <div className="max-w-5xl mx-auto px-4">
          <h1 className="text-2xl font-semibold text-gray-800 mb-4 text-center">
            ¿A dónde te gustaría ir?
          </h1>

          <div className="bg-white shadow-lg rounded-xl p-6 flex flex-col md:flex-row gap-4 items-center justify-center">
            <select className="border rounded-lg p-2 w-full md:w-1/5">
              <option>Desde</option>
              <option>Santiago</option>
              <option>Valdivia</option>
            </select>
            <select className="border rounded-lg p-2 w-full md:w-1/5">
              <option>Hacia</option>
              <option>Buenos Aires</option>
              <option>Coquimbo</option>
            </select>
            <input type="date" className="border rounded-lg p-2 w-full md:w-1/5" />
            <input type="date" className="border rounded-lg p-2 w-full md:w-1/5" />
            <select className="border rounded-lg p-2 w-full md:w-1/5">
              <option>Clase</option>
              <option>Económica</option>
              <option>Ejecutiva</option>
            </select>
            <button className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition">
              🔍
            </button>
          </div>
        </div>
      </div>

      {/* 🌍 Destinos */}
      <section className="max-w-6xl mx-auto px-4 py-12">
        <h2 className="text-center text-2xl font-bold mb-8 text-gray-800">
          Explora el mundo con AirLink
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {destinos.map((dest) => (
            <Link
              key={dest.id}
              to={`/destination/${dest.id}`}
              className="relative bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition"
            >
              <img src={dest.img} alt={dest.nombre} className="w-full h-48 object-cover" />
              <div className="absolute inset-0 bg-black bg-opacity-25 hover:bg-opacity-40 transition"></div>
              <div className="absolute bottom-4 left-4 text-white">
                <h3 className="font-semibold text-lg">{dest.nombre}</h3>
                <p className="text-sm">{dest.precio}</p>
              </div>
            </Link>
          ))}
        </div>

        <div className="text-center mt-10">
          <Link
            to="/offers"
            className="bg-purple-600 text-white px-6 py-3 rounded-lg shadow hover:bg-purple-700 transition"
          >
            Reserva tu destino ahora
          </Link>
        </div>
      </section>

      {/* 💬 Reseñas */}
      <section className="bg-white py-12">
        <h2 className="text-center text-2xl font-bold mb-8 text-gray-800">
          Reseñas de nuestros clientes
        </h2>

        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6 px-4">
          {reseñas.map((r) => (
            <div key={r.id} className="bg-gray-50 p-6 rounded-2xl shadow hover:shadow-md transition">
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
                {"★".repeat(r.rating)}{"☆".repeat(5 - r.rating)}
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
