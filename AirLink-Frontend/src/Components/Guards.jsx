// src/Components/Guards.jsx
import { Navigate, useLocation } from "react-router-dom";

/* -------- Util seguro para leer JSON desde localStorage -------- */
const getLS = (k) => {
  try {
    const raw = localStorage.getItem(k);
    if (!raw || raw === "null" || raw === "undefined") return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
};

const isNonEmptyStr = (v) => typeof v === "string" && v.trim().length > 0;

/* -------- Frescura opcional (desactiva si no usas __ts) -------- */
const isFresh = (obj, maxMinutes = 120) => {
  if (!obj || typeof obj !== "object") return false;
  if (typeof obj.__ts !== "number") return false;
  const ageMin = (Date.now() - obj.__ts) / 60000;
  return ageMin >= 0 && ageMin <= maxMinutes;
};

/* -------- Reglas de negocio -------- */
const hasSearch = () => {
  const s = getLS("searchState");
  const shapeOK =
    s &&
    isNonEmptyStr(s.origen) &&
    isNonEmptyStr(s.destino) &&
    (isNonEmptyStr(s.fechaIda) || typeof s.fechaIda === "number");
  // si no usas timestamps, cambia a: return Boolean(shapeOK);
  return Boolean(shapeOK && isFresh(s, 120));
};

const hasFlightOut = () => {
  const d = getLS("vueloSeleccionado");
  const shapeOK =
    d &&
    (isNonEmptyStr(d.vueloIda) || typeof d.vueloIda === "object") &&
    (isNonEmptyStr(d.tarifaIda) || typeof d.tarifaIda === "object");
  return Boolean(shapeOK && isFresh(d, 120));
};

const isRoundTrip = () => {
  const s = getLS("searchState");
  if (!isFresh(s, 120)) return false;
  return Boolean(
    s?.idaVuelta === true ||
      s?.roundTrip === true ||
      s?.tipo === "roundtrip" ||
      s?.tipoViaje === "RT" ||
      s?.vueltaRequerida === true
  );
};

const hasReturnIfNeeded = () => {
  if (!isRoundTrip()) return true;
  const d = getLS("vueloSeleccionado");
  const shapeOK =
    d &&
    (isNonEmptyStr(d.vueloVuelta) || typeof d.vueloVuelta === "object") &&
    (isNonEmptyStr(d.tarifaVuelta) || typeof d.tarifaVuelta === "object");
  return Boolean(shapeOK && isFresh(d, 120));
};

const isCheckoutReady = () => {
  const chk = getLS("checkout") || getLS("checkout_ready");
  const ready =
    chk === true ||
    chk?.ready === true ||
    chk?.estado === "ready" ||
    chk?.status === "ready";
  return Boolean(ready && isFresh(chk, 120) && hasFlightOut() && hasReturnIfNeeded());
};

const isAuth = () => {
  const token = localStorage.getItem("token") || localStorage.getItem("authToken");
  const user = getLS("user") || getLS("auth");
  return Boolean(token || user?.id || user?.email);
};

/* -------- Redirección por defecto: Home -------- */
const DEFAULT_REDIRECT = "/";

/* -------- Guards (exports nombrados) -------- */
export function RequireSearch({ children }) {
  const loc = useLocation();
  return hasSearch()
    ? children
    : <Navigate to={DEFAULT_REDIRECT} state={{ from: loc }} replace />;
}

export function RequireFlightOut({ children }) {
  const loc = useLocation();
  // si quieres exigir también búsqueda fresca aquí:
  // return (hasSearch() && hasFlightOut()) ? children : <Navigate ... />
  return hasFlightOut()
    ? children
    : <Navigate to={DEFAULT_REDIRECT} state={{ from: loc }} replace />;
}

export function RequireReturnIfRoundTrip({ children }) {
  const loc = useLocation();
  return hasReturnIfNeeded()
    ? children
    : <Navigate to={DEFAULT_REDIRECT} state={{ from: loc }} replace />;
}

export function RequireCheckoutReady({ children }) {
  const loc = useLocation();
  return isCheckoutReady()
    ? children
    : <Navigate to={DEFAULT_REDIRECT} state={{ from: loc }} replace />;
}

export function RequireAuth({ children }) {
  const loc = useLocation();
  return isAuth()
    ? children
    : <Navigate to="/mi-cuenta" state={{ from: loc }} replace />;
}

/* (Opcional) Sin export default para evitar confusiones con named exports */
