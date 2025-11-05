// src/Components/Guards.jsx
import { Navigate, useLocation } from "react-router-dom";

/* Util seguro para leer JSON desde localStorage */
const getLS = (k) => {
  try {
    const raw = localStorage.getItem(k);
    if (raw === null) return null;
    if (raw === "null" || raw === "undefined" || raw.trim() === "") return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
};

/* ======== Reglas de negocio reutilizables ======== */

// 1) ¿Hay búsqueda hecha?
const hasSearch = () => {
  const s = getLS("searchState") || getLS("vueloSeleccionado");
  return Boolean(s?.origen && s?.destino && s?.fechaIda);
};

// 2) ¿Hay vuelo de ida elegido?
const hasFlightOut = () => {
  const d = getLS("vueloSeleccionado");
  return Boolean(d?.vueloIda && d?.tarifaIda);
};

// 3) ¿El viaje es ida y vuelta?
const isRoundTrip = () => {
  const s = getLS("searchState") || {};
  return Boolean(
    s?.idaVuelta === true ||
      s?.roundTrip === true ||
      s?.tipo === "roundtrip" ||
      s?.tipoViaje === "RT" ||
      s?.vueltaRequerida === true
  );
};

// 4) Si es ida y vuelta, ¿hay vuelo de vuelta elegido?
const hasReturnIfNeeded = () => {
  if (!isRoundTrip()) return true; // si es solo ida, no exigir
  const d = getLS("vueloSeleccionado");
  return Boolean(d?.vueloVuelta && d?.tarifaVuelta);
};

// 5) ¿Checkout listo?
const isCheckoutReady = () => {
  const chk = getLS("checkout") || getLS("checkout_ready");
  // Acepta varias formas posibles de marcar "listo"
  const ready =
    chk === true ||
    chk?.ready === true ||
    chk?.estado === "ready" ||
    chk?.status === "ready";
  // En fallback, que exista al menos ida (y si aplica, vuelta)
  return ready && hasFlightOut() && hasReturnIfNeeded();
};

// 6) ¿Usuario autenticado?
const isAuth = () => {
  const token =
    localStorage.getItem("token") || localStorage.getItem("authToken");
  const user = getLS("user") || getLS("auth");
  return Boolean(token || user?.id || user?.email);
};

// 6.1) **Checkout invitado permitido** (opción B)
// Si el checkout está listo, permitimos pasar aunque no haya sesión.
const hasGuestCheckout = () => {
  const chk = getLS("checkout") || getLS("checkout_ready");
  return Boolean(
    chk === true ||
      chk?.ready === true ||
      chk?.estado === "ready" ||
      chk?.status === "ready"
  );
};

/* ======== Guards como componentes ======== */

export function RequireSearch({ children }) {
  const loc = useLocation();
  return hasSearch() ? (
    children
  ) : (
    <Navigate to="/vuelos" state={{ from: loc }} replace />
  );
}

export function RequireFlightOut({ children }) {
  const loc = useLocation();
  return hasFlightOut() ? (
    children
  ) : (
    <Navigate to="/vuelos" state={{ from: loc }} replace />
  );
}

export function RequireReturnIfRoundTrip({ children }) {
  const loc = useLocation();
  return hasReturnIfNeeded() ? (
    children
  ) : (
    <Navigate to="/vuelos/vuelta" state={{ from: loc }} replace />
  );
}

export function RequireCheckoutReady({ children }) {
  const loc = useLocation();
  return isCheckoutReady() ? (
    children
  ) : (
    <Navigate to="/vuelos/detalleviaje" state={{ from: loc }} replace />
  );
}

/**
 * Opción B:
 * - Permite el acceso si hay sesión (token/usuario) **o** si el checkout invitado está listo.
 * - Mantiene el redirect clásico a /mi-cuenta cuando no se cumple ninguna de las dos.
 */
export function RequireAuth({ children }) {
  const loc = useLocation();
  if (isAuth() || hasGuestCheckout()) return children;
  return <Navigate to="/mi-cuenta" state={{ from: loc }} replace />;
}
