// Sessions list + Share + Settings sheet contents

function SessionsSheet({ open, onClose, sessions, currentId, onSwitch, onNew, onDelete, onDuplicate, onRename, dark }) {
  const t = THEMES[dark ? 'dark' : 'light'];
  const [editingId, setEditingId] = React.useState(null);
  const [name, setName] = React.useState('');

  return (
    <Sheet open={open} onClose={onClose} title="Phiên game" dark={dark}>
      <div style={{ padding: '12px 16px 24px' }}>
        <button onClick={onNew} style={{
          width: '100%', padding: '14px', borderRadius: 14,
          background: t.accent, color: '#fff', border: 'none',
          fontSize: 15, fontWeight: 700, cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
          marginBottom: 16, boxShadow: `0 4px 14px ${t.accent}44`,
        }}>
          <IconPlus size={18} /> Phiên mới
        </button>

        <Label t={t}>{sessions.length} phiên đã lưu</Label>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {sessions.map(s => {
            const isCurr = s.id === currentId;
            const maxScore = Math.max(...s.players.map(p => totalFor(s, p.id)), 0);
            return (
              <div key={s.id} style={{
                background: isCurr ? `${t.accent}18` : t.surface,
                border: `1px solid ${isCurr ? t.accent + '55' : t.border}`,
                borderRadius: 14, padding: '12px 14px',
                display: 'flex', alignItems: 'center', gap: 12,
              }}>
                <div style={{
                  width: 40, height: 40, borderRadius: 10,
                  background: t.surface2, color: t.textDim,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  flexShrink: 0,
                }}>
                  <IconFolder size={18} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  {editingId === s.id ? (
                    <input
                      autoFocus value={name}
                      onChange={(e) => setName(e.target.value)}
                      onBlur={() => { onRename(s.id, name || s.name); setEditingId(null); }}
                      onKeyDown={(e) => { if (e.key === 'Enter') e.target.blur(); }}
                      style={{
                        width: '100%', background: t.bg2, color: t.text,
                        border: `1px solid ${t.borderStrong}`, borderRadius: 6,
                        padding: '4px 8px', fontSize: 14, fontWeight: 600, outline: 'none',
                      }}
                    />
                  ) : (
                    <div onClick={() => onSwitch(s.id)} style={{
                      fontSize: 15, fontWeight: 600, color: t.text, cursor: 'pointer',
                      overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                    }}>{s.name}</div>
                  )}
                  <div style={{ fontSize: 12, color: t.textDim, marginTop: 2 }}>
                    {s.players.length} người · {s.rounds.length} round · cao nhất {maxScore}
                  </div>
                </div>
                <button onClick={() => { setEditingId(s.id); setName(s.name); }} style={{
                  ...ghostBtn(t), width: 32, height: 32, borderRadius: 8,
                  background: 'transparent', border: 'none',
                }}>
                  <IconEdit size={15} stroke={t.textDim} />
                </button>
                <button onClick={() => onDuplicate(s.id)} style={{
                  ...ghostBtn(t), width: 32, height: 32, borderRadius: 8,
                  background: 'transparent', border: 'none',
                }}>
                  <IconCopy size={15} stroke={t.textDim} />
                </button>
                {sessions.length > 1 && (
                  <button onClick={() => onDelete(s.id)} style={{
                    ...ghostBtn(t), width: 32, height: 32, borderRadius: 8,
                    background: 'transparent', border: 'none', color: t.danger,
                  }}>
                    <IconTrash size={15} stroke={t.danger} />
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </Sheet>
  );
}

function ShareSheet({ open, onClose, session, palette, dark }) {
  const t = THEMES[dark ? 'dark' : 'light'];
  const [copied, setCopied] = React.useState(false);
  if (!session) return null;

  const ranked = rankedPlayers(session);
  const medals = ['🥇', '🥈', '🥉'];

  const textSummary = () => {
    const lines = [];
    lines.push(`🎴 ${session.name} — Kết quả`);
    lines.push(`${session.rounds.length} round · ${session.players.length} người chơi`);
    lines.push('');
    ranked.forEach((p, i) => {
      const prefix = medals[i] || `  ${i + 1}.`;
      lines.push(`${prefix} ${p.name}: ${p.total}`);
    });
    return lines.join('\n');
  };

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(textSummary());
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (e) {}
  };

  return (
    <Sheet open={open} onClose={onClose} title="Chia sẻ kết quả" dark={dark}>
      <div style={{ padding: 16 }}>
        {/* Podium card preview */}
        <div style={{
          background: `linear-gradient(135deg, ${t.surface2}, ${t.surface})`,
          borderRadius: 18, padding: '20px 16px 16px',
          border: `1px solid ${t.border}`,
        }}>
          <div style={{ textAlign: 'center', marginBottom: 16 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: t.textDim, textTransform: 'uppercase', letterSpacing: 0.8 }}>
              {session.name}
            </div>
            <div style={{ fontSize: 22, fontWeight: 800, color: t.text, marginTop: 4 }}>
              Kết quả cuối
            </div>
            <div style={{ fontSize: 12, color: t.textFaint, marginTop: 2 }}>
              {session.rounds.length} round · {formatDate(session.createdAt)}
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {ranked.map((p, i) => {
              const c = palette[p.colorIdx];
              return (
                <div key={p.id} style={{
                  display: 'flex', alignItems: 'center', gap: 12,
                  padding: '10px 12px', borderRadius: 12,
                  background: i === 0 ? `linear-gradient(90deg, ${c.base}33, transparent)` : t.surface,
                  border: `1px solid ${i === 0 ? c.base + '55' : t.border}`,
                }}>
                  <div style={{
                    width: 28, height: 28, borderRadius: 8,
                    background: i < 3 ? `linear-gradient(135deg, ${c.glow}, ${c.base})` : t.surface2,
                    color: i < 3 ? c.ink : t.textDim,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 13, fontWeight: 800,
                  }}>{i + 1}</div>
                  <div style={{ flex: 1, fontSize: 15, fontWeight: 600, color: t.text }}>
                    {p.name}
                    {i === 0 && <span style={{ marginLeft: 6, color: c.glow, fontSize: 12 }}>👑 Quán quân</span>}
                  </div>
                  <div style={{
                    fontSize: 22, fontWeight: 800, color: i === 0 ? c.glow : t.text,
                    fontVariantNumeric: 'tabular-nums', letterSpacing: -0.5,
                  }}>{p.total}</div>
                </div>
              );
            })}
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginTop: 16 }}>
          <button onClick={copy} style={{
            padding: '14px', borderRadius: 12, background: t.surface,
            color: t.text, border: `1px solid ${t.border}`, cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            fontSize: 14, fontWeight: 600,
          }}>
            {copied ? <><IconCheck size={16} stroke={t.success} /> Đã chép</> : <><IconCopy size={16} /> Chép văn bản</>}
          </button>
          <button onClick={() => {
            if (navigator.share) navigator.share({ title: session.name, text: textSummary() }).catch(()=>{});
            else copy();
          }} style={{
            padding: '14px', borderRadius: 12, background: t.accent,
            color: '#fff', border: 'none', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            fontSize: 14, fontWeight: 700,
          }}>
            <IconShare size={16} stroke="#fff" /> Chia sẻ
          </button>
        </div>
      </div>
    </Sheet>
  );
}

function SettingsSheet({ open, onClose, session, onModeChange, onAddPlayer, onTargetChange, dark, onToggleDark, step, onStepChange }) {
  const t = THEMES[dark ? 'dark' : 'light'];
  if (!session) return null;

  return (
    <Sheet open={open} onClose={onClose} title="Cài đặt" dark={dark}>
      <div style={{ padding: '4px 16px 24px', display: 'flex', flexDirection: 'column', gap: 20 }}>

        {/* Mode */}
        <div>
          <Label t={t}>Chế độ ghi điểm</Label>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
            <ModeBtn active={session.mode === 'round'} onClick={() => onModeChange('round')} t={t}
              title="Theo round" desc="Nhập xong → kết thúc round"/>
            <ModeBtn active={session.mode === 'free'} onClick={() => onModeChange('free')} t={t}
              title="Tự do" desc="Cộng/trừ bất cứ lúc nào"/>
          </div>
        </div>

        {/* Step */}
        <div>
          <Label t={t}>Bước mặc định (+/−)</Label>
          <div style={{ display: 'flex', gap: 6 }}>
            {[1, 2, 5, 10, 50, 100].map(v => (
              <button key={v} onClick={() => onStepChange(v)} style={{
                flex: 1, padding: '10px 0', borderRadius: 10,
                background: step === v ? t.accent : t.surface,
                color: step === v ? '#fff' : t.text,
                border: `1px solid ${step === v ? t.accent : t.border}`,
                fontSize: 14, fontWeight: 700, cursor: 'pointer',
                fontVariantNumeric: 'tabular-nums',
              }}>{v}</button>
            ))}
          </div>
        </div>

        {/* Target */}
        <div>
          <Label t={t}>Mốc điểm (tùy chọn)</Label>
          <div style={{ display: 'flex', gap: 6 }}>
            {[null, 50, 100, 200, 500].map(v => (
              <button key={String(v)} onClick={() => onTargetChange(v)} style={{
                flex: 1, padding: '10px 0', borderRadius: 10,
                background: session.target === v ? t.accent : t.surface,
                color: session.target === v ? '#fff' : t.text,
                border: `1px solid ${session.target === v ? t.accent : t.border}`,
                fontSize: 14, fontWeight: 600, cursor: 'pointer',
              }}>{v === null ? 'Không' : v}</button>
            ))}
          </div>
        </div>

        {/* Theme */}
        <div>
          <Label t={t}>Giao diện</Label>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
            <ModeBtn active={dark} onClick={() => onToggleDark(true)} t={t}
              title="🌙 Tối" desc="Dark mode tinh tế"/>
            <ModeBtn active={!dark} onClick={() => onToggleDark(false)} t={t}
              title="☀️ Sáng" desc="Light mode sạch"/>
          </div>
        </div>

        {/* Add player */}
        <button onClick={onAddPlayer} disabled={session.players.length >= 8} style={{
          padding: '14px', borderRadius: 12, background: t.surface,
          color: session.players.length >= 8 ? t.textFaint : t.text,
          border: `1px solid ${t.border}`,
          cursor: session.players.length >= 8 ? 'not-allowed' : 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
          fontSize: 14, fontWeight: 600,
        }}>
          <IconPlus size={16} />
          Thêm người chơi ({session.players.length}/8)
        </button>
      </div>
    </Sheet>
  );
}

function ModeBtn({ active, onClick, t, title, desc }) {
  return (
    <button onClick={onClick} style={{
      padding: '12px', borderRadius: 12, textAlign: 'left',
      background: active ? t.accent + '22' : t.surface,
      border: `1px solid ${active ? t.accent + '77' : t.border}`,
      cursor: 'pointer',
    }}>
      <div style={{ fontSize: 14, fontWeight: 700, color: active ? t.text : t.text, marginBottom: 2 }}>{title}</div>
      <div style={{ fontSize: 12, color: t.textDim, lineHeight: 1.3 }}>{desc}</div>
    </button>
  );
}

function formatDate(ts) {
  const d = new Date(ts);
  return `${d.getDate().toString().padStart(2,'0')}/${(d.getMonth()+1).toString().padStart(2,'0')}`;
}

Object.assign(window, { SessionsSheet, ShareSheet, SettingsSheet, ModeBtn, formatDate });
