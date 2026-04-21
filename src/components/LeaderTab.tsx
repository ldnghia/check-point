import type { Session } from "../types";
import { computeScores, perRound } from "../utils/data";

export default function LeaderTab({ session }: { session: Session }) {
  const scores = computeScores(session);
  const ranked = [...session.players].map((p) => ({ ...p, score: scores[p.id] })).sort((a, b) => b.score - a.score);
  const matrix = perRound(session);
  const last = matrix[matrix.length - 1];

  return (
    <>
      <div className="h-head"><h2>Xếp hạng</h2></div>
      <div className="lb">
        {ranked.map((p, i) => (
          <div key={p.id} className={"lb-item " + (i === 0 ? "top" : "")} style={{ "--pc": p.color } as React.CSSProperties}>
            <div className="lr">{i === 0 ? "★" : String(i + 1).padStart(2, "0")}</div>
            <div className="av" style={{ "--pc": p.color, width: 40, height: 40, fontSize: 15 } as React.CSSProperties}>
              {p.name.slice(0, 1).toUpperCase()}
            </div>
            <div className="lname">
              <div className="nn">{p.name}</div>
              <div className="mm">
                {last ? (
                  <span style={{ color: last.perPlayer[p.id] > 0 ? "var(--positive)" : last.perPlayer[p.id] < 0 ? "var(--danger)" : "var(--text-3)" }}>
                    round vừa rồi {last.perPlayer[p.id] > 0 ? "+" : ""}{last.perPlayer[p.id]}
                  </span>
                ) : "chưa có round"}
              </div>
            </div>
            <div className="lbsc">{p.score}</div>
          </div>
        ))}
      </div>
    </>
  );
}
