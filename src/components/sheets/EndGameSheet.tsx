import type { Session } from "../../types";
import { computeScores, perRound } from "../../utils/data";
import Icon from "../Icon";

interface Props {
  session: Session;
  onNewSession: () => void;
  onClose: () => void;
}

const MEDALS = ["🥇", "🥈", "🥉"];

export default function EndGameSheet({ session, onNewSession, onClose }: Props) {
  const scores = computeScores(session);
  const ranked = [...session.players]
    .map((p) => ({ ...p, score: scores[p.id] }))
    .sort((a, b) => b.score - a.score);
  const totalRounds = perRound(session).length;

  return (
    <div className="sheet" onClick={(e) => e.stopPropagation()} style={{ maxHeight: "88vh" }}>
      <div className="grab" />

      <div style={{ textAlign: "center", padding: "8px 0 16px" }}>
        <div style={{ fontSize: 40, lineHeight: 1, marginBottom: 8 }}>🏆</div>
        <h2 style={{ margin: 0, fontSize: 20, fontWeight: 700 }}>Kết thúc ván!</h2>
        <div style={{ fontSize: 12, color: "var(--text-3)", marginTop: 4 }}>
          {session.name} · {totalRounds} round{totalRounds !== 1 ? "s" : ""}
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 8, overflowY: "auto", flex: 1 }}>
        {ranked.map((p, i) => (
          <div
            key={p.id}
            style={{
              display: "flex", alignItems: "center", gap: 12,
              padding: i === 0 ? "14px 14px" : "10px 14px",
              borderRadius: 14,
              background: i === 0
                ? "color-mix(in oklab, var(--accent) 12%, var(--bg-2))"
                : "var(--bg-2)",
              border: i === 0 ? "1px solid color-mix(in oklab, var(--accent) 35%, transparent)" : "1px solid var(--line)",
              "--pc": p.color,
            } as React.CSSProperties}
          >
            <div style={{ fontSize: i < 3 ? 22 : 14, fontWeight: 700, width: 28, textAlign: "center", color: "var(--text-3)" }}>
              {i < 3 ? MEDALS[i] : String(i + 1).padStart(2, "0")}
            </div>
            <div
              className="av"
              style={{ "--pc": p.color, width: i === 0 ? 44 : 36, height: i === 0 ? 44 : 36, fontSize: i === 0 ? 17 : 14 } as React.CSSProperties}
            >
              {p.name.slice(0, 1).toUpperCase()}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: i === 0 ? 16 : 14, fontWeight: i === 0 ? 700 : 500, color: "var(--text)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {p.name}
              </div>
              {i === 0 && (
                <div style={{ fontSize: 11, color: "var(--accent)", fontWeight: 600, marginTop: 2 }}>Người chiến thắng</div>
              )}
            </div>
            <div style={{ fontSize: i === 0 ? 22 : 17, fontWeight: 700, color: i === 0 ? "var(--accent)" : "var(--text)", fontVariantNumeric: "tabular-nums" }}>
              {p.score}
            </div>
          </div>
        ))}
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 16 }}>
        <button
          onClick={onNewSession}
          style={{ width: "100%", padding: "13px", borderRadius: 12, border: "none", background: "var(--text)", color: "var(--bg)", fontSize: 15, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}
        >
          <Icon n="plusc" s={16} /> Tạo session mới
        </button>
        <button
          onClick={onClose}
          style={{ width: "100%", padding: "11px", borderRadius: 12, border: "1px solid var(--line)", background: "transparent", color: "var(--text-2)", fontSize: 14, fontWeight: 500, cursor: "pointer" }}
        >
          Đóng
        </button>
      </div>
    </div>
  );
}
