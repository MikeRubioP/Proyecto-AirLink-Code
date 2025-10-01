// src/Components/Navbar.jsx
import React, { useState, useRef, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { User, Menu, X } from 'lucide-react';
import airlinkLogo from '../assets/airlinkLogo2.png';
import LoginModal from './LoginModal'; // ← IMPORTAR EL MODAL

const Navbar = () => {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isLoginModalOpen, setIsLoginModalOpen] = useState(false); // ← NUEVO STATE
    const menuRef = useRef(null);
    const toggleRef = useRef(null);

    const toggleMobileMenu = () => {
        setIsMobileMenuOpen((s) => !s);
    };

    const handleLinkClick = () => {
        setIsMobileMenuOpen(false);
    };

    // ← NUEVA FUNCIÓN PARA ABRIR EL MODAL
    const handleUserClick = () => {
        setIsLoginModalOpen(true);
    };

    // ← NUEVA FUNCIÓN PARA CERRAR EL MODAL
    const handleCloseModal = () => {
        setIsLoginModalOpen(false);
    };

    useEffect(() => {
        const handleKey = (e) => {
            if (e.key === 'Escape') setIsMobileMenuOpen(false);
        };

        const handleOutsideClick = (e) => {
            if (
                menuRef.current &&
                !menuRef.current.contains(e.target) &&
                toggleRef.current &&
                !toggleRef.current.contains(e.target)
            ) {
                setIsMobileMenuOpen(false);
            }
        };

        if (isMobileMenuOpen) {
            document.addEventListener('keydown', handleKey);
            document.addEventListener('mousedown', handleOutsideClick);
        }

        return () => {
            document.removeEventListener('keydown', handleKey);
            document.removeEventListener('mousedown', handleOutsideClick);
        };
    }, [isMobileMenuOpen]);

    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth >= 768) setIsMobileMenuOpen(false);
        };
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const desktopBase = "px-3 py-2 text-sm font-medium transition-colors duration-200";
    const desktopActive = "text-purple-600 font-semibold";
    const desktopInactive = "text-gray-900 hover:text-purple-600";

    const mobileBase = "hover:bg-gray-50 block px-3 py-2 text-base font-medium rounded-md transition-colors duration-200";
    const mobileActive = "text-purple-600 font-semibold";
    const mobileInactive = "text-gray-900 hover:text-purple-600";

    return (
        <>
            <nav className="bg-white shadow-xs relative z-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        <div className="flex-shrink-0 flex items-center">
                            <NavLink to="/" onClick={handleLinkClick} className="flex items-center">
                                <img src={airlinkLogo} alt="AirLink" className="h-20 w-auto" />
                            </NavLink>
                        </div>

                        <div className="hidden md:block">
                            <div className="ml-10 flex items-baseline space-x-8">
                                <NavLink
                                    to="/"
                                    end
                                    onClick={handleLinkClick}
                                    className={({ isActive }) => `${isActive ? desktopActive : desktopInactive} ${desktopBase}`}
                                >
                                    Inicio
                                </NavLink>

                                <NavLink
                                    to="/ofertas"
                                    onClick={handleLinkClick}
                                    className={({ isActive }) => `${isActive ? desktopActive : desktopInactive} ${desktopBase}`}
                                >
                                    Ofertas
                                </NavLink>

                                <NavLink
                                    to="/cupones"
                                    onClick={handleLinkClick}
                                    className={({ isActive }) => `${isActive ? desktopActive : desktopInactive} ${desktopBase}`}
                                >
                                    Cupones
                                </NavLink>

                                <NavLink
                                    to="/contacto"
                                    onClick={handleLinkClick}
                                    className={({ isActive }) => `${isActive ? desktopActive : desktopInactive} ${desktopBase}`}
                                >
                                    Contacto
                                </NavLink>

                                <NavLink
                                    to="/sobre-nosotros"
                                    onClick={handleLinkClick}
                                    className={({ isActive }) => `${isActive ? desktopActive : desktopInactive} ${desktopBase}`}
                                >
                                    Sobre nosotros
                                </NavLink>
                            </div>
                        </div>

                        <div className="hidden md:block">
                            <button
                                onClick={handleUserClick} // ← CAMBIO AQUÍ
                                aria-label="Abrir mi cuenta"
                                className="bg-purple-600 hover:bg-purple-700 text-white p-2 rounded-full transition-colors duration-200"
                            >
                                <User className="h-5 w-5" />
                            </button>
                        </div>

                        {/* Menu Mobile */}
                        <div className="md:hidden">
                            <button
                                ref={toggleRef}
                                onClick={toggleMobileMenu}
                                aria-label={isMobileMenuOpen ? "Cerrar menú" : "Abrir menú"}
                                aria-controls="mobile-menu"
                                aria-expanded={isMobileMenuOpen}
                                className="inline-flex items-center justify-center p-2 rounded-md text-gray-900 hover:text-purple-600 hover:bg-gray-100 transition-colors duration-200"
                            >
                                {isMobileMenuOpen ? <X className="block h-6 w-6" /> : <Menu className="block h-6 w-6" />}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Mobile Navigation Menu */}
                {isMobileMenuOpen && (
                    <div
                        ref={menuRef}
                        id="mobile-menu"
                        className="md:hidden absolute top-16 inset-x-0 bg-white shadow-lg border-t"
                        role="menu"
                        aria-label="Menú móvil"
                    >
                        <div className="px-2 pt-2 pb-3 space-y-1">
                            <NavLink
                                to="/"
                                end
                                onClick={handleLinkClick}
                                className={({ isActive }) =>
                                    `${isActive ? mobileActive : mobileInactive} ${mobileBase}`
                                }
                                role="menuitem"
                            >
                                Inicio
                            </NavLink>

                            <NavLink
                                to="/ofertas"
                                onClick={handleLinkClick}
                                className={({ isActive }) =>
                                    `${isActive ? mobileActive : mobileInactive} ${mobileBase}`
                                }
                                role="menuitem"
                            >
                                Ofertas
                            </NavLink>

                            <NavLink
                                to="/cupones"
                                onClick={handleLinkClick}
                                className={({ isActive }) =>
                                    `${isActive ? mobileActive : mobileInactive} ${mobileBase}`
                                }
                                role="menuitem"
                            >
                                Cupones
                            </NavLink>

                            <NavLink
                                to="/contacto"
                                onClick={handleLinkClick}
                                className={({ isActive }) =>
                                    `${isActive ? mobileActive : mobileInactive} ${mobileBase}`
                                }
                                role="menuitem"
                            >
                                Contacto
                            </NavLink>

                            <NavLink
                                to="/sobre-nosotros"
                                onClick={handleLinkClick}
                                className={({ isActive }) =>
                                    `${isActive ? mobileActive : mobileInactive} ${mobileBase}`
                                }
                                role="menuitem"
                            >
                                Sobre nosotros
                            </NavLink>

                            <div className="pt-4 pb-3 border-t border-gray-200">
                                <div className="flex items-center px-3">
                                    <button
                                        aria-label="Mi cuenta"
                                        onClick={handleUserClick} // ← CAMBIO AQUÍ
                                        className="bg-purple-600 hover:bg-purple-700 text-white p-2 rounded-full transition-colors duration-200"
                                    >
                                        <User className="h-5 w-5" />
                                    </button>
                                    <span className="ml-3 text-gray-900 text-sm font-medium">Mi cuenta</span>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </nav>

            {/* ← MODAL DE LOGIN */}
            <LoginModal isOpen={isLoginModalOpen} onClose={handleCloseModal} />
        </>
    );
};

export default Navbar;