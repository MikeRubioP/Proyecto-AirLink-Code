import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";

const API = import.meta.env.VITE_API_URL || "http://localhost:5174";
const asset = (name) => new URL(`../../assets/${name}`, import.meta.url).href;

export default function Ofertas() {
    const [all, setAll] = useState([]);
    const [loading, setLoading] = useState(true);
    const [q, setQ] = useState("");
    const [maxPrice, setMaxPrice] = useState(100000); // CLP
    const [sort, setSort] = useState("desc"); // desc: mayor descuento primero
    const [error, setError] = useState("");

    useEffect(() => {
        (async () => {
            try {
                const r = await fetch(`${API}/api/destinos`);
                if (!r.ok) throw new Error(`HTTP ${r.status}`);
                const data = await r.json();

                // Normaliza: si no viene imageUrl desde el backend, resolvemos por imgPath desde /src/assets
                const withImg = data.map((d, i) => ({
                    id: d.id,
                    nombre: d.nombre,
                    basePrice: Number(d.precio),
                    // ejemplo simple: 15–35% de descuento rotativo
                    off: [0.15, 0.2, 0.25, 0.3, 0.35][i % 5],
                    img: d.imageUrl || asset(d.imgPath || nombreAArchivo(d.nombre)),
                }));
                setAll(withImg);
            } catch (e) {
                console.error(e);
                setError("No se pudo cargar desde la API. Mostrando datos locales.");
                // Fallback local rápido (ajusta nombres si quieres)
                setAll([
                    { id: 1, nombre: "Valdivia", basePrice: 20000, off: 0.25, img: asset("Valdivia.webp") },
                    { id: 2, nombre: "Coquimbo", basePrice: 21000, off: 0.2, img: asset("Coquimbo.jpeg") },
                    { id: 3, nombre: "Chillán", basePrice: 17000, off: 0.15, img: asset("Chillan.jpg") },
                    { id: 4, nombre: "Buenos Aires, Argentina", basePrice: 59000, off: 0.3, img: asset("BuenosAires.avif") },
                    { id: 5, nombre: "São Paulo, Brasil", basePrice: 70000, off: 0.35, img: asset("SaoPaulo.jpg") },
                    { id: 6, nombre: "Lima, Perú", basePrice: 29000, off: 0.2, img: asset("Lima.jpg") },
                ]);
            } finally {
                setLoading(false);
            }
        })();
    }, []);

    const filtered = useMemo(() => {
        const byText = (d) =>
            d.nombre.toLowerCase().includes(q.trim().toLowerCase());
        const byPrice = (d) => Math.round(d.basePrice * (1 - d.off)) <= maxPrice;

        const sorted = [...all]
            .filter(byText)
            .filter(byPrice)
            .sort((a, b) => {
                const ad = a.off, bd = b.off;
                if (sort === "desc") return bd - ad;
                if (sort === "asc") return ad - bd;
                // precio final
                const ap = Math.round(a.basePrice * (1 - a.off));
                const bp = Math.round(b.basePrice * (1 - b.off));
                return ap - bp;
            });

        return sorted;
    }, [all, q, maxPrice, sort]);

    return (
        <div className="min-h-screen bg-[#F7F7FB]">
            {/* HERO */}
            <section className="relative overflow-hidden">
                <div className="absolute -top-24 -right-24 h-72 w-72 rounded-full bg-[#7C4DFF]/10 blur-2xl" />
                <div className="absolute -bottom-24 -left-24 h-72 w-72 rounded-full bg-[#7C4DFF]/10 blur-2xl" />
                <div className="max-w-7xl mx-auto px-6 py-12 md:py-16">
                    <p className="inline-flex items-center gap-2 text-sm text-[#7C4DFF] font-semibold bg-[#7C4DFF]/10 px-3 py-1 rounded-full">
                        🔖 Ofertas
                    </p>
                    <h1 className="mt-3 text-3xl md:text-4xl font-extrabold">
                        Ahorra en tu próximo viaje
                    </h1>
                    <p className="mt-2 text-[#5c5c66] max-w-2xl">
                        Descuentos limitados en destinos seleccionados. Reserva ahora y asegura el mejor precio.
                    </p>
                </div>
            </section>

            {/* FILTROS */}
            <section className="max-w-7xl mx-auto px-6 pb-4">
                <div className="rounded-3xl border border-[#E7E7ED] bg-white p-4 md:p-5 flex flex-col md:flex-row gap-4 items-center">
                    <input
                        className="input rounded-xl w-full md:flex-1"
                        placeholder="Buscar destino (ej. Lima, Buenos Aires)"
                        value={q}
                        onChange={(e) => setQ(e.target.value)}
                    />
                    <div className="flex items-center gap-3 w-full md:w-auto">
                        <div className="text-sm text-[#5c5c66]">Precio máx.</div>
                        <input
                            type="range"
                            min={10000}
                            max={120000}
                            step={1000}
                            value={maxPrice}
                            onChange={(e) => setMaxPrice(Number(e.target.value))}
                        />
                        <div className="w-20 text-right font-medium">
                            ${maxPrice.toLocaleString("es-CL")}
                        </div>
                    </div>
                    <select
                        className="input rounded-xl w-full md:w-56"
                        value={sort}
                        onChange={(e) => setSort(e.target.value)}
                    >
                        <option value="desc">Mayor descuento</option>
                        <option value="asc">Menor descuento</option>
                        <option value="price">Precio (menor primero)</option>
                    </select>
                </div>

                {error && (
                    <p className="mt-3 text-sm text-red-600">{error}</p>
                )}
            </section>

            {/* GRID DE OFERTAS */}
            <section className="max-w-7xl mx-auto px-6 pb-16">
                {loading ? (
                    <SkeletonGrid />
                ) : filtered.length === 0 ? (
                    <div className="rounded-3xl border border-[#E7E7ED] bg-white p-10 text-center text-[#5c5c66]">
                        No encontramos resultados con esos filtros.
                    </div>
                ) : (
                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filtered.map((d) => (
                            <OfferCard key={d.id} data={d} />
                        ))}
                    </div>
                )}

                <div className="text-center mt-10">
                    <Link
                        to="/cupones"
                        className="rounded-xl bg-[#7C4DFF] text-white px-6 py-3 shadow hover:bg-[#6B3DF0] transition"
                    >
                        ¿Tienes un cupón? Canjéalo aquí
                    </Link>
                </div>
            </section>
        </div>
    );
}

