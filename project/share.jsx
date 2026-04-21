// ============ Share modal ============
function ShareModal({ session, onClose }) {
  const scores = SessionUtils.computeScores(session);
  const ranked = [...session.players]
    .map((p) => ({ ...p, score: scores[p.id] }))
    .sort((a, b) => b.score - a.score);
  const nRounds = Math.max(0, session.currentRound - 1);
  const [copied, setCopied] = React.useState(false);

  const handleCopy = () => {
    const text =
      `🎲 ${session.name}\n` +
      `${nRounds} round · ${session.players.length} người\n\n` +
      ranked
        .map((p, i) => `${i === 0 ? "🏆" : i + 1 + "."} ${p.name} — ${p.score}`)
        .join("\n");
    navigator.clipboard?.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-head">
          <h3>Chia sẻ kết quả</h3>
          <div style={{ flex: 1 }} />
          <button className="btn sm ghost" onClick={onClose}>
            <Icon name="close" size={14} />
          </button>
        </div>
        <div className="modal-body">
          <div className="share-card">
            <div className="sh-title">Check·point · kết quả ván</div>
            <div className="sh-game">{session.name}</div>
            <div>
              {ranked.map((p, i) => (
                <div key={p.id} className={"share-row " + (i === 0 ? "winner" : "")}>
                  <div className="rk">{i === 0 ? "🏆" : i + 1}</div>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <div
                      style={{
                        width: 10,
                        height: 10,
                        borderRadius: 3,
                        background: p.color,
                      }}
                    />
                    {p.name}
                  </div>
                  <div className="sc">{p.score}</div>
                </div>
              ))}
            </div>
            <div className="share-foot">
              <span>{nRounds} round đã chơi</span>
              <span>{new Date().toLocaleDateString("vi-VN")}</span>
            </div>
          </div>

          <div style={{ display: "flex", gap: 8 }}>
            <button className="btn" style={{ flex: 1 }} onClick={handleCopy}>
              <Icon name="copy" /> {copied ? "Đã copy!" : "Copy văn bản"}
            </button>
            <button className="btn primary" style={{ flex: 1 }} onClick={onClose}>
              <Icon name="check" /> Xong
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

window.ShareModal = ShareModal;
