// src/Pages/Cliente/Asientos.jsx
import React, { useMemo, useState } from "react";

/**
 * Props opcionales:
 * - seats: Array<{ code: "1A" | "12F" | ... , disabled?: boolean, ocupado?: boolean, taken?: boolean, estado?: string }>
 * - onSelect: (seatCode: string | null, seatObj: object | null) => void
 * - maxSelect: number (por si se quisieran varios asientos)
 */
export default function Asientos({ seats = null, onSelect, maxSelect = 1 }) {
  // Letras por lado para A320 3–pasillo–3
  const LEFT = ["A", "B", "C"];
  const RIGHT = ["D", "E", "F"];
  const ROWS = Array.from({ length: 20 }, (_, i) => i + 1);

  // Si no vienen asientos desde props, generamos un mock básico
  const allSeats = useMemo(() => {
    if (Array.isArray(seats) && seats.length) return seats;

    // Mock: todos libres excepto algunos
    const mock = [];
    for (const r of ROWS) {
      for (const l of [...LEFT, ...RIGHT]) {
        mock.push({
          code: `${r}${l}`,
          // bloqueados de ejemplo
          disabled:
            (r === 1 && (l === "C" || l === "D")) ||
            (r === 2 && l === "A") ||
            false,
        });
      }
    }
    // Ocupados de ejemplo
    return mock;
  }, [seats]);

  // Índice rápido por code
  const seatByCode = useMemo(() => {
    const map = new Map();
    for (const s of allSeats) map.set(s.code, s);
    return map;
  }, [allSeats]);

  // Selección local (soporta 1 o más)
  const [selected, setSelected] = useState([]);

  const toggleSeat = (seat) => {
    const { code } = seat;
    const exists = selected.includes(code);

    // Si solo permites 1 selección
    if (maxSelect === 1) {
      const next = exists ? [] : [code];
      setSelected(next);
      onSelect?.(next[0] ?? null, next[0] ? seatByCode.get(next[0]) : null);
      return;
    }

    // Permite varios
    let next = exists ? selected.filter((c) => c !== code) : [...selected, code];
    if (next.length > maxSelect) next = next.slice(0, maxSelect);
    setSelected(next);
    onSelect?.(next, next.map((c) => seatByCode.get(c)));
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h2 className="text-center text-lg font-semibold mb-2">
        Cabina A320 (3–3)
      </h2>

      <div className="flex justify-center gap-10">
        {/* Etiquetas de letras (A..F) */}
        <div className="flex flex-col items-center pt-8">
          <div className="flex gap-2 text-xs text-gray-500 mb-1">
            {LEFT.map((l) => (
              <span key={`L${l}`} className="w-9 text-center">
                {l}
              </span>
            ))}
            <span className="w-5" />
            {RIGHT.map((l) => (
              <span key={`R${l}`} className="w-9 text-center">
                {l}
              </span>
            ))}
          </div>

          {/* Filas */}
          <div className="flex flex-col gap-2">
            {ROWS.map((row) => (
              <SeatRow
                key={row}
                row={row}
                LEFT={LEFT}
                RIGHT={RIGHT}
                seatByCode={seatByCode}
                selected={selected}
                onToggle={toggleSeat}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Leyenda simple */}
      <div className="mt-6 flex items-center gap-4 justify-center text-sm">
        <LegendBox className="bg-white border-[#E7E7ED]" label="Disponible" />
        <LegendBox className="bg-gray-200 text-gray-500" label="No disponible" />
        <LegendBox className="bg-[#E9E2FF] text-[#5B35FF]" label="Seleccionado" />
      </div>
    </div>
  );
}

/* -------------------- Fila (3–pasillo–3) -------------------- */
function SeatRow({ row, LEFT, RIGHT, seatByCode, selected, onToggle }) {
  return (
    <div className="flex items-center gap-2">
      {/* N° de fila a la izquierda */}
      <div className="text-xs w-6 text-right pr-1 text-gray-500">{row}</div>

      {/* Lado Izquierdo (A,B,C) */}
      <div className="flex gap-2">
        {LEFT.map((l) => {
          const code = `${row}${l}`;
          const seat = seatByCode.get(code) || { code };
          const active = selected.includes(code);
        return (
            <SeatButton
              key={code}
              seat={seat}
              active={active}
              onClick={() => onToggle(seat)}
            />
          );
        })}
      </div>

      {/* Pasillo */}
      <div className="w-5" />

      {/* Lado Derecho (D,E,F) */}
      <div className="flex gap-2">
        {RIGHT.map((l) => {
          const code = `${row}${l}`;
          const seat = seatByCode.get(code) || { code };
          const active = selected.includes(code);
          return (
            <SeatButton
              key={code}
              seat={seat}
              active={active}
              onClick={() => onToggle(seat)}
            />
          );
        })}
      </div>

      {/* N° de fila a la derecha (opcional) */}
      <div className="text-xs w-6 text-left pl-1 text-gray-500">{row}</div>
    </div>
  );
}

/* -------------------- Botón de asiento (en este mismo archivo) -------------------- */
function SeatButton({ seat, active, onClick }) {
  const isDisabled =
    seat?.disabled === true ||
    seat?.ocupado === true ||
    seat?.taken === true ||
    seat?.estado === "ocupado" ||
    seat?.estado === "bloqueado";

  const base =
    "h-9 w-9 rounded-md text-xs font-semibold flex items-center justify-center border transition-colors";
  const cls = isDisabled
    ? `${base} bg-gray-200 text-gray-500 border-gray-300 cursor-not-allowed`
    : active
    ? `${base} bg-[#E9E2FF] text-[#5B35FF] border-[#CDBBFF] hover:bg-[#E1D9FF]`
    : `${base} bg-white text-gray-800 border-[#E7E7ED] hover:bg-[#fafafe]`;

  return (
    <button
      type="button"
      disabled={isDisabled}
      onClick={() => !isDisabled && onClick?.(seat)}
      aria-pressed={active ? "true" : "false"}
      aria-label={`Asiento ${seat?.code || ""}${
        isDisabled ? " no disponible" : ""
      }`}
      className={cls}
      title={seat?.code}
    >
      {/* Muestra solo la letra para que sea más limpio (A/B/C...) */}
      {seat?.code?.replace(/^\d+/, "")}
      {/* Si prefieres mostrar completo, usa {seat?.code} */}
    </button>
  );
}

/* -------------------- Leyenda -------------------- */
function LegendBox({ className = "", label }) {
  return (
    <div className="flex items-center gap-2">
      <div className={`h-5 w-5 rounded-md border border-[#E7E7ED] ${className}`} />
      <span className="text-gray-600">{label}</span>
    </div>
  );
}
