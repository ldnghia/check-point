// History: mode toggle between table and line chart

function HistoryView({ session, dark = true, palette, onClose, onUndo }) {
  const t = THEMES[dark ? 'dark' : 'light'];
  const [mode, setMode] = React.useState('table'); // 'table' | 'chart'

  return (
    <div style={{
      display: 'flex', flexDirection: 'column', height: '100%',
      background: t.bg, color: t.text,
    }}>
      {/* Header */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 12, padding: '14px 16px 10px',
        borderBottom: `1px solid ${t.border}`,
      }}>
        <button onClick={onClose} style={{
          ...ghostBtn(t), width: 36, height: 36, borderRadius: 10,
        }} aria-label="Đóng">
          <IconChevL size={18} stroke={t.text} />
        </button>
        <div style={{ flex: 1, fontSize: 17, fontWeight: 600 }}>Lịch sử</div>
        <div style={{
          display: 'flex', padding: 3, background: t.surface,
          borderRadius: 10, border: `1px solid ${t.border}`,
        }}>
          <SegBtn active={mode === 'table'} onClick={() => setMode('table')} t={t}>
            <IconTable size={15} /> Bảng
          </SegBtn>
          <SegBtn active={mode === 'chart'} onClick={() => setMode('chart')} t={t}>
            <IconChart size={15} /> Biểu đồ
          </SegBtn>
        </div>
      </div>

      {/* Content */}
      <div style={{ flex: 1, overflow: 'auto' }}>
        {session.rounds.length === 0 ? (
          <EmptyState t={t} />
        ) : mode === 'table' ? (
          <HistoryTable session={session} t={t} palette={palette} onUndo={onUndo} />
        ) : (
          <HistoryChart session={session} t={t} palette={palette} />
        )}
      </div>
    </div>
  );
}

function SegBtn({ active, onClick, children, t }) {
  return (
    <button onClick={onClick} style={{
      display: 'flex', alignItems: 'center', gap: 6,
      padding: '6px 12px', borderRadius: 7, border: 'none',
      background: active ? t.surface2 : 'transparent',
      color: active ? t.text : t.textDim,
      fontSize: 13, fontWeight: 600, cursor: 'pointer',
      boxShadow: active ? `0 1px 2px rgba(0,0,0,0.2), inset 0 0 0 1px ${t.border}` : 'none',
    }}>{children}</button>
  );
}

function EmptyState({ t }) {
  return (
    <div style={{
      padding: '80px 24px', textAlign: 'center',
      color: t.textDim, fontSize: 14,
    }}>
      <div style={{
        width: 56, height: 56, borderRadius: 16, background: t.surface,
        border: `1px solid ${t.border}`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        margin: '0 auto 16px', color: t.textFaint,
      }}>
        <IconHistory size={24} />
      </div>
      <div style={{ fontSize: 15, fontWeight: 600, color: t.text, marginBottom: 4 }}>
        Chưa có round nào
      </div>
      <div>Kết thúc round đầu tiên để xem lịch sử tại đây.</div>
    </div>
  );
}

