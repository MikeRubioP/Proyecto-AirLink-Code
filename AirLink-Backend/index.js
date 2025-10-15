import mysql from "mysql2/promise";
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

import { router as authRoutes } from "./auth.routes.js";
import { router as uploadRoutes } from "./upload.routes.js";
import { router as destinosRoutes } from "./destinos.routes.js";

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

  // Configuración de CORS más permisiva
  app.use(
    cors({
      origin: "*", // En producción cambiar a tu dominio específico
      credentials: true,
    })
  );

  app.use(express.json());

  // Servir archivos estáticos (imágenes)
  app.use("/uploads", express.static(path.join(__dirname, "uploads")));

  app.set("db", db);

  // Rutas
  app.use("/auth", authRoutes);
  app.use("/upload", uploadRoutes);
  app.use("/destinos", destinosRoutes);

  app.listen(5174, () => {
    console.log("✅ Servidor corriendo en el puerto 5174");
  });
};

startServer();
