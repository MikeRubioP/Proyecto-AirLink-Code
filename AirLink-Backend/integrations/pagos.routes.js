import express from "express";
import Stripe from "stripe";
import paypal from "@paypal/checkout-server-sdk";
import { MercadoPagoConfig, Preference } from "mercadopago";
import dotenv from "dotenv";
dotenv.config();

const router = express.Router();

// ========================================
// CONFIGURACIÓN DE STRIPE
// ========================================
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// CLP es moneda sin decimales en Stripe
const toUnitAmountCLP = (v) => Math.round(Number(v || 0));

// ========================================
// CONFIGURACIÓN DE PAYPAL
// ========================================
const clientId =
  "AV1mix21GYzSkc8ogOlxj0IOSpGAKzHRiXYdCHGHh4eKHLKEluulPdS2tmGiJ6TUo3OrLvUQTr4bjScm";
const clientSecret =
  "EFj4o3c2J33gvRT-UmyCa_BQW2mmCdjBt2rxajVP-bcPTT2plD1lNNDAmcWuMm_NkYoqxLGPItfk5eTS";
const environment = new paypal.core.SandboxEnvironment(clientId, clientSecret);
const paypalClient = new paypal.core.PayPalHttpClient(environment);

// ========================================
// CONFIGURACIÓN DE MERCADO PAGO
// ========================================
const mpClient = new MercadoPagoConfig({
  accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN,
});

// ========================================
// FUNCIÓN AUXILIAR: Generar código de reserva único
// ========================================
function generarCodigoReserva() {
  const fecha = new Date().toISOString().slice(2, 10).replace(/-/g, "");
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `RES${fecha}${random}`;
}

// ========================================
// CREAR RESERVA EN LA BASE DE DATOS
// ========================================
router.post("/crear-reserva", async (req, res) => {
  const db = req.app.get("db");
  const { pasajero, vuelo = null, buses = [], total, metodoPago } = req.body;

  let connection;

  try {
    // Validaciones mínimas
    if (!pasajero || !total) {
      return res.status(400).json({
        error: "Datos incompletos",
        required: ["pasajero", "total"],
      });
    }

    // Debe haber al menos un item: vuelo o buses
    if (!vuelo && (!buses || buses.length === 0)) {
      return res.status(400).json({ error: "No hay items de reserva." });
    }

    // Determinar idViaje para la reserva (vuelo o primer bus)
    const primerViajeId =
      (vuelo && vuelo.idViaje) ||
      (Array.isArray(buses) && buses[0]?.id) ||
      null;

    if (!primerViajeId) {
      return res
        .status(400)
        .json({ error: "Falta id de viaje (vuelo o bus)." });
    }

    connection = await db.getConnection();
    await connection.beginTransaction();

    // ===== BUSCAR O CREAR USUARIO =====
    let idUsuario;

    // Buscar si existe usuario con este email
    const [existingUser] = await connection.query(
      "SELECT idUsuario FROM usuario WHERE email = ?",
      [pasajero.correo]
    );

    if (existingUser.length > 0) {
      // Usuario existe
      idUsuario = existingUser[0].idUsuario;
      console.log(`✅ Usuario encontrado: ${idUsuario}`);
    } else {
      // Crear usuario nuevo
      console.log(`📝 Creando nuevo usuario para: ${pasajero.correo}`);

      const [userResult] = await connection.query(
        `INSERT INTO usuario 
          (nombreUsuario, email, contrasena, idRol, verificado) 
          VALUES (?, ?, ?, 1, 0)`,
        [
          `${pasajero.nombre} ${pasajero.apellido}`.trim(),
          pasajero.correo,
          "temp_password_" + Date.now(), // Password temporal
        ]
      );
      idUsuario = userResult.insertId;
      console.log(`✅ Usuario creado con ID: ${idUsuario}`);
    }
    // ===== FIN BUSCAR O CREAR USUARIO =====

    // Mapear método de pago a ID
    const metodoPagoMap = { stripe: 1, mercadopago: 2, paypal: 4 };
    const idMetodoPago = metodoPagoMap[metodoPago] || 1;

    const codigoReserva = generarCodigoReserva();

    // Insertar reserva principal
    const [reservaResult] = await connection.query(
      `INSERT INTO reserva 
        (codigo_reserva, idUsuario, idViaje, fecha_reserva, idTipoCategoria, estado, monto_total, moneda)
        VALUES (?, ?, ?, NOW(), ?, 'pendiente', ?, 'CLP')`,
      [codigoReserva, idUsuario, primerViajeId, 1, total]
    );

    const reservaId = reservaResult.insertId;

    // Insertar pasajero asociado
    const [pasajeroResult] = await connection.query(
      `INSERT INTO pasajero 
        (idReserva, nombrePasajero, apellidoPasajero, documento, tipo_documento, fecha_nacimiento, nacionalidad)
        VALUES (?, ?, ?, ?, ?, ?, 'CL')`,
      [
        reservaId,
        pasajero.nombre,
        pasajero.apellido,
        pasajero.numeroDocumento,
        pasajero.tipoDocumento || "DNI",
        pasajero.fechaNacimiento || null,
      ]
    );

    // Registro de pago pendiente
    await connection.query(
      `INSERT INTO pago 
        (idReserva, idMetodoPago, idEstadoPago, monto, moneda, created_at)
        VALUES (?, ?, 1, ?, 'CLP', NOW())`,
      [reservaId, idMetodoPago, total]
    );

    await connection.commit();

    res.status(201).json({
      success: true,
      reservaId,
      codigoReserva,
      pasajeroId: pasajeroResult.insertId,
      usuarioId: idUsuario,
      message: "Reserva creada exitosamente",
    });
  } catch (error) {
    if (connection) await connection.rollback();
    console.error("Error al crear reserva:", error);
    res.status(500).json({
      error: "Error al crear la reserva",
      details: error.message,
    });
  } finally {
    if (connection) connection.release();
  }
});

