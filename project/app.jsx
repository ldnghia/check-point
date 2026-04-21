// ============ Main App ============
function App() {
  const [state, setState] = React.useState(() => {
    const saved = localStorage.getItem("checkpoint.v1");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {}
    }
    const demo = SessionUtils.buildDemoSession(4);
    const s2 = {
      ...SessionUtils.buildDemoSession(3),
      id: "s2",
      name: "Ván trưa CN",
      createdAt: Date.now() - 24 * 60 * 60 * 1000,
    };
    return {
      theme: "dark",
      step: 1,
      sessions: [demo, s2],
      activeId: demo.id,
      historyView: "table", // table | chart | leaderboard
    };
  });

  const [tweaksOpen, setTweaksOpen] = React.useState(true);
  const [shareOpen, setShareOpen] = React.useState(false);
  const [undoStack, setUndoStack] = React.useState([]);

  // Persist
  React.useEffect(() => {
    localStorage.setItem("checkpoint.v1", JSON.stringify(state));
  }, [state]);

  React.useEffect(() => {
    document.documentElement.dataset.theme = state.theme;
  }, [state.theme]);

  // Edit-mode protocol (Tweaks)
  React.useEffect(() => {
    const handler = (e) => {
      if (!e.data) return;
      if (e.data.type === "__activate_edit_mode") setTweaksOpen(true);
      if (e.data.type === "__deactivate_edit_mode") setTweaksOpen(false);
    };
    window.addEventListener("message", handler);
    try {
      window.parent.postMessage({ type: "__edit_mode_available" }, "*");
    } catch (err) {}
    return () => window.removeEventListener("message", handler);
  }, []);

  const session = state.sessions.find((s) => s.id === state.activeId);
  if (!session) return null;

  const scores = SessionUtils.computeScores(session);
  const ranked = [...session.players].sort(
    (a, b) => scores[b.id] - scores[a.id]
  );
  const leaderId = ranked[0]?.id;
  const rankOf = Object.fromEntries(ranked.map((p, i) => [p.id, i + 1]));

  const updateSession = (fn) =>
    setState((s) => ({
      ...s,
      sessions: s.sessions.map((x) => (x.id === session.id ? fn(x) : x)),
    }));

  const applyDelta = (playerId, delta) => {
    const entry = {
      id: "h-" + Date.now() + "-" + Math.random().toString(36).slice(2, 6),
      round: session.currentRound,
      playerId,
      delta,
      ts: Date.now(),
    };
    updateSession((sess) => ({ ...sess, history: [...sess.history, entry] }));
    setUndoStack((u) => [...u, entry.id]);
  };

  const endRound = () => {
    updateSession((sess) => ({ ...sess, currentRound: sess.currentRound + 1 }));
  };

  const undoLast = () => {
    setState((s) => {
      const sess = s.sessions.find((x) => x.id === s.activeId);
      if (!sess.history.length) return s;
      const last = sess.history[sess.history.length - 1];
      return {
        ...s,
        sessions: s.sessions.map((x) =>
          x.id === sess.id
            ? { ...x, history: x.history.slice(0, -1) }
            : x
        ),
      };
    });
  };

  const newSession = () => {
    const id = "s-" + Date.now();
    const sess = {
      id,
      name: "Session mới",
      game: "Tiến lên",
      createdAt: Date.now(),
      players: Array.from({ length: 4 }, (_, i) => ({
        id: "p" + (i + 1) + "-" + Date.now() + i,
        name: SessionUtils.INITIAL_NAMES[i],
        color: SessionUtils.PALETTE[i],
      })),
      history: [],
      currentRound: 1,
      mode: "round",
      targetScore: null,
    };
    setState((s) => ({ ...s, sessions: [sess, ...s.sessions], activeId: id }));
  };

  // Per-player helpers
  const lastDeltaFor = (pid) => {
    const h = [...session.history].reverse().find((x) => x.playerId === pid);
    return h?.delta ?? null;
  };
  const tinyHistoryFor = (pid) =>
    session.history
      .filter((h) => h.playerId === pid)
      .slice(-10)
      .map((h) => h.delta);

  const totalPlayers = session.players.length;
  const totalPoints = Object.values(scores).reduce((a, b) => a + Math.abs(b), 0);
  const nRounds = Math.max(0, session.currentRound - 1);
  const leader = ranked[0];

  const toggleTheme = () =>
    setState((s) => ({ ...s, theme: s.theme === "dark" ? "light" : "dark" }));

  return (
    <div className="app">
      <Sidebar
        sessions={state.sessions}
        activeId={state.activeId}
        onSelect={(id) => setState((s) => ({ ...s, activeId: id }))}
        onNew={newSession}
        theme={state.theme}
        onToggleTheme={toggleTheme}
      />

      <main className="main" data-screen-label="01 Scoring">
        {/* Topbar */}
        <div className="topbar">
          <div className="title-group">
            <div className="eyebrow">{session.game}</div>
            <h1 className="page-title">
              {session.name}
              <Icon name="edit" className="i edit-pen" size={14} />
            </h1>
          </div>
          <div style={{ flex: 1 }} />
          <div className="pill-group">
            <button
              className={"pill " + (session.mode === "round" ? "active" : "")}
              onClick={() => updateSession((s) => ({ ...s, mode: "round" }))}
            >
              <Icon name="flag" size={13} /> Theo round
            </button>
            <button
              className={"pill " + (session.mode === "free" ? "active" : "")}
              onClick={() => updateSession((s) => ({ ...s, mode: "free" }))}
            >
              <Icon name="coin" size={13} /> Tự do
            </button>
          </div>
          <button
            className="btn ghost"
            onClick={undoLast}
            disabled={session.history.length === 0}
          >
            <Icon name="undo" /> Hoàn tác
          </button>
          <button className="btn" onClick={() => setShareOpen(true)}>
            <Icon name="share" /> Chia sẻ
          </button>
        </div>

        {/* Stats row */}
        <div className="stats">
          <div className="stat">
            <div className="lbl">Round hiện tại</div>
            <div className="val">
              R{String(session.currentRound).padStart(2, "0")}
              <small>· {nRounds} đã xong</small>
            </div>
          </div>
          <div className="stat">
            <div className="lbl">Người dẫn đầu</div>
            <div className="val" style={{ color: leader?.color }}>
              {leader?.name || "—"}
              <small style={{ color: "var(--text-3)" }}>
                {leader ? scores[leader.id] + "đ" : ""}
              </small>
            </div>
          </div>
          <div className="stat">
            <div className="lbl">Số người chơi</div>
            <div className="val">
              {totalPlayers}
              <small>người</small>
            </div>
          </div>
          <div className="stat">
            <div className="lbl">Tổng điểm đã trao</div>
            <div className="val">
              {totalPoints}
              <small>điểm</small>
            </div>
          </div>
        </div>

        {/* Player grid */}
        <div className="players">
          {session.players.map((p) => (
            <PlayerCard
              key={p.id}
              player={p}
              score={scores[p.id]}
              rank={rankOf[p.id]}
              totalPlayers={totalPlayers}
              step={state.step}
              lastDelta={lastDeltaFor(p.id)}
              tinyHistory={tinyHistoryFor(p.id)}
              onDelta={(d) => applyDelta(p.id, d)}
              onRename={(name) =>
                updateSession((sess) => ({
                  ...sess,
                  players: sess.players.map((x) =>
                    x.id === p.id ? { ...x, name } : x
                  ),
                }))
              }
              isLeader={p.id === leaderId && totalPlayers > 1}
            />
          ))}
        </div>

        {/* History section */}
        <div style={{ marginTop: 8 }}>
          <div className="section-title">
            <h2>Lịch sử điểm</h2>
            <div className="pill-group">
              <button
                className={"pill " + (state.historyView === "table" ? "active" : "")}
                onClick={() => setState((s) => ({ ...s, historyView: "table" }))}
              >
                <Icon name="table" size={13} /> Bảng
              </button>
              <button
                className={"pill " + (state.historyView === "chart" ? "active" : "")}
                onClick={() => setState((s) => ({ ...s, historyView: "chart" }))}
              >
                <Icon name="chart" size={13} /> Biểu đồ
              </button>
              <button
                className={"pill " + (state.historyView === "leaderboard" ? "active" : "")}
                onClick={() => setState((s) => ({ ...s, historyView: "leaderboard" }))}
              >
                <Icon name="trophy" size={13} /> Xếp hạng
              </button>
            </div>
          </div>
          {state.historyView === "table" && <HistoryTable session={session} />}
          {state.historyView === "chart" && <LineChart session={session} />}
          {state.historyView === "leaderboard" && <Leaderboard session={session} />}
        </div>

        {/* Round action bar */}
        {session.mode === "round" && (
          <div className="round-bar">
            <span className="rb-label">
              Đang ở <span className="rb-val">R{session.currentRound}</span>
            </span>
            <button className="btn sm" onClick={undoLast} disabled={!session.history.length}>
              <Icon name="undo" size={13} /> Hoàn tác
            </button>
            <button className="btn primary sm" onClick={endRound}>
              <Icon name="check" size={13} /> Kết thúc round
              <Icon name="chevRight" size={13} />
            </button>
          </div>
        )}
      </main>

      {tweaksOpen ? (
        <TweaksPanel
          state={state}
          setState={setState}
          onClose={() => setTweaksOpen(false)}
        />
      ) : (
        <button
          className="tweaks-toggle"
          onClick={() => setTweaksOpen(true)}
        >
          <Icon name="settings" size={14} /> Tweaks
        </button>
      )}

      {shareOpen && (
        <ShareModal session={session} onClose={() => setShareOpen(false)} />
      )}
    </div>
  );
}

window.App = App;

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<App />);
