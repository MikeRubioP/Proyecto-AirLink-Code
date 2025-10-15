import express from "express";
import multer from "multer";
import path from "path";
import { promises as fs } from "fs";
import { fileURLToPath } from "url";
import jwt from "jsonwebtoken";

export const router = express.Router();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const JWT_SECRET = "secret_key";

// Middleware de autenticación
const verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ message: "No se proporcionó token" });
  }
  const token = authHeader.split(" ")[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.userId = decoded.idUsuario;
    next();
  } catch (error) {
    return res.status(401).json({ message: "Token inválido o expirado" });
  }
};

// Configuración de multer para destinos
const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    const uploadPath = path.join(__dirname, "uploads", "destinos");
    try {
      await fs.mkdir(uploadPath, { recursive: true });
      cb(null, uploadPath);
    } catch (error) {
      cb(error);
    }
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, "destino-" + uniqueSuffix + path.extname(file.originalname));
  },
});

const upload = multer({ storage });

// Crear destino con imagen
router.post("/", verifyToken, upload.single("imagen"), async (req, res) => {
  const db = req.app.get("db");
  const { nombre, precio, ciudad, pais, descripcion, destacado } = req.body;

  try {
    const imagePath = req.file
      ? `/uploads/destinos/${req.file.filename}`
      : null;

    const [result] = await db.execute(
      `INSERT INTO destino (nombre, precio, ciudad, pais, imagen, descripcion, destacado, activo) 
       VALUES (?, ?, ?, ?, ?, ?, ?, 1)`,
      [
        nombre,
        precio,
        ciudad,
        pais,
        imagePath,
        descripcion || null,
        destacado || 0,
      ]
    );

    res.json({
      message: "Destino creado exitosamente",
      idDestino: result.insertId,
      imagen: imagePath ? `http://localhost:5174${imagePath}` : null,
    });
  } catch (error) {
    console.error("Error al crear destino:", error);
    res.status(500).json({ error: "Error al crear destino" });
  }
});

// Listar destinos
router.get("/", async (req, res) => {
  const db = req.app.get("db");

  try {
    const [destinos] = await db.query(
      "SELECT * FROM destino WHERE activo = 1 ORDER BY destacado DESC, created_at DESC"
    );

    const destinosConImagen = destinos.map((destino) => ({
      ...destino,
      imagen: destino.imagen ? `http://localhost:5174${destino.imagen}` : null,
    }));

    res.json(destinosConImagen);
  } catch (error) {
    console.error("Error al listar destinos:", error);
    res.status(500).json({ error: "Error al listar destinos" });
  }
});

// Obtener un destino específico
router.get("/:id", async (req, res) => {
  const db = req.app.get("db");
  const { id } = req.params;

  try {
    const [rows] = await db.query("SELECT * FROM destino WHERE idDestino = ?", [
      id,
    ]);

    if (rows.length === 0) {
      return res.status(404).json({ error: "Destino no encontrado" });
    }

    const destino = {
      ...rows[0],
      imagen: rows[0].imagen ? `http://localhost:5174${rows[0].imagen}` : null,
    };

    res.json(destino);
  } catch (error) {
    console.error("Error al obtener destino:", error);
    res.status(500).json({ error: "Error al obtener destino" });
  }
});

// Actualizar destino
router.put("/:id", verifyToken, upload.single("imagen"), async (req, res) => {
  const db = req.app.get("db");
  const { id } = req.params;
  const { nombre, precio, ciudad, pais, descripcion, destacado } = req.body;

  try {
    let query = `UPDATE destino SET nombre=?, precio=?, ciudad=?, pais=?, descripcion=?, destacado=?`;
    let values = [
      nombre,
      precio,
      ciudad,
      pais,
      descripcion || null,
      destacado || 0,
    ];

    // Si hay nueva imagen
    if (req.file) {
      const imagePath = `/uploads/destinos/${req.file.filename}`;
      query += ", imagen=?";
      values.push(imagePath);

      // Eliminar imagen anterior
      const [oldDestino] = await db.query(
        "SELECT imagen FROM destino WHERE idDestino = ?",
        [id]
      );
      if (oldDestino[0]?.imagen) {
        const oldPath = path.join(__dirname, oldDestino[0].imagen);
        try {
          await fs.unlink(oldPath);
        } catch (err) {
          console.error("Error al eliminar imagen anterior:", err);
        }
      }
    }

    query += " WHERE idDestino=?";
    values.push(id);

    await db.execute(query, values);

    res.json({ message: "Destino actualizado exitosamente" });
  } catch (error) {
    console.error("Error al actualizar destino:", error);
    res.status(500).json({ error: "Error al actualizar destino" });
  }
});

// Eliminar destino (soft delete)
router.delete("/:id", verifyToken, async (req, res) => {
  const db = req.app.get("db");
  const { id } = req.params;

  try {
    await db.execute("UPDATE destino SET activo = 0 WHERE idDestino = ?", [id]);
    res.json({ message: "Destino eliminado exitosamente" });
  } catch (error) {
    console.error("Error al eliminar destino:", error);
    res.status(500).json({ error: "Error al eliminar destino" });
  }
});
