// AirLink-Backend/integrations/vuelos.routes.js
import express from "express";

export const router = express.Router(); // ⬅️ export nombrado (coincide con tu import en index.js)

const like = (s) => `%${s}%`;

/* ===========================
   BUSCAR VUELOS
   GET /vuelos/buscar?origen=SCL&destino=PMC&fecha=2025-11-03&clase=eco
   Devuelve: idViaje, horaSalida, horaLlegada, duracion, origen/destino, empresa, modelo,
             precio (mínimo), tarifasDisponibles, asientosDisponibles, etc.
=========================== */
router.get("/buscar", async (req, res) => {
  try {
    const db = req.app.get("db");
    const { origen = "SCL", destino, fecha, clase } = req.query;

    if (!destino || !fecha) {
      return res
        .status(400)
        .json({ error: "Faltan parámetros requeridos", message: "Se requiere destino y fecha" });
    }

    // Si viene ciudad en lugar de código IATA (3 letras), convertir
    let destinoCodigo = destino;
    if (destino && destino.length > 3) {
      const [terminalResult] = await db.query(
        `SELECT codigo FROM terminal WHERE ciudad LIKE ? LIMIT 1`,
        [like(destino)]
      );
      if (terminalResult.length > 0) destinoCodigo = terminalResult[0].codigo;
    }

    const [vuelos] = await db.query(
      `
      SELECT
        v.idViaje,
        DATE(v.salida)                                 AS fecha,
        TIME_FORMAT(v.salida,  '%H:%i')                AS horaSalida,
        TIME_FORMAT(v.llegada, '%H:%i')                AS horaLlegada,
        TIMESTAMPDIFF(MINUTE, v.salida, v.llegada)     AS duracion,

        t1.codigo          AS origenCodigo,
        t1.ciudad          AS origenCiudad,
        t1.nombreTerminal  AS origenNombre,

        t2.codigo          AS destinoCodigo,
        t2.ciudad          AS destinoCiudad,
        t2.nombreTerminal  AS destinoNombre,

        e.nombreEmpresa    AS empresa,
        e.logo             AS empresaLogo,

        eq.modelo,
        eq.matricula,

        MIN(vt.precio)                         AS precio,               -- precio base (mínimo)
        COUNT(DISTINCT vt.idTarifa)            AS tarifasDisponibles,   -- Nº de tarifas cargadas
        SUM(vt.cupos)                          AS asientosDisponibles,
        v.estado
      FROM viaje v
      JOIN ruta            r   ON v.idRuta           = r.idRuta
      JOIN terminal        t1  ON r.idTerminalOrigen = t1.idTerminal
      JOIN terminal        t2  ON r.idTerminalDestino= t2.idTerminal
      JOIN empresa_equipo  eq  ON v.idEquipo         = eq.idEquipo
      JOIN empresa         e   ON eq.idEmpresa       = e.idEmpresa
      LEFT JOIN viaje_tarifa vt ON v.idViaje         = vt.idViaje
      WHERE t1.codigo = ? 
        AND t2.codigo = ? 
        AND DATE(v.salida) = ?
        AND v.estado = 'programado'
        AND vt.cupos > 0
      GROUP BY v.idViaje, v.salida, v.llegada,
               t1.codigo, t1.ciudad, t1.nombreTerminal,
               t2.codigo, t2.ciudad, t2.nombreTerminal,
               e.nombreEmpresa, e.logo, eq.modelo, eq.matricula, v.estado
      ORDER BY MIN(vt.precio) ASC
      `,
      [origen, destinoCodigo, fecha]
    );

    res.json(vuelos);
  } catch (error) {
    console.error("❌ Error buscando vuelos:", error);
    res.status(500).json({ error: "Error al buscar vuelos", message: error.message });
  }
});

/* ===========================
   OBTENER CÓDIGO DE TERMINAL DESDE CIUDAD
   GET /vuelos/destinos/:ciudad/codigo
=========================== */
router.get("/destinos/:ciudad/codigo", async (req, res) => {
  try {
    const db = req.app.get("db");
    const { ciudad } = req.params;

    const [result] = await db.query(
      `SELECT codigo, ciudad, nombreTerminal FROM terminal WHERE ciudad LIKE ? LIMIT 1`,
      [like(ciudad)]
    );

    if (result.length > 0) return res.json(result[0]);
    return res.status(404).json({ error: "Ciudad no encontrada", ciudad });
  } catch (error) {
    console.error("❌ Error obteniendo código de ciudad:", error);
    res.status(500).json({ error: "Error del servidor", message: error.message });
  }
});