// ========================================
// STRIPE - CREAR SESIÓN DE PAGO (vuelo + buses)
// ========================================
router.post("/stripe/create-session", async (req, res) => {
  const { reservaId, pasajero, vuelo = null, buses = [] } = req.body;

  try {
    const line_items = [];

    // Vuelo (opcional)
    if (vuelo && Number(vuelo.precio) > 0) {
      line_items.push({
        price_data: {
          currency: "clp",
          product_data: {
            name: `Vuelo ${vuelo.origen} → ${vuelo.destino} · ${vuelo.tarifaNombre}`,
          },
          unit_amount: toUnitAmountCLP(vuelo.precio),
        },
        quantity: 1,
      });
    }

    // Buses (0..n)
    for (const b of buses || []) {
      const amount = toUnitAmountCLP(b.precioAdulto);
      if (amount <= 0) continue;
      line_items.push({
        price_data: {
          currency: "clp",
          product_data: {
            name: `${b.empresa} – ${b.origen} → ${b.destino}`,
            description:
              b.horaSalida && b.horaLlegada
                ? `Salida: ${b.horaSalida} - Llegada: ${b.horaLlegada}`
                : undefined,
          },
          unit_amount: amount,
        },
        quantity: 1,
      });
    }

    if (line_items.length === 0) {
      return res.status(400).json({ error: "No hay items para cobrar." });
    }

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      line_items,
      customer_email: pasajero?.correo,
      success_url: `http://localhost:5173/pago-exitoso?reservaId=${encodeURIComponent(
        reservaId
      )}&status=success&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `http://localhost:5173/pago?status=cancel&reservaId=${encodeURIComponent(
        reservaId
      )}`,
      metadata: {
        reservaId: String(reservaId || ""),
        pasajeroNombre: pasajero
          ? `${pasajero.nombre || ""} ${pasajero.apellido || ""}`.trim()
          : "",
      },
    });

    res
      .status(200)
      .json({ success: true, sessionId: session.id, url: session.url });
  } catch (error) {
    console.error("Error en Stripe:", error);
    res
      .status(500)
      .json({
        error: "Error al crear sesión de Stripe",
        details: error.message,
      });
  }
});

// ========================================
// MERCADO PAGO - CREAR PREFERENCIA (vuelo + buses)
// ========================================
router.post("/mercadopago/create-preference", async (req, res) => {
  try {
    const { vuelo = null, buses = [], reservaId, pasajero } = req.body;

    if (!vuelo && (!buses || buses.length === 0)) {
      return res.status(400).json({ error: "No hay items para cobrar." });
    }
    if (!reservaId)
      return res.status(400).json({ error: "reservaId es requerido" });
    if (!pasajero || !pasajero.nombre || !pasajero.correo) {
      return res.status(400).json({ error: "Datos de pasajero incompletos" });
    }

    const preference = new Preference(mpClient);
    const items = [];

    if (vuelo && Number(vuelo.precio) > 0) {
      items.push({
        title: `Vuelo ${vuelo.origen} → ${vuelo.destino} · ${vuelo.tarifaNombre}`,
        quantity: 1,
        currency_id: "CLP",
        unit_price: Number(vuelo.precio),
      });
    }

    for (const b of buses || []) {
      items.push({
        title: `${b.empresa} – ${b.origen} → ${b.destino}`,
        quantity: 1,
        currency_id: "CLP",
        unit_price: Number(b.precioAdulto || 0),
      });
    }

    const preferenceData = {
      items,
      back_urls: {
        success: `http://localhost:5173/pago-exitoso?reservaId=${reservaId}&status=success`,
        failure: `http://localhost:5173/pago-exitoso?reservaId=${reservaId}&status=failure`,
        pending: `http://localhost:5173/pago-exitoso?reservaId=${reservaId}&status=pending`,
      },
      external_reference: String(reservaId),
      statement_descriptor: "AIRLINK",
      payer: {
        name: pasajero.nombre,
        surname: pasajero.apellido || "",
        email: pasajero.correo,
      },
    };

    const response = await preference.create({ body: preferenceData });
    res.json({
      success: true,
      init_point: response.init_point,
      id: response.id,
    });
  } catch (error) {
    console.error("❌ Error completo de MercadoPago:", error);
    res.status(500).json({
      error: "Error al crear preferencia de Mercado Pago",
      message: error.message,
      details: error.response?.data || error.toString(),
    });
  }
});

