import type { AppState } from "../types";
import { computeScores } from "../utils/data";
import Icon from "./Icon";

interface Props {
  state: AppState;
  setState: React.Dispatch<React.SetStateAction<AppState>>;
  onNew: () => void;
}

export default function SessionsTab({ state, setState, onNew }: Props) {
  return (
    <>
      <div className="h-head">
        <h2>Sessions</h2>
        <button className="chip" onClick={onNew}><Icon n="plusc" s={12} /> Mới</button>
      </div>
      <div className="slist">
        {state.sessions.map((s) => {
          const sc = computeScores(s);
          const leader = [...s.players].sort((a, b) => sc[b.id] - sc[a.id])[0];
          const d = new Date(s.createdAt);
          return (
            <button
              key={s.id}
              className={"sitem " + (s.id === state.activeId ? "active" : "")}
              onClick={() => setState((st) => ({ ...st, activeId: s.id, tab: "play" }))}
            >
              <div className="si-ic" style={{
                background: leader ? `color-mix(in oklab, ${leader.color} 20%, var(--bg-3))` : "var(--bg-3)",
                color: leader?.color || "var(--text-2)",
              }}>
                {leader ? leader.name.slice(0, 1).toUpperCase() : "?"}
              </div>
              <div className="si-main">
                <div className="sn">{s.name}</div>
                <div className="sm">{s.players.length} người · {Math.max(0, s.currentRound - 1)} round · {d.toLocaleDateString("vi-VN")}</div>
              </div>
              {s.id === state.activeId && <div style={{ fontSize: 11, color: "var(--text-3)" }}>đang chơi</div>}
            </button>
          );
        })}
      </div>
    </>
  );
}
