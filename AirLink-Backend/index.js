import mysql from "mysql2/promise";
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

import { router as authRoutes } from "./auth.routes.js";
import { router as uploadRoutes } from "./upload.routes.js";
import { router as destinoRoutes } from "./destino.routes.js";
import { router as empresaRoutes } from "./empresa.routes.js";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const startServer = async () => {
  const db = await mysql.createConnection({
    host: "localhost",
    user: "airlink",
    password: "airlink",
    database: "Airlink",
  });

  const app = express();
  app.use(cors());
  app.use(express.json());

  // ✅ SERVIR ARCHIVOS ESTÁTICOS (imágenes)
  app.use("/uploads", express.static(path.join(__dirname, "uploads")));

  app.set("db", db);

  // Rutas
  app.use("/auth", authRoutes);
  app.use("/api", uploadRoutes);
  app.use("/api/destinos", destinoRoutes);
  app.use("/api/empresas", empresaRoutes);

  app.get("/", (req, res) => {
    res.json({
      message: "✈️ API Airlink activa",
      version: "1.0.0",
    });
  });

  app.listen(5174, () => {
    console.log("✅ Servidor corriendo en http://localhost:5174");
  });
};

startServer();
