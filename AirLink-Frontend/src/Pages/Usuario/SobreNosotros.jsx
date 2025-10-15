import React from "react";
import { Link } from "react-router-dom";

// Si tienes ilustraciones propias, colócalas en src/assets y cámbialas aquí:
const heroImg = new URL("../../assets/airlinkLogo2.png", import.meta.url).href;
// Puedes crear más imágenes y reemplazar los placeholders abajo cuando las tengas.

export default function SobreNosotros() {
    return (
        <div className="min-h-screen bg-[#F7F7FB] text-[#242424]">
            {/* HERO */}
            <section className="relative overflow-hidden">
                <div className="absolute -top-24 -right-24 h-72 w-72 rounded-full bg-[#7C4DFF]/10 blur-2xl" />
                <div className="absolute -bottom-24 -left-24 h-72 w-72 rounded-full bg-[#7C4DFF]/10 blur-2xl" />

                <div className="max-w-7xl mx-auto px-6 py-16 grid md:grid-cols-2 gap-10 items-center">
                    <div>
                        <p className="inline-flex items-center gap-2 text-sm text-[#7C4DFF] font-semibold bg-[#7C4DFF]/10 px-3 py-1 rounded-full">
                            ✈️ Sobre nosotros
                        </p>
                        <h1 className="mt-4 text-3xl md:text-4xl font-extrabold leading-tight">
                            Conectamos personas y destinos de forma simple, rápida y segura
                        </h1>
                        <p className="mt-4 text-lg text-[#5c5c66]">
                            En AirLink creemos que viajar debe ser una experiencia sin fricciones.
                            Por eso construimos una plataforma clara, transparente y pensada “mobile–first”.
                        </p>

                        <div className="mt-6 flex flex-wrap gap-3">
                            <Link
                                to="/ofertas"
                                className="btn-primary rounded-xl px-5 py-3"
                                style={{ background: "#7C4DFF" }}
                            >
                                Ver ofertas
                            </Link>
                            <Link
                                to="/contacto"
                                className="rounded-xl px-5 py-3 border border-[#E7E7ED] bg-white hover:bg-[#fafafe] transition"
                            >
                                Contáctanos
                            </Link>
                        </div>
                    </div>

                    <div className="relative">
                        <div className="aspect-[4/3] rounded-3xl bg-white shadow-sm border border-[#E7E7ED] overflow-hidden grid place-items-center">
                            <img
                                src={heroImg}
                                alt="AirLink"
                                className="w-2/3 opacity-90"
                            />
                        </div>
                    </div>
                </div>
            </section>

            {/* MISIÓN / VALORES */}
            <section className="max-w-7xl mx-auto px-6 py-12">
                <div className="grid md:grid-cols-3 gap-6">
                    <div className="card p-6 rounded-2xl border border-[#E7E7ED] bg-white">
                        <h3 className="text-xl font-bold">Nuestra misión</h3>
                        <p className="mt-2 text-[#5c5c66]">
                            Democratizar los viajes ofreciendo una experiencia intuitiva y tarifas competitivas,
                            con soporte humano cuando lo necesites.
                        </p>
                    </div>
                    <div className="card p-6 rounded-2xl border border-[#E7E7ED] bg-white">
                        <h3 className="text-xl font-bold">Transparencia</h3>
                        <p className="mt-2 text-[#5c5c66]">
                            Mostramos precios claros, sin letras chicas. Tu tiempo vale, y te ayudamos a decidir sin fricciones.
                        </p>
                    </div>
                    <div className="card p-6 rounded-2xl border border-[#E7E7ED] bg-white">
                        <h3 className="text-xl font-bold">Innovación útil</h3>
                        <p className="mt-2 text-[#5c5c66]">
                            Tomamos ideas del diseño y la ingeniería para resolver problemas reales en cada paso del viaje.
                        </p>
                    </div>
                </div>
            </section>

            {/* STATS */}
            <section className="max-w-7xl mx-auto px-6 py-4">
                <div className="grid sm:grid-cols-3 gap-4">
                    <Stat kpi="500K+" label="Usuarios felices" />
                    <Stat kpi="120+" label="Destinos disponibles" />
                    <Stat kpi="4.8★" label="Satisfacción promedio" />
                </div>
            </section>

            {/* TIMELINE */}
            <section className="max-w-7xl mx-auto px-6 py-12">
                <h2 className="text-2xl font-bold mb-6">Nuestra historia</h2>
                <ol className="relative border-s border-[#E7E7ED] pl-6 space-y-8">
                    <TimelineItem year="2021" title="Nace AirLink">
                        Lanzamos el primer MVP con foco en reservas simples y seguras.
                    </TimelineItem>
                    <TimelineItem year="2022" title="App mobile y cupones">
                        Sumamos aplicación móvil y un sistema de cupones para fidelizar.
                    </TimelineItem>
                    <TimelineItem year="2023" title="Check-in en 1 clic">
                        Optimización del flujo de check-in y mejoras de accesibilidad.
                    </TimelineItem>
                    <TimelineItem year="2024" title="Expansión regional">
                        Nuevas alianzas con aerolíneas y más destinos en LATAM.
                    </TimelineItem>
                </ol>
            </section>

            {/* EQUIPO */}
            <section className="max-w-7xl mx-auto px-6 py-12">
                <h2 className="text-2xl font-bold mb-6">Conoce al equipo</h2>
                <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    <Member name="Ana R." role="Product Designer" />
                    <Member name="Luis M." role="Frontend Engineer" />
                    <Member name="Camila P." role="Backend Engineer" />
                    <Member name="Diego S." role="CX Lead" />
                </div>
            </section>

            {/* CTA */}
            <section className="max-w-4xl mx-auto px-6 pb-16">
                <div className="rounded-3xl border border-[#E7E7ED] bg-white p-8 md:p-10 text-center">
                    <h3 className="text-2xl font-bold">
                        ¿Te unes a nuestro próximo destino?
                    </h3>
                    <p className="mt-2 text-[#5c5c66]">
                        Recibe novedades, descuentos y tips de viaje una vez al mes.
                    </p>
                    <form
                        onSubmit={(e) => e.preventDefault()}
                        className="mt-6 flex flex-col sm:flex-row gap-3 justify-center"
                    >
                        <input
                            className="input rounded-xl w-full sm:w-96"
                            placeholder="tu@email.com"
                        />
                        <button
                            className="btn-primary rounded-xl px-6 py-3"
                            style={{ background: "#7C4DFF" }}
                        >
                            Suscribirme
                        </button>
                    </form>
                </div>
            </section>
        </div>
    );
}

