// ============ History Table + Chart ============
function HistoryTable({ session }) {
  const matrix = SessionUtils.perRoundMatrix(session);
  const totals = SessionUtils.computeScores(session);

  if (matrix.length === 0) {
    return (
      <div className="panel">
        <div className="empty">
          Chưa có round nào. Cộng/trừ điểm, rồi bấm <b>Kết thúc round</b> để ghi lại.
        </div>
      </div>
    );
  }

  return (
    <div className="panel">
      <div className="htable-wrap">
        <table className="htable">
          <thead>
            <tr>
              <th>Round</th>
              {session.players.map((p) => (
                <th key={p.id} style={{ "--pc": p.color }}>
                  <span className="ph">
                    <span className="dot" />
                    {p.name}
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {matrix.map((r) => (
              <tr key={r.round}>
                <td>R{String(r.round).padStart(2, "0")}</td>
                {session.players.map((p) => {
                  const d = r.perPlayer[p.id];
                  const running = r.totals[p.id];
                  return (
                    <td key={p.id}>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "flex-end",
                          gap: 8,
                        }}
                      >
                        <span
                          className={
                            "delta " +
                            (d > 0 ? "pos" : d < 0 ? "neg" : "zero")
                          }
                        >
                          {d > 0 ? "+" : ""}
                          {d === 0 ? "—" : d}
                        </span>
                        <span style={{ color: "var(--text-3)", fontSize: 12, minWidth: 32, textAlign: "right" }}>
                          {running}
                        </span>
                      </div>
                    </td>
                  );
                })}
              </tr>
            ))}
            <tr className="total-row">
              <td>Tổng</td>
              {session.players.map((p) => (
                <td key={p.id}>{totals[p.id]}</td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}

function LineChart({ session, hidden = {} }) {
  const matrix = SessionUtils.perRoundMatrix(session);
  const W = 860;
  const H = 300;
  const pad = { l: 40, r: 24, t: 16, b: 28 };
  const innerW = W - pad.l - pad.r;
  const innerH = H - pad.t - pad.b;

  const allValues = [0, ...matrix.flatMap((r) => session.players.map((p) => r.totals[p.id]))];
  const maxY = Math.max(10, ...allValues);
  const minY = Math.min(0, ...allValues);
  const rangeY = maxY - minY || 1;

  const nRounds = Math.max(matrix.length, 1);
  const x = (i) => pad.l + (nRounds <= 1 ? innerW / 2 : (i / (nRounds - 1 || 1)) * innerW);
  const y = (v) => pad.t + (1 - (v - minY) / rangeY) * innerH;

  // Y-ticks
  const tickCount = 5;
  const ticks = [];
  for (let i = 0; i <= tickCount; i++) {
    const v = Math.round(minY + (rangeY * i) / tickCount);
    ticks.push(v);
  }

  return (
    <div className="panel">
      <div className="chart-wrap">
        <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", height: "auto", display: "block" }}>
          {/* grid + y axis */}
          {ticks.map((v, i) => (
            <g key={i}>
              <line
                x1={pad.l}
                x2={W - pad.r}
                y1={y(v)}
                y2={y(v)}
                stroke="var(--line)"
                strokeDasharray={v === 0 ? "0" : "2 4"}
              />
              <text
                x={pad.l - 8}
                y={y(v) + 4}
                fill="var(--text-3)"
                fontSize="11"
                textAnchor="end"
                fontFamily="var(--mono)"
              >
                {v}
              </text>
            </g>
          ))}
          {/* x labels */}
          {matrix.map((r, i) => (
            <text
              key={r.round}
              x={x(i)}
              y={H - 8}
              fill="var(--text-3)"
              fontSize="11"
              textAnchor="middle"
              fontFamily="var(--mono)"
            >
              R{r.round}
            </text>
          ))}
          {/* lines per player */}
          {session.players.map((p) => {
            if (hidden[p.id]) return null;
            const pts = matrix.map((r, i) => [x(i), y(r.totals[p.id])]);
            const d = pts.map((pt, i) => (i === 0 ? "M" : "L") + pt[0] + "," + pt[1]).join(" ");
            return (
              <g key={p.id}>
                <path d={d} fill="none" stroke={p.color} strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />
                {pts.map((pt, i) => (
                  <circle
                    key={i}
                    cx={pt[0]}
                    cy={pt[1]}
                    r={i === pts.length - 1 ? 4 : 2.5}
                    fill={p.color}
                  />
                ))}
                {/* label at end */}
                {pts.length > 0 && (
                  <text
                    x={pts[pts.length - 1][0] + 8}
                    y={pts[pts.length - 1][1] + 4}
                    fill={p.color}
                    fontSize="11"
                    fontFamily="var(--mono)"
                  >
                    {p.name}
                  </text>
                )}
              </g>
            );
          })}
        </svg>
      </div>
    </div>
  );
}

function Leaderboard({ session }) {
  const scores = SessionUtils.computeScores(session);
  const ranked = [...session.players]
    .map((p) => ({ ...p, score: scores[p.id] }))
    .sort((a, b) => b.score - a.score);

  // trend = last round delta
  const matrix = SessionUtils.perRoundMatrix(session);
  const lastRound = matrix[matrix.length - 1];

  return (
    <div className="panel">
      <div className="leaderboard">
        {ranked.map((p, i) => {
          const trend = lastRound ? lastRound.perPlayer[p.id] : 0;
          return (
            <div key={p.id} className="lb-row" style={{ "--pc": p.color }}>
              <div className={"lb-rank " + (i === 0 ? "gold" : "")}>
                {i === 0 ? "★" : String(i + 1).padStart(2, "0")}
              </div>
              <div className="lb-player">
                <div className="avatar" style={{ width: 32, height: 32, fontSize: 13 }}>
                  {p.name.slice(0, 1).toUpperCase()}
                </div>
                <div style={{ minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {p.name}
                </div>
              </div>
              <div className="lb-score">{p.score}</div>
              <div
                className={"lb-trend " + (trend > 0 ? "up" : trend < 0 ? "down" : "")}
              >
                {trend > 0 ? "+" : ""}
                {trend}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

window.HistoryTable = HistoryTable;
window.LineChart = LineChart;
window.Leaderboard = Leaderboard;
