import React, { useEffect, useState, useRef } from "react";
import { Link } from "react-router-dom";
import { ChevronLeft, ChevronRight } from "lucide-react";
import Footer from "../../Components/Footer";

const API_URL = "http://localhost:5174";

export default function Ofertas() {
    const [destinos, setDestinos] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch(`${API_URL}/destinos`)
            .then(res => res.json())
            .then(data => {
                const conDescuentos = data.map((d, i) => ({
                    ...d,
                    descuento: [15, 20, 25, 30, 35][i % 5],
                    precioOriginal: d.precio,
                    precio: Math.round(d.precio * (1 - [0.15, 0.20, 0.25, 0.30, 0.35][i % 5]))
                }));
                setDestinos(conDescuentos);
                setLoading(false);
            })
            .catch(err => {
                console.error('Error cargando destinos:', err);
                setLoading(false);
            });
    }, []);

    const agruparPorRegion = () => {
        const grupos = {
            norte: [],
            sur: [],
            internacional: []
        };

        destinos.forEach(d => {
            const pais = (d.pais || '').toLowerCase();
            const ciudad = (d.ciudad || '').toLowerCase();

            if (ciudad.includes('arica') || ciudad.includes('iquique') ||
                ciudad.includes('antofagasta') || ciudad.includes('calama') ||
                ciudad.includes('copiapó') || ciudad.includes('la serena') ||
                ciudad.includes('coquimbo')) {
                grupos.norte.push(d);
            }
            else if (pais.includes('chile') && (
                ciudad.includes('concepción') || ciudad.includes('temuco') ||
                ciudad.includes('valdivia') || ciudad.includes('osorno') ||
                ciudad.includes('puerto montt') || ciudad.includes('coyhaique') ||
                ciudad.includes('punta arenas') || ciudad.includes('chillán'))) {
                grupos.sur.push(d);
            }
            else {
                grupos.internacional.push(d);
            }
        });

        return grupos;
    };

    const { norte, sur, internacional } = agruparPorRegion();

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-violet-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Cargando ofertas...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* HERO BANNER */}
            <img
                src="src/assets/Banners2.png"
                alt="Banner Cupones"
                className="w-full h-48 md:h-64 rounded-2xl shadow-sm object-cover"
            />

            {/* VUELOS AL NORTE DE CHILE */}
            {norte.length > 0 && (
                <section className="max-w-7xl mx-auto px-6 py-12">
                    <div className="flex items-center justify-center gap-2 mb-8">
                        <div className="h-0.5 flex-1 bg-violet-300"></div>
                        <h2 className="text-xl font-bold text-violet-600 flex items-center gap-2">
                            ✈️ Vuelos en oferta al Norte de Chile
                        </h2>
                        <div className="h-0.5 flex-1 bg-violet-300"></div>
                    </div>
                    <Carousel destinos={norte} />
                </section>
            )}

            {/* VUELOS AL SUR DE CHILE */}
            {sur.length > 0 && (
                <section className="max-w-7xl mx-auto px-6 py-12">
                    <div className="flex items-center justify-center gap-2 mb-8">
                        <div className="h-0.5 flex-1 bg-blue-300"></div>
                        <h2 className="text-xl font-bold text-blue-600 flex items-center gap-2">
                            ✈️ Vuelos en oferta al Sur de Chile
                        </h2>
                        <div className="h-0.5 flex-1 bg-blue-300"></div>
                    </div>
                    <Carousel destinos={sur} />
                </section>
            )}

            {/* VUELOS INTERNACIONALES */}
            {internacional.length > 0 && (
                <section className="max-w-7xl mx-auto px-6 py-12 pb-20">
                    <div className="flex items-center justify-center gap-2 mb-8">
                        <div className="h-0.5 flex-1 bg-green-300"></div>
                        <h2 className="text-xl font-bold text-green-600 flex items-center gap-2">
                            🌍 Vuelos en oferta a otros países
                        </h2>
                        <div className="h-0.5 flex-1 bg-green-300"></div>
                    </div>
                    <Carousel destinos={internacional} />
                </section>
            )}

            {destinos.length === 0 && !loading && (
                <div className="max-w-7xl mx-auto px-6 py-20 text-center">
                    <p className="text-gray-500 text-lg">No hay ofertas disponibles en este momento</p>
                </div>
            )}
        </div>
    );
}

