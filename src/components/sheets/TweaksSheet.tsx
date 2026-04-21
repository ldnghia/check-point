import { useState } from "react";
import type { AppState, Session } from "../../types";
import { computeScores, PALETTE, NAMES } from "../../utils/data";
import Icon from "../Icon";

interface Props {
  state: AppState;
  setState: React.Dispatch<React.SetStateAction<AppState>>;
  session: Session;
  updateSession: (fn: (s: Session) => Session) => void;
  addPlayer: (name?: string, color?: string) => void;
  removePlayer: (pid: string) => void;
  onResetAll: () => void;
  onClose: () => void;
}

export default function TweaksSheet({ state, setState, session, updateSession, addPlayer, removePlayer, onResetAll, onClose }: Props) {
  const [openSw, setOpenSw] = useState<string | null>(null);
  const [confirmReset, setConfirmReset] = useState(false);
  const scores = computeScores(session);

  const changeCount = (n: number) => {
    updateSession((sess) => {
      let players = [...sess.players];
      let hist = [...sess.history];
      while (players.length < n) {
        const i = players.length;
        players.push({ id: "p" + (i + 1) + "-" + Date.now(), name: NAMES[i] || "Người " + (i + 1), color: PALETTE[i % PALETTE.length] });
      }
      while (players.length > n) {
        const r = players.pop()!;
        hist = hist.filter((h) => h.playerId !== r.id);
      }
      return { ...sess, players, history: hist };
    });
  };

  return (
    <div className="sheet" onClick={(e) => e.stopPropagation()}>
      <div className="grab" />
      <div style={{ display: "flex", alignItems: "center" }}>
        <h3>Cài đặt</h3>
        <button className="sheet-close" onClick={onClose}><Icon n="close" s={14} /></button>
      </div>

      <div className="tw-grp">
        <div className="tw-lbl">Tên session</div>
        <input
          type="text"
          value={session.name}
          onChange={(e) => updateSession((s) => ({ ...s, name: e.target.value }))}
          style={{ background: "var(--bg-2)", border: "1px solid var(--line)", borderRadius: 10, padding: "10px 12px", fontSize: 14, color: "var(--text)" }}
        />
      </div>

      <div className="tw-grp">
        <div className="tw-lbl">Giao diện</div>
        <div className="tw-segw">
          <button className={state.theme === "dark" ? "on" : ""} onClick={() => setState((s) => ({ ...s, theme: "dark" }))}><Icon n="moon" s={12} /> Tối</button>
          <button className={state.theme === "light" ? "on" : ""} onClick={() => setState((s) => ({ ...s, theme: "light" }))}><Icon n="sun" s={12} /> Sáng</button>
        </div>
      </div>

      <div className="tw-grp">
        <div className="tw-lbl">Số người chơi · {session.players.length}</div>
        <div className="tw-segw">
          {[2, 3, 4, 5, 6, 7, 8].map((n) => (
            <button key={n} className={session.players.length === n ? "on" : ""} onClick={() => changeCount(n)}>{n}</button>
          ))}
        </div>
      </div>

      <div className="tw-grp">
        <div className="tw-lbl">Điểm bước mặc định khi +/−</div>
        <div className="tw-segw">
          {[1, 5, 10, 25, 100].map((n) => (
            <button key={n} className={state.step === n ? "on" : ""} onClick={() => setState((s) => ({ ...s, step: n }))}>{n}</button>
          ))}
        </div>
      </div>

      <div className="tw-grp">
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div className="tw-lbl" style={{ flex: 1 }}>Người chơi · {session.players.length}</div>
          {session.players.length < 8 && (
            <button className="chip" onClick={() => addPlayer()} style={{ padding: "4px 10px", fontSize: 12 }}>
              <Icon n="plusc" s={12} /> Thêm
            </button>
          )}
        </div>
        <div className="tw-plist">
          {session.players.map((p) => (
            <div key={p.id}>
              <div className="tw-prow" style={{ "--pc": p.color } as React.CSSProperties}>
                <button className="tw-av" style={{ background: p.color }} onClick={() => setOpenSw(openSw === p.id ? null : p.id)} />
                <input
                  className="tw-nm"
                  value={p.name}
                  onChange={(e) => updateSession((s) => ({ ...s, players: s.players.map((x) => x.id === p.id ? { ...x, name: e.target.value } : x) }))}
                  style={{ color: "var(--text)" }}
                />
                <div className="tw-sc">{scores[p.id]}đ</div>
                {session.players.length > 2 && (
                  <button
                    onClick={() => { if (window.confirm(`Xoá ${p.name} khỏi session?`)) removePlayer(p.id); }}
                    style={{ width: 28, height: 28, borderRadius: 8, background: "transparent", color: "var(--text-3)", display: "grid", placeItems: "center", border: "none", cursor: "pointer" }}
                  >
                    <Icon n="close" s={14} />
                  </button>
                )}
              </div>
              {openSw === p.id && (
                <div className="swatches-row" style={{ marginTop: 6, padding: "8px 10px", background: "var(--bg-2)", border: "1px solid var(--line)", borderRadius: 12 }}>
                  {PALETTE.map((c) => (
                    <button
                      key={c}
                      className={"sw-opt " + (p.color === c ? "on" : "")}
                      style={{ "--c": c, background: c } as React.CSSProperties}
                      onClick={() => { updateSession((s) => ({ ...s, players: s.players.map((x) => x.id === p.id ? { ...x, color: c } : x) })); setOpenSw(null); }}
                    />
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="tw-grp" style={{ marginTop: 8 }}>
        {!confirmReset ? (
          <button
            onClick={() => setConfirmReset(true)}
            style={{ width: "100%", padding: "10px 14px", borderRadius: 10, border: "1px solid var(--danger)", background: "transparent", color: "var(--danger)", fontSize: 13, fontWeight: 500, cursor: "pointer" }}
          >
            Xóa toàn bộ dữ liệu
          </button>
        ) : (
          <div style={{ background: "color-mix(in oklab, var(--danger) 10%, var(--bg-2))", border: "1px solid var(--danger)", borderRadius: 12, padding: "14px" }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: "var(--danger)", marginBottom: 4 }}>Xác nhận xóa tất cả?</div>
            <div style={{ fontSize: 12, color: "var(--text-2)", marginBottom: 12 }}>Toàn bộ người chơi và session sẽ bị xóa vĩnh viễn. Không thể hoàn tác.</div>
            <div style={{ display: "flex", gap: 8 }}>
              <button
                onClick={() => setConfirmReset(false)}
                style={{ flex: 1, padding: "8px", borderRadius: 8, border: "1px solid var(--line)", background: "var(--bg-2)", color: "var(--text)", fontSize: 13, cursor: "pointer" }}
              >
                Hủy
              </button>
              <button
                onClick={onResetAll}
                style={{ flex: 1, padding: "8px", borderRadius: 8, border: "none", background: "var(--danger)", color: "#fff", fontSize: 13, fontWeight: 600, cursor: "pointer" }}
              >
                Xóa tất cả
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
