import express from "express";

const router = express.Router();

// ============================================
// BUSCAR VUELOS
// ============================================
router.get("/buscar", async (req, res) => {
  try {
    const db = req.app.get("db");
    const { origen = "SCL", destino, fecha, clase } = req.query;

    console.log("Búsqueda de vuelos:", { origen, destino, fecha, clase });

    // Validar parámetros requeridos
    if (!destino || !fecha) {
      return res.status(400).json({
        error: "Faltan parámetros requeridos",
        message: "Se requiere destino y fecha",
      });
    }

    // Si viene ciudad en lugar de código, convertir
    let destinoCodigo = destino;

    // Si el destino no es un código de 3 letras, buscar por ciudad
    if (destino && destino.length > 3) {
      const [terminalResult] = await db.query(
        "SELECT codigo FROM terminal WHERE ciudad LIKE ? LIMIT 1",
        [`%${destino}%`]
      );
      if (terminalResult.length > 0) {
        destinoCodigo = terminalResult[0].codigo;
      }
    }

    const query = `
      SELECT 
        v.idViaje,
        DATE(v.salida) as fecha,
        TIME_FORMAT(v.salida, '%H:%i') as horaSalida,
        TIME_FORMAT(v.llegada, '%H:%i') as horaLlegada,
        TIMESTAMPDIFF(MINUTE, v.salida, v.llegada) as duracion,
        t1.codigo as origenCodigo,
        t1.ciudad as origenCiudad,
        t1.nombreTerminal as origenNombre,
        t2.codigo as destinoCodigo,
        t2.ciudad as destinoCiudad,
        t2.nombreTerminal as destinoNombre,
        e.nombreEmpresa as empresa,
        e.logo as empresaLogo,
        eq.modelo,
        eq.matricula,
        MIN(vt.precio) as precio,
        COUNT(DISTINCT vt.idTarifa) as tarifasDisponibles,
        SUM(vt.cupos) as asientosDisponibles,
        v.estado
      FROM viaje v
      JOIN ruta r ON v.idRuta = r.idRuta
      JOIN terminal t1 ON r.idTerminalOrigen = t1.idTerminal
      JOIN terminal t2 ON r.idTerminalDestino = t2.idTerminal
      JOIN empresa_equipo eq ON v.idEquipo = eq.idEquipo
      JOIN empresa e ON eq.idEmpresa = e.idEmpresa
      LEFT JOIN viaje_tarifa vt ON v.idViaje = vt.idViaje
      WHERE t1.codigo = ? 
        AND t2.codigo = ?
        AND DATE(v.salida) = ?
        AND v.estado = 'programado'
        AND vt.cupos > 0
      GROUP BY v.idViaje, v.salida, v.llegada, t1.codigo, t1.ciudad, t1.nombreTerminal,
               t2.codigo, t2.ciudad, t2.nombreTerminal, e.nombreEmpresa, e.logo,
               eq.modelo, eq.matricula, v.estado
      ORDER BY MIN(vt.precio) ASC
    `;

    const [vuelos] = await db.query(query, [origen, destinoCodigo, fecha]);

    console.log(`✅ Encontrados ${vuelos.length} vuelos`);

    res.json(vuelos);
  } catch (error) {
    console.error("❌ Error buscando vuelos:", error);
    res.status(500).json({
      error: "Error al buscar vuelos",
      message: error.message,
    });
  }
});

// ============================================
// OBTENER CÓDIGO DE CIUDAD (para conversión)
// ============================================
router.get("/destinos/:ciudad/codigo", async (req, res) => {
  try {
    const db = req.app.get("db");
    const { ciudad } = req.params;

    console.log("🔍 Buscando código para ciudad:", ciudad);

    const [result] = await db.query(
      "SELECT codigo, ciudad, nombreTerminal FROM terminal WHERE ciudad LIKE ? LIMIT 1",
      [`%${ciudad}%`]
    );

    if (result.length > 0) {
      console.log("✅ Código encontrado:", result[0]);
      res.json(result[0]);
    } else {
      console.log("❌ Ciudad no encontrada:", ciudad);
      res.status(404).json({
        error: "Ciudad no encontrada",
        ciudad: ciudad,
      });
    }
  } catch (error) {
    console.error("❌ Error obteniendo código de ciudad:", error);
    res.status(500).json({
      error: "Error del servidor",
      message: error.message,
    });
  }
});