/* ===========================
   LISTAR DESTINOS
   GET /vuelos/destinos
=========================== */
router.get("/destinos", async (req, res) => {
  try {
    const db = req.app.get("db");
    const [destinos] = await db.query(`
      SELECT DISTINCT
        t.idTerminal, t.codigo, t.ciudad, t.nombreTerminal, t.imagen,
        tt.nombreTipoTerminal AS tipo
      FROM terminal t
      JOIN tipo_terminal tt ON t.idTipoTerminal = tt.idTipoTerminal
      WHERE t.activo = 1
      ORDER BY t.ciudad
    `);
    res.json(destinos);
  } catch (error) {
    console.error("❌ Error obteniendo destinos:", error);
    res.status(500).json({ error: "Error al obtener destinos", message: error.message });
  }
});

/* ===========================
   TARIFAS POR VIAJE (para el modal de tarifas)
   GET /vuelos/viajes/:idViaje/tarifas
   Devuelve cada tarifa con su precio/cupos y metadatos de tarifa/cabina
=========================== */
router.get("/viajes/:idViaje/tarifas", async (req, res) => {
  const db = req.app.get("db");
  const { idViaje } = req.params;

  try {
    console.log("➡️  GET /vuelos/viajes/:idViaje/tarifas", idViaje);

    const [rows] = await db.query(
      `
      SELECT
        vt.idViajeTarifa,
        vt.idTarifa,
        t.codigoTarifa,
        t.nombreTarifa,
        vt.precio,
        vt.moneda,
        vt.cupos,
        t.equipaje_incl_kg,
        t.cambios,
        t.reembolsable,
        t.condiciones,
        cc.nombreCabinaClase,
        cc.descripcion AS descripcionCabina
      FROM viaje_tarifa vt
      JOIN tarifa       t  ON t.idTarifa      = vt.idTarifa
      JOIN cabina_clase cc ON cc.idCabinaClase = t.idCabinaClase
      WHERE vt.idViaje = ?
      ORDER BY vt.idTarifa ASC
      `,
      [idViaje]
    );

    // Devolvemos arreglo (vacío si no hay) → NO 404
    return res.json(rows);
  } catch (err) {
    console.error("❌ Error obteniendo tarifas:", err);
    res.status(500).json({ error: "Error obteniendo tarifas", message: err.message });
  }
});

/* ===========================
   DETALLE DE UN VIAJE
   GET /vuelos/:idViaje
=========================== */
router.get("/:idViaje", async (req, res) => {
  try {
    const db = req.app.get("db");
    const { idViaje } = req.params;

    const [vuelo] = await db.query(
      `
      SELECT 
        v.idViaje, v.salida, v.llegada, v.estado,
        t1.codigo         AS origenCodigo,
        t1.ciudad         AS origenCiudad,
        t1.nombreTerminal AS origenNombre,
        t2.codigo         AS destinoCodigo,
        t2.ciudad         AS destinoCiudad,
        t2.nombreTerminal AS destinoNombre,
        e.nombreEmpresa   AS empresa,
        e.logo            AS empresaLogo,
        eq.modelo,
        eq.capacidad,
        r.distanciaKm,
        r.duracionEstimadaMin
      FROM viaje v
      JOIN ruta            r   ON v.idRuta            = r.idRuta
      JOIN terminal        t1  ON r.idTerminalOrigen  = t1.idTerminal
      JOIN terminal        t2  ON r.idTerminalDestino = t2.idTerminal
      JOIN empresa_equipo  eq  ON v.idEquipo          = eq.idEquipo
      JOIN empresa         e   ON eq.idEmpresa        = e.idEmpresa
      WHERE v.idViaje = ?
      LIMIT 1
      `,
      [idViaje]
    );

    if (vuelo.length === 0) {
      return res.status(404).json({ error: "Vuelo no encontrado" });
    }

    // (Opcional) Traer tarifas aquí también si quieres un detalle completo
    const [tarifas] = await db.query(
      `
      SELECT 
        vt.idViajeTarifa, vt.idTarifa, vt.precio, vt.moneda, vt.cupos,
        t.codigoTarifa, t.nombreTarifa, t.equipaje_incl_kg, t.cambios, t.reembolsable, t.condiciones,
        cc.nombreCabinaClase, cc.descripcion AS descripcionCabina
      FROM viaje_tarifa vt
      JOIN tarifa       t  ON t.idTarifa       = vt.idTarifa
      JOIN cabina_clase cc ON cc.idCabinaClase = t.idCabinaClase
      WHERE vt.idViaje = ? AND t.activo = 1
      ORDER BY vt.precio ASC
      `,
      [idViaje]
    );

    res.json({ vuelo: vuelo[0], tarifas });
  } catch (error) {
    console.error("❌ Error obteniendo detalles del vuelo:", error);
    res.status(500).json({ error: "Error al obtener detalles del vuelo", message: error.message });
  }
});
