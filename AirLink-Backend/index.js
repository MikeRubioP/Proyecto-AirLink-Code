import mysql from "mysql2/promise";
import express from "express";
import cors from "cors";
import dotenv from "dotenv";

import { router as authRoutes } from "./auth.routes.js";

dotenv.config();

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

  app.set("db", db);

  app.use("/auth", authRoutes);

  // Aquí agregaremos las rutas de login y registro

  app.listen(5174, () => {
    console.log("✅ Servidor corriendo en el puerto 5174");
  });
};

startServer();