function HistoryTable({ session, t, palette, onUndo }) {
  const players = session.players;

  // Compute running totals per round per player
  const runningTotals = {};
  players.forEach(p => { runningTotals[p.id] = 0; });

  const rows = session.rounds.map((r, idx) => {
    const cells = players.map(p => {
      const delta = r.scores[p.id] || 0;
      runningTotals[p.id] += delta;
      return { delta, total: runningTotals[p.id] };
    });
    return { round: r, idx, cells, at: r.at };
  });

  // Winner of each round = max delta
  rows.forEach(row => {
    const max = Math.max(...row.cells.map(c => c.delta));
    row.cells.forEach(c => c.isWinner = c.delta === max && max > 0);
  });

  const totals = players.map(p => ({
    p, total: session.rounds.reduce((s, r) => s + (r.scores[p.id] || 0), 0)
  }));
  const maxTotal = Math.max(...totals.map(x => x.total), 0);

  return (
    <div style={{ padding: '8px 0 24px' }}>
      {/* Sticky header */}
      <div style={{
        position: 'sticky', top: 0, zIndex: 2, background: t.bg,
        borderBottom: `1px solid ${t.border}`,
      }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: `56px repeat(${players.length}, minmax(64px, 1fr))`,
          padding: '10px 16px', gap: 6,
          fontSize: 11, fontWeight: 700, color: t.textDim,
          letterSpacing: 0.6, textTransform: 'uppercase',
        }}>
          <div>Round</div>
          {players.map(p => {
            const c = palette[p.colorIdx];
            return (
              <div key={p.id} style={{
                textAlign: 'center', color: t.text,
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
              }}>
                <span style={{
                  width: 8, height: 8, borderRadius: 99, background: c.base,
                  boxShadow: `0 0 8px ${c.glow}66`,
                }} />
                <span style={{ fontSize: 11, fontWeight: 600, maxWidth: '100%', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.name}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Rows */}
      {rows.map(({ round, idx, cells, at }) => (
        <div key={round.id} style={{
          display: 'grid',
          gridTemplateColumns: `56px repeat(${players.length}, minmax(64px, 1fr))`,
          padding: '10px 16px', gap: 6,
          borderBottom: `1px solid ${t.border}`,
          alignItems: 'center',
        }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: t.text, fontVariantNumeric: 'tabular-nums' }}>
              #{idx + 1}
            </div>
            <div style={{ fontSize: 10, color: t.textFaint, fontVariantNumeric: 'tabular-nums' }}>
              {formatTime(at)}
            </div>
          </div>
          {cells.map((cell, i) => {
            const p = players[i];
            const c = palette[p.colorIdx];
            const neg = cell.delta < 0;
            const zero = cell.delta === 0;
            return (
              <div key={p.id} style={{
                textAlign: 'center', padding: '4px 2px', borderRadius: 8,
                background: cell.isWinner ? `${c.base}22` : 'transparent',
                display: 'flex', flexDirection: 'column', gap: 1,
              }}>
                <span style={{
                  fontSize: 15, fontWeight: 700, fontVariantNumeric: 'tabular-nums',
                  color: zero ? t.textFaint : neg ? t.danger : c.glow,
                }}>
                  {cell.delta > 0 ? '+' : ''}{cell.delta}
                </span>
                <span style={{ fontSize: 10, color: t.textDim, fontVariantNumeric: 'tabular-nums' }}>
                  = {cell.total}
                </span>
              </div>
            );
          })}
        </div>
      ))}

      {/* Totals footer */}
      <div style={{
        marginTop: 12, marginLeft: 16, marginRight: 16,
        background: t.surface, border: `1px solid ${t.border}`,
        borderRadius: 14, padding: '12px 0', position: 'relative',
      }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: `56px repeat(${players.length}, minmax(64px, 1fr))`,
          padding: '0 16px', gap: 6, alignItems: 'center',
        }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: t.textDim, textTransform: 'uppercase', letterSpacing: 0.5 }}>
            Tổng
          </div>
          {totals.map(({ p, total }) => {
            const c = palette[p.colorIdx];
            const isLeader = total === maxTotal && total !== 0;
            return (
              <div key={p.id} style={{ textAlign: 'center' }}>
                <div style={{
                  fontSize: 20, fontWeight: 800, fontVariantNumeric: 'tabular-nums',
                  color: isLeader ? c.glow : t.text,
                  display: 'inline-flex', alignItems: 'center', gap: 4,
                }}>
                  {isLeader && <IconCrown size={13} stroke={c.glow} />}
                  {total}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function HistoryChart({ session, t, palette }) {
  const players = session.players;
  const rounds = session.rounds;
  if (rounds.length === 0) return null;

  // Cumulative totals including round 0 (=0)
  const series = players.map(p => {
    const vals = [0];
    let acc = 0;
    rounds.forEach(r => {
      acc += (r.scores[p.id] || 0);
      vals.push(acc);
    });
    return { p, vals };
  });

  const allVals = series.flatMap(s => s.vals);
  let max = Math.max(...allVals, 10);
  let min = Math.min(...allVals, 0);
  const pad = Math.max(2, Math.round((max - min) * 0.12));
  max += pad; min -= pad;
  const range = max - min || 1;

  const W = 720, H = 360;
  const padL = 44, padR = 20, padT = 20, padB = 36;
  const innerW = W - padL - padR;
  const innerH = H - padT - padB;

  const xAt = (i) => padL + (rounds.length > 0 ? (i / rounds.length) * innerW : 0);
  const yAt = (v) => padT + innerH - ((v - min) / range) * innerH;

  // Grid lines (rounded to nice values)
  const ySteps = 5;
  const stepSize = niceStep((max - min) / ySteps);
  const gridStart = Math.ceil(min / stepSize) * stepSize;
  const gridLines = [];
  for (let v = gridStart; v <= max; v += stepSize) {
    gridLines.push(v);
  }

  return (
    <div style={{ padding: '16px 12px 24px' }}>
      <div style={{
        background: t.surface, border: `1px solid ${t.border}`,
        borderRadius: 18, padding: '16px 8px 12px',
      }}>
        <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', height: 'auto', display: 'block' }}>
          {/* y gridlines */}
          {gridLines.map(v => (
            <g key={v}>
              <line x1={padL} x2={W - padR} y1={yAt(v)} y2={yAt(v)}
                stroke={t.border} strokeDasharray={v === 0 ? '' : '3,4'} strokeWidth={v === 0 ? 1 : 1} />
              <text x={padL - 8} y={yAt(v) + 4} textAnchor="end"
                fontSize="11" fill={t.textFaint} fontFamily="ui-sans-serif, system-ui">
                {v}
              </text>
            </g>
          ))}
          {/* x labels */}
          {rounds.map((r, i) => (
            <text key={r.id} x={xAt(i + 1)} y={H - padB + 18} textAnchor="middle"
              fontSize="10" fill={t.textFaint} fontFamily="ui-sans-serif, system-ui">
              R{i + 1}
            </text>
          ))}
          <text x={padL} y={H - padB + 18} textAnchor="middle"
            fontSize="10" fill={t.textFaint} fontFamily="ui-sans-serif, system-ui">
            Start
          </text>

          {/* series */}
          {series.map(({ p, vals }) => {
            const c = palette[p.colorIdx];
            const pts = vals.map((v, i) => [xAt(i), yAt(v)]);
            const path = pts.map(([x, y], i) => (i ? 'L' : 'M') + x.toFixed(1) + ',' + y.toFixed(1)).join(' ');
            return (
              <g key={p.id}>
                <path d={path} fill="none" stroke={c.base} strokeWidth="2.5"
                  strokeLinecap="round" strokeLinejoin="round" opacity="0.95" />
                {pts.map(([x, y], i) => (
                  <circle key={i} cx={x} cy={y} r={i === pts.length - 1 ? 4 : 2.5}
                    fill={c.glow} stroke={t.surface} strokeWidth="1.5" />
                ))}
                {/* end label */}
                <text x={pts[pts.length-1][0] + 8} y={pts[pts.length-1][1] + 4}
                  fontSize="11" fontWeight="700" fill={c.glow}
                  fontFamily="ui-sans-serif, system-ui">
                  {p.name}
                </text>
              </g>
            );
          })}
        </svg>

        {/* legend */}
        <div style={{
          display: 'flex', gap: 12, flexWrap: 'wrap', padding: '12px 8px 4px',
          borderTop: `1px solid ${t.border}`, marginTop: 8,
        }}>
          {series.map(({ p, vals }) => {
            const c = palette[p.colorIdx];
            const last = vals[vals.length - 1];
            return (
              <div key={p.id} style={{
                display: 'flex', alignItems: 'center', gap: 6,
                fontSize: 12, color: t.textDim, fontWeight: 500,
              }}>
                <span style={{
                  width: 10, height: 10, borderRadius: 99, background: c.base,
                  boxShadow: `0 0 6px ${c.glow}88`,
                }} />
                <span style={{ color: t.text, fontWeight: 600 }}>{p.name}</span>
                <span style={{ color: c.glow, fontWeight: 700, fontVariantNumeric: 'tabular-nums' }}>
                  {last > 0 ? '+' : ''}{last}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function niceStep(raw) {
  if (raw <= 0) return 1;
  const pow = Math.pow(10, Math.floor(Math.log10(raw)));
  const norm = raw / pow;
  let nice;
  if (norm < 1.5) nice = 1;
  else if (norm < 3) nice = 2;
  else if (norm < 7) nice = 5;
  else nice = 10;
  return nice * pow;
}

function formatTime(ts) {
  const d = new Date(ts);
  return d.getHours().toString().padStart(2, '0') + ':' + d.getMinutes().toString().padStart(2, '0');
}

function ghostBtn(t) {
  return {
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    background: t.surface, border: `1px solid ${t.border}`,
    color: t.text, cursor: 'pointer', padding: 0,
    WebkitTapHighlightColor: 'transparent',
  };
}

Object.assign(window, { HistoryView, HistoryTable, HistoryChart, SegBtn, ghostBtn, formatTime });
