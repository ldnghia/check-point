import { useState } from "react";
import type { Player } from "../types";
import Icon from "./Icon";

interface Props {
  player: Player;
  onCancel: () => void;
  onApply: (v: number) => void;
}

export default function Numpad({ player, onCancel, onApply }: Props) {
  const [val, setVal] = useState("");
  const [sign, setSign] = useState(1);

  const press = (k: string) => {
    if (k === "del") return setVal((v) => v.slice(0, -1));
    if (k === "clr") return setVal("");
    if (val.length >= 4) return;
    setVal((v) => v + k);
  };

  const n = parseInt(val, 10);
  const final = isNaN(n) ? 0 : n * sign;

  return (
    <div className="sheet" onClick={(e) => e.stopPropagation()}>
      <div className="grab" />
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <div
          className="av"
          style={{
            "--pc": player.color,
            width: 36, height: 36, fontSize: 14,
            background: `color-mix(in oklab, ${player.color} 22%, var(--bg-2))`,
            color: player.color,
            border: `1px solid color-mix(in oklab, ${player.color} 35%, transparent)`,
          } as React.CSSProperties}
        >
          {player.name.slice(0, 1).toUpperCase()}
        </div>
        <h3 style={{ flex: 1 }}>{player.name}</h3>
        <button className="sheet-close" onClick={onCancel}><Icon n="close" s={14} /></button>
      </div>

      <div className="np-display">
        {val === "" ? (
          <span className="hint">nhập điểm…</span>
        ) : (
          <><span className={"sgn " + (sign > 0 ? "pos" : "neg")}>{sign > 0 ? "+" : "−"}</span>{val}</>
        )}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 }}>
        <button
          className="chip big"
          style={{
            background: sign > 0 ? "color-mix(in oklab, var(--positive) 18%, var(--bg-2))" : "var(--bg-2)",
            color: sign > 0 ? "var(--positive)" : "var(--text-2)",
          }}
          onClick={() => setSign(1)}
        >
          + Cộng
        </button>
        <button
          className="chip big"
          style={{
            background: sign < 0 ? "color-mix(in oklab, var(--danger) 18%, var(--bg-2))" : "var(--bg-2)",
            color: sign < 0 ? "var(--danger)" : "var(--text-2)",
          }}
          onClick={() => setSign(-1)}
        >
          − Trừ
        </button>
      </div>

      <div className="numpad">
        {["1","2","3","4","5","6","7","8","9"].map((k) => (
          <button key={k} onClick={() => press(k)}>{k}</button>
        ))}
        <button className="fn" onClick={() => press("clr")}>C</button>
        <button onClick={() => press("0")}>0</button>
        <button className="fn" onClick={() => press("del")}>⌫</button>
      </div>

      <button
        className="apply-btn"
        onClick={() => { if (final !== 0) onApply(final); }}
      >
        <Icon n="check" s={16} />
        Xác nhận {final !== 0 && (final > 0 ? "+" : "") + final}
      </button>
    </div>
  );
}
