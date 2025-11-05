import express from "express";

export const router = express.Router();

router.get("/disponibles", async (req, res) => {
  try {
    const db = req.app.get("db");
    const { origenCodigo, destinoCodigo, fecha, horaLlegadaVuelo } = req.query;

    if (!origenCodigo) {
      return res.status(400).json({
        error: "Se requiere origenCodigo",
      });
    }

    console.log("🔍 Buscando buses:", {
      origenCodigo,
      destinoCodigo,
      fecha,
      horaLlegadaVuelo,
    });

    // MAPEO CRUCIAL: Aeropuerto → Terminal de bus de la ciudad
    const aeropuertoATerminalBus = {
      // Chile
      SCL: "SCL-BUS",
      PMC: "PMC-BUS",
      IQQ: "IQQ-BUS",
      LSC: "COQ-BUS", // Aeropuerto La Serena → Terminal Coquimbo
      ANF: "ANF-BUS",
      PUQ: "PUQ-BUS",
      VLP: "VLP-BUS",
      CCP: "CCP-BUS",
      TMC: "TMC-BUS",
      // Internacional
      CUZ: "CUZ",
      EZE: "EZE",
      MEX: "MEX",
      BOG: "BOG",
      LIM: "LIM",
      GIG: "GIG",
    };

    // Obtener ciudad del terminal de bus
    const terminalBusCodigo =
      aeropuertoATerminalBus[origenCodigo] || origenCodigo;

    // Primero, obtener la ciudad del terminal
    const [terminalInfo] = await db.query(
      "SELECT ciudad FROM terminal WHERE codigo = ? LIMIT 1",
      [terminalBusCodigo]
    );

    if (terminalInfo.length === 0) {
      console.log(
        `⚠️ No se encontró terminal con código: ${terminalBusCodigo}`
      );
      return res.json([]);
    }

    const ciudadOrigen = terminalInfo[0].ciudad;
    console.log(`📍 Ciudad origen para buses: ${ciudadOrigen}`);

    // CRÍTICO: Construir datetime completo de llegada del vuelo
    let fechaHoraMinima = null;
    if (fecha && horaLlegadaVuelo) {
      // Formato: 2025-11-08 19:05:00
      fechaHoraMinima = `${fecha} ${horaLlegadaVuelo}:00`;
      console.log(
        `⏰ Hora mínima de salida del bus: ${fechaHoraMinima} + 90 minutos`
      );
    }

    // Query mejorada con filtro de hora CORRECTO
    const query = `
      SELECT 
        v.idViaje,
        e.nombreEmpresa as empresa,
        e.logo,
        tOrigen.codigo as origenCodigo,
        tOrigen.nombreTerminal as origen,
        tOrigen.ciudad as ciudadOrigen,
        tDestino.codigo as destinoCodigo,
        tDestino.nombreTerminal as destino,
        tDestino.ciudad as ciudadDestino,
        DATE_FORMAT(v.salida, '%a, %d/%m') as fechaSalida,
        DATE_FORMAT(v.salida, '%Y-%m-%d') as fechaCompleta,
        TIME_FORMAT(v.salida, '%H:%i') as horaSalida,
        TIME_FORMAT(v.llegada, '%H:%i') as horaLlegada,
        v.salida as salidaCompleta,
        TIMESTAMPDIFF(MINUTE, v.salida, v.llegada) as duracionMin,
        vt.precio as precioAdulto,
        vt.cupos,
        r.distanciaKm,
        -- Calcular minutos desde llegada del vuelo
        ${
          fechaHoraMinima
            ? `
          TIMESTAMPDIFF(MINUTE, 
            DATE_ADD('${fechaHoraMinima}', INTERVAL 90 MINUTE),
            v.salida
          ) as minutosDesdeVuelo
        `
            : "NULL as minutosDesdeVuelo"
        }
      FROM viaje v
      INNER JOIN ruta r ON v.idRuta = r.idRuta
      INNER JOIN terminal tOrigen ON r.idTerminalOrigen = tOrigen.idTerminal
      INNER JOIN terminal tDestino ON r.idTerminalDestino = tDestino.idTerminal
      INNER JOIN empresa_equipo eq ON v.idEquipo = eq.idEquipo
      INNER JOIN empresa e ON eq.idEmpresa = e.idEmpresa
      INNER JOIN viaje_tarifa vt ON v.idViaje = vt.idViaje
      WHERE e.tipoEmpresa = 'bus'
        AND e.activo = 1
        AND v.estado = 'programado'
        AND tOrigen.ciudad = ?
        ${
          destinoCodigo
            ? `
          AND (
            tDestino.ciudad = ? 
            OR tDestino.codigo = ?
            OR tDestino.ciudad LIKE ?
          )
        `
            : ""
        }
        ${
          fechaHoraMinima
            ? `
          -- FILTRO CRÍTICO: Buses que salen al menos 90 min después del vuelo
          AND v.salida >= DATE_ADD('${fechaHoraMinima}', INTERVAL 90 MINUTE)
          -- Solo buses del mismo día o siguiente
          AND DATE(v.salida) IN (DATE('${fecha}'), DATE_ADD(DATE('${fecha}'), INTERVAL 1 DAY))
        `
            : `
          -- Sin hora de llegada, mostrar buses futuros del día especificado
          ${fecha ? "AND DATE(v.salida) >= DATE(?)" : "AND v.salida >= NOW()"}
        `
        }
        AND vt.cupos > 0
      ORDER BY v.salida ASC, r.distanciaKm ASC
      LIMIT 50
    `;

    const params = [ciudadOrigen];

    if (destinoCodigo) {
      params.push(destinoCodigo, destinoCodigo, `%${destinoCodigo}%`);
    }

    if (fecha && !fechaHoraMinima) {
      params.push(fecha);
    }

    const [buses] = await db.query(query, params);

    console.log(`✅ Encontrados ${buses.length} buses desde ${ciudadOrigen}`);

    if (buses.length > 0) {
      const destinos = [...new Set(buses.map((b) => b.ciudadDestino))];
      console.log(`🗺️ Destinos disponibles: ${destinos.join(", ")}`);
      console.log(
        `📅 Primer bus sale: ${buses[0].horaSalida} hacia ${buses[0].ciudadDestino}`
      );
    } else {
      console.log(
        `❌ No hay buses disponibles después de ${horaLlegadaVuelo || "ahora"}`
      );
    }

    if (buses.length === 0 && fechaHoraMinima) {
      console.log("⚠️ Verificando si hay buses más tarde...");

      const [busesDelDia] = await db.query(
        `
        SELECT 
          TIME_FORMAT(v.salida, '%H:%i') as horaSalida,
          tDestino.ciudad
        FROM viaje v
        INNER JOIN ruta r ON v.idRuta = r.idRuta
        INNER JOIN terminal tOrigen ON r.idTerminalOrigen = tOrigen.idTerminal
        INNER JOIN terminal tDestino ON r.idTerminalDestino = tDestino.idTerminal
        INNER JOIN empresa_equipo eq ON v.idEquipo = eq.idEquipo
        INNER JOIN empresa e ON eq.idEmpresa = e.idEmpresa
        WHERE e.tipoEmpresa = 'bus'
          AND v.estado = 'programado'
          AND tOrigen.ciudad = ?
          AND DATE(v.salida) = DATE(?)
        ORDER BY v.salida
        LIMIT 5
      `,
        [ciudadOrigen, fecha]
      );

      console.log("🕐 Buses disponibles ese día:", busesDelDia);
    }

    const busesFormateados = buses.map((bus) => {
      const tiempoEspera = calcularTiempoEspera(
        fechaHoraMinima,
        bus.salidaCompleta
      );

      return {
        ...bus,
        duracion: `${Math.floor(bus.duracionMin / 60)}h ${
          bus.duracionMin % 60
        }min`,
        color: getColorEmpresa(bus.empresa),
        tiempoEspera: tiempoEspera,
        // Debug info
        _debug: {
          horaLlegadaVuelo: horaLlegadaVuelo,
          horaSalidaBus: bus.horaSalida,
          minutosDesdeVuelo: bus.minutosDesdeVuelo,
        },
      };
    });

    res.json(busesFormateados);
  } catch (error) {
    console.error("❌ Error al buscar buses:", error);
    res.status(500).json({
      error: "Error al buscar buses disponibles",
      detalle: error.message,
    });
  }
});

