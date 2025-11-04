// PagoExitoso.jsx
import { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';

export default function PagoExitoso() {
    const [searchParams] = useSearchParams();
    const reservaId = searchParams.get('reservaId');

    useEffect(() => {
        // Aquí puedes actualizar el estado de la reserva
        // o mostrar la confirmación
    }, [reservaId]);

    return (
        <div className="min-h-screen flex items-center justify-center bg-green-50">
            <div className="bg-white p-8 rounded-lg shadow-lg">
                <h1 className="text-2xl font-bold text-green-600 mb-4">
                    ¡Pago exitoso!
                </h1>
                <p>Reserva #{reservaId}</p>
            </div>
        </div>
    );
}