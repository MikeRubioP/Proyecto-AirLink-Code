// src/Pages/Usuario/Cupones.jsx
import React, { useMemo, useState } from "react";

const MOCK_TOTAL = 79990; // total de ejemplo para la simulación

export default function Cupones() {
    const [code, setCode] = useState("");
    const [applied, setApplied] = useState(null); // cupón aplicado
    const [copied, setCopied] = useState("");     // código recientemente copiado
    const [query, setQuery] = useState("");

    // catálogos de ejemplo (puedes traerlos desde la API luego)
    const coupons = useMemo(
        () => [
            {
                id: 1,
                code: "AIRLINK15",
                title: "15% OFF en vuelos seleccionados",
                type: "percent", // percent | fixed
                value: 15,
                min: 30000,
                expires: "2025-12-31",
                tag: "Recomendado",
            },
            {
                id: 2,
                code: "BIENVENIDA10",
                title: "Descuento de bienvenida",
                type: "percent",
                value: 10,
                min: 0,
                expires: "2025-08-30",
                tag: "Nuevo",
            },
            {
                id: 3,
                code: "FULL20K",
                title: "$20.000 de descuento",
                type: "fixed",
                value: 20000,
                min: 80000,
                expires: "2025-11-15",
                tag: "Limitado",
            },
            {
                id: 4,
                code: "LATAM5",
                title: "5% OFF LATAM",
                type: "percent",
                value: 5,
                min: 25000,
                expires: "2025-09-30",
                tag: "Partner",
            },
        ],
        []
    );

    const filtered = coupons.filter(
        (c) =>
            c.code.toLowerCase().includes(query.toLowerCase()) ||
            c.title.toLowerCase().includes(query.toLowerCase()) ||
            c.tag.toLowerCase().includes(query.toLowerCase())
    );

    const applyCoupon = (c) => {
        // validaciones simples
        if (MOCK_TOTAL < c.min) {
            alert(`Este cupón requiere un mínimo de $${c.min.toLocaleString("es-CL")}.`);
            return;
        }
        setApplied(c);
        setCode(c.code);
    };

    const handleRedeem = (e) => {
        e.preventDefault();
        const found = coupons.find((c) => c.code.toLowerCase() === code.trim().toLowerCase());
        if (!found) {
            alert("Código inválido o no disponible.");
            return;
        }
        applyCoupon(found);
    };

    const removeCoupon = () => {
        setApplied(null);
        setCode("");
    };

    const discountValue = (() => {
        if (!applied) return 0;
        if (applied.type === "percent") return Math.round((applied.value / 100) * MOCK_TOTAL);
        return Math.min(applied.value, MOCK_TOTAL);
    })();

    const finalTotal = Math.max(0, MOCK_TOTAL - discountValue);

    const copy = async (txt) => {
        try {
            await navigator.clipboard.writeText(txt);
            setCopied(txt);
            setTimeout(() => setCopied(""), 1200);
        } catch { }
    };

    return (
        <div className="min-h-screen bg-[#F7F7FB]">
            {/* HERO */}
            <section className="relative overflow-hidden">
                <div className="absolute -top-24 -right-24 h-72 w-72 rounded-full bg-[#7C4DFF]/10 blur-2xl" />
                <div className="absolute -bottom-24 -left-24 h-72 w-72 rounded-full bg-[#7C4DFF]/10 blur-2xl" />

                <div className="max-w-7xl mx-auto px-6 py-12 md:py-16">
                    <p className="inline-flex items-center gap-2 text-sm text-[#7C4DFF] font-semibold bg-[#7C4DFF]/10 px-3 py-1 rounded-full">
                        🎟️ Cupones
                    </p>
                    <h1 className="mt-3 text-3xl md:text-4xl font-extrabold">
                        Canjea y ahorra en tus vuelos
                    </h1>
                    <p className="mt-2 text-[#5c5c66] max-w-2xl">
                        Aplica un código promocional o elige uno de los cupones disponibles. Se muestra una simulación del total.
                    </p>
                </div>
            </section>

            {/* GRID principal */}
            <section className="max-w-7xl mx-auto px-6 pb-16 grid lg:grid-cols-3 gap-6">
                {/* Lado izquierdo: canje + buscador + listado */}
                <div className="lg:col-span-2 space-y-4">
                    {/* Canjear código */}
                    <form
                        onSubmit={handleRedeem}
                        className="rounded-3xl border border-[#E7E7ED] bg-white p-4 md:p-5 flex flex-col md:flex-row gap-3"
                    >
                        <input
                            value={code}
                            onChange={(e) => setCode(e.target.value)}
                            className="input rounded-xl w-full md:flex-1"
                            placeholder="Ingresa tu código (ej. AIRLINK15)"
                        />
                        <button
                            type="submit"
                            className="rounded-xl bg-[#7C4DFF] text-white px-6 py-3 hover:bg-[#6B3DF0] transition"
                        >
                            Canjear
                        </button>
                    </form>

                    {/* Buscador */}
                    <div className="rounded-3xl border border-[#E7E7ED] bg-white p-4">
                        <input
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            placeholder="Buscar cupones (título, código o etiqueta)"
                            className="input rounded-xl w-full"
                        />
                    </div>

                    {/* Lista de cupones */}
                    <div className="space-y-4">
                        {filtered.map((c) => (
                            <CouponCard
                                key={c.id}
                                c={c}
                                onUse={() => applyCoupon(c)}
                                onCopy={() => copy(c.code)}
                                copied={copied === c.code}
                            />
                        ))}
                        {filtered.length === 0 && (
                            <div className="rounded-3xl border border-[#E7E7ED] bg-white p-8 text-center text-[#5c5c66]">
                                No encontramos cupones con ese filtro.
                            </div>
                        )}
                    </div>
                </div>

                {/* Lado derecho: resumen y simulación */}
                <aside className="rounded-3xl border border-[#E7E7ED] bg-white p-6 h-fit">
                    <h3 className="text-lg font-bold">Resumen</h3>
                    <p className="text-sm text-[#5c5c66] mb-4">
                        Monto simulado del carrito: <b>${MOCK_TOTAL.toLocaleString("es-CL")}</b>
                    </p>

                    <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                            <span>Subtotal</span>
                            <span>${MOCK_TOTAL.toLocaleString("es-CL")}</span>
                        </div>
                        <div className="flex justify-between text-[#7C4DFF]">
                            <span>Descuento {applied ? `(${applied.code})` : ""}</span>
                            <span>- ${discountValue.toLocaleString("es-CL")}</span>
                        </div>
                        <div className="h-px bg-[#E7E7ED] my-2" />
                        <div className="flex justify-between font-extrabold text-lg">
                            <span>Total</span>
                            <span>${finalTotal.toLocaleString("es-CL")}</span>
                        </div>
                    </div>

                    {applied ? (
                        <button
                            className="mt-5 w-full rounded-xl border border-[#E7E7ED] px-4 py-3 hover:bg-[#fafafe]"
                            onClick={removeCoupon}
                        >
                            Quitar cupón
                        </button>
                    ) : (
                        <button
                            className="mt-5 w-full rounded-xl bg-[#7C4DFF] text-white px-4 py-3 hover:bg-[#6B3DF0]"
                            onClick={() => alert("Proceder con este total (simulado).")}
                        >
                            Continuar con el pago
                        </button>
                    )}
                </aside>
            </section>
        </div>
    );
}

