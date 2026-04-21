import { useState } from "react";
import type { Player } from "../types";

interface Props {
  player: Player;
  score: number;
  rank: number;
  leader: boolean;
  step: number;
  lastDelta: number | null;
  currentDelta: number | null;
  onDelta: (n: number) => void;
  onOpenNumpad: () => void;
}

export default function PlayerRow({ player, score, rank, leader, step, lastDelta, currentDelta, onDelta, onOpenNumpad }: Props) {
  const [float, setFloat] = useState<{ v: number; id: number } | null>(null);
  const [pop, setPop] = useState(false);

  const apply = (n: number) => {
    onDelta(n);
    setFloat({ v: n, id: Date.now() });
    setPop(true);
    setTimeout(() => setPop(false), 400);
    setTimeout(() => setFloat(null), 900);
  };

  return (
    <div className={"prow" + (leader ? " leader" : "")} style={{ "--pc": player.color } as React.CSSProperties}>
      <div className="av">
        {player.name.slice(0, 1).toUpperCase()}
        {leader && <div className="crown">★</div>}
      </div>
      <div className="p-main">
        <div className="p-name">{player.name}</div>
        <div className="p-meta">
          <span>#{rank}</span>
          <span className="dot" />
          {lastDelta != null ? (
            <span className={"last " + (lastDelta > 0 ? "up" : "down")}>
              {lastDelta > 0 ? "▲ +" : "▼ "}{lastDelta}
            </span>
          ) : (
            <span className="last">mới</span>
          )}
          {currentDelta != null && currentDelta !== 0 && (
            <>
              <span className="dot" />
              <span style={{ color: currentDelta > 0 ? "var(--positive)" : "var(--danger)", fontWeight: 600 }}>
                {currentDelta > 0 ? "+" : ""}{currentDelta}
              </span>
            </>
          )}
        </div>
      </div>
      <div className={"p-score" + (pop ? " pop" : "")} onClick={onOpenNumpad}>
        {score}
        {float && (
          <div key={float.id} className={"float-d " + (float.v > 0 ? "up" : "down")}>
            {float.v > 0 ? "+" : ""}{float.v}
          </div>
        )}
      </div>
      <div className="p-btns">
        <button className="p-btn" onClick={() => apply(step)}>+</button>
        <button className="p-btn" onClick={() => apply(-step)}>−</button>
      </div>
    </div>
  );
}
