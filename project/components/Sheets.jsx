// Bottom sheets / modals

function Sheet({ open, onClose, children, title, dark = true, maxHeight = '85vh' }) {
  const t = THEMES[dark ? 'dark' : 'light'];
  if (!open) return null;
  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, zIndex: 50,
        background: t.scrim, backdropFilter: 'blur(4px)',
        display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
        animation: 'fadeIn 200ms ease',
      }}>
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '100%', maxWidth: 560, background: t.bg2,
          borderTopLeftRadius: 24, borderTopRightRadius: 24,
          border: `1px solid ${t.border}`, borderBottom: 'none',
          maxHeight, display: 'flex', flexDirection: 'column',
          animation: 'slideUp 260ms cubic-bezier(0.2, 0.8, 0.2, 1)',
          boxShadow: '0 -24px 60px rgba(0,0,0,0.6)',
        }}>
        <div style={{
          display: 'flex', justifyContent: 'center', padding: '8px 0 4px',
        }}>
          <div style={{
            width: 36, height: 4, borderRadius: 99, background: t.borderStrong,
          }} />
        </div>
        {title && (
          <div style={{
            display: 'flex', alignItems: 'center', padding: '8px 16px 12px',
            borderBottom: `1px solid ${t.border}`,
          }}>
            <div style={{ flex: 1, fontSize: 16, fontWeight: 600, color: t.text }}>{title}</div>
            <button onClick={onClose} style={{
              ...ghostBtn(t), width: 30, height: 30, borderRadius: 8,
              background: 'transparent', border: 'none',
            }}>
              <IconClose size={18} stroke={t.textDim} />
            </button>
          </div>
        )}
        <div style={{ flex: 1, overflow: 'auto' }}>
          {children}
        </div>
      </div>
    </div>
  );
}

// Centered modal (smaller)
function Modal({ open, onClose, children, title, dark = true, width = 420 }) {
  const t = THEMES[dark ? 'dark' : 'light'];
  if (!open) return null;
  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, zIndex: 60,
        background: t.scrim, backdropFilter: 'blur(4px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: 16, animation: 'fadeIn 160ms ease',
      }}>
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '100%', maxWidth: width, background: t.bg2,
          borderRadius: 20, border: `1px solid ${t.border}`,
          boxShadow: '0 20px 60px rgba(0,0,0,0.6)',
          animation: 'pop 200ms cubic-bezier(0.2, 0.8, 0.2, 1)',
          display: 'flex', flexDirection: 'column', maxHeight: '85vh',
        }}>
        {title && (
          <div style={{
            display: 'flex', alignItems: 'center', padding: '14px 18px',
            borderBottom: `1px solid ${t.border}`,
          }}>
            <div style={{ flex: 1, fontSize: 16, fontWeight: 600, color: t.text }}>{title}</div>
            <button onClick={onClose} style={{
              ...ghostBtn(t), width: 30, height: 30, borderRadius: 8,
              background: 'transparent', border: 'none',
            }}>
              <IconClose size={18} stroke={t.textDim} />
            </button>
          </div>
        )}
        <div style={{ overflow: 'auto' }}>{children}</div>
      </div>
    </div>
  );
}

// Player edit sheet: name, color, actions
function PlayerEditSheet({ player, palette, dark, onRename, onColor, onRemove, onClose }) {
  const t = THEMES[dark ? 'dark' : 'light'];
  if (!player) return null;
  return (
    <Sheet open={!!player} onClose={onClose} title={player.name} dark={dark}>
      <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 18 }}>
        {/* Name */}
        <div>
          <Label t={t}>Tên người chơi</Label>
          <input
            value={player.name}
            onChange={(e) => onRename(e.target.value)}
            style={{
              width: '100%', boxSizing: 'border-box',
              background: t.surface, border: `1px solid ${t.border}`,
              color: t.text, fontSize: 16, fontWeight: 500,
              padding: '12px 14px', borderRadius: 12, outline: 'none',
            }}
          />
        </div>

        {/* Color */}
        <div>
          <Label t={t}>Màu card</Label>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(8, 1fr)', gap: 8 }}>
            {palette.map((c, i) => (
              <button key={c.name} onClick={() => onColor(i)} style={{
                aspectRatio: '1 / 1', borderRadius: 12,
                background: `linear-gradient(135deg, ${c.glow}, ${c.base})`,
                border: i === player.colorIdx ? `2px solid ${t.text}` : `1px solid ${t.border}`,
                cursor: 'pointer', padding: 0,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                transition: 'transform 120ms ease',
                transform: i === player.colorIdx ? 'scale(1.08)' : 'scale(1)',
              }}>
                {i === player.colorIdx && <IconCheck size={16} stroke={c.ink} sw={3} />}
              </button>
            ))}
          </div>
        </div>

        {/* Danger action */}
        <button onClick={onRemove} style={{
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
          padding: '12px', borderRadius: 12, border: `1px solid ${t.danger}44`,
          background: `${t.danger}11`, color: t.danger, fontSize: 14, fontWeight: 600,
          cursor: 'pointer',
        }}>
          <IconTrash size={16} /> Xoá người chơi
        </button>
      </div>
    </Sheet>
  );
}

