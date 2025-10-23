import { createContext, useContext, useState, useMemo } from "react";

const VueloCtx = createContext(undefined);

export function VueloProvider({ children }) {
  const [form, setForm] = useState({
    origen: "",
    destino: "",
    fechaIda: "",
    fechaVuelta: "",
    pasajeros: "1",
    cabina: "Económica",
    vueloIda: null,
    vueloVuelta: null,
  });

  const value = useMemo(() => ({ form, setForm }), [form]);
  return <VueloCtx.Provider value={value}>{children}</VueloCtx.Provider>;
}

export function useVuelo() {
  const ctx = useContext(VueloCtx);
  if (ctx === undefined) {
    throw new Error("useVuelo debe usarse dentro de VueloProvider");
  }
  return ctx;
}
