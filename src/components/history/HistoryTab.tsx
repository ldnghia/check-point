import { useState } from "react";
import type { Session } from "../../types";
import { computeScores, perRound } from "../../utils/data";
import Icon from "../Icon";
import RoundsList from "./RoundsList";
import ChartView from "./ChartView";
import TableView from "./TableView";

interface Props {
  session: Session;
  updateSession: (fn: (s: Session) => Session) => void;
}

export default function HistoryTab({ session, updateSession }: Props) {
  const [view, setView] = useState<"rounds" | "chart" | "table">("rounds");
  const matrix = perRound(session);
  const scores = computeScores(session);

  const editRoundEntry = (round: number, playerId: string, newDelta: number) => {
    updateSession((sess) => {
      const preserved = sess.history.filter(
        (h) => !(h.round === round && h.playerId === playerId)
      );
      const existing = sess.history.find(
        (h) => h.round === round && h.playerId === playerId
      );
      const newEntries =
        newDelta !== 0
          ? [{ id: "h-edit-" + Date.now(), round, playerId, delta: newDelta, ts: existing?.ts ?? Date.now() }]
          : [];
      return { ...sess, history: [...preserved, ...newEntries] };
    });
  };

  return (
    <>
      <div className="h-head">
        <h2>Lịch sử</h2>
        <div className="h-tabs">
          <button className={view === "rounds" ? "on" : ""} onClick={() => setView("rounds")}><Icon n="list" s={12} /> Round</button>
          <button className={view === "chart" ? "on" : ""} onClick={() => setView("chart")}><Icon n="chart" s={12} /> Đồ thị</button>
          <button className={view === "table" ? "on" : ""} onClick={() => setView("table")}><Icon n="table" s={12} /> Bảng</button>
        </div>
      </div>
      {view === "rounds" && <RoundsList session={session} matrix={matrix} onEditEntry={editRoundEntry} />}
      {view === "chart" && <ChartView session={session} matrix={matrix} />}
      {view === "table" && <TableView session={session} matrix={matrix} scores={scores} />}
    </>
  );
}
