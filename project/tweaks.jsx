// ============ Tweaks panel ============
function TweaksPanel({ state, setState, onClose }) {
  const [openSwatch, setOpenSwatch] = React.useState(null);
  const session = state.sessions.find((s) => s.id === state.activeId);
  if (!session) return null;

  const updateSession = (fn) =>
    setState((s) => ({
      ...s,
      sessions: s.sessions.map((x) => (x.id === session.id ? fn(x) : x)),
    }));

  const changePlayerCount = (n) => {
    updateSession((sess) => {
      let players = [...sess.players];
      while (players.length < n) {
        const i = players.length;
        players.push({
          id: "p" + (i + 1) + "-" + Date.now(),
          name: SessionUtils.INITIAL_NAMES[i] || "Người " + (i + 1),
          color: SessionUtils.PALETTE[i % SessionUtils.PALETTE.length],
        });
      }
      while (players.length > n) {
        const removed = players.pop();
        sess = {
          ...sess,
          history: sess.history.filter((h) => h.playerId !== removed.id),
        };
      }
      return { ...sess, players };
    });
  };

  const scores = SessionUtils.computeScores(session);

  return (
    <div className="tweaks">
      <div className="tweaks-head">
        <span className="dot" />
        <h3>Tweaks</h3>
        <div style={{ flex: 1 }} />
        <button className="btn sm ghost" onClick={onClose}>
          <Icon name="close" size={14} />
        </button>
      </div>
      <div className="tweaks-body">
        <div className="tw-group">
          <label>Chế độ sáng/tối</label>
          <div className="tw-seg">
            {["dark", "light"].map((t) => (
              <button
                key={t}
                className={state.theme === t ? "on" : ""}
                onClick={() => setState((s) => ({ ...s, theme: t }))}
              >
                {t === "dark" ? "Tối" : "Sáng"}
              </button>
            ))}
          </div>
        </div>

        <div className="tw-group">
          <label>Số người chơi · {session.players.length}</label>
          <div className="tw-seg">
            {[2, 3, 4, 5, 6, 7, 8].map((n) => (
              <button
                key={n}
                className={session.players.length === n ? "on" : ""}
                onClick={() => changePlayerCount(n)}
              >
                {n}
              </button>
            ))}
          </div>
        </div>

        <div className="tw-group">
          <label>Step mặc định khi +/−</label>
          <div className="tw-seg">
            {[1, 5, 10, 25, 100].map((n) => (
              <button
                key={n}
                className={state.step === n ? "on" : ""}
                onClick={() => setState((s) => ({ ...s, step: n }))}
              >
                {n}
              </button>
            ))}
          </div>
        </div>

        <div className="tw-group">
          <label>Người chơi · tên · màu</label>
          <div className="tw-players">
            {session.players.map((p, idx) => (
              <div key={p.id} className="tw-player" style={{ "--pc": p.color, position: "relative" }}>
                <button
                  className="sw"
                  onClick={() =>
                    setOpenSwatch(openSwatch === p.id ? null : p.id)
                  }
                />
                {openSwatch === p.id && (
                  <div className="swatches">
                    {SessionUtils.PALETTE.map((c) => (
                      <button
                        key={c}
                        className={"opt " + (p.color === c ? "on" : "")}
                        style={{ "--c": c }}
                        onClick={() => {
                          updateSession((sess) => ({
                            ...sess,
                            players: sess.players.map((x) =>
                              x.id === p.id ? { ...x, color: c } : x
                            ),
                          }));
                          setOpenSwatch(null);
                        }}
                      />
                    ))}
                  </div>
                )}
                <input
                  type="text"
                  value={p.name}
                  onChange={(e) =>
                    updateSession((sess) => ({
                      ...sess,
                      players: sess.players.map((x) =>
                        x.id === p.id ? { ...x, name: e.target.value } : x
                      ),
                    }))
                  }
                  style={{
                    background: "var(--bg-2)",
                    border: "1px solid var(--line)",
                    borderRadius: 6,
                    padding: "5px 8px",
                    fontSize: 13,
                  }}
                />
                <div className="tiny-score">{scores[p.id]}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="tw-group">
          <label>Tên session</label>
          <input
            type="text"
            value={session.name}
            onChange={(e) =>
              updateSession((sess) => ({ ...sess, name: e.target.value }))
            }
          />
        </div>
      </div>
    </div>
  );
}

window.TweaksPanel = TweaksPanel;
