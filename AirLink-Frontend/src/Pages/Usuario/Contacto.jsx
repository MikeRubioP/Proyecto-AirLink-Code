import React, { useState } from "react";
import Swal from "sweetalert2";
import Footer from "../../Components/Footer";

export default function Contacto() {
  const [form, setForm] = useState({
    nombre: "",
    email: "",
    asunto: "",
    mensaje: "",
  });
  const [sending, setSending] = useState(false);

  function onChange(e) {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  }

  async function onSubmit(e) {
    e.preventDefault();

    const confirm = await Swal.fire({
      title: "¿Deseas enviar el mensaje? 💌",
      text: "Verifica que tus datos sean correctos antes de continuar.",
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Sí, enviar",
      cancelButtonText: "Cancelar",
      confirmButtonColor: "#450d82",
      cancelButtonColor: "#aaa",
    });

    if (!confirm.isConfirmed) return;

    setSending(true);
    try {
      await new Promise((r) => setTimeout(r, 700));

      await Swal.fire({
        icon: "success",
        title: "¡Mensaje enviado! ✈️",
        text: "Gracias por contactarnos. Te responderemos pronto.",
        confirmButtonColor: "#450d82",
      });

      setForm({ nombre: "", email: "", asunto: "", mensaje: "" });
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Error al enviar",
        text: "Ocurrió un problema al enviar tu mensaje. Intenta nuevamente.",
        confirmButtonColor: "#450d82",
      });
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#F7F7FB] text-[#242424]">
      {/* HERO */}
      <section className="relative overflow-hidden">
        <div className="absolute -top-24 -right-24 h-72 w-72 rounded-full bg-[#450d82]/15 blur-3xl" />
        <div className="absolute -bottom-24 -left-24 h-72 w-72 rounded-full bg-[#450d82]/15 blur-3xl" />

        <div className="max-w-7xl mx-auto px-6 py-20 text-center relative z-10">
          <p className="inline-flex items-center gap-2 text-sm text-[#450d82] font-semibold bg-[#450d82]/10 px-3 py-1 rounded-full">
            📮 Contáctanos
          </p>
          <h1 className="mt-4 text-3xl md:text-4xl font-extrabold leading-tight">
            ¿En qué podemos ayudarte?
          </h1>
          <p className="mt-3 text-[#5c5c66] max-w-2xl mx-auto">
            Nuestro equipo está disponible para resolver dudas sobre reservas,
            pagos, cambios o cualquier consulta relacionada con tus vuelos.
          </p>
        </div>
      </section>

      {/* GRID: Formulario + Información */}
      <section className="max-w-7xl mx-auto px-6 pb-16 grid lg:grid-cols-3 gap-8">
        {/* Formulario */}
        <div className="lg:col-span-2 rounded-3xl border border-[#E7E7ED] bg-white p-6 md:p-8 shadow-sm hover:shadow-md transition">
          <h2 className="text-2xl font-bold text-[#450d82]">Envíanos un mensaje</h2>
          <p className="text-[#5c5c66] mb-6">
            Respondemos habitualmente en menos de 24 horas hábiles.
          </p>

          <form onSubmit={onSubmit} className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Nombre</label>
                <input
                  name="nombre"
                  value={form.nombre}
                  onChange={onChange}
                  required
                  className="w-full rounded-xl border border-gray-300 px-4 py-2 focus:ring-2 focus:ring-[#450d82] outline-none"
                  placeholder="Tu nombre"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Correo electrónico</label>
                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={onChange}
                  required
                  className="w-full rounded-xl border border-gray-300 px-4 py-2 focus:ring-2 focus:ring-[#450d82] outline-none"
                  placeholder="tucorreo@ejemplo.com"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Asunto</label>
              <input
                name="asunto"
                value={form.asunto}
                onChange={onChange}
                required
                className="w-full rounded-xl border border-gray-300 px-4 py-2 focus:ring-2 focus:ring-[#450d82] outline-none"
                placeholder="Consulta, cambio de vuelo, reembolso…"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Mensaje</label>
              <textarea
                name="mensaje"
                value={form.mensaje}
                onChange={onChange}
                required
                rows={6}
                className="w-full rounded-xl border border-gray-300 px-4 py-3 focus:ring-2 focus:ring-[#450d82] outline-none resize-y"
                placeholder="Cuéntanos tu caso con el mayor detalle posible."
              />
            </div>

            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
              <p className="text-xs text-[#8A8A8E]">
                Al enviar aceptas nuestra política de privacidad.
              </p>
              <button
                type="submit"
                disabled={sending}
                className="px-6 py-3 rounded-xl text-white font-semibold shadow-md hover:shadow-lg transition disabled:opacity-60"
                style={{ background: "#450d82" }}
              >
                {sending ? "Enviando..." : "Enviar mensaje"}
              </button>
            </div>
          </form>
        </div>

        {/* Tarjetas de contacto */}
        <aside className="space-y-4">
          <ContactCard
            icon="📞"
            title="Soporte telefónico"
            lines={["+56 2 2345 6789", "Lun–Vie · 09:00–18:00"]}
          />
          <ContactCard
            icon="✉️"
            title="Correo de atención"
            lines={["soporte@airlink.com", "Respondemos < 24h hábiles"]}
          />
          <ContactCard
            icon="💬"
            title="WhatsApp"
            lines={["+56 9 8765 4321", "Respuestas rápidas"]}
          />
          <ContactCard
            icon="📍"
            title="Oficina central"
            lines={["Av. Ejemplo 123, Santiago", "Chile"]}
          />
        </aside>
      </section>

      {/* Mapa */}
      <section className="max-w-7xl mx-auto px-6 pb-20">
        <div className="rounded-3xl overflow-hidden border border-[#E7E7ED] bg-white shadow-sm hover:shadow-md transition">
          <iframe
            title="AirLink HQ"
            src="https://maps.google.com/maps?q=Santiago%20Chile&t=&z=12&ie=UTF8&iwloc=&output=embed"
            className="w-full h-[380px]"
            loading="lazy"
          />
        </div>
      </section>

    </div>
  );
}

/* -------- Subcomponentes -------- */

function ContactCard({ icon, title, lines = [] }) {
  return (
    <div className="rounded-2xl border border-[#E7E7ED] bg-white p-5 shadow-sm hover:shadow-md transition transform hover:-translate-y-1">
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-xl grid place-items-center bg-[#450d82]/10 text-[#450d82] text-xl">
          {icon}
        </div>
        <div>
          <h3 className="font-semibold text-[#450d82]">{title}</h3>
          {lines.map((l, i) => (
            <p key={i} className="text-sm text-[#5c5c66]">
              {l}
            </p>
          ))}
        </div>
      </div>
    </div>
  );
}