function Carousel({ destinos }) {
    const scrollRef = useRef(null);
    const [canScrollLeft, setCanScrollLeft] = useState(false);
    const [canScrollRight, setCanScrollRight] = useState(true);

    const checkScroll = () => {
        if (scrollRef.current) {
            const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
            setCanScrollLeft(scrollLeft > 0);
            setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
        }
    };

    useEffect(() => {
        checkScroll();
        const ref = scrollRef.current;
        if (ref) {
            ref.addEventListener('scroll', checkScroll);
            return () => ref.removeEventListener('scroll', checkScroll);
        }
    }, [destinos]);

    const scroll = (direction) => {
        if (scrollRef.current) {
            const scrollAmount = 400;
            scrollRef.current.scrollBy({
                left: direction === 'left' ? -scrollAmount : scrollAmount,
                behavior: 'smooth'
            });
        }
    };

    return (
        <div className="relative">
            {/* Botón Izquierda */}
            {canScrollLeft && (
                <button
                    onClick={() => scroll('left')}
                    className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white shadow-lg rounded-full p-2 hover:bg-gray-100 transition"
                >
                    <ChevronLeft className="w-6 h-6 text-gray-700" />
                </button>
            )}

            {/* Carrusel */}
            <div
                ref={scrollRef}
                className="flex gap-6 overflow-x-auto scrollbar-hide scroll-smooth pb-4"
                style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
                {destinos.map((destino) => (
                    <div key={destino.idDestino} className="flex-shrink-0 w-80">
                        <OfferCard destino={destino} />
                    </div>
                ))}
            </div>

            {/* Botón Derecha */}
            {canScrollRight && (
                <button
                    onClick={() => scroll('right')}
                    className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white shadow-lg rounded-full p-2 hover:bg-gray-100 transition"
                >
                    <ChevronRight className="w-6 h-6 text-gray-700" />
                </button>
            )}

        </div>
    );
}

function OfferCard({ destino }) {
    const getImageUrl = () => {
        if (!destino.imagen) {
            return `https://source.unsplash.com/600x400/?${destino.ciudad},${destino.pais}`;
        }
        if (destino.imagen.startsWith('http')) {
            return destino.imagen;
        }
        return `${API_URL}${destino.imagen}`;
    };

    const imageUrl = getImageUrl();

    return (
        <Link to={`/destination/${destino.idDestino}`}>
            <div className="bg-white rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300">
                {/* Imagen con badge */}
                <div className="relative h-52">
                    <img
                        src={imageUrl}
                        alt={destino.nombreDestino}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                            e.target.src = 'https://source.unsplash.com/600x400/?travel,city';
                        }}
                    />
                    {/* Badge de descuento - esquina superior izquierda */}
                    <div className="absolute top-3 left-3 bg-violet-600 text-white px-3 py-1.5 rounded-lg font-bold text-sm shadow-lg">
                        {destino.descuento}% OFF
                    </div>
                </div>

                {/* Contenido */}
                <div className="p-4">
                    {/* Ciudad y País */}
                    <h3 className="font-semibold text-gray-800 text-lg mb-2">
                        {destino.ciudad}, {destino.pais}
                    </h3>

                    {/* Precio */}
                    <div className="flex items-center justify-between mb-3">
                        <div className="text-2xl font-bold text-gray-900">
                            ${Number(destino.precio).toLocaleString('es-CL')}
                        </div>
                        {destino.precioOriginal && (
                            <div className="text-sm text-gray-400 line-through">
                                ${Number(destino.precioOriginal).toLocaleString('es-CL')}
                            </div>
                        )}
                    </div>

                    {/* Duración del viaje */}
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                        <span>✈️</span>
                        <span>Viaje de 10 días</span>
                        <div className="ml-auto bg-violet-100 text-violet-700 px-2 py-0.5 rounded text-xs font-semibold">
                            OFF
                        </div>
                    </div>

                </div>

            </div>

        </Link>
    );
}