/* ---------- Subcomponentes ---------- */

function CouponCard({ c, onUse, onCopy, copied }) {
    const isPercent = c.type === "percent";
    const expiresFmt = new Date(c.expires).toLocaleDateString("es-CL");

    return (
        <div className="rounded-2xl border border-[#E7E7ED] bg-white p-4 md:p-5 flex flex-col md:flex-row md:items-center gap-4">
            <div className="flex-1">
                <div className="flex items-center gap-2">
                    <span className="inline-flex text-xs font-semibold text-[#7C4DFF] bg-[#7C4DFF]/10 rounded-full px-2 py-0.5">
                        {c.tag}
                    </span>
                    <span className="text-xs text-[#8A8A8E]">Vence: {expiresFmt}</span>
                </div>

                <h4 className="mt-1 font-semibold">{c.title}</h4>
                <p className="text-sm text-[#5c5c66]">
                    Código: <b>{c.code}</b> · {isPercent ? `${c.value}% OFF` : `$${c.value.toLocaleString("es-CL")} OFF`} ·
                    &nbsp;Mínimo: ${c.min.toLocaleString("es-CL")}
                </p>
            </div>

            <div className="flex gap-2">
                <button
                    onClick={onCopy}
                    className="rounded-xl border border-[#E7E7ED] px-4 py-2 text-sm bg-white hover:bg-[#fafafe]"
                >
                    {copied ? "¡Copiado!" : "Copiar"}
                </button>
                <button
                    onClick={onUse}
                    className="rounded-xl bg-[#7C4DFF] text-white px-4 py-2 text-sm hover:bg-[#6B3DF0]"
                >
                    Usar ahora
                </button>
            </div>
        </div>
    );
}