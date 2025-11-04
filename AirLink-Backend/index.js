// index.js
import dotenv from "dotenv";
dotenv.config(); // Cargar variables de entorno lo antes posible

import express from "express";
import cors from "cors";
import mysql from "mysql2/promise";
import path from "path";
import { fileURLToPath } from "url";

import { router as authRoutes }      from "./auth.routes.js";
import { router as uploadRoutes }    from "./integrations/upload.routes.js";
import { router as destinosRoutes }  from "./integrations/destinos.routes.js";
import { router as dpaRoutes }       from "./integrations/dpa.routes.js";
import { router as busesRoutes }     from "./integrations/buses.routes.js";
import { countriesRoutes }           from "./integrations/countries.routes.js";
import { geocodingRoutes }           from "./integrations/geocoding.routes.js";


const __filename = fileURLToPath(import.meta.url);
const __dirname  = path.dirname(__filename);
const PORT = process.env.PORT ? Number(process.env.PORT) : 5174;
const ALLOWED_ORIGINS = (process.env.ALLOWED_ORIGINS || "*")
  .split(",")
  .map(s => s.trim())
  .filter(Boolean);


const startServer = async () => {
  const db = await mysql.createConnection({
    host:     process.env.DB_HOST     || "localhost",
    user:     process.env.DB_USER     || "airlink",
    password: process.env.DB_PASS     || "airlink",
    database: process.env.DB_NAME     || "Airlink",
    port:     process.env.DB_PORT     ? Number(process.env.DB_PORT) : 3306,
  });

  console.log("✅ Conexión a la base de datos establecida");

  const app = express();


  app.use(cors({
    origin: (origin, cb) => {
      if (ALLOWED_ORIGINS.includes("*") || !origin || ALLOWED_ORIGINS.includes(origin)) {
        return cb(null, true);
      }
      return cb(new Error("Origen no permitido por CORS"));
    },
    credentials: true,
  }));


  app.use(express.json({ limit: "10mb" }));
  app.use(express.urlencoded({ extended: true }));


  // Archivos estáticos
  app.use("/uploads", express.static(path.join(__dirname, "uploads")));
  app.set("db", db);


  app.get("/health", (_req, res) => res.json({ ok: true }));

  app.use("/auth", authRoutes);

  app.use("/upload", uploadRoutes);
  app.use("/destinos", destinosRoutes);
  app.use("/dpa", dpaRoutes);
  app.use("/buses", busesRoutes);

  app.use("/api/countries",  countriesRoutes);
  app.use("/api/geocoding",  geocodingRoutes);

  app.use((req, res) => {
    res.status(404).json({ error: "Ruta no encontrada", path: req.originalUrl });
  });


  app.use((err, req, res, _next) => {
    console.error("❌ Error middleware:", err);
    const status = err.status || 500;
    res.status(status).json({
      error: err.message || "Error interno",
      detail: err.detail || undefined,
    });
  });

  app.listen(PORT, () => {
    console.log(`✅ Servidor corriendo en el puerto ${PORT}`);
  });
};

startServer().catch((e) => {
  console.error("❌ No se pudo iniciar el servidor:", e);
  process.exit(1);
});
