<<<<<<< HEAD
import airlinkLogo from "../assets/airlinkLogo.png";

export default function Footer() {
  return (
    <footer className="bg-white border-t border-gray-200 text-gray-700 text-sm">
      {/* Contenido principal */}
      <div className="max-w-6xl mx-auto px-4 py-10 grid grid-cols-1 md:grid-cols-4 gap-8">
        {/* Columna 1: Logo + descripción + redes */}
        <div className="text-left">
          {/* Logo marca */}
          <div className="flex items-center gap-2 mb-4">
            <img
              src={airlinkLogo}
              alt="Airlink logo"
              className="h-14 w-auto object-contain"
            />
          </div>

          {/* Descripción corta */}
          <p className="text-gray-500 leading-relaxed text-[13px] max-w-[220px]">
            Lorem ipsum dolor sit amet consectetur adipiscing elit aliquam
          </p>

          {/* Redes sociales */}
          <div className="flex items-center gap-3 mt-4 text-purple-600">
            {/* Facebook */}
            <a
              href="#"
              aria-label="Facebook"
              className="hover:text-purple-800 transition"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="w-4 h-4"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M22 12.07C22 6.51 17.52 2 12 2S2 6.51 2 12.07c0 5.02 3.66 9.18 8.44 9.93v-7.03H8.08v-2.9h2.36v-2.22c0-2.33 1.38-3.62 3.5-3.62.7 0 1.43.12 2.13.24v2.35h-1.2c-1.18 0-1.55.74-1.55 1.5v1.75h2.64l-.42 2.9h-2.22v7.03C18.34 21.25 22 17.09 22 12.07z" />
              </svg>
            </a>

            {/* Twitter */}
            <a
              href="#"
              aria-label="Twitter"
              className="hover:text-purple-800 transition"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="w-4 h-4"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M22.46 6c-.77.35-1.6.58-2.46.69a4.28 4.28 0 0 0 1.88-2.37 8.59 8.59 0 0 1-2.72 1.05 4.27 4.27 0 0 0-7.5 2.92c0 .34.04.67.1.98A12.1 12.1 0 0 1 3.15 4.9a4.27 4.27 0 0 0 1.32 5.7 4.24 4.24 0 0 1-1.94-.54v.05c0 2.07 1.5 3.8 3.48 4.2-.36.1-.74.15-1.13.15-.28 0-.55-.03-.81-.08a4.28 4.28 0 0 0 4 2.98A8.57 8.57 0 0 1 2 19.54a12.07 12.07 0 0 0 6.56 1.92c7.88 0 12.2-6.53 12.2-12.2v-.56A8.7 8.7 0 0 0 24 5.5a8.5 8.5 0 0 1-2.54.7z" />
              </svg>
            </a>

            {/* Instagram */}
            <a
              href="#"
              aria-label="Instagram"
              className="hover:text-purple-800 transition"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="w-4 h-4"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M7 2C4.243 2 2 4.243 2 7v10c0 2.757 2.243 5 5 5h10c2.757 0 5-2.243 5-5V7c0-2.757-2.243-5-5-5H7zm10 2c1.654 0 3 1.346 3 3v10c0 1.654-1.346 3-3 3H7c-1.654 0-3-1.346-3-3V7c0-1.654 1.346-3 3-3h10zm-1.5 2a1 1 0 100 2 1 1 0 000-2zM12 7a5 5 0 100 10 5 5 0 000-10zm0 2a3 3 0 110 6 3 3 0 010-6z" />
              </svg>
            </a>

            {/* LinkedIn */}
            <a
              href="#"
              aria-label="LinkedIn"
              className="hover:text-purple-800 transition"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="w-4 h-4"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M4.98 3.5c0 1.38-1.1 2.5-2.48 2.5A2.49 2.49 0 010 3.5C0 2.12 1.1 1 2.5 1S5 2.12 5 3.5zM.5 8h4v14h-4V8zm7 0h3.8v2h.1c.53-1 1.82-2.1 3.76-2.1 4.02 0 4.77 2.6 4.77 6v8h-4v-7.1c0-1.7-.03-3.8-2.3-3.8-2.3 0-2.7 1.8-2.7 3.7V22h-4V8z" />
              </svg>
            </a>

            {/* YouTube */}
            <a
              href="#"
              aria-label="YouTube"
              className="hover:text-purple-800 transition"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="w-4 h-4"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M21.6 7.2c-.2-1-.9-1.8-1.9-2-1.7-.4-4.7-.4-4.7-.4s-3 0-4.7.4c-1 .2-1.7 1-1.9 2-.3 1.4-.3 4.3-.3 4.3s0 2.9.3 4.3c.2 1 .9 1.8 1.9 2 1.7.4 4.7.4 4.7.4s3 0 4.7-.4c1-.2 1.7-1 1.9-2 .3-1.4.3-4.3.3-4.3s0-2.9-.3-4.3zM10 14.5v-6l5.2 3-5.2 3z" />
              </svg>
            </a>
          </div>
        </div>

        {/* Columna 2: Cuenta */}
        <div>
          <h3 className="text-gray-900 font-medium mb-4 text-sm">Cuenta</h3>
          <ul className="space-y-2 text-[13px]">
            <li><a href="#" className="hover:text-purple-600">Mis viajes</a></li>
            <li><a href="#" className="hover:text-purple-600">Cuenta</a></li>
            <li><a href="#" className="hover:text-purple-600">Check In</a></li>
          </ul>
        </div>

        {/* Columna 3: Somos AirLink */}
        <div>
          <h3 className="text-gray-900 font-medium mb-4 text-sm">Somos AirLink</h3>
          <ul className="space-y-2 text-[13px]">
            <li><a href="#" className="hover:text-purple-600">Quiénes somos</a></li>
            <li><a href="#" className="hover:text-purple-600">Contáctanos</a></li>
            <li><a href="#" className="hover:text-purple-600">Preguntas Frecuentes</a></li>
          </ul>
        </div>

        {/* Columna 4: Contacto */}
        <div>
          <h3 className="text-gray-900 font-medium mb-4 text-sm">Contacto</h3>
          <ul className="space-y-3 text-[13px] text-gray-600">
            <li className="flex items-start gap-2">
              {/* mail icon */}
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="w-4 h-4 text-purple-600 flex-shrink-0 mt-[2px]"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth="1.5"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.5a2.25 2.25 0 01-2.32 0l-7.5-4.5A2.25 2.25 0 013 6.993V6.75"
                />
              </svg>
              <span className="text-gray-600">viajes@airlink.com</span>
            </li>

            <li className="flex items-start gap-2">
              {/* phone icon */}
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="w-4 h-4 text-purple-600 flex-shrink-0 mt-[2px]"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth="1.5"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M2.25 6.75c0 8.284 6.716 15 15 15h1.5a2.25 2.25 0 002.25-2.25v-2.1c0-.516-.351-.966-.852-1.091l-3.423-.856a1.125 1.125 0 00-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.39-.292.563-.79.417-1.173l-.856-3.423a1.125 1.125 0 00-1.091-.852h-2.1A2.25 2.25 0 002.25 4.5v2.25z"
                />
              </svg>
              <span className="text-gray-600">(56) 9 2687 5892</span>
            </li>

            <li className="flex items-start gap-2">
              {/* location icon */}
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="w-4 h-4 text-purple-600 flex-shrink-0 mt-[2px]"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth="1.5"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z"
                />
              </svg>
              <span className="text-gray-600 leading-relaxed">
                Av. Alameda Libertador Bernardo O'Higgins 1255, Santiago
=======
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
>>>>>>> 0dda0840a17526eee628f77526a0142d4df0ef81
              </span>
            </li>
          </ul>
        </div>
      </div>

<<<<<<< HEAD
      {/* Línea gris separadora + legal */}
      <div className="border-t border-gray-200">
        <div className="max-w-6xl mx-auto px-4 py-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 text-[12px] text-gray-500">
          <div className="whitespace-nowrap">Copyright © 2025</div>

          <div className="text-center flex-1 text-gray-500">
            Todos los derechos reservados |
            <a
              href="#"
              className="text-gray-700 hover:text-purple-600 ml-1"
            >
              Términos y condiciones
            </a>
            <span className="mx-1 text-gray-400">|</span>
            <a href="#" className="text-gray-700 hover:text-purple-600">
              Política de privacidad
            </a>
          </div>
=======
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
>>>>>>> 0dda0840a17526eee628f77526a0142d4df0ef81
        </div>
      </div>
    </footer>
  );
<<<<<<< HEAD
}
=======
};

export default Footer;
>>>>>>> 0dda0840a17526eee628f77526a0142d4df0ef81