// ============================================
// OBTENER TODOS LOS DESTINOS/TERMINALES DISPONIBLES
// ============================================
router.get("/destinos", async (req, res) => {
  try {
    const db = req.app.get("db");

    const query = `
      SELECT DISTINCT
        t.idTerminal,
        t.codigo,
        t.ciudad,
        t.nombreTerminal,
        t.imagen,
        tt.nombreTipoTerminal as tipo
      FROM terminal t
      JOIN tipo_terminal tt ON t.idTipoTerminal = tt.idTipoTerminal
      WHERE t.activo = 1
      ORDER BY t.ciudad
    `;

    const [destinos] = await db.query(query);
    res.json(destinos);
  } catch (error) {
    console.error("❌ Error obteniendo destinos:", error);
    res.status(500).json({
      error: "Error al obtener destinos",
      message: error.message,
    });
  }
});

// ============================================
// OBTENER DETALLES DE UN VUELO ESPECÍFICO
// ============================================
router.get("/:idViaje", async (req, res) => {
  try {
    const db = req.app.get("db");
    const { idViaje } = req.params;

    const query = `
      SELECT 
        v.idViaje,
        v.salida,
        v.llegada,
        v.estado,
        t1.codigo as origenCodigo,
        t1.ciudad as origenCiudad,
        t1.nombreTerminal as origenNombre,
        t2.codigo as destinoCodigo,
        t2.ciudad as destinoCiudad,
        t2.nombreTerminal as destinoNombre,
        e.nombreEmpresa as empresa,
        e.logo as empresaLogo,
        eq.modelo,
        eq.capacidad,
        r.distanciaKm,
        r.duracionEstimadaMin
      FROM viaje v
      JOIN ruta r ON v.idRuta = r.idRuta
      JOIN terminal t1 ON r.idTerminalOrigen = t1.idTerminal
      JOIN terminal t2 ON r.idTerminalDestino = t2.idTerminal
      JOIN empresa_equipo eq ON v.idEquipo = eq.idEquipo
      JOIN empresa e ON eq.idEmpresa = e.idEmpresa
      WHERE v.idViaje = ?
    `;

    const [vuelo] = await db.query(query, [idViaje]);

    if (vuelo.length === 0) {
      return res.status(404).json({ error: "Vuelo no encontrado" });
    }

    // Obtener tarifas disponibles para este vuelo
    const [tarifas] = await db.query(
      `SELECT 
        vt.idViajeTarifa,
        vt.precio,
        vt.moneda,
        vt.cupos,
        t.codigoTarifa,
        t.nombreTarifa,
        t.equipaje_incl_kg,
        t.cambios,
        t.reembolsable,
        t.condiciones,
        cc.nombreCabinaClase,
        cc.descripcion as descripcionCabina
      FROM viaje_tarifa vt
      JOIN tarifa t ON vt.idTarifa = t.idTarifa
      JOIN cabina_clase cc ON t.idCabinaClase = cc.idCabinaClase
      WHERE vt.idViaje = ? AND vt.cupos > 0 AND t.activo = 1
      ORDER BY vt.precio ASC`,
      [idViaje]
    );

    res.json({
      vuelo: vuelo[0],
      tarifas,
    });
  } catch (error) {
    console.error("❌ Error obteniendo detalles del vuelo:", error);
    res.status(500).json({
      error: "Error al obtener detalles del vuelo",
      message: error.message,
    });
  }
});

// ============================================
// OBTENER TARIFAS DE UN VUELO
// ============================================
router.get("/:idViaje/tarifas", async (req, res) => {
  try {
    const db = req.app.get("db");
    const { idViaje } = req.params;

    const query = `
      SELECT 
        vt.idViajeTarifa,
        vt.precio,
        vt.moneda,
        vt.cupos,
        t.codigoTarifa,
        t.nombreTarifa,
        t.equipaje_incl_kg,
        t.cambios,
        t.reembolsable,
        t.condiciones,
        cc.nombreCabinaClase,
        cc.prioridad,
        cc.descripcion
      FROM viaje_tarifa vt
      JOIN tarifa t ON vt.idTarifa = t.idTarifa
      JOIN cabina_clase cc ON t.idCabinaClase = cc.idCabinaClase
      WHERE vt.idViaje = ? AND vt.cupos > 0 AND t.activo = 1
      ORDER BY cc.prioridad, vt.precio ASC
    `;

    const [tarifas] = await db.query(query, [idViaje]);

    if (tarifas.length === 0) {
      return res.status(404).json({
        error: "No hay tarifas disponibles para este vuelo",
      });
    }

    res.json(tarifas);
  } catch (error) {
    console.error("❌ Error obteniendo tarifas:", error);
    res.status(500).json({
      error: "Error al obtener tarifas",
      message: error.message,
    });
  }
});

export { router };