function Label({ children, t }) {
  return (
    <div style={{
      fontSize: 11, fontWeight: 700, color: t.textDim,
      textTransform: 'uppercase', letterSpacing: 0.6, marginBottom: 8,
    }}>{children}</div>
  );
}

// Number pad for detailed score entry
function NumberPadModal({ open, onClose, onSubmit, initial = 0, playerName, color, dark = true }) {
  const t = THEMES[dark ? 'dark' : 'light'];
  const [value, setValue] = React.useState('');
  const [sign, setSign] = React.useState(1); // 1 or -1

  React.useEffect(() => {
    if (open) { setValue(''); setSign(initial < 0 ? -1 : 1); }
  }, [open]);

  const press = (k) => {
    if (k === 'del') return setValue(v => v.slice(0, -1));
    if (k === 'clear') return setValue('');
    if (value.length >= 4) return;
    if (k === '.') return;
    setValue(v => v + k);
  };

  const numericValue = sign * (parseInt(value || '0', 10) || 0);

  return (
    <Modal open={open} onClose={onClose} dark={dark} width={360}>
      {open && (
        <div style={{ padding: 20 }}>
          <div style={{ textAlign: 'center', marginBottom: 10 }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: t.textDim, textTransform: 'uppercase', letterSpacing: 0.6 }}>
              Nhập điểm cho
            </div>
            <div style={{ fontSize: 18, fontWeight: 700, color: color?.glow || t.text, marginTop: 2 }}>
              {playerName}
            </div>
          </div>

          {/* Display */}
          <div style={{
            background: t.surface, borderRadius: 16, padding: '18px 16px',
            textAlign: 'center', marginBottom: 16,
            border: `1px solid ${t.border}`,
          }}>
            <div style={{
              fontSize: 44, fontWeight: 800, color: t.text, fontVariantNumeric: 'tabular-nums',
              letterSpacing: -1.5, lineHeight: 1,
            }}>
              {sign < 0 ? '−' : '+'}{value || '0'}
            </div>
          </div>

          {/* Sign toggle */}
          <div style={{
            display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 10,
          }}>
            <button onClick={() => setSign(1)} style={{
              padding: '10px 0', borderRadius: 12, fontSize: 14, fontWeight: 700,
              background: sign === 1 ? t.success + '22' : t.surface,
              color: sign === 1 ? t.success : t.textDim,
              border: `1px solid ${sign === 1 ? t.success + '66' : t.border}`,
              cursor: 'pointer',
            }}>+ CỘNG</button>
            <button onClick={() => setSign(-1)} style={{
              padding: '10px 0', borderRadius: 12, fontSize: 14, fontWeight: 700,
              background: sign === -1 ? t.danger + '22' : t.surface,
              color: sign === -1 ? t.danger : t.textDim,
              border: `1px solid ${sign === -1 ? t.danger + '66' : t.border}`,
              cursor: 'pointer',
            }}>− TRỪ</button>
          </div>

          {/* Pad */}
          <div style={{
            display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8, marginBottom: 12,
          }}>
            {['1','2','3','4','5','6','7','8','9','clear','0','del'].map(k => (
              <button key={k} onClick={() => press(k)} style={{
                padding: '16px 0', borderRadius: 12, fontSize: 20, fontWeight: 600,
                background: t.surface, color: t.text, cursor: 'pointer',
                border: `1px solid ${t.border}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                {k === 'del' ? <IconX size={18} stroke={t.textDim} /> :
                 k === 'clear' ? <span style={{ fontSize: 12, fontWeight: 700, color: t.textDim }}>AC</span> : k}
              </button>
            ))}
          </div>

          <button onClick={() => { onSubmit(numericValue); onClose(); }} style={{
            width: '100%', padding: '14px 0', borderRadius: 14,
            background: color?.base || t.accent, color: color?.ink || '#fff',
            border: 'none', fontSize: 15, fontWeight: 700, cursor: 'pointer',
            boxShadow: `0 4px 16px ${color?.base || t.accent}66`,
          }}>
            Xác nhận ({numericValue > 0 ? '+' : ''}{numericValue})
          </button>
        </div>
      )}
    </Modal>
  );
}

Object.assign(window, { Sheet, Modal, PlayerEditSheet, Label, NumberPadModal });