/* ---------- Subcomponentes ---------- */

function Stat({ kpi, label }) {
    return (
        <div className="rounded-2xl border border-[#E7E7ED] bg-white p-6 text-center">
            <div className="text-3xl font-extrabold text-[#7C4DFF]">{kpi}</div>
            <div className="mt-1 text-[#5c5c66]">{label}</div>
        </div>
    );
}

function TimelineItem({ year, title, children }) {
    return (
        <li className="ms-4">
            <div className="absolute -left-1.5 mt-1.5 h-3 w-3 rounded-full border-2 border-white bg-[#7C4DFF]" />
            <div className="rounded-2xl border border-[#E7E7ED] bg-white p-5">
                <div className="flex items-center gap-3">
                    <span className="inline-flex text-xs font-semibold text-[#7C4DFF] bg-[#7C4DFF]/10 rounded-full px-2 py-0.5">
                        {year}
                    </span>
                    <h3 className="font-semibold">{title}</h3>
                </div>
                <p className="mt-2 text-[#5c5c66]">{children}</p>
            </div>
        </li>
    );
}

function Member({ name, role }) {
    const avatar = `https://api.dicebear.com/8.x/initials/svg?seed=${encodeURIComponent(
        name
    )}&backgroundType=gradientLinear&fontFamily=Inter&fontWeight=700`;
    return (
        <div className="rounded-2xl border border-[#E7E7ED] bg-white p-6 text-center">
            <img
                src={avatar}
                alt={name}
                className="w-20 h-20 rounded-full mx-auto object-cover"
            />
            <h4 className="mt-3 font-semibold">{name}</h4>
            <p className="text-sm text-[#5c5c66]">{role}</p>
        </div>
    );
}