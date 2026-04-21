import type { Session, RoundData } from "../../types";

interface Props {
  session: Session;
  matrix: RoundData[];
}

export default function ChartView({ session, matrix }: Props) {
  const W = 360, H = 220;
  const pad = { l: 28, r: 50, t: 12, b: 24 };
  const innerW = W - pad.l - pad.r;
  const innerH = H - pad.t - pad.b;
  const all = [0, ...matrix.flatMap((r) => session.players.map((p) => r.totals[p.id]))];
  const maxY = Math.max(10, ...all);
  const minY = Math.min(0, ...all);
  const rY = maxY - minY || 1;
  const n = Math.max(matrix.length, 1);
  const x = (i: number) => pad.l + (n <= 1 ? innerW / 2 : (i / (n - 1 || 1)) * innerW);
  const y = (v: number) => pad.t + (1 - (v - minY) / rY) * innerH;
  const ticks: number[] = [];
  for (let i = 0; i <= 4; i++) ticks.push(Math.round(minY + (rY * i) / 4));

  return (
    <>
      <div className="chart-legend">
        {session.players.map((p) => (
          <span key={p.id} className="lg" style={{ "--pc": p.color } as React.CSSProperties}>
            <span className="dot" />{p.name}
          </span>
        ))}
      </div>
      <div className="panel" style={{ marginTop: 10 }}>
        <div className="chart-box">
          <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", display: "block" }}>
            {ticks.map((v, i) => (
              <g key={i}>
                <line x1={pad.l} x2={W - pad.r} y1={y(v)} y2={y(v)} stroke="var(--line)" strokeDasharray={v === 0 ? "0" : "2 4"} />
                <text x={pad.l - 4} y={y(v) + 3} fill="var(--text-3)" fontSize="9" textAnchor="end" fontFamily="var(--mono)">{v}</text>
              </g>
            ))}
            {matrix.map((r, i) => (
              <text key={r.round} x={x(i)} y={H - 6} fill="var(--text-3)" fontSize="9" textAnchor="middle" fontFamily="var(--mono)">R{r.round}</text>
            ))}
            {session.players.map((p) => {
              const pts = matrix.map((r, i) => [x(i), y(r.totals[p.id])] as [number, number]);
              const d = pts.map((pt, i) => (i === 0 ? "M" : "L") + pt[0] + "," + pt[1]).join(" ");
              return (
                <g key={p.id}>
                  <path d={d} fill="none" stroke={p.color} strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />
                  {pts.map((pt, i) => <circle key={i} cx={pt[0]} cy={pt[1]} r={i === pts.length - 1 ? 3.5 : 2} fill={p.color} />)}
                  {pts.length > 0 && (
                    <text x={pts[pts.length - 1][0] + 5} y={pts[pts.length - 1][1] + 3} fill={p.color} fontSize="10" fontFamily="var(--mono)">{p.name}</text>
                  )}
                </g>
              );
            })}
          </svg>
        </div>
      </div>
    </>
  );
}
