// ============ PlayerCard ============
const { useState: useStateP, useRef: useRefP, useEffect: useEffectP } = React;

function PlayerCard({ player, score, rank, totalPlayers, step, lastDelta, tinyHistory, onDelta, onRename, isLeader }) {
  const [input, setInput] = useStateP("");
  const [floatDelta, setFloatDelta] = useStateP(null);
  const [popping, setPopping] = useStateP(false);
  const [editing, setEditing] = useStateP(false);
  const [name, setName] = useStateP(player.name);
  const cardRef = useRefP();

  useEffectP(() => {
    setName(player.name);
  }, [player.name]);

  const applyDelta = (n) => {
    if (!n || isNaN(n)) return;
    onDelta(n);
    setFloatDelta({ v: n, id: Date.now() });
    setPopping(true);
    setTimeout(() => setPopping(false), 400);
    setTimeout(() => setFloatDelta(null), 900);
  };

  const handleInputApply = () => {
    const v = parseInt(input.replace(/[^\d-]/g, ""), 10);
    if (!isNaN(v) && v !== 0) {
      applyDelta(v);
      setInput("");
    }
  };

  const rankLabel = rank === 1 ? "Dẫn đầu" : `#${rank}`;

  return (
    <div
      ref={cardRef}
      className={"card" + (popping ? " pop" : "") + (isLeader ? " leader" : "")}
      style={{ "--pc": player.color }}
    >
      <div className="card-head">
        <div className="avatar">{player.name.slice(0, 1).toUpperCase()}</div>
        {editing ? (
          <input
            autoFocus
            value={name}
            onChange={(e) => setName(e.target.value)}
            onBlur={() => {
              onRename(name.trim() || player.name);
              setEditing(false);
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                onRename(name.trim() || player.name);
                setEditing(false);
              }
            }}
            className="player-name"
            style={{
              background: "var(--bg-2)",
              borderRadius: 6,
              padding: "2px 6px",
              border: "1px solid var(--line)",
            }}
          />
        ) : (
          <div className="player-name" onDoubleClick={() => setEditing(true)}>
            {player.name}
          </div>
        )}
        <div className={"rank-badge " + (rank === 1 && totalPlayers > 1 ? "gold" : "")}>
          {totalPlayers > 1 ? rankLabel : "Người chơi"}
        </div>
      </div>

      <div className="score-display">
        {floatDelta && (
          <div
            key={floatDelta.id}
            className={"float-delta " + (floatDelta.v > 0 ? "up" : "down")}
          >
            {floatDelta.v > 0 ? "+" : ""}
            {floatDelta.v}
          </div>
        )}
        <div className="big">{score}</div>
        {lastDelta != null && (
          <div className={"delta-last " + (lastDelta > 0 ? "up" : lastDelta < 0 ? "down" : "")}>
            {lastDelta > 0 ? "▲" : lastDelta < 0 ? "▼" : "·"}{" "}
            {lastDelta > 0 ? "+" : ""}
            {lastDelta} lượt trước
          </div>
        )}
      </div>

      <div className="score-actions">
        <button className="step-btn" onClick={() => applyDelta(-step)} aria-label="minus">
          −
        </button>
        <div className="delta-input">
          <input
            type="text"
            inputMode="numeric"
            placeholder="nhập số…"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleInputApply();
            }}
          />
          <button className="apply" onClick={handleInputApply}>
            OK
          </button>
        </div>
        <button className="step-btn" onClick={() => applyDelta(step)} aria-label="plus">
          +
        </button>
      </div>

      <div className="quick-row">
        {[step * 5, step * 10, -step * 5, -step * 10].map((v) => (
          <button
            key={v}
            className={"quick " + (v < 0 ? "neg" : "")}
            onClick={() => applyDelta(v)}
          >
            {v > 0 ? "+" : ""}
            {v}
          </button>
        ))}
      </div>

      <div className="tiny-history" title="10 thay đổi gần nhất">
        {tinyHistory.length === 0 ? (
          <div style={{ fontSize: 11, color: "var(--text-3)" }}>chưa có thay đổi</div>
        ) : (
          tinyHistory.map((d, i) => {
            const abs = Math.abs(d);
            const max = Math.max(...tinyHistory.map((x) => Math.abs(x)), 1);
            const h = Math.max(4, (abs / max) * 28);
            return (
              <div
                key={i}
                className={"bar " + (d < 0 ? "neg" : "")}
                style={{ height: h }}
              />
            );
          })
        )}
      </div>
    </div>
  );
}

window.PlayerCard = PlayerCard;
