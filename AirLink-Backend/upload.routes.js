import express from "express";
import multer from "multer";
import path from "path";
import { promises as fs } from "fs";
import { fileURLToPath } from "url";

export const router = express.Router();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuración de multer para diferentes tipos de archivos
const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    const tipo = req.body.tipo || "general"; // destinos, empresas, equipos, etc.
    const uploadPath = path.join(__dirname, "uploads", tipo);

    try {
      await fs.mkdir(uploadPath, { recursive: true });
      cb(null, uploadPath);
    } catch (error) {
      cb(error);
    }
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    const name = file.fieldname + "-" + uniqueSuffix + ext;
    cb(null, name);
  },
});

// Filtro de archivos (solo imágenes)
const fileFilter = (req, file, cb) => {
  const allowedTypes = [
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/gif",
    "image/webp",
  ];

  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(
      new Error("Tipo de archivo no permitido. Solo se permiten imágenes."),
      false
    );
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB máximo
});

// Endpoint para subir una imagen
router.post("/upload", upload.single("imagen"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No se recibió ninguna imagen" });
    }

    const tipo = req.body.tipo || "general";
    const imagePath = `/uploads/${tipo}/${req.file.filename}`;

    res.json({
      message: "Imagen subida exitosamente",
      path: imagePath,
      fullUrl: `http://localhost:5174${imagePath}`,
    });
  } catch (error) {
    console.error("Error al subir imagen:", error);
    res.status(500).json({ error: "Error al subir la imagen" });
  }
});

// Endpoint para subir múltiples imágenes (galerías)
router.post(
  "/upload-multiple",
  upload.array("imagenes", 10),
  async (req, res) => {
    try {
      if (!req.files || req.files.length === 0) {
        return res.status(400).json({ error: "No se recibieron imágenes" });
      }

      const tipo = req.body.tipo || "general";
      const images = req.files.map((file) => ({
        path: `/uploads/${tipo}/${file.filename}`,
        fullUrl: `http://localhost:5174/uploads/${tipo}/${file.filename}`,
      }));

      res.json({
        message: `${images.length} imágenes subidas exitosamente`,
        images,
      });
    } catch (error) {
      console.error("Error al subir imágenes:", error);
      res.status(500).json({ error: "Error al subir las imágenes" });
    }
  }
);

// Endpoint para eliminar una imagen
router.delete("/delete-image", async (req, res) => {
  try {
    const { imagePath } = req.body;

    if (!imagePath) {
      return res
        .status(400)
        .json({ error: "Se requiere la ruta de la imagen" });
    }

    // Construir la ruta completa del archivo
    const fullPath = path.join(__dirname, imagePath.replace(/^\//, ""));

    // Verificar si el archivo existe
    try {
      await fs.access(fullPath);
    } catch {
      return res.status(404).json({ error: "Imagen no encontrada" });
    }

    // Eliminar el archivo
    await fs.unlink(fullPath);

    res.json({ message: "Imagen eliminada exitosamente" });
  } catch (error) {
    console.error("Error al eliminar imagen:", error);
    res.status(500).json({ error: "Error al eliminar la imagen" });
  }
});
