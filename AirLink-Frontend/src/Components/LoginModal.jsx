import React, { useRef, useEffect, useState } from 'react';
import { X } from 'lucide-react';
import airlinkLogo from '../assets/airlinkLogo2.png';
import { GoogleLogin } from "@react-oauth/google";
import { jwtDecode } from "jwt-decode";
import axios from "axios";
import { useAuth } from '../context/AuthContext';

const LoginModal = ({ isOpen, onClose, onSwitchToRegister }) => {
    const modalRef = useRef(null);
    const { login } = useAuth(); // ← Solo necesitas login
    const [showEmailForm, setShowEmailForm] = useState(false);
    const [formData, setFormData] = useState({
        email: '',
        contrasena: ''
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const handleEscape = (e) => {
            if (e.key === 'Escape') onClose();
        };

        const handleOutsideClick = (e) => {
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
    }, [isOpen, onClose]);

    useEffect(() => {
        if (!isOpen) {
            setShowEmailForm(false);
            setFormData({ email: '', contrasena: '' });
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

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');

        if (!formData.email || !formData.contrasena) {
            setError('Todos los campos son obligatorios');
            return;
        }

        setLoading(true);

        try {
            const res = await axios.post("http://localhost:5174/auth/login", {
                email: formData.email,
                contrasena: formData.contrasena,
            });

            // Usar el login del context
            login(res.data.usuario, res.data.token);
            console.log("Login correcto:", res.data.usuario);
            onClose();
            // NO uses window.location.reload() - el context se encargará
        } catch (err) {
            setError(err.response?.data?.message || "Error en login");
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleSuccess = async (credentialResponse) => {
        try {
            const decoded = jwtDecode(credentialResponse.credential);
            console.log("Usuario de Google:", decoded);

            const res = await axios.post("http://localhost:5174/auth/google", {
                googleId: decoded.sub,
                email: decoded.email,
                nombreUsuario: decoded.name,
            });

            // Usar el login del context
            login(res.data.usuario, res.data.token);
            onClose();
            // NO uses window.location.reload()
        } catch (err) {
            setError(err.response?.data?.message || "Error en login con Google");
        }
    };

    return (
        <div className="fixed inset-0 flex items-center justify-center z-[60] p-4" style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}>
            <div
                ref={modalRef}
                className="bg-white rounded-lg shadow-xl max-w-md w-full p-8 relative"
                style={{
                    animation: 'fadeIn 0.2s ease-out'
                }}
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
                        Inicia sesión
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
                                    onError={() => setError("❌ Error en login con Google")}
                                />
                            </div>
                        </>
                    ) : (
                        <>
                            <form onSubmit={handleLogin} className="w-full space-y-4">
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
                                        placeholder="Tu contraseña"
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
                                    {loading ? 'Iniciando sesión...' : 'Iniciar sesión'}
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
                            ¿No tienes cuenta?{' '}
                            <button
                                onClick={onSwitchToRegister}
                                className="text-purple-600 hover:text-purple-700 font-semibold"
                            >
                                Regístrate aquí
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
    );
};

export default LoginModal;