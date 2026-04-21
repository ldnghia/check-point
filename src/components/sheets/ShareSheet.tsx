import { useState } from "react";
import type { Session } from "../../types";
import { computeScores } from "../../utils/data";
import Icon from "../Icon";

interface Props {
  session: Session;
  onClose: () => void;
}

export default function ShareSheet({ session, onClose }: Props) {
  const scores = computeScores(session);
  const ranked = [...session.players].map((p) => ({ ...p, score: scores[p.id] })).sort((a, b) => b.score - a.score);
  const n = Math.max(0, session.currentRound - 1);
  const [copied, setCopied] = useState(false);

  const copy = () => {
    const t =
      `🎲 ${session.name}\n${n} round · ${session.players.length} người\n\n` +
      ranked.map((p, i) => `${i === 0 ? "🏆" : i + 1 + "."} ${p.name} — ${p.score}`).join("\n");
    navigator.clipboard?.writeText(t);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="sheet" onClick={(e) => e.stopPropagation()}>
      <div className="grab" />
      <div style={{ display: "flex", alignItems: "center" }}>
        <h3>Chia sẻ kết quả</h3>
        <button className="sheet-close" onClick={onClose}><Icon n="close" s={14} /></button>
      </div>
      <div className="share-card">
        <div className="stitle">Check·point · kết quả</div>
        <div className="sgame">{session.name}</div>
        <div>
          {ranked.map((p, i) => (
            <div key={p.id} className={"share-row " + (i === 0 ? "w" : "")}>
              <div className="rk">{i === 0 ? "🏆" : i + 1}</div>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <div style={{ width: 10, height: 10, borderRadius: 3, background: p.color }} />{p.name}
              </div>
              <div className="sc">{p.score}</div>
            </div>
          ))}
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: "var(--text-3)" }}>
          <span>{n} round</span>
          <span>{new Date().toLocaleDateString("vi-VN")}</span>
        </div>
      </div>
      <div style={{ display: "flex", gap: 8 }}>
        <button className="chip big" style={{ flex: 1, justifyContent: "center", height: 48 }} onClick={copy}>
          <Icon n="copy" s={14} /> {copied ? "Đã copy" : "Copy"}
        </button>
        <button className="chip big" style={{ flex: 1, justifyContent: "center", height: 48, background: "var(--accent)", color: "var(--accent-ink)", borderColor: "transparent", fontWeight: 600 }} onClick={onClose}>
          <Icon n="check" s={14} /> Xong
        </button>
      </div>
    </div>
  );
}
