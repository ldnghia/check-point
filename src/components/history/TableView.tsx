import type { Session, RoundData } from "../../types";

interface Props {
  session: Session;
  matrix: RoundData[];
  scores: Record<string, number>;
}

export default function TableView({ session, matrix, scores }: Props) {
  return (
    <div className="panel" style={{ overflow: "auto" }}>
      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13, fontVariantNumeric: "tabular-nums" }}>
        <thead>
          <tr style={{ background: "var(--bg-2)" }}>
            <th style={{ padding: "8px 10px", textAlign: "left", fontSize: 10, color: "var(--text-3)", textTransform: "uppercase", letterSpacing: "0.04em" }}>R</th>
            {session.players.map((p) => (
              <th key={p.id} style={{ padding: "8px 10px", textAlign: "right", fontSize: 11, color: "var(--text)", fontWeight: 500 }}>
                <span style={{ display: "inline-flex", alignItems: "center", gap: 5 }}>
                  <span style={{ width: 6, height: 6, borderRadius: 2, background: p.color, display: "inline-block" }} />
                  {p.name}
                </span>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {matrix.map((r) => (
            <tr key={r.round} style={{ borderTop: "1px solid var(--line)" }}>
              <td style={{ padding: "8px 10px", color: "var(--text-3)", fontSize: 11 }}>R{String(r.round).padStart(2, "0")}</td>
              {session.players.map((p) => {
                const d = r.perPlayer[p.id];
                return (
                  <td key={p.id} style={{ padding: "8px 10px", textAlign: "right" }}>
                    <div style={{ display: "flex", justifyContent: "flex-end", alignItems: "center", gap: 6 }}>
                      <span style={{
                        fontSize: 11, padding: "1px 6px", borderRadius: 999,
                        color: d > 0 ? "var(--positive)" : d < 0 ? "var(--danger)" : "var(--text-3)",
                        background: d === 0 ? "transparent" : `color-mix(in oklab, ${d > 0 ? "var(--positive)" : "var(--danger)"} 14%, transparent)`,
                      }}>
                        {d === 0 ? "—" : (d > 0 ? "+" : "") + d}
                      </span>
                      <span style={{ color: "var(--text-3)", fontSize: 11, minWidth: 24, textAlign: "right" }}>{r.totals[p.id]}</span>
                    </div>
                  </td>
                );
              })}
            </tr>
          ))}
          <tr style={{ background: "var(--bg-2)", fontWeight: 600, borderTop: "1px solid var(--line)" }}>
            <td style={{ padding: "10px", color: "var(--text)" }}>Tổng</td>
            {session.players.map((p) => (
              <td key={p.id} style={{ padding: "10px", textAlign: "right", fontSize: 14 }}>{scores[p.id]}</td>
            ))}
          </tr>
        </tbody>
      </table>
    </div>
  );
}
