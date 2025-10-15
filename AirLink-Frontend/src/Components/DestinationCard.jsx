import { Link } from "react-router-dom";

const API_URL = "http://localhost:5174";

export default function DestinationCard({ destino, showLink = true }) {
    // Construir URL completa de la imagen desde el backend
    const getImageUrl = () => {
        if (!destino.imagen) {
            return `https://source.unsplash.com/600x400/?${destino.ciudad},${destino.pais}`;
        }

        // Si ya es una URL completa (http/https)
        if (destino.imagen.startsWith('http')) {
            return destino.imagen;
        }

        // Si es una ruta del servidor (/uploads/...)
        return `${API_URL}${destino.imagen}`;
    };

    const imageUrl = getImageUrl();

    // 🔍 DEBUG: Ver qué URL se está generando
    console.log('🖼️ Destino:', destino.nombre);
    console.log('📁 Imagen en BD:', destino.imagen);
    console.log('🌐 URL generada:', imageUrl);

    const cardContent = (
        <div className="relative bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 cursor-pointer">
            <img
                src={imageUrl}
                alt={destino.nombre}
                className="w-full h-48 object-cover"
                onLoad={() => {
                    console.log('✅ Imagen cargada correctamente:', imageUrl);
                }}
                onError={(e) => {
                    console.error('❌ Error cargando imagen:', imageUrl);
                    console.error('❌ Destino:', destino.nombre);
                    e.target.src = 'https://source.unsplash.com/600x400/?travel,city';
                }}
            />

            {/* 🔍 DEBUG: Mostrar la URL en la card (temporal) */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent hover:from-black/70 transition-all"></div>

            <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
                <h3 className="font-semibold text-lg mb-1">{destino.nombre}</h3>
                <div className="flex items-center justify-between">
                    <p className="text-sm opacity-90">
                        {destino.ciudad && destino.pais ? `${destino.ciudad}, ${destino.pais}` : ''}
                    </p>
                    <p className="text-lg font-bold bg-purple-600 px-3 py-1 rounded-full">
                        ${Number(destino.precio).toLocaleString('es-CL')}
                    </p>
                </div>
                {destino.destacado === 1 && (
                    <span className="absolute top-3 right-3 bg-yellow-400 text-gray-900 text-xs font-bold px-2 py-1 rounded-full">
                        ⭐ Destacado
                    </span>
                )}
            </div>
        </div>
    );

    return showLink ? (
        <Link to={`/destination/${destino.idDestino}`}>
            {cardContent}
        </Link>
    ) : (
        <div>{cardContent}</div>
    );
}