function calcularTiempoEspera(fechaHoraLlegada, salidaBus) {
  if (!fechaHoraLlegada) return null;

  try {
    // Sumar 90 minutos a la llegada del vuelo
    const llegada = new Date(fechaHoraLlegada);
    llegada.setMinutes(llegada.getMinutes() + 90);

    const salida = new Date(salidaBus);
    const diff = Math.floor((salida - llegada) / 60000); // minutos

    if (diff < 0) return null; // Bus sale antes (no debería pasar)
    if (diff === 0) return "Sale justo después";
    if (diff < 60) return `${diff} min de espera`;

    const horas = Math.floor(diff / 60);
    const mins = diff % 60;
    return mins > 0 ? `${horas}h ${mins}min de espera` : `${horas}h de espera`;
  } catch (e) {
    console.error("Error calculando tiempo de espera:", e);
    return null;
  }
}

function getColorEmpresa(nombreEmpresa) {
  const empresaLower = nombreEmpresa?.toLowerCase() || "";

  const colores = {
    flixbus: "bg-green-500",
    pullman: "bg-purple-700",
    turbus: "bg-red-600",
    condor: "bg-yellow-500",
    "tur bus": "bg-red-600",
    "cruz del sur": "bg-blue-600",
    default: "bg-gray-600",
  };

  for (const [key, value] of Object.entries(colores)) {
    if (empresaLower.includes(key)) {
      return value;
    }
  }

  return colores.default;
}

