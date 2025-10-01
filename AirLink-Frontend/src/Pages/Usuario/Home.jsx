import { Link } from "react-router-dom";

export default function Home() {
    return (
        <div>
            <h1 className="text-3xl font-bold">Bienvenido a AirLink</h1>
            <p className="mt-4 text-gray-600">Explora destinos y ofertas.</p>

            <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                <Link to="/destination/valparaiso" className="p-4 bg-white rounded shadow">
                    <h3 className="font-semibold">Valparaíso</h3>
                    <p className="text-sm text-gray-500">Desde $60.000</p>
                </Link>

                <Link to="/destination/coquimbo" className="p-4 bg-white rounded shadow">
                    <h3 className="font-semibold">Coquimbo</h3>
                    <p className="text-sm text-gray-500">Desde $21.000</p>
                </Link>

                <Link to="/offers" className="p-4 bg-white rounded shadow">
                    <h3 className="font-semibold">Ver todas las ofertas</h3>
                </Link>
            </div>
        </div>
    );
}
