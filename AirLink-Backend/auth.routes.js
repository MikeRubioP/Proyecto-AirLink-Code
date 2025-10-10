import express from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import nodemailer from "nodemailer";

export const router = express.Router();

const JWT_SECRET = "secret_key";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "airlink.noreply@gmail.com",
    pass: "hnih eejk ysmq alac",
  },
});

const verificationCodes = new Map();

const generateCode = () =>
  Math.floor(100000 + Math.random() * 900000).toString();

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

router.post("/register", async (req, res) => {
  const db = req.app.get("db");
  const { nombreUsuario, email, contrasena } = req.body;

  try {
    const [rows] = await db.query("SELECT * FROM usuario WHERE email = ?", [
      email,
    ]);
    if (rows.length > 0) {
      return res.status(400).json({ message: "El correo ya está registrado" });
    }

    const code = generateCode();
    const expiresAt = Date.now() + 10 * 60 * 1000; // 10 minutos

    verificationCodes.set(email, {
      code,
      expiresAt,
      nombreUsuario,
      contrasena: await bcrypt.hash(contrasena, 10),
    });

    // Enviar email
    const mailOptions = {
      from: `"AirLink ✈️" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "🔐 Verifica tu cuenta de AirLink",
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; background-color: #f4f4f4; margin: 0; padding: 0; }
            .container { max-width: 600px; margin: 40px auto; background-color: #ffffff; border-radius: 10px; overflow: hidden; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
            .header { background: linear-gradient(135deg, #9333ea 0%, #7c3aed 100%); color: white; padding: 40px 20px; text-align: center; }
            .content { padding: 40px 30px; text-align: center; }
            .code-box { background-color: #f3f4f6; border: 2px dashed #9333ea; border-radius: 8px; padding: 20px; margin: 30px 0; }
            .code { font-size: 36px; font-weight: bold; color: #9333ea; letter-spacing: 8px; font-family: 'Courier New', monospace; }
            .footer { background-color: #f9fafb; padding: 20px; text-align: center; font-size: 12px; color: #6b7280; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>✈️ AirLink</h1>
              <p>Verificación de Cuenta</p>
            </div>
            <div class="content">
              <h2>¡Hola ${nombreUsuario}! 👋</h2>
              <p>Gracias por registrarte en AirLink. Para completar tu registro, usa este código:</p>
              <div class="code-box">
                <div class="code">${code}</div>
              </div>
              <p>Este código expirará en <strong>10 minutos</strong>.</p>
              <p style="color: #6b7280; font-size: 14px;">Si no solicitaste este código, ignora este correo.</p>
            </div>
            <div class="footer">
              <p>© ${new Date().getFullYear()} AirLink. Todos los derechos reservados.</p>
            </div>
          </div>
        </body>
        </html>
      `,
    };

    await transporter.sendMail(mailOptions);

    res.json({
      message: "Código de verificación enviado a tu correo",
      email,
    });
  } catch (error) {
    console.error("Error en registro:", error);
    res.status(500).json({ error: error.message });
  }
});

