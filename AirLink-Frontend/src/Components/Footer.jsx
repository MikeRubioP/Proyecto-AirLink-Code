import React from "react";
import {
  FaFacebookF,
  FaTwitter,
  FaInstagram,
  FaLinkedinIn,
  FaYoutube,
} from "react-icons/fa";
import { HiMail, HiPhone, HiLocationMarker } from "react-icons/hi";
import airlinkLogo from "../assets/airlinkLogo.png"; // 👈 Import correcto del logo

const Footer = () => {
  return (
    <footer className="bg-white text-gray-700 border-t border-gray-200 mt-10">
      <div className="max-w-7xl mx-auto px-6 py-10 grid grid-cols-1 md:grid-cols-4 gap-8 text-sm">
        {/* 🟣 Logo y descripción */}
        <div>
          <img
            src={airlinkLogo}
            alt="AirLink"
            className="h-8 mb-4"
          />
          <p className="text-gray-500">
            Conectamos destinos, acercamos personas.
          </p>
          <div className="flex items-center gap-4 mt-4 text-gray-500">
            <FaFacebookF className="hover:text-blue-600 cursor-pointer transition" />
            <FaTwitter className="hover:text-sky-500 cursor-pointer transition" />
            <FaInstagram className="hover:text-pink-500 cursor-pointer transition" />
            <FaLinkedinIn className="hover:text-blue-700 cursor-pointer transition" />
            <FaYoutube className="hover:text-red-600 cursor-pointer transition" />
          </div>
        </div>

        {/* 🟣 Cuenta */}
        <div>
          <h3 className="font-semibold mb-3 text-gray-800">Cuenta</h3>
          <ul className="space-y-2">
            <li className="hover:text-blue-600 cursor-pointer">Mis viajes</li>
            <li className="hover:text-blue-600 cursor-pointer">Cuenta</li>
            <li className="hover:text-blue-600 cursor-pointer">Check In</li>
          </ul>
        </div>

        {/* 🟣 Somos AirLink */}
        <div>
          <h3 className="font-semibold mb-3 text-gray-800">Somos AirLink</h3>
          <ul className="space-y-2">
            <li className="hover:text-blue-600 cursor-pointer">Quiénes somos</li>
            <li className="hover:text-blue-600 cursor-pointer">Contáctanos</li>
            <li className="hover:text-blue-600 cursor-pointer">Preguntas frecuentes</li>
          </ul>
        </div>

        {/* 🟣 Contacto */}
        <div>
          <h3 className="font-semibold mb-3 text-gray-800">Contacto</h3>
          <ul className="space-y-3 text-gray-600">
            <li className="flex items-center gap-2">
              <HiMail className="text-blue-600" />
              <span>viajes@airlink.com</span>
            </li>
            <li className="flex items-center gap-2">
              <HiPhone className="text-blue-600" />
              <span>(56) 9 2687 5892</span>
            </li>
            <li className="flex items-start gap-2">
              <HiLocationMarker className="text-blue-600 mt-1" />
              <span>
                Av. Alameda Libertador Bernardo O’Higgins 1255, Santiago
              </span>
            </li>
          </ul>
        </div>
      </div>

      {/* 🟣 Línea inferior */}
      <div className="border-t border-gray-200 py-4 text-center text-sm text-gray-500">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center px-6 gap-2">
          <p>Copyright © 2025</p>
          <p>
            Todos los derechos reservados |{" "}
            <a href="#" className="text-blue-600 hover:underline">
              Términos y condiciones
            </a>{" "}
            |{" "}
            <a href="#" className="text-blue-600 hover:underline">
              Política de privacidad
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
