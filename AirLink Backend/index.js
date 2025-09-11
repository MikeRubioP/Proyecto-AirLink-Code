import mysql from "mysql2";
import express from "express";
import cors from "cors";

const app = express();

app.use(cors());
app.use(express.json());

const db = mysql.createConnection({
  host: "localhost",
  user: "airlink",
  password: "airlink",
  database: "Airlink",
});

app.listen(5174, () => {
  console.log("corriendo en el puerto 5174");
});
