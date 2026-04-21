import { useState, useEffect } from "react";
import type { AppState, Session, SheetType } from "./types";
import { demoSession, computeScores, perRound, PALETTE, NAMES } from "./utils/data";
import Icon from "./components/Icon";
import PlayerRow from "./components/PlayerRow";
import Numpad from "./components/Numpad";
import TabBar from "./components/TabBar";
import HistoryTab from "./components/history/HistoryTab";
import LeaderTab from "./components/LeaderTab";
import SessionsTab from "./components/SessionsTab";
import ShareSheet from "./components/sheets/ShareSheet";
import SessionsSheet from "./components/sheets/SessionsSheet";
import TweaksSheet from "./components/sheets/TweaksSheet";
import RenameSheet from "./components/sheets/RenameSheet";
import AddPlayerSheet from "./components/sheets/AddPlayerSheet";
import EndGameSheet from "./components/sheets/EndGameSheet";

function initState(): AppState {
  const saved = localStorage.getItem("checkpoint.mobile.v1");
  if (saved) { try { return JSON.parse(saved); } catch (_) {} }
  const s1 = demoSession(4);
  const s2 = { ...demoSession(3), id: "s2", name: "Ván trưa CN", createdAt: Date.now() - 86400e3 };
  return { theme: "dark", step: 1, sessions: [s1, s2], activeId: s1.id, tab: "play" };
}

