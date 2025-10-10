import React, { useRef, useEffect, useState } from 'react';
import { X } from 'lucide-react';
import airlinkLogo from '../assets/airlinkLogo2.png';
import { GoogleLogin } from "@react-oauth/google";
import { jwtDecode } from "jwt-decode";
import axios from "axios";
import VerificationModal from './VerificationModal';

const RegisterModal = ({ isOpen, onClose, onSwitchToLogin }) => {
    const modalRef = useRef(null);
    const [showEmailForm, setShowEmailForm] = useState(false);
    const [showVerification, setShowVerification] = useState(false);
    const [registeredEmail, setRegisteredEmail] = useState('');
    const [formData, setFormData] = useState({
        nombreUsuario: '',
        email: '',
        contrasena: '',
        confirmarContrasena: ''
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const handleEscape = (e) => {
            if (e.key === 'Escape' && !showVerification) {
                onClose();
            }
        };

        const handleOutsideClick = (e) => {
            // No cerrar si el modal de verificación está abierto
            if (showVerification) return;

            if (modalRef.current && !modalRef.current.contains(e.target)) {
                onClose();
            }
        };

        if (isOpen) {
            document.addEventListener('keydown', handleEscape);
            document.addEventListener('mousedown', handleOutsideClick);
            document.body.style.overflow = 'hidden';
        }

        return () => {
            document.removeEventListener('keydown', handleEscape);
            document.removeEventListener('mousedown', handleOutsideClick);
            document.body.style.overflow = 'unset';
        };
    }, [isOpen, onClose, showVerification]);

    useEffect(() => {
        if (!isOpen) {
            setShowEmailForm(false);
            setShowVerification(false);
            setFormData({
                nombreUsuario: '',
                email: '',
                contrasena: '',
                confirmarContrasena: ''
            });
            setError('');
        }
    }, [isOpen]);

    if (!isOpen) return null;

    const handleInputChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
        setError('');
    };

    const handleRegister = async (e) => {
        e.preventDefault();
        setError('');

        // Validaciones
        if (!formData.nombreUsuario || !formData.email || !formData.contrasena || !formData.confirmarContrasena) {
            setError('Todos los campos son obligatorios');
            return;
        }

        if (formData.contrasena !== formData.confirmarContrasena) {
            setError('Las contraseñas no coinciden');
            return;
        }

        if (formData.contrasena.length < 6) {
            setError('La contraseña debe tener al menos 6 caracteres');
            return;
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(formData.email)) {
            setError('Email inválido');
            return;
        }

        setLoading(true);

        try {
            await axios.post("http://localhost:5174/auth/register", {
                nombreUsuario: formData.nombreUsuario,
                email: formData.email,
                contrasena: formData.contrasena,
            });

            // Guardar email y mostrar modal de verificación
            setRegisteredEmail(formData.email);
            setShowVerification(true);
        } catch (err) {
            setError(err.response?.data?.message || "Error en el registro");
        } finally {
            setLoading(false);
        }
    };

    const handleVerified = () => {
        // Cuando el usuario verifique exitosamente (ya está logueado automáticamente)
        setShowVerification(false);
        onClose(); // Cerrar todos los modales

        // Mostrar mensaje de bienvenida
        setTimeout(() => {
            alert("¡Bienvenido a AirLink! 🎉 Tu cuenta ha sido verificada y ya has iniciado sesión");
        }, 100);
    };

    const handleGoogleSuccess = async (credentialResponse) => {
        try {
            const decoded = jwtDecode(credentialResponse.credential);

            const res = await axios.post("http://localhost:5174/auth/google", {
                googleId: decoded.sub,
                email: decoded.email,
                nombreUsuario: decoded.name,
            });

            localStorage.setItem("token", res.data.token);
            alert("Registro con Google correcto ✅");
            onClose();
            window.location.reload();
        } catch (err) {
            setError(err.response?.data?.message || "Error en registro con Google");
        }
    };

    return (
        <>
            <div className="fixed inset-0 flex items-center justify-center z-[60] p-4" style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}>
                <div
                    ref={modalRef}
                    className="bg-white rounded-lg shadow-xl max-w-md w-full p-8 relative"
                    style={{ animation: 'fadeIn 0.2s ease-out' }}
                >
                    <button
                        onClick={onClose}
                        aria-label="Cerrar modal"
                        className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
                    >
                        <X className="h-5 w-5" />
                    </button>

                    <div className="flex flex-col items-center">
                        <div className="mb-6">
                            <img src={airlinkLogo} alt="AirLink" className="h-20 w-auto" />
                        </div>

                        <h2 className="text-2xl font-bold text-gray-900 mb-8">
                            {showEmailForm ? 'Completa tu registro' : 'Regístrate'}
                        </h2>

                        {!showEmailForm ? (
                            <>
                                <button
                                    onClick={() => setShowEmailForm(true)}
                                    className="w-full bg-purple-600 hover:bg-purple-700 text-white font-medium py-3 px-4 rounded-lg transition-colors mb-4"
                                >
                                    Continuar con correo
                                </button>

                                <div className="w-full">
                                    <GoogleLogin
                                        onSuccess={handleGoogleSuccess}
                                        onError={() => setError("❌ Error en registro con Google")}
                                    />
                                </div>
                            </>
                        ) : (
                            <>
                                <form onSubmit={handleRegister} className="w-full space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Nombre de usuario
                                        </label>
                                        <input
                                            type="text"
                                            name="nombreUsuario"
                                            value={formData.nombreUsuario}
                                            onChange={handleInputChange}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent outline-none"
                                            placeholder="Tu nombre"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Email
                                        </label>
                                        <input
                                            type="email"
                                            name="email"
                                            value={formData.email}
                                            onChange={handleInputChange}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent outline-none"
                                            placeholder="tu@email.com"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Contraseña
                                        </label>
                                        <input
                                            type="password"
                                            name="contrasena"
                                            value={formData.contrasena}
                                            onChange={handleInputChange}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent outline-none"
                                            placeholder="Mínimo 6 caracteres"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Confirmar contraseña
                                        </label>
                                        <input
                                            type="password"
                                            name="confirmarContrasena"
                                            value={formData.confirmarContrasena}
                                            onChange={handleInputChange}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent outline-none"
                                            placeholder="Repite tu contraseña"
                                        />
                                    </div>

                                    {error && (
                                        <div className="text-red-600 text-sm text-center bg-red-50 py-2 px-3 rounded">
                                            {error}
                                        </div>
                                    )}

                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="w-full bg-purple-600 hover:bg-purple-700 text-white font-medium py-3 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {loading ? 'Enviando código...' : 'Registrarse'}
                                    </button>

                                    <button
                                        type="button"
                                        onClick={() => setShowEmailForm(false)}
                                        className="w-full text-gray-600 hover:text-gray-800 text-sm font-medium"
                                    >
                                        ← Volver
                                    </button>
                                </form>
                            </>
                        )}

                        <p className="text-xs text-gray-500 text-center mt-6 leading-relaxed">
                            Al continuar, aceptas los {' '}
                            <a href="#" className="text-purple-600 hover:text-purple-700 underline">
                                Términos de servicio
                            </a> {' '}
                            y reconoce que ha leído nuestra {' '}
                            <a href="#" className="text-purple-600 hover:text-purple-700 underline">
                                Política de privacidad
                            </a>{' '}
                            de AirLink.
                        </p>

                        {!showEmailForm && (
                            <p className="text-xs text-gray-600 text-center mt-4">
                                ¿Ya tienes cuenta?{' '}
                                <button
                                    onClick={onSwitchToLogin}
                                    className="text-purple-600 hover:text-purple-700 font-semibold"
                                >
                                    Inicia sesión aquí
                                </button>
                            </p>
                        )}
                    </div>
                </div>

                <style>{`
                    @keyframes fadeIn {
                        from {
                            opacity: 0;
                            transform: scale(0.95);
                        }
                        to {
                            opacity: 1;
                            transform: scale(1);
                        }
                    }
                `}</style>
            </div>

            {/* Modal de verificación */}
            <VerificationModal
                isOpen={showVerification}
                onClose={() => setShowVerification(false)}
                email={registeredEmail}
                onVerified={handleVerified}
            />
        </>
    );
};

export default RegisterModal;