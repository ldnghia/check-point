// Player scoring card — refined, not saturated.

function PlayerCard({
  player, color, total, pending = 0, step = 1, mode, isLeader = false,
  onInc, onDec, onQuick, onOpenDetail, onLongPressNum,
  dark = true, rankBadge = null, showChart = false, chartData = [],
}) {
  const t = THEMES[dark ? 'dark' : 'light'];

  // Card background: a rich gradient using the player color, but darker/deeper
  const bg = dark
    ? `linear-gradient(135deg, ${color.base} 0%, ${mix(color.base, '#000', 0.35)} 100%)`
    : `linear-gradient(135deg, ${color.glow} 0%, ${color.base} 100%)`;

  const ink = color.ink;
  const softInk = `${ink}CC`;
  const inkBtn = `${ink}22`;

  const displayNum = mode === 'round' ? total + pending : total;
  const deltaBadge = mode === 'round' && pending !== 0;

  return (
    <div style={{
      position: 'relative',
      borderRadius: 20,
      background: bg,
      padding: '14px 16px 16px',
      boxShadow: dark
        ? `0 2px 0 ${color.base}44, 0 8px 24px rgba(0,0,0,0.35), inset 0 1px 0 rgba(255,255,255,0.09)`
        : `0 2px 0 ${mix(color.base, '#000', 0.2)}, 0 10px 22px rgba(0,0,0,0.12)`,
      overflow: 'hidden',
      transition: 'transform 120ms ease',
    }}>
      {/* subtle vignette texture */}
      <div aria-hidden style={{
        position: 'absolute', inset: 0, borderRadius: 20, pointerEvents: 'none',
        background: `radial-gradient(120% 70% at 90% 10%, ${color.glow}55, transparent 55%)`,
        mixBlendMode: 'screen', opacity: dark ? 0.35 : 0.6,
      }} />

      {/* Header row */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        gap: 10, position: 'relative',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 0 }}>
          {rankBadge && (
            <div style={{
              fontSize: 11, fontWeight: 700, color: softInk,
              background: inkBtn, padding: '3px 7px', borderRadius: 6,
              letterSpacing: 0.4,
            }}>{rankBadge}</div>
          )}
          <div style={{
            fontSize: 17, fontWeight: 600, color: ink, letterSpacing: -0.2,
            whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
          }}>{player.name}</div>
          {isLeader && (
            <div title="Dẫn đầu" style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              width: 22, height: 22, borderRadius: 6, background: inkBtn, color: ink,
            }}>
              <IconCrown size={13} />
            </div>
          )}
        </div>
        <button onClick={onOpenDetail} style={{
          ...iconBtnStyle(ink, inkBtn), width: 32, height: 28, borderRadius: 9,
        }}>
          <IconMore size={16} stroke={ink} />
        </button>
      </div>

      {/* Round draft chip */}
      {deltaBadge && (
        <div style={{
          position: 'absolute', top: 14, left: '50%', transform: 'translateX(-50%)',
          fontSize: 11, fontWeight: 700, color: ink,
          background: inkBtn, padding: '3px 8px', borderRadius: 999,
          letterSpacing: 0.3,
        }}>
          ROUND HIỆN TẠI: {pending > 0 ? '+' : ''}{pending}
        </div>
      )}

      {/* Score row: minus / num / plus */}
      <div style={{
        display: 'grid', gridTemplateColumns: '44px 1fr 44px',
        alignItems: 'center', marginTop: 4, gap: 6,
      }}>
        <button
          onClick={() => onDec(step)}
          onContextMenu={(e) => { e.preventDefault(); onQuick('dec'); }}
          style={{ ...iconBtnStyle(ink, inkBtn), height: 56, borderRadius: 12 }}
          aria-label="Trừ điểm"
        >
          <IconMinus size={22} stroke={ink} sw={2.4} />
        </button>

        <button onClick={onLongPressNum} style={{
          background: 'transparent', border: 'none', cursor: 'pointer',
          color: ink, padding: 0, margin: 0,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          position: 'relative',
        }}>
          <span style={{
            fontSize: 62, fontWeight: 800, letterSpacing: -2,
            lineHeight: 1, fontVariantNumeric: 'tabular-nums',
            textShadow: dark ? '0 2px 18px rgba(0,0,0,0.25)' : 'none',
          }}>
            {displayNum}
          </span>
          {pending !== 0 && (
            <span style={{
              position: 'absolute', right: 0, top: -2,
              fontSize: 13, fontWeight: 700, color: ink, opacity: 0.75,
              fontVariantNumeric: 'tabular-nums',
              padding: '3px 6px', borderRadius: 6, background: inkBtn,
            }}>{total}</span>
          )}
        </button>

        <button
          onClick={() => onInc(step)}
          onContextMenu={(e) => { e.preventDefault(); onQuick('inc'); }}
          style={{ ...iconBtnStyle(ink, inkBtn), height: 56, borderRadius: 12 }}
          aria-label="Cộng điểm"
        >
          <IconPlus size={22} stroke={ink} sw={2.4} />
        </button>
      </div>

      {/* Optional inline sparkline */}
      {showChart && chartData.length > 1 && (
        <div style={{ marginTop: 6, height: 28, opacity: 0.8 }}>
          <Sparkline data={chartData} stroke={ink} />
        </div>
      )}
    </div>
  );
}

function iconBtnStyle(ink, bg) {
  return {
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    background: bg, border: 'none', color: ink, cursor: 'pointer',
    padding: 0, transition: 'transform 80ms ease, background 120ms ease',
    WebkitTapHighlightColor: 'transparent',
  };
}

function Sparkline({ data, stroke = '#fff' }) {
  // data: array of cumulative totals by round
  const w = 240, h = 28;
  if (data.length < 2) return null;
  const max = Math.max(...data, 1);
  const min = Math.min(...data, 0);
  const range = max - min || 1;
  const step = w / (data.length - 1);
  const pts = data.map((v, i) => [i * step, h - ((v - min) / range) * (h - 4) - 2]);
  const path = pts.map(([x, y], i) => (i ? 'L' : 'M') + x.toFixed(1) + ',' + y.toFixed(1)).join(' ');
  return (
    <svg viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none" style={{ width: '100%', height: '100%' }}>
      <path d={path} fill="none" stroke={stroke} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" opacity="0.85" />
      <circle cx={pts[pts.length-1][0]} cy={pts[pts.length-1][1]} r="2.5" fill={stroke} />
    </svg>
  );
}

// Simple color mix (hex, hex, t) — t toward c2
function mix(c1, c2, t) {
  const p = (c) => [parseInt(c.slice(1,3),16), parseInt(c.slice(3,5),16), parseInt(c.slice(5,7),16)];
  const [r1,g1,b1] = p(c1), [r2,g2,b2] = p(c2);
  const to = (x) => x.toString(16).padStart(2,'0');
  const r = Math.round(r1 + (r2-r1)*t), g = Math.round(g1 + (g2-g1)*t), b = Math.round(b1 + (b2-b1)*t);
  return '#' + to(r) + to(g) + to(b);
}

Object.assign(window, { PlayerCard, Sparkline, mix });
