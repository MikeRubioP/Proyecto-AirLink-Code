import React, { useState } from "react";

export default function Contacto() {
    const [form, setForm] = useState({
        nombre: "",
        email: "",
        asunto: "",
        mensaje: "",
    });
    const [sending, setSending] = useState(false);
    const [ok, setOk] = useState(false);

    function onChange(e) {
        setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
    }

    async function onSubmit(e) {
        e.preventDefault();
        setSending(true);
        setOk(false);
        try {
            // Aquí podrías llamar a tu backend: fetch(`${API}/api/contact`, {method:'POST', body: JSON.stringify(form)...})
            await new Promise((r) => setTimeout(r, 700)); // simulación
            setOk(true);
            setForm({ nombre: "", email: "", asunto: "", mensaje: "" });
        } finally {
            setSending(false);
        }
    }

    return (
        <div className="min-h-screen bg-[#F7F7FB]">
            {/* HERO */}
            <section className="relative overflow-hidden">
                <div className="absolute -top-20 -left-24 h-72 w-72 rounded-full bg-[#7C4DFF]/10 blur-2xl" />
                <div className="absolute -bottom-24 -right-24 h-72 w-72 rounded-full bg-[#7C4DFF]/10 blur-2xl" />
                <div className="max-w-7xl mx-auto px-6 py-12 md:py-16">
                    <p className="inline-flex items-center gap-2 text-sm text-[#7C4DFF] font-semibold bg-[#7C4DFF]/10 px-3 py-1 rounded-full">
                        📮 Contáctanos
                    </p>
                    <h1 className="mt-3 text-3xl md:text-4xl font-extrabold">
                        ¿En qué podemos ayudarte?
                    </h1>
                    <p className="mt-2 text-[#5c5c66] max-w-2xl">
                        Nuestro equipo está disponible para resolver dudas sobre reservas, pagos,
                        cambios y cualquier consulta relacionada con tu viaje.
                    </p>
                </div>
            </section>

            {/* GRID: Formulario + Información */}
            <section className="max-w-7xl mx-auto px-6 pb-16 grid lg:grid-cols-3 gap-6">
                {/* Formulario */}
                <div className="lg:col-span-2 rounded-3xl border border-[#E7E7ED] bg-white p-6 md:p-8">
                    <h2 className="text-xl font-bold">Envíanos un mensaje</h2>
                    <p className="text-[#5c5c66] mb-6">Respondemos en menos de 24 horas hábiles.</p>

                    {ok && (
                        <div className="mb-4 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-green-700">
                            ¡Gracias! Tu mensaje fue enviado correctamente.
                        </div>
                    )}

                    <form onSubmit={onSubmit} className="space-y-4">
                        <div className="grid md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium mb-1">Nombre</label>
                                <input
                                    name="nombre"
                                    value={form.nombre}
                                    onChange={onChange}
                                    required
                                    className="input w-full rounded-xl border px-4 py-2 bg-white"
                                    placeholder="Tu nombre"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Email</label>
                                <input
                                    type="email"
                                    name="email"
                                    value={form.email}
                                    onChange={onChange}
                                    required
                                    className="input w-full rounded-xl border px-4 py-2 bg-white"
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
                                className="input w-full rounded-xl border px-4 py-2 bg-white"
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
                                className="input w-full rounded-xl border px-4 py-3 bg-white resize-y"
                                placeholder="Cuéntanos tu caso con el mayor detalle posible."
                            />
                        </div>

                        <div className="flex items-center justify-between">
                            <p className="text-xs text-[#8A8A8E]">
                                Al enviar aceptas nuestra política de privacidad.
                            </p>
                            <button
                                type="submit"
                                disabled={sending}
                                className="btn-primary rounded-xl px-6 py-3 disabled:opacity-60"
                                style={{ background: "#7C4DFF" }}
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

            {/* Mapa / ubicación */}
            <section className="max-w-7xl mx-auto px-6 pb-20">
                <div className="rounded-3xl overflow-hidden border border-[#E7E7ED] bg-white">
                    {/* Puedes reemplazar el iframe por tu embed real de Google Maps */}
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
        <div className="rounded-2xl border border-[#E7E7ED] bg-white p-5">
            <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl grid place-items-center bg-[#7C4DFF]/10 text-[#7C4DFF] text-xl">
                    {icon}
                </div>
                <div>
                    <h3 className="font-semibold">{title}</h3>
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