// ========================================
// PAYPAL - CREAR ORDEN (vuelo + buses)
// ========================================
router.post("/paypal/create-order", async (req, res) => {
  const { vuelo = null, buses = [], reservaId, pasajero } = req.body;

  try {
    if (!vuelo && (!buses || buses.length === 0)) {
      return res.status(400).json({ error: "No hay items para cobrar." });
    }

    const conversionRate = 900; // CLP → USD (demo)
    const totalCLP =
      Number(vuelo?.precio || 0) +
      (buses || []).reduce((sum, b) => sum + Number(b.precioAdulto || 0), 0);

    const totalUSD = (totalCLP / conversionRate).toFixed(2);

    const items = [];

    if (vuelo && Number(vuelo.precio) > 0) {
      items.push({
        name: `Vuelo ${vuelo.origen} → ${vuelo.destino} · ${vuelo.tarifaNombre}`,
        unit_amount: {
          currency_code: "USD",
          value: (Number(vuelo.precio) / conversionRate).toFixed(2),
        },
        quantity: "1",
      });
    }

    for (const b of buses || []) {
      items.push({
        name: `${b.empresa} – ${b.origen} → ${b.destino}`,
        description:
          b.horaSalida && b.horaLlegada
            ? `${b.horaSalida} - ${b.horaLlegada}`
            : undefined,
        unit_amount: {
          currency_code: "USD",
          value: (Number(b.precioAdulto || 0) / conversionRate).toFixed(2),
        },
        quantity: "1",
      });
    }

    const request = new paypal.orders.OrdersCreateRequest();
    request.prefer("return=representation");
    request.requestBody({
      intent: "CAPTURE",
      purchase_units: [
        {
          amount: {
            currency_code: "USD",
            value: totalUSD,
            breakdown: {
              item_total: { currency_code: "USD", value: totalUSD },
            },
          },
          items,
          description: `Reserva #${reservaId}`,
        },
      ],
      application_context: {
        return_url: `http://localhost:5173/pago-exitoso?reservaId=${reservaId}&status=success`,
        cancel_url: `http://localhost:5173/pago?status=cancel&reservaId=${reservaId}`,
        brand_name: "AirLink",
        user_action: "PAY_NOW",
      },
    });

    const order = await paypalClient.execute(request);
    res.status(201).json({
      success: true,
      id: order.result.id,
      approveUrl: order.result.links.find((l) => l.rel === "approve").href,
    });
  } catch (error) {
    console.error("Error en PayPal:", error);
    res
      .status(500)
      .json({
        error: "Error al crear orden de PayPal",
        details: error.message,
      });
  }
});

