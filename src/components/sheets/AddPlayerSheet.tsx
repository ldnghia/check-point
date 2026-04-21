import { useState, useEffect, useRef } from "react";
import type { Session } from "../../types";
import { PALETTE, NAMES } from "../../utils/data";
import Icon from "../Icon";

interface Props {
  session: Session;
  onAdd: (name: string, color: string) => void;
  onClose: () => void;
}

export default function AddPlayerSheet({ session, onAdd, onClose }: Props) {
  const taken = new Set(session.players.map((p) => p.color));
  const defaultColor = PALETTE.find((c) => !taken.has(c)) || PALETTE[session.players.length % PALETTE.length];
  const [name, setName] = useState("");
  const [color, setColor] = useState(defaultColor);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { setTimeout(() => inputRef.current?.focus(), 50); }, []);

  const available = NAMES.filter((n) => !session.players.some((p) => p.name === n));

  return (
    <div className="sheet" onClick={(e) => e.stopPropagation()}>
      <div className="grab" />
      <div style={{ display: "flex", alignItems: "center" }}>
        <h3>Thêm người chơi</h3>
        <button className="sheet-close" onClick={onClose}><Icon n="close" s={14} /></button>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "4px 2px" }}>
        <div className="av" style={{
          "--pc": color, width: 52, height: 52, fontSize: 20,
          background: `color-mix(in oklab, ${color} 22%, var(--bg-2))`,
          color, border: `1px solid color-mix(in oklab, ${color} 35%, transparent)`,
        } as React.CSSProperties}>
          {(name.trim() || "?").slice(0, 1).toUpperCase()}
        </div>
        <div style={{ flex: 1, fontSize: 12, color: "var(--text-3)" }}>
          Người thứ {session.players.length + 1} · bắt đầu với 0 điểm ở <b style={{ color: "var(--text)" }}>R{session.currentRound}</b>
        </div>
      </div>
      <div className="tw-grp">
        <div className="tw-lbl">Tên</div>
        <input
          ref={inputRef}
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter") onAdd(name, color); }}
          placeholder={available[0] || "Nhập tên..."}
          style={{ background: "var(--bg-2)", border: "1px solid var(--line)", borderRadius: 12, padding: "14px 16px", fontSize: 16, fontWeight: 500, color: "var(--text)" }}
        />
        {available.length > 0 && (
          <div className="tw-segw" style={{ marginTop: 6 }}>
            {available.slice(0, 6).map((n) => (
              <button key={n} onClick={() => setName(n)} style={{ fontSize: 12 }}>{n}</button>
            ))}
          </div>
        )}
      </div>
      <div className="tw-grp">
        <div className="tw-lbl">Màu</div>
        <div className="swatches-row" style={{ padding: "4px 0" }}>
          {PALETTE.map((c) => {
            const used = taken.has(c);
            return (
              <button
                key={c}
                className={"sw-opt " + (color === c ? "on" : "")}
                style={{ "--c": c, background: c, opacity: used ? 0.3 : 1 } as React.CSSProperties}
                disabled={used && color !== c}
                onClick={() => setColor(c)}
              />
            );
          })}
        </div>
      </div>
      <button className="apply-btn" onClick={() => onAdd(name, color)}>
        <Icon n="plusc" s={16} /> Thêm {name.trim() || "người chơi"}
      </button>
    </div>
  );
}
