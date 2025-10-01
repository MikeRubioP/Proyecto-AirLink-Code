// src/Components/LoginModal.jsx
import React, { useRef, useEffect } from 'react';
import { X } from 'lucide-react';
import airlinkLogo from '../assets/airlinkLogo2.png';

const LoginModal = ({ isOpen, onClose }) => {
    const modalRef = useRef(null);

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

    if (!isOpen) return null;

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
                    {/* Logo */}
                    <div className="mb-6">
                        <img src={airlinkLogo} alt="AirLink" className="h-20 w-auto" />
                    </div>

                    {/* Título */}
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Inicia sesión</h2>
                    <p className="text-sm text-gray-600 text-center mb-6">
                        o{' '}
                        <button className="text-purple-600 hover:text-purple-700 font-medium">
                            crea una cuenta
                        </button>
                    </p>

                    {/* Botón Continuar con correo */}
                    <button className="w-full bg-purple-600 hover:bg-purple-700 text-white font-medium py-3 px-4 rounded-lg transition-colors mb-3">
                        Continuar con correo
                    </button>

                    {/* Botón Continuar con Google */}
                    <button className="w-full bg-white hover:bg-gray-50 text-gray-900 font-medium py-3 px-4 rounded-lg border border-gray-300 transition-colors flex items-center justify-center gap-2">
                        <svg className="h-5 w-5" viewBox="0 0 24 24">
                            <path
                                fill="#4285F4"
                                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                            />
                            <path
                                fill="#34A853"
                                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                            />
                            <path
                                fill="#FBBC05"
                                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                            />
                            <path
                                fill="#EA4335"
                                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                            />
                        </svg>
                        Continuar con Google
                    </button>

                    {/* Política y términos */}
                    <p className="text-xs text-gray-500 text-center mt-6 leading-relaxed">
                        Al hacer clic en iniciar sesión, aceptas la{' '}
                        <a href="#" className="text-purple-600 hover:text-purple-700 underline">
                            Política de privacidad
                        </a>{' '}
                        y los{' '}
                        <a href="#" className="text-purple-600 hover:text-purple-700 underline">
                            Términos y condiciones
                        </a>{' '}
                        de AirLink.
                    </p>

                    {/* Código de registro */}
                    <p className="text-xs text-gray-600 text-center mt-4">
                        ¿Ya tienes cuenta? Regístrate con el código{' '}
                        <span className="font-semibold">CLIÉ</span>
                    </p>
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