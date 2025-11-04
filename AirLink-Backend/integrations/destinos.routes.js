import express from "express";

const router = express.Router();

// Obtener todos los destinos
router.get("/", async (req, res) => {
  try {
    const db = req.app.get("db");
    const { destacado, activo } = req.query;

    let query = "SELECT * FROM destino WHERE 1=1";
    const params = [];

    // Filtrar por destacado
    if (destacado === "true" || destacado === "1") {
      query += " AND destacado = 1";
    }

    // Filtrar por activo (por defecto solo activos)
    if (activo === "false" || activo === "0") {
      query += " AND activo = 0";
    } else {
      query += " AND activo = 1";
    }

    query += " ORDER BY destacado DESC, created_at DESC";

    const [destinos] = await db.query(query, params);

    res.status(200).json(destinos);
  } catch (error) {
    console.error("Error al obtener destinos:", error);
    res.status(500).json({ error: "Error al obtener destinos" });
  }
});

// Obtener un destino por ID
router.get("/:id", async (req, res) => {
  try {
    const db = req.app.get("db");
    const { id } = req.params;

    const [destinos] = await db.query(
      "SELECT * FROM destino WHERE idDestino = ?",
      [id]
    );

    if (destinos.length === 0) {
      return res.status(404).json({ error: "Destino no encontrado" });
    }

    res.status(200).json(destinos[0]);
  } catch (error) {
    console.error("Error al obtener destino:", error);
    res.status(500).json({ error: "Error al obtener destino" });
  }
});

// Crear un nuevo destino
router.post("/", async (req, res) => {
  try {
    const db = req.app.get("db");
    const { nombre, precio, ciudad, pais, imagen, descripcion, destacado } =
      req.body;

    // Validaciones
    if (!nombre || !precio || !ciudad || !pais || !imagen) {
      return res.status(400).json({
        error: "Faltan campos requeridos: nombre, precio, ciudad, pais, imagen",
      });
    }

    const [result] = await db.query(
      `INSERT INTO destino (nombre, precio, ciudad, pais, imagen, descripcion, destacado, activo) 
       VALUES (?, ?, ?, ?, ?, ?, ?, 1)`,
      [
        nombre,
        precio,
        ciudad,
        pais,
        imagen,
        descripcion || null,
        destacado ? 1 : 0,
      ]
    );

    res.status(201).json({
      mensaje: "Destino creado exitosamente",
      idDestino: result.insertId,
    });
  } catch (error) {
    console.error("Error al crear destino:", error);
    res.status(500).json({ error: "Error al crear destino" });
  }
});

// Actualizar un destino
router.put("/:id", async (req, res) => {
  try {
    const db = req.app.get("db");
    const { id } = req.params;
    const {
      nombre,
      precio,
      ciudad,
      pais,
      imagen,
      descripcion,
      destacado,
      activo,
    } = req.body;

    // Verificar que el destino existe
    const [destinos] = await db.query(
      "SELECT * FROM destino WHERE idDestino = ?",
      [id]
    );

    if (destinos.length === 0) {
      return res.status(404).json({ error: "Destino no encontrado" });
    }

    // Construir query dinámico
    const updates = [];
    const values = [];

    if (nombre !== undefined) {
      updates.push("nombre = ?");
      values.push(nombre);
    }
    if (precio !== undefined) {
      updates.push("precio = ?");
      values.push(precio);
    }
    if (ciudad !== undefined) {
      updates.push("ciudad = ?");
      values.push(ciudad);
    }
    if (pais !== undefined) {
      updates.push("pais = ?");
      values.push(pais);
    }
    if (imagen !== undefined) {
      updates.push("imagen = ?");
      values.push(imagen);
    }
    if (descripcion !== undefined) {
      updates.push("descripcion = ?");
      values.push(descripcion);
    }
    if (destacado !== undefined) {
      updates.push("destacado = ?");
      values.push(destacado ? 1 : 0);
    }
    if (activo !== undefined) {
      updates.push("activo = ?");
      values.push(activo ? 1 : 0);
    }

    if (updates.length === 0) {
      return res.status(400).json({ error: "No hay campos para actualizar" });
    }

    values.push(id);

    await db.query(
      `UPDATE destino SET ${updates.join(", ")} WHERE idDestino = ?`,
      values
    );

    res.status(200).json({ mensaje: "Destino actualizado exitosamente" });
  } catch (error) {
    console.error("Error al actualizar destino:", error);
    res.status(500).json({ error: "Error al actualizar destino" });
  }
});

// Eliminar un destino (soft delete)
router.delete("/:id", async (req, res) => {
  try {
    const db = req.app.get("db");
    const { id } = req.params;

    const [result] = await db.query(
      "UPDATE destino SET activo = 0 WHERE idDestino = ?",
      [id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Destino no encontrado" });
    }

    res.status(200).json({ mensaje: "Destino desactivado exitosamente" });
  } catch (error) {
    console.error("Error al eliminar destino:", error);
    res.status(500).json({ error: "Error al eliminar destino" });
  }
});

// routes/vuelos.js
router.get("/api/vuelos/buscar", async (req, res) => {
  try {
    const { origen = "SCL", destino, fecha, clase } = req.query;

    // Si viene ciudad en lugar de código, convertir
    let destinoCodigo = destino;

    // Si el destino no es un código de 3 letras, buscar por ciudad
    if (destino && destino.length > 3) {
      const [terminalResult] = await db.query(
        "SELECT codigo FROM terminal WHERE ciudad = ? LIMIT 1",
        [destino]
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
        t2.codigo as destinoCodigo,
        t2.ciudad as destinoCiudad,
        e.nombreEmpresa as empresa,
        e.logo as empresaLogo,
        eq.modelo,
        MIN(vt.precio) as precio,
        COUNT(DISTINCT vt.idTarifa) as tarifasDisponibles,
        SUM(vt.cupos) as asientosDisponibles
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
      GROUP BY v.idViaje
      ORDER BY MIN(vt.precio) ASC
    `;

    const [vuelos] = await db.query(query, [origen, destinoCodigo, fecha]);

    res.json(vuelos);
  } catch (error) {
    console.error("Error buscando vuelos:", error);
    res.status(500).json({
      error: "Error al buscar vuelos",
      message: error.message,
    });
  }
});

// Endpoint adicional: obtener código de ciudad
router.get("/api/destinos/:ciudad/codigo", async (req, res) => {
  try {
    const { ciudad } = req.params;
    const [result] = await db.query(
      "SELECT codigo, ciudad FROM terminal WHERE ciudad LIKE ? LIMIT 1",
      [`%${ciudad}%`]
    );

    if (result.length > 0) {
      res.json(result[0]);
    } else {
      res.status(404).json({ error: "Ciudad no encontrada" });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export { router };
