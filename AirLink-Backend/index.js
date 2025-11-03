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
import { countriesRoutes } from "./integrations/countries.routes.js"; 

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

  app.use(
    cors({
      origin: "*",
      credentials: true,
    })
  );

  app.use(express.json());

  // estáticos
  app.use("/uploads", express.static(path.join(__dirname, "uploads")));

  // inyecta DB si lo usas en middlewares/rutas
  app.set("db", db);

  // Rutas
  app.use("/auth", authRoutes);
  app.use("/upload", uploadRoutes);
  app.use("/destinos", destinosRoutes);
  app.use("/dpa", dpaRoutes);
  app.use("/buses", busesRoutes);
  app.use("/api/countries", countriesRoutes); 

  app.listen(5174, () => {
    console.log("✅ Servidor corriendo en el puerto 5174");
  });
};

startServer();
