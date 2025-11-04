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
  accessToken:
    "TEST-1614782271695759-051601-12cf797b6738f1251fccf49822703022-1116207264",
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
  const { pasajero, buses, total, metodoPago } = req.body;

  let connection;

  try {
    // Validar datos
    if (!pasajero || !buses || buses.length === 0 || !total) {
      return res.status(400).json({
        error: "Datos incompletos",
        required: ["pasajero", "buses", "total"],
      });
    }

    // Validar que los buses tengan IDs de viaje
    const viajeIds = buses.map((bus) => bus.id).filter((id) => id);
    if (viajeIds.length === 0) {
      return res.status(400).json({
        error: "Los buses deben tener IDs de viaje válidos",
      });
    }

    connection = await db.getConnection();
    await connection.beginTransaction();

    // Mapear método de pago a ID
    const metodoPagoMap = {
      stripe: 1,
      mercadopago: 2,
      paypal: 4, // PayPal
    };

    const idMetodoPago = metodoPagoMap[metodoPago] || 1;

    // PASO 1: Buscar o crear usuario temporal (si no está autenticado)
    // Por ahora usaremos el usuario administrador (idUsuario = 1)
    // En producción deberías tener el usuario autenticado
    const idUsuario = 1; // Usuario por defecto

    // PASO 2: Obtener el primer viaje para la reserva
    const primerViajeId = viajeIds[0];

    // PASO 3: Generar código de reserva único
    const codigoReserva = generarCodigoReserva();

    // PASO 4: Insertar reserva principal
    const [reservaResult] = await connection.query(
      `INSERT INTO reserva 
        (codigo_reserva, idUsuario, idViaje, fecha_reserva, idTipoCategoria, estado, monto_total, moneda)
        VALUES (?, ?, ?, NOW(), ?, 'pendiente', ?, 'CLP')`,
      [
        codigoReserva,
        idUsuario,
        primerViajeId,
        1, // 1 = Solo Ida (ajustar según tu lógica)
        total,
      ]
    );

    const reservaId = reservaResult.insertId;

    // PASO 5: Insertar pasajero asociado a la reserva
    const [pasajeroResult] = await connection.query(
      `INSERT INTO pasajero 
        (idReserva, nombrePasajero, apellidoPasajero, documento, tipo_documento, fecha_nacimiento, nacionalidad)
        VALUES (?, ?, ?, ?, 'DNI', ?, 'CL')`,
      [
        reservaId,
        pasajero.nombre,
        pasajero.apellido,
        pasajero.numeroDocumento,
        pasajero.fechaNacimiento || null,
      ]
    );

    const idPasajero = pasajeroResult.insertId;

    // PASO 6: Si hay múltiples buses/viajes, crear reservas adicionales o vincularlos
    // Por simplicidad, guardaremos la info en una tabla temporal o en el mismo registro

    // PASO 7: Insertar registro de pago pendiente
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
      pasajeroId: idPasajero,
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
// STRIPE - CREAR SESIÓN DE PAGO
// ========================================
router.post("/stripe/create-session", async (req, res) => {
  const { buses, reservaId, pasajero } = req.body;

  try {
    const lineItems = buses.map((bus) => ({
      price_data: {
        currency: "clp",
        product_data: {
          name: `${bus.empresa} - ${bus.origen} a ${bus.destino}`,
          description: `Salida: ${bus.horaSalida} - Llegada: ${bus.horaLlegada}`,
        },
        unit_amount: Math.round(bus.precioAdulto), // Stripe requiere enteros
      },
      quantity: 1,
    }));

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: lineItems,
      mode: "payment",
      success_url: `http://localhost:5173/pago-exitoso?reservaId=${reservaId}&status=success`,
      cancel_url: `http://localhost:5173/pago?status=cancel&reservaId=${reservaId}`,
      customer_email: pasajero.correo,
      metadata: {
        reservaId: reservaId.toString(),
        pasajeroNombre: `${pasajero.nombre} ${pasajero.apellido}`,
      },
    });

    res.status(200).json({
      success: true,
      sessionId: session.id,
      url: session.url,
    });
  } catch (error) {
    console.error("Error en Stripe:", error);
    res.status(500).json({
      error: "Error al crear sesión de Stripe",
      details: error.message,
    });
  }
});

