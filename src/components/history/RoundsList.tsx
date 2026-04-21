import { useState } from "react";
import type { Session, RoundData, Player } from "../../types";
import Icon from "../Icon";
import EditRoundSheet from "./EditRoundSheet";

interface Props {
  session: Session;
  matrix: RoundData[];
  onEditEntry: (round: number, playerId: string, newDelta: number) => void;
}

interface EditTarget {
  player: Player;
  round: number;
  currentDelta: number;
}

export default function RoundsList({ session, matrix, onEditEntry }: Props) {
  const [editTarget, setEditTarget] = useState<EditTarget | null>(null);

  if (matrix.length === 0) {
    return (
      <div className="panel" style={{ padding: 32, textAlign: "center", color: "var(--text-3)", fontSize: 13 }}>
        Chưa có round nào. Cộng/trừ điểm rồi bấm <b>Xong round</b>.
      </div>
    );
  }

  const handleApply = (newDelta: number) => {
    if (!editTarget) return;
    onEditEntry(editTarget.round, editTarget.player.id, newDelta);
    setEditTarget(null);
  };

  return (
    <>
      <div className="panel">
        <div className="rlist">
          {[...matrix].reverse().map((r) => {
            const winnerId = session.players.reduce(
              (w, p) => (r.perPlayer[p.id] > (r.perPlayer[w] ?? -Infinity) ? p.id : w),
              session.players[0].id
            );
            const winner = session.players.find((p) => p.id === winnerId);
            const time = r.ts ? new Date(r.ts).toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" }) : "";
            return (
              <div key={r.round} className="rrow">
                <div className="rrow-top">
                  <div className="rn">R{String(r.round).padStart(2, "0")}</div>
                  <div className="rt">{time}</div>
                  {winner && (
                    <div className="rwinner" style={{ "--pc": winner.color } as React.CSSProperties}>
                      <div className="wd" />{winner.name} thắng
                    </div>
                  )}
                </div>
                <div className="rrow-body">
                  {session.players.map((p) => {
                    const d = r.perPlayer[p.id];
                    return (
                      <button
                        key={p.id}
                        className="rcell rcell-edit"
                        style={{ "--pc": p.color } as React.CSSProperties}
                        onClick={() => setEditTarget({ player: p, round: r.round, currentDelta: d })}
                        title="Chạm để sửa"
                      >
                        <div className="cn" />
                        <div className="cnm">{p.name}</div>
                        <div className={"cd " + (d > 0 ? "pos" : d < 0 ? "neg" : "zero")}>
                          {d === 0 ? "—" : (d > 0 ? "+" : "") + d}
                        </div>
                        <div className="rcell-edit-icon">
                          <Icon n="edit" s={10} />
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {editTarget && (
        <div className="sheet-bg" onClick={() => setEditTarget(null)}>
          <EditRoundSheet
            player={editTarget.player}
            round={editTarget.round}
            currentDelta={editTarget.currentDelta}
            onCancel={() => setEditTarget(null)}
            onApply={handleApply}
          />
        </div>
      )}
    </>
  );
}