export default function App() {
  const [state, setState] = useState<AppState>(initState);
  const [sheet, setSheet] = useState<SheetType>(null);
  const [numpadPlayer, setNumpadPlayer] = useState<Session["players"][0] | null>(null);
  const [toast, setToast] = useState<{ msg: string; id: number } | null>(null);

  useEffect(() => { localStorage.setItem("checkpoint.mobile.v1", JSON.stringify(state)); }, [state]);
  useEffect(() => { document.documentElement.dataset.theme = state.theme; }, [state.theme]);

  const newSession = () => {
    const id = "s-" + Date.now();
    const sess: Session = {
      id, name: "Bi a Hoàng Cầu", game: "Tiến lên", createdAt: Date.now(),
      players: [],
      history: [], currentRound: 1, mode: "round",
    };
    setState((s) => ({ ...s, sessions: [sess, ...s.sessions], activeId: id, tab: "play" }));
    setSheet("rename");
  };

  const session = state.sessions.find((s) => s.id === state.activeId);

  if (!session) {
    return (
      <div className="stage">
        <div className="phone" style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 16, padding: 40, textAlign: "center" }}>
            <div style={{ fontSize: 48, lineHeight: 1 }}>🎮</div>
            <div style={{ fontSize: 20, fontWeight: 700, color: "var(--text)" }}>Checkpoint</div>
            <div style={{ fontSize: 13, color: "var(--text-3)", maxWidth: 220 }}>Chưa có session nào. Tạo session mới để bắt đầu.</div>
            <button
              onClick={newSession}
              style={{ marginTop: 8, padding: "12px 28px", borderRadius: 14, background: "var(--text)", color: "var(--bg)", fontSize: 15, fontWeight: 600, border: "none", cursor: "pointer" }}
            >
              Tạo session mới
            </button>
          </div>
        </div>
      </div>
    );
  }

  const scores = computeScores(session);
  const ranked = [...session.players].sort((a, b) => scores[b.id] - scores[a.id]);
  const leaderId = ranked[0]?.id;
  const rankOf = Object.fromEntries(ranked.map((p, i) => [p.id, i + 1]));

  const updateSession = (fn: (s: Session) => Session) =>
    setState((s) => ({ ...s, sessions: s.sessions.map((x) => (x.id === session.id ? fn(x) : x)) }));

  const showToast = (msg: string) => {
    const id = Date.now();
    setToast({ msg, id });
    setTimeout(() => setToast((t) => (t?.id === id ? null : t)), 4000);
  };

  const applyDelta = (pid: string, delta: number) => {
    const entry = { id: "h-" + Date.now() + "-" + Math.random().toString(36).slice(2, 5), round: session.currentRound, playerId: pid, delta, ts: Date.now() };
    updateSession((sess) => ({ ...sess, history: [...sess.history, entry] }));
    const p = session.players.find((x) => x.id === pid)!;
    showToast(`${p.name}: ${delta > 0 ? "+" : ""}${delta}`);
  };

  const undoLast = () => {
    updateSession((sess) => sess.history.length ? { ...sess, history: sess.history.slice(0, -1) } : sess);
    setToast(null);
  };

  const endRound = () => {
    updateSession((sess) => ({ ...sess, currentRound: sess.currentRound + 1 }));
    showToast("Đã kết thúc round " + session.currentRound);
  };

  const addPlayer = (name?: string, color?: string) => {
    const taken = new Set(session.players.map((p) => p.color));
    const pickColor = color || PALETTE.find((c) => !taken.has(c)) || PALETTE[session.players.length % PALETTE.length];
    const finalName = (name?.trim()) || NAMES[session.players.length] || `Người ${session.players.length + 1}`;
    const np = { id: "p-" + Date.now() + "-" + Math.random().toString(36).slice(2, 5), name: finalName, color: pickColor };
    updateSession((sess) => ({ ...sess, players: [...sess.players, np] }));
    showToast(`Đã thêm ${finalName}`);
  };

  const removePlayer = (pid: string) => {
    updateSession((sess) => ({
      ...sess,
      players: sess.players.filter((p) => p.id !== pid),
      history: sess.history.filter((h) => h.playerId !== pid),
    }));
  };

  const resetAll = () => {
    localStorage.removeItem("checkpoint.mobile.v1");
    setState({ theme: state.theme, step: 1, sessions: [], activeId: "", tab: "play" });
    setSheet(null);
  };

  const renameSession = (name: string) => {
    const n = name.trim();
    if (!n) return;
    updateSession((s) => ({ ...s, name: n }));
  };

  const lastRoundDeltaFor = (pid: string): number | null => {
    const lastCompleted = session.currentRound - 1;
    if (lastCompleted <= 0) return null;
    const entries = session.history.filter(
      (h) => h.round === lastCompleted && h.playerId === pid
    );
    if (entries.length === 0) return null;
    return entries.reduce((sum, h) => sum + h.delta, 0);
  };

  const currentRoundDeltaFor = (pid: string): number | null => {
    if (session.mode !== "round") return null;
    const entries = session.history.filter(
      (h) => h.round === session.currentRound && h.playerId === pid
    );
    if (entries.length === 0) return null;
    return entries.reduce((sum, h) => sum + h.delta, 0);
  };

  const matrix = perRound(session);

  return (
    <div className="stage">
      <div className="phone">
        {/* Header */}
        <div className="phd">
          <div className="phd-row">
            <button className="ic-btn" onClick={() => setSheet("sessions")}><Icon n="list" s={16} /></button>
            <div style={{ flex: 1, minWidth: 0, cursor: "pointer" }} onClick={() => setSheet("rename")}>
              <h1 className="phd-title">{session.name}<Icon n="edit" s={12} /></h1>
              <div className="phd-sub">
                <span>{session.game}</span>
                <span className="dot" />
                <span>{session.players.length} người</span>
                <span className="dot" />
                <span>R{session.currentRound}</span>
              </div>
            </div>
            <button className="ic-btn" onClick={() => setSheet("share")}><Icon n="share" s={16} /></button>
            <button className="ic-btn" onClick={() => setSheet("tweaks")}><Icon n="settings" s={16} /></button>
          </div>
          <div className="seg">
            <button className={session.mode === "round" ? "on" : ""} onClick={() => updateSession((s) => ({ ...s, mode: "round" }))}><Icon n="flag" s={12} /> Round</button>
            <button className={session.mode === "free" ? "on" : ""} onClick={() => updateSession((s) => ({ ...s, mode: "free" }))}><Icon n="coin" s={12} /> Tự do</button>
          </div>
        </div>

        {/* Body */}
        <div className="scroll">
          {state.tab === "play" && (
            <>
              {session.mode === "round" && (
                <div className="round-card">
                  <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                    <div className="rc-lbl">Round hiện tại</div>
                    <div className="rc-num">R{String(session.currentRound).padStart(2, "0")}</div>
                  </div>
                  <div className="rc-mini">
                    {Array.from({ length: 12 }).map((_, i) => {
                      const r = matrix[matrix.length - 12 + i];
                      const mag = r ? Math.max(...session.players.map((p) => Math.abs(r.perPlayer[p.id]))) : 0;
                      const h = r ? Math.max(4, Math.min(28, mag * 1.8)) : 4;
                      return <div key={i} className="b" style={{ height: h, opacity: r ? 0.9 : 0.25 }} />;
                    })}
                  </div>
                  <button className="rc-endbtn" onClick={endRound}>Xong <Icon n="check" s={12} /></button>
                </div>
              )}

              {session.players.map((p) => (
                <PlayerRow
                  key={p.id}
                  player={p}
                  score={scores[p.id]}
                  rank={rankOf[p.id]}
                  leader={p.id === leaderId && session.players.length > 1}
                  step={state.step}
                  lastDelta={lastRoundDeltaFor(p.id)}
                  currentDelta={currentRoundDeltaFor(p.id)}
                  onDelta={(d) => applyDelta(p.id, d)}
                  onOpenNumpad={() => { setNumpadPlayer(p); setSheet("numpad"); }}
                />
              ))}

              {session.players.length < 8 && (
                <button
                  className="prow"
                  onClick={() => setSheet("addplayer")}
                  style={{ justifyContent: "center", color: "var(--text-2)", borderStyle: "dashed", background: "transparent", gap: 8 }}
                >
                  <div className="av" style={{ "--pc": "var(--text-3)", background: "var(--bg-2)", color: "var(--text-3)", border: "1px dashed var(--line-2)" } as React.CSSProperties}>+</div>
                  <div style={{ flex: 1, textAlign: "left" }}>
                    <div style={{ fontSize: 14, fontWeight: 500, color: "var(--text)" }}>Thêm người chơi</div>
                    <div style={{ fontSize: 11, color: "var(--text-3)" }}>Vào giữa ván cũng được — điểm bắt đầu từ 0</div>
                  </div>
                  <Icon n="plusc" s={18} />
                </button>
              )}

              {session.players.length > 0 && (
                <button
                  onClick={() => setSheet("endgame")}
                  style={{ margin: "4px 0 8px", width: "100%", padding: "13px", borderRadius: 14, border: "1px solid color-mix(in oklab, var(--danger) 40%, transparent)", background: "color-mix(in oklab, var(--danger) 8%, transparent)", color: "var(--danger)", fontSize: 14, fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}
                >
                  🏁 Kết thúc ván
                </button>
              )}
            </>
          )}
          {state.tab === "history" && <HistoryTab session={session} updateSession={updateSession} />}
          {state.tab === "leader" && <LeaderTab session={session} />}
          {state.tab === "sessions" && <SessionsTab state={state} setState={setState} onNew={newSession} />}
        </div>

        {/* Toast */}
        {toast && (
          <div key={toast.id} className="toast">
            <span>{toast.msg}</span>
            {session.history.length > 0 && <button className="undo" onClick={undoLast}>Hoàn tác</button>}
          </div>
        )}

        {/* Tab bar */}
        <TabBar tab={state.tab} onChange={(t) => setState((s) => ({ ...s, tab: t }))} />

        {/* Sheets */}
        {sheet && (
          <div className="sheet-bg" onClick={() => setSheet(null)}>
            {sheet === "numpad" && numpadPlayer && (
              <Numpad player={numpadPlayer} onCancel={() => setSheet(null)} onApply={(v) => { applyDelta(numpadPlayer.id, v); setSheet(null); }} />
            )}
            {sheet === "share" && <ShareSheet session={session} onClose={() => setSheet(null)} />}
            {sheet === "sessions" && <SessionsSheet state={state} setState={setState} onNew={newSession} onClose={() => setSheet(null)} />}
            {sheet === "tweaks" && (
              <TweaksSheet state={state} setState={setState} session={session} updateSession={updateSession} addPlayer={addPlayer} removePlayer={removePlayer} onResetAll={resetAll} onClose={() => setSheet(null)} />
            )}
            {sheet === "addplayer" && <AddPlayerSheet session={session} onAdd={(n, c) => { addPlayer(n, c); setSheet(null); }} onClose={() => setSheet(null)} />}
            {sheet === "rename" && <RenameSheet session={session} onSave={(n) => { renameSession(n); setSheet(null); }} onClose={() => setSheet(null)} />}
            {sheet === "endgame" && <EndGameSheet session={session} onNewSession={() => { newSession(); }} onClose={() => setSheet(null)} />}
          </div>
        )}
      </div>
    </div>
  );
}