// VERIFICAR CÓDIGO
router.post("/verify-code", async (req, res) => {
  const db = req.app.get("db");
  const { email, code } = req.body;

  try {
    const stored = verificationCodes.get(email);

    if (!stored) {
      return res
        .status(400)
        .json({ message: "Código no encontrado o expirado" });
    }

    if (Date.now() > stored.expiresAt) {
      verificationCodes.delete(email);
      return res.status(400).json({ message: "El código ha expirado" });
    }

    if (stored.code !== code) {
      return res.status(400).json({ message: "Código incorrecto" });
    }

    // Crear el usuario en la base de datos
    const [result] = await db.query(
      // ← CAMBIO: Ahora captura el resultado
      "INSERT INTO usuario (nombreUsuario, email, contrasena, idRol, verificado) VALUES (?, ?, ?, ?, ?)",
      [stored.nombreUsuario, email, stored.contrasena, 1, true]
    );

    // Limpiar el código usado
    verificationCodes.delete(email);

    // ← NUEVO: Generar token JWT para auto-login
    const token = jwt.sign(
      { idUsuario: result.insertId, email: email },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    // ← NUEVO: Obtener el usuario recién creado
    const [rows] = await db.query(
      "SELECT idUsuario, nombreUsuario, email, idRol, verificado FROM usuario WHERE idUsuario = ?",
      [result.insertId]
    );

    // ← CAMBIO: Ahora devuelve token y usuario, no solo mensaje
    res.json({
      message: "¡Cuenta verificada exitosamente! 🎉",
      token,
      usuario: rows[0],
    });
  } catch (error) {
    console.error("Error verificando código:", error);
    res.status(500).json({ error: error.message });
  }
});

// REENVIAR CÓDIGO
router.post("/resend-code", async (req, res) => {
  const { email } = req.body;

  try {
    const stored = verificationCodes.get(email);

    if (!stored) {
      return res
        .status(400)
        .json({ message: "No hay registro pendiente para este email" });
    }

    // Generar nuevo código
    const code = generateCode();
    const expiresAt = Date.now() + 10 * 60 * 1000;

    // Actualizar código
    verificationCodes.set(email, { ...stored, code, expiresAt });

    // Reenviar email
    const mailOptions = {
      from: `"AirLink ✈️" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "🔐 Nuevo código de verificación",
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; background-color: #f4f4f4; margin: 0; padding: 0; }
            .container { max-width: 600px; margin: 40px auto; background-color: #ffffff; border-radius: 10px; overflow: hidden; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
            .header { background: linear-gradient(135deg, #9333ea 0%, #7c3aed 100%); color: white; padding: 40px 20px; text-align: center; }
            .content { padding: 40px 30px; text-align: center; }
            .code-box { background-color: #f3f4f6; border: 2px dashed #9333ea; border-radius: 8px; padding: 20px; margin: 30px 0; }
            .code { font-size: 36px; font-weight: bold; color: #9333ea; letter-spacing: 8px; font-family: 'Courier New', monospace; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>✈️ AirLink</h1>
            </div>
            <div class="content">
              <h2>Nuevo código de verificación</h2>
              <p>Has solicitado un nuevo código:</p>
              <div class="code-box">
                <div class="code">${code}</div>
              </div>
              <p>Este código expirará en <strong>10 minutos</strong>.</p>
            </div>
          </div>
        </body>
        </html>
      `,
    };

    await transporter.sendMail(mailOptions);

    res.json({ message: "Nuevo código enviado" });
  } catch (error) {
    console.error("Error reenviando código:", error);
    res.status(500).json({ error: error.message });
  }
});

// LOGIN normal
router.post("/login", async (req, res) => {
  const db = req.app.get("db");
  const { email, contrasena } = req.body;

  try {
    const [rows] = await db.query("SELECT * FROM usuario WHERE email = ?", [
      email,
    ]);
    if (rows.length === 0) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    const match = await bcrypt.compare(contrasena, rows[0].contrasena);
    if (!match) {
      return res.status(401).json({ message: "Contraseña incorrecta" });
    }

    const token = jwt.sign(
      { idUsuario: rows[0].idUsuario, email: rows[0].email },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    const { contrasena: _, ...usuarioSinPassword } = rows[0];

    res.json({
      message: "Login exitoso",
      token,
      usuario: usuarioSinPassword,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// LOGIN con Google
router.post("/google", async (req, res) => {
  const db = req.app.get("db");
  const { googleId, email, nombreUsuario } = req.body;

  try {
    let [rows] = await db.query(
      "SELECT * FROM usuario WHERE googleId = ? OR email = ?",
      [googleId, email]
    );

    if (rows.length === 0) {
      await db.query(
        "INSERT INTO usuario (nombreUsuario, email, googleId, idRol, verificado) VALUES (?, ?, ?, ?, ?)",
        [nombreUsuario, email, googleId, 1, true]
      );
      [rows] = await db.query("SELECT * FROM usuario WHERE googleId = ?", [
        googleId,
      ]);
    }

    const token = jwt.sign(
      { idUsuario: rows[0].idUsuario, email: rows[0].email },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    const { contrasena: _, ...usuarioSinPassword } = rows[0];

    res.json({
      message: "Login con Google exitoso",
      token,
      usuario: usuarioSinPassword,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Verificar usuario autenticado
router.get("/me", verifyToken, async (req, res) => {
  const db = req.app.get("db");

  try {
    const [rows] = await db.query(
      "SELECT idUsuario, nombreUsuario, email, idRol, googleId, verificado FROM usuario WHERE idUsuario = ?",
      [req.userId]
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    res.json({ usuario: rows[0] });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
