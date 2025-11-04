// index.js
import dotenv from "dotenv";
dotenv.config(); // Cargar variables de entorno lo antes posible

import express from "express";
import cors from "cors";
import mysql from "mysql2/promise";
import path from "path";
import { fileURLToPath } from "url";

import { router as authRoutes } from "./auth.routes.js";
import { router as destinosRoutes } from "./integrations/destinos.routes.js";
import { router as dpaRoutes } from "./integrations/dpa.routes.js";
import { router as busesRoutes } from "./integrations/buses.routes.js";
import { router as vuelosRoutes } from "./vuelos.routes.js";
import { router as uploadRoutes } from "./integrations/upload.routes.js";
import { router as pagosRoutes } from "./integrations/pagos.routes.js";
import { countriesRoutes } from "./integrations/countries.routes.js";
import { geocodingRoutes } from "./integrations/geocoding.routes.js";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PORT = process.env.PORT ? Number(process.env.PORT) : 5174;
const ALLOWED_ORIGINS = (process.env.ALLOWED_ORIGINS || "*")
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean);

const startServer = async () => {
  try {
    // Conexión a la base de datos con pool
    const db = await mysql.createPool({
      host: "localhost",
      user: "airlink",
      password: "airlink",
      database: "Airlink",
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
    });

    // Probar conexión
    await db.query("SELECT 1");
    console.log("✅ Conexión a la base de datos establecida");

    const app = express();

    // CORS - CORREGIDO
    app.use(
      cors({
        origin: "http://localhost:5173",
        credentials: true,
        methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
        allowedHeaders: ["Content-Type", "Authorization"],
      })
    );

    // Middlewares
    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));

    // Archivos estáticos
    app.use("/uploads", express.static(path.join(__dirname, "uploads")));

    // Inyecta DB para usarlo en middlewares/rutas
    app.set("db", db);

    // ====================================
    // TODAS LAS RUTAS - ANTES DEL 404
    // ====================================
    app.use("/auth", authRoutes);
    app.use("/upload", uploadRoutes);
    app.use("/destinos", destinosRoutes);
    app.use("/dpa", dpaRoutes);
    app.use("/buses", busesRoutes);
    app.use("/vuelos", vuelosRoutes);
    app.use("/pagos", pagosRoutes);
    app.use("/api/countries", countriesRoutes);
    app.use("/api/geocoding", geocodingRoutes);

    // Ruta de prueba
    app.get("/api/test", (req, res) => {
      res.json({
        message: "API de AirLink funcionando correctamente ✈️",
        timestamp: new Date().toISOString(),
      });
    });

    // Health check
    app.get("/health", async (req, res) => {
      try {
        await db.query("SELECT 1");
        res.json({
          status: "ok",
          database: "connected",
          timestamp: new Date().toISOString(),
        });
      } catch (error) {
        res.status(500).json({
          status: "error",
          database: "disconnected",
          error: error.message,
        });
      }
    });

    // ====================================
    // MANEJO DE ERRORES - AL FINAL
    // ====================================

    // 404 Handler - DESPUÉS de todas las rutas
    app.use((req, res) => {
      console.log("⚠️ Ruta no encontrada:", req.method, req.path);
      res.status(404).json({
        error: "Ruta no encontrada",
        ruta: req.path,
        metodo: req.method,
      });
    });

    // Error Handler global
    app.use((err, req, res, next) => {
      console.error("❌ Error:", err);
      res.status(err.status || 500).json({
        error: err.message || "Error interno del servidor",
        ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
      });
    });

    // Iniciar servidor
    const PORT = process.env.PORT || 5174;
    app.listen(PORT, () => {
      console.log(`✅ Servidor corriendo en el puerto ${PORT}`);
      console.log(`🌍 http://localhost:${PORT}`);
      console.log("\n📍 Rutas disponibles:");
      console.log("   - POST   /auth/login");
      console.log("   - POST   /auth/register");
      console.log("   - POST   /upload");
      console.log("   - GET    /destinos");
      console.log("   - GET    /dpa");
      console.log("   - GET    /buses");
      console.log("   - GET    /vuelos");
      console.log("   - POST   /pagos/crear-reserva");
      console.log("   - POST   /pagos/stripe/create-session");
      console.log("   - POST   /pagos/mercadopago/create-preference");
      console.log("   - POST   /pagos/paypal/create-order");
      console.log("   - GET    /api/countries");
      console.log("   - GET    /api/geocoding");
      console.log("   - GET    /health");
      console.log("   - GET    /api/test");
    });

    // Manejo de cierre graceful
    process.on("SIGTERM", async () => {
      console.log("📴 SIGTERM recibido, cerrando servidor...");
      await db.end();
      process.exit(0);
    });
  } catch (error) {
    console.error("❌ Error al iniciar el servidor:", error);
    process.exit(1);
  }
};

startServer();