// ========================================
// MERCADO PAGO - CREAR PREFERENCIA
// ========================================
router.post("/mercadopago/create-preference", async (req, res) => {
  const { buses, reservaId, pasajero } = req.body;

  try {
    const body = {
      items: buses.map((bus) => ({
        title: `${bus.empresa} - ${bus.origen} a ${bus.destino}`,
        description: `Salida: ${bus.horaSalida} - Llegada: ${bus.horaLlegada}`,
        quantity: 1,
        unit_price: Number(bus.precioAdulto),
        currency_id: "CLP",
      })),
      back_urls: {
        success: `http://localhost:5173/pago-exitoso?reservaId=${reservaId}&status=success`,
        failure: `http://localhost:5173/pago?status=failure&reservaId=${reservaId}`,
        pending: `http://localhost:5173/pago?status=pending&reservaId=${reservaId}`,
      },
      auto_return: "approved",
      payer: {
        name: pasajero.nombre,
        surname: pasajero.apellido,
        email: pasajero.correo,
        phone: {
          number: pasajero.telefono,
        },
      },
      metadata: {
        reserva_id: reservaId.toString(),
      },
    };

    const preference = new Preference(mpClient);
    const result = await preference.create({ body });

    res.json({
      success: true,
      id: result.id,
      init_point: result.init_point,
    });
  } catch (error) {
    console.error("Error en Mercado Pago:", error);
    res.status(500).json({
      error: "Error al crear preferencia de Mercado Pago",
      details: error.message,
    });
  }
});

// ========================================
// PAYPAL - CREAR ORDEN
// ========================================
router.post("/paypal/create-order", async (req, res) => {
  const { buses, reservaId, pasajero } = req.body;

  try {
    const conversionRate = 900; // CLP a USD
    const totalCLP = buses.reduce((sum, bus) => sum + bus.precioAdulto, 0);
    const totalUSD = (totalCLP / conversionRate).toFixed(2);

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
              item_total: {
                currency_code: "USD",
                value: totalUSD,
              },
            },
          },
          items: buses.map((bus) => {
            const itemPriceUSD = (bus.precioAdulto / conversionRate).toFixed(2);
            return {
              name: `${bus.empresa} - ${bus.origen} a ${bus.destino}`,
              description: `${bus.horaSalida} - ${bus.horaLlegada}`,
              unit_amount: {
                currency_code: "USD",
                value: itemPriceUSD,
              },
              quantity: "1",
            };
          }),
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
      approveUrl: order.result.links.find((link) => link.rel === "approve")
        .href,
    });
  } catch (error) {
    console.error("Error en PayPal:", error);
    res.status(500).json({
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
  const { estado } = req.body; // 'pendiente', 'confirmada', 'cancelada'

  try {
    await db.query("UPDATE reserva SET estado = ? WHERE idReserva = ?", [
      estado,
      reservaId,
    ]);

    // Actualizar también el estado del pago
    const estadoPagoMap = {
      confirmada: 2, // Aprobado
      cancelada: 3, // Rechazado
      pendiente: 1, // Pendiente
    };

    await db.query("UPDATE pago SET idEstadoPago = ? WHERE idReserva = ?", [
      estadoPagoMap[estado] || 1,
      reservaId,
    ]);

    res.json({
      success: true,
      message: "Estado de reserva actualizado",
    });
  } catch (error) {
    console.error("Error al actualizar estado:", error);
    res.status(500).json({
      error: "Error al actualizar estado de reserva",
      details: error.message,
    });
  }
});

// ========================================
// OBTENER RESERVA POR ID
// ========================================
router.get("/reserva/:reservaId", async (req, res) => {
  const db = req.app.get("db");
  const { reservaId } = req.params;

  try {
    const [reserva] = await db.query(
      `SELECT 
        r.*,
        p.nombrePasajero,
        p.apellidoPasajero,
        p.documento,
        v.salida,
        v.llegada,
        t_origen.nombreTerminal as origen,
        t_destino.nombreTerminal as destino
       FROM reserva r
       LEFT JOIN pasajero p ON r.idReserva = p.idReserva
       LEFT JOIN viaje v ON r.idViaje = v.idViaje
       LEFT JOIN ruta ru ON v.idRuta = ru.idRuta
       LEFT JOIN terminal t_origen ON ru.idTerminalOrigen = t_origen.idTerminal
       LEFT JOIN terminal t_destino ON ru.idTerminalDestino = t_destino.idTerminal
       WHERE r.idReserva = ?`,
      [reservaId]
    );

    if (reserva.length === 0) {
      return res.status(404).json({ error: "Reserva no encontrada" });
    }

    res.json({
      success: true,
      reserva: reserva[0],
    });
  } catch (error) {
    console.error("Error al obtener reserva:", error);
    res.status(500).json({
      error: "Error al obtener reserva",
      details: error.message,
    });
  }
});

// ========================================
// WEBHOOK STRIPE (para confirmar pagos)
// ========================================
router.post(
  "/stripe/webhook",
  express.raw({ type: "application/json" }),
  async (req, res) => {
    const sig = req.headers["stripe-signature"];
    const webhookSecret = "whsec_tu_webhook_secret"; // Configura esto en Stripe

    let event;

    try {
      event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
    } catch (err) {
      console.error("Webhook signature verification failed:", err.message);
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    // Manejar el evento
    if (event.type === "checkout.session.completed") {
      const session = event.data.object;
      const reservaId = session.metadata.reservaId;

      // Actualizar estado de la reserva a confirmada
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
