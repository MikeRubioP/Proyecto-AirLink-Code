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

const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    const uploadPath = path.join(__dirname, "uploads", "empresas");
    try {
      await fs.mkdir(uploadPath, { recursive: true });
      cb(null, uploadPath);
    } catch (error) {
      cb(error);
    }
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, "logo-" + uniqueSuffix + path.extname(file.originalname));
  },
});

const upload = multer({ storage });

// Crear empresa con logo
router.post("/", verifyToken, upload.single("logo"), async (req, res) => {
  const db = req.app.get("db");
  const { nombreEmpresa, tipoEmpresa, descripcion, sitio_web } = req.body;

  try {
    const logoPath = req.file ? `/uploads/empresas/${req.file.filename}` : null;

    const [result] = await db.execute(
      `INSERT INTO empresa (nombreEmpresa, tipoEmpresa, logo, descripcion, sitio_web, activo) 
       VALUES (?, ?, ?, ?, ?, 1)`,
      [
        nombreEmpresa,
        tipoEmpresa,
        logoPath,
        descripcion || null,
        sitio_web || null,
      ]
    );

    res.json({
      message: "Empresa creada exitosamente",
      idEmpresa: result.insertId,
      logo: logoPath ? `http://localhost:5174${logoPath}` : null,
    });
  } catch (error) {
    console.error("Error al crear empresa:", error);
    res.status(500).json({ error: "Error al crear empresa" });
  }
});

// Listar empresas
router.get("/", async (req, res) => {
  const db = req.app.get("db");

  try {
    const [empresas] = await db.query("SELECT * FROM empresa WHERE activo = 1");

    const empresasConLogo = empresas.map((empresa) => ({
      ...empresa,
      logo: empresa.logo ? `http://localhost:5174${empresa.logo}` : null,
    }));

    res.json(empresasConLogo);
  } catch (error) {
    console.error("Error al listar empresas:", error);
    res.status(500).json({ error: "Error al listar empresas" });
  }
});

// Actualizar empresa
router.put("/:id", verifyToken, upload.single("logo"), async (req, res) => {
  const db = req.app.get("db");
  const { id } = req.params;
  const { nombreEmpresa, tipoEmpresa, descripcion, sitio_web } = req.body;

  try {
    let query = `UPDATE empresa SET nombreEmpresa=?, tipoEmpresa=?, descripcion=?, sitio_web=?`;
    let values = [
      nombreEmpresa,
      tipoEmpresa,
      descripcion || null,
      sitio_web || null,
    ];

    if (req.file) {
      const logoPath = `/uploads/empresas/${req.file.filename}`;
      query += ", logo=?";
      values.push(logoPath);

      // Eliminar logo anterior
      const [oldEmpresa] = await db.query(
        "SELECT logo FROM empresa WHERE idEmpresa = ?",
        [id]
      );
      if (oldEmpresa[0]?.logo) {
        const oldPath = path.join(__dirname, oldEmpresa[0].logo);
        try {
          await fs.unlink(oldPath);
        } catch (err) {
          console.error("Error al eliminar logo anterior:", err);
        }
      }
    }

    query += " WHERE idEmpresa=?";
    values.push(id);

    await db.execute(query, values);

    res.json({ message: "Empresa actualizada exitosamente" });
  } catch (error) {
    console.error("Error al actualizar empresa:", error);
    res.status(500).json({ error: "Error al actualizar empresa" });
  }
});

// Eliminar empresa (soft delete)
router.delete("/:id", verifyToken, async (req, res) => {
  const db = req.app.get("db");
  const { id } = req.params;

  try {
    await db.execute("UPDATE empresa SET activo = 0 WHERE idEmpresa = ?", [id]);
    res.json({ message: "Empresa eliminada exitosamente" });
  } catch (error) {
    console.error("Error al eliminar empresa:", error);
    res.status(500).json({ error: "Error al eliminar empresa" });
  }
});