router.get("/conexiones/:ciudad", async (req, res) => {
  try {
    const db = req.app.get("db");
    const { ciudad } = req.params;

    console.log(`🗺️ Buscando conexiones desde: ${ciudad}`);

    const [conexiones] = await db.query(
      `
      SELECT DISTINCT
        tDestino.ciudad as destino,
        tDestino.codigo,
        tDestino.nombreTerminal,
        COUNT(v.idViaje) as viajes_disponibles,
        MIN(vt.precio) as precioMinimo,
        MIN(r.distanciaKm) as distanciaKm
      FROM viaje v
      INNER JOIN ruta r ON v.idRuta = r.idRuta
      INNER JOIN terminal tOrigen ON r.idTerminalOrigen = tOrigen.idTerminal
      INNER JOIN terminal tDestino ON r.idTerminalDestino = tDestino.idTerminal
      INNER JOIN empresa_equipo eq ON v.idEquipo = eq.idEquipo
      INNER JOIN empresa e ON eq.idEmpresa = e.idEmpresa
      INNER JOIN viaje_tarifa vt ON v.idViaje = vt.idViaje
      WHERE e.tipoEmpresa = 'bus'
        AND v.estado = 'programado'
        AND v.salida >= NOW()
        AND vt.cupos > 0
        AND tOrigen.ciudad = ?
      GROUP BY tDestino.ciudad, tDestino.codigo, tDestino.nombreTerminal
      ORDER BY viajes_disponibles DESC, distanciaKm ASC
    `,
      [ciudad]
    );

    console.log(
      `✅ Encontradas ${conexiones.length} conexiones desde ${ciudad}:`,
      conexiones.map((c) => `${c.destino} (${c.viajes_disponibles} viajes)`)
    );

    res.json(conexiones);
  } catch (error) {
    console.error("❌ Error al obtener conexiones:", error);
    res.status(500).json({
      error: "Error al obtener conexiones",
      detalle: error.message,
    });
  }
});

export default router;
