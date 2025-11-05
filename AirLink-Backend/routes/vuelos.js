// routes/vuelos.js
import express from "express";
const router = express.Router();

// Tarifas por idViaje
router.get("/viajes/:idViaje/tarifas", async (req, res) => {
  const db = req.app.get("db");
  const idViaje = Number(req.params.idViaje);

  if (!Number.isInteger(idViaje) || idViaje <= 0) {
    return res.status(400).json({ error: "idViaje inválido" });
  }

  try {
    const [rows] = await db.query(
      `
      SELECT
        vt.idTarifa,
        t.nombre     AS nombreTarifa,
        vt.precio,
        vt.moneda,
        vt.cupos
      FROM viaje_tarifa vt
      JOIN tarifa t ON t.idTarifa = vt.idTarifa
      WHERE vt.idViaje = ?
      ORDER BY vt.idTarifa
      `,
      [idViaje]
    );

    if (!rows || rows.length === 0) {
      return res.status(404).json([]); // sin tarifas para ese viaje
    }

    // Normaliza tipos numéricos por si vienen como strings
    const normalizadas = rows.map(r => ({
      idTarifa: Number(r.idTarifa),
      nombreTarifa: r.nombreTarifa,
      precio: Number(r.precio),
      moneda: r.moneda,
      cupos: Number(r.cupos ?? 0),
    }));

    res.json(normalizadas);
  } catch (err) {
    console.error("Error obteniendo tarifas:", err);
    res.status(500).json({ error: "Error obteniendo tarifas" });
  }
});

export default router;
