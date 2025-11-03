import mysql from "mysql2/promise";
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

import { router as authRoutes } from "./auth.routes.js";
import { router as uploadRoutes } from "./upload.routes.js";
import { router as destinosRoutes } from "./destinos.routes.js";
import { router as dpaRoutes } from "./dpa.routes.js";
import { router as busesRoutes } from "./buses.routes.js";
import { router as vuelosRoutes } from "./vuelos.routes.js"; // ⬅️ NUEVO

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

  console.log("✅ Conexión a la base de datos establecida");

  const app = express();

  app.use(
    cors({
      origin: "*",
      credentials: true,
    })
  );

  app.use(express.json());

  // Archivos estáticos
  app.use("/uploads", express.static(path.join(__dirname, "uploads")));

  // Inyecta DB para usarlo en middlewares/rutas
  app.set("db", db);

  // Rutas
  app.use("/auth", authRoutes);
  app.use("/upload", uploadRoutes);
  app.use("/destinos", destinosRoutes);
  app.use("/dpa", dpaRoutes);
  app.use("/buses", busesRoutes);
  app.use("/vuelos", vuelosRoutes); // ⬅️ NUEVO

  // Ruta de prueba
  app.get("/api/test", (req, res) => {
    res.json({
      message: "API de AirLink funcionando correctamente ✈️",
      timestamp: new Date().toISOString(),
    });
  });

  // Manejo de errores 404
  app.use((req, res) => {
    console.log("⚠️ Ruta no encontrada:", req.method, req.path);
    res.status(404).json({
      error: "Ruta no encontrada",
      ruta: req.path,
      metodo: req.method,
    });
  });

  app.listen(5174, () => {
    console.log("✅ Servidor corriendo en el puerto 5174");
    console.log("📍 Rutas disponibles:");
    console.log("   - /auth");
    console.log("   - /upload");
    console.log("   - /destinos");
    console.log("   - /dpa");
    console.log("   - /buses");
    console.log("   - /vuelos ⬅️ NUEVO");
  });
};

startServer().catch((err) => {
  console.error("❌ Error al iniciar el servidor:", err);
  process.exit(1);
});