// ========================================
// ACTUALIZAR ESTADO DE RESERVA
// ========================================
router.put("/actualizar-estado/:reservaId", async (req, res) => {
  const db = req.app.get("db");
  const { reservaId } = req.params;
  const { estado } = req.body;

  try {
    await db.query("UPDATE reserva SET estado = ? WHERE idReserva = ?", [
      estado,
      reservaId,
    ]);

    const estadoPagoMap = { confirmada: 2, cancelada: 3, pendiente: 1 };
    await db.query("UPDATE pago SET idEstadoPago = ? WHERE idReserva = ?", [
      estadoPagoMap[estado] || 1,
      reservaId,
    ]);

    res.json({ success: true, message: "Estado de reserva actualizado" });
  } catch (error) {
    console.error("Error al actualizar estado:", error);
    res
      .status(500)
      .json({
        error: "Error al actualizar estado de reserva",
        details: error.message,
      });
  }
});

// ========================================
// WEBHOOK MERCADOPAGO
// ========================================
router.post("/mercadopago/webhook", async (req, res) => {
  try {
    const payment = req.query;
    console.log("🔔 Webhook MercadoPago:", payment);

    if (payment.type === "payment") {
      const db = req.app.get("db");
      const reservaId = payment.external_reference;

      if (payment.status === "approved") {
        await db.query(
          "UPDATE reserva SET estado = 'confirmada' WHERE idReserva = ?",
          [reservaId]
        );
        await db.query("UPDATE pago SET idEstadoPago = 2 WHERE idReserva = ?", [
          reservaId,
        ]);
      } else if (payment.status === "rejected") {
        await db.query(
          "UPDATE reserva SET estado = 'cancelada' WHERE idReserva = ?",
          [reservaId]
        );
        await db.query("UPDATE pago SET idEstadoPago = 3 WHERE idReserva = ?", [
          reservaId,
        ]);
      }
    }

    res.status(200).send("OK");
  } catch (error) {
    console.error("Error en webhook MercadoPago:", error);
    res.status(500).send("Error");
  }
});

// ========================================
// WEBHOOK STRIPE
// ========================================
router.post(
  "/stripe/webhook",
  express.raw({ type: "application/json" }),
  async (req, res) => {
    const sig = req.headers["stripe-signature"];
    const webhookSecret = "whsec_tu_webhook_secret";

    let event;
    try {
      event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
    } catch (err) {
      console.error("Webhook signature verification failed:", err.message);
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    if (event.type === "checkout.session.completed") {
      const session = event.data.object;
      const reservaId = session.metadata?.reservaId;

      const db = req.app.get("db");
      await db.query(
        "UPDATE reserva SET estado = 'confirmada' WHERE idReserva = ?",
        [reservaId]
      );
      await db.query("UPDATE pago SET idEstadoPago = 2 WHERE idReserva = ?", [
        reservaId,
      ]);
    }

    res.json({ received: true });
  }
);

export { router };
