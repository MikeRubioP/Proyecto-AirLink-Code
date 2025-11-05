import { Router } from "express";
import { z } from "zod";
import mysql from "mysql2/promise";

const contactoSchema = z.object({
  nombre: z.string().min(2).max(80),
  email: z.string().email().max(120),
  asunto: z.string().min(3).max(120),
  mensaje: z.string().min(5).max(2000)
});

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10
});

const router = Router();

router.post("/", async (req, res) => {
  try {
    const data = contactoSchema.parse(req.body);

    // Consulta 100% parametrizada (sin concatenaciones)
    const sql = `
      INSERT INTO contacto (nombre, email, asunto, mensaje, created_at)
      VALUES (?, ?, ?, ?, NOW())
    `;
    await pool.execute(sql, [
      data.nombre, data.email, data.asunto, data.mensaje
    ]);

    res.status(201).json({ ok: true });
  } catch (err) {
    if (err?.issues) return res.status(400).json({ error: "Datos inválidos" });
    console.error(err);
    res.status(500).json({ error: "Error del servidor" });
  }
});

export default router;
