import { Router } from "express";
export const router = Router();

// POST /buses/search  -> devuelve resultados mock (cámbialos por tu query real)
router.post("/search", async (req, res) => {
  const { origen_comuna, destino_comuna, fecha_ida } = req.body || {};
  const sample = [
    { id: 1, brand: "FLIXBUS", salida: "07:00", llegada: "13:35",
      fecha: fecha_ida, cabina: ["Salón Cama", "Salón Cama (I)"],
      precio: { now: 18030, old: 20090 }, duracion: "6:35 horas", qr: true }
  ];
  res.json({ filtros: { origen_comuna, destino_comuna, fecha_ida }, resultados: sample });
});
