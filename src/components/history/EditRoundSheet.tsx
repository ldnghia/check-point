import { useState } from "react";
import type { Player } from "../../types";
import Icon from "../Icon";

interface Props {
  player: Player;
  round: number;
  currentDelta: number;
  onCancel: () => void;
  onApply: (newDelta: number) => void;
}

export default function EditRoundSheet({ player, round, currentDelta, onCancel, onApply }: Props) {
  const [val, setVal] = useState(currentDelta === 0 ? "" : String(Math.abs(currentDelta)));
  const [sign, setSign] = useState(currentDelta < 0 ? -1 : 1);

  const press = (k: string) => {
    if (k === "del") return setVal((v) => v.slice(0, -1));
    if (k === "clr") return setVal("");
    if (val.length >= 4) return;
    setVal((v) => v + k);
  };

  const n = parseInt(val, 10);
  const final = isNaN(n) ? 0 : n * sign;
  const changed = final !== currentDelta;

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
        <div style={{ flex: 1 }}>
          <h3 style={{ margin: 0, fontSize: 16 }}>{player.name}</h3>
          <div style={{ fontSize: 11, color: "var(--text-3)", marginTop: 2 }}>
            Sửa điểm · Round {String(round).padStart(2, "0")}
          </div>
        </div>
        <button className="sheet-close" onClick={onCancel}><Icon n="close" s={14} /></button>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "4px 2px" }}>
        <div style={{ fontSize: 12, color: "var(--text-3)" }}>Hiện tại:</div>
        <div style={{
          fontSize: 13, fontWeight: 600, fontVariantNumeric: "tabular-nums",
          padding: "3px 10px", borderRadius: 999,
          color: currentDelta > 0 ? "var(--positive)" : currentDelta < 0 ? "var(--danger)" : "var(--text-3)",
          background: currentDelta === 0 ? "transparent" : `color-mix(in oklab, ${currentDelta > 0 ? "var(--positive)" : "var(--danger)"} 14%, transparent)`,
        }}>
          {currentDelta === 0 ? "—" : (currentDelta > 0 ? "+" : "") + currentDelta}
        </div>
        {currentDelta !== 0 && (
          <button
            onClick={() => onApply(0)}
            style={{ marginLeft: "auto", fontSize: 11, color: "var(--danger)", padding: "4px 10px", borderRadius: 999, background: "color-mix(in oklab, var(--danger) 10%, transparent)", border: "1px solid color-mix(in oklab, var(--danger) 25%, transparent)", cursor: "pointer" }}
          >
            Xoá điểm
          </button>
        )}
      </div>

      <div className="np-display">
        {val === "" ? (
          <span className="hint">nhập điểm mới…</span>
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
        style={{ opacity: (!changed || val === "") ? 0.5 : 1 }}
        onClick={() => { if (changed && val !== "") onApply(final); }}
      >
        <Icon n="check" s={16} />
        {val === "" ? "Nhập điểm mới" : `Cập nhật → ${final > 0 ? "+" : ""}${final}`}
      </button>
    </div>
  );
}
