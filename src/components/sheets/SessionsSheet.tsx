import type { AppState } from "../../types";
import { computeScores } from "../../utils/data";
import Icon from "../Icon";

interface Props {
  state: AppState;
  setState: React.Dispatch<React.SetStateAction<AppState>>;
  onNew: () => void;
  onClose: () => void;
}

export default function SessionsSheet({ state, setState, onNew, onClose }: Props) {
  return (
    <div className="sheet" onClick={(e) => e.stopPropagation()}>
      <div className="grab" />
      <div style={{ display: "flex", alignItems: "center" }}>
        <h3>Sessions</h3>
        <button className="sheet-close" onClick={onClose}><Icon n="close" s={14} /></button>
      </div>
      <div className="slist">
        {state.sessions.map((s) => {
          const sc = computeScores(s);
          const leader = [...s.players].sort((a, b) => sc[b.id] - sc[a.id])[0];
          return (
            <button
              key={s.id}
              className={"sitem " + (s.id === state.activeId ? "active" : "")}
              onClick={() => { setState((st) => ({ ...st, activeId: s.id })); onClose(); }}
            >
              <div className="si-ic" style={{
                background: leader ? `color-mix(in oklab, ${leader.color} 20%, var(--bg-3))` : "var(--bg-3)",
                color: leader?.color || "var(--text-2)",
              }}>
                {leader ? leader.name.slice(0, 1).toUpperCase() : "?"}
              </div>
              <div className="si-main">
                <div className="sn">{s.name}</div>
                <div className="sm">{s.players.length} người · {Math.max(0, s.currentRound - 1)} round{leader ? ` · ${leader.name} dẫn` : ""}</div>
              </div>
              {s.id === state.activeId && <div style={{ fontSize: 11, color: "var(--text-3)" }}>đang chơi</div>}
            </button>
          );
        })}
        <button className="sitem" onClick={onNew} style={{ borderStyle: "dashed", justifyContent: "center", color: "var(--text-2)" }}>
          <Icon n="plusc" s={18} /> Bắt đầu session mới
        </button>
      </div>
    </div>
  );
}