/* ---------- helpers / subcomponentes ---------- */

function nombreAArchivo(nombre) {
    // mapea nombres típicos a tus archivos (por si el backend aún no envía imgPath)
    const map = {
        "Valdivia": "Valdivia.webp",
        "Coquimbo": "Coquimbo.jpeg",
        "Chillán": "Chillan.jpg",
        "Buenos Aires, Argentina": "BuenosAires.avif",
        "São Paulo, Brasil": "SaoPaulo.jpg",
        "Lima, Perú": "Lima.jpg",
        "Ciudad de México, México": "CiudadMexico.webp",
        "Bogotá, Colombia": "Bogota.jpg",
        "Quito, Ecuador": "Quito.jpg",
    };
    return map[nombre] || "Valdivia.webp";
}

function finalPrice(base, off) {
    return Math.max(0, Math.round(base * (1 - off)));
}

function OfferCard({ data }) {
    const price = finalPrice(data.basePrice, data.off);
    const offPct = Math.round(data.off * 100);

    return (
        <div className="rounded-2xl overflow-hidden border border-[#E7E7ED] bg-white hover:shadow-md transition">
            <div className="relative h-44">
                <img
                    src={data.img}
                    alt={data.nombre}
                    className="absolute inset-0 w-full h-full object-cover"
                    loading="lazy"
                />
                <div className="absolute left-3 top-3 rounded-full bg-[#7C4DFF] text-white text-xs font-semibold px-3 py-1 shadow">
                    -{offPct}%
                </div>
                <div className="absolute inset-0 bg-black/20" />
            </div>
            <div className="p-4">
                <h3 className="font-semibold">{data.nombre}</h3>
                <div className="mt-1 flex items-end gap-2">
                    <span className="text-2xl font-extrabold text-[#7C4DFF]">
                        ${price.toLocaleString("es-CL")}
                    </span>
                    <span className="text-sm line-through text-[#8A8A8E]">
                        ${Number(data.basePrice).toLocaleString("es-CL")}
                    </span>
                </div>
                <div className="mt-4 flex gap-2">
                    <Link
                        to={`/destination/${data.id}`}
                        className="rounded-xl bg-[#7C4DFF] text-white px-4 py-2 text-sm hover:bg-[#6B3DF0] transition"
                    >
                        Ver detalle
                    </Link>
                    <button className="rounded-xl border border-[#E7E7ED] px-4 py-2 text-sm bg-white hover:bg-[#fafafe]">
                        Reservar ahora
                    </button>
                </div>
            </div>
        </div>
    );
}

function SkeletonGrid() {
    return (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="rounded-2xl overflow-hidden border border-[#E7E7ED] bg-white">
                    <div className="h-44 bg-gray-200 animate-pulse" />
                    <div className="p-4">
                        <div className="h-5 w-2/3 bg-gray-200 rounded mb-2 animate-pulse" />
                        <div className="h-4 w-1/3 bg-gray-200 rounded animate-pulse" />
                    </div>
                </div>
            ))}
        </div>
    );
}