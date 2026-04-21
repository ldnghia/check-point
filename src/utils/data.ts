import type { Session, RoundData } from "../types";

export const PALETTE = [
  "#e6a56a","#7fb3e8","#c79ae6","#6ecbb0",
  "#e68a9b","#d9c463","#9aa8d8","#e8946d",
  "#85d6c5","#d49ac0","#c3d6a0","#a9b6f0",
];

export const NAMES = ["Long","Hoàng","Đăng","Trường","Nghĩa","Quân","Phương","Hưng"];

export function demoSession(n = 4): Session {
  const players = Array.from({ length: n }, (_, i) => ({
    id: "p" + (i + 1),
    name: NAMES[i],
    color: PALETTE[i],
  }));
  const rows = [
    [12, -4, -4, -4], [-3, 10, -3, -4], [-5, -5, 15, -5],
    [8, -2, -3, -3],  [-6, 14, -4, -4], [10, -3, -4, -3],
  ].map((r) => r.slice(0, n));
  const history: Session["history"] = [];
  rows.forEach((row, rIdx) =>
    row.forEach((d, pIdx) => {
      if (d !== 0)
        history.push({
          id: `h${rIdx}-${pIdx}`,
          round: rIdx + 1,
          playerId: players[pIdx].id,
          delta: d,
          ts: Date.now() - (rows.length - rIdx) * 60000,
        });
    })
  );
  return {
    id: "s-demo",
    name: "Tiến lên — tối thứ 6",
    game: "Tiến lên",
    createdAt: Date.now() - 2 * 3600e3,
    players,
    history,
    currentRound: rows.length + 1,
    mode: "round",
  };
}

export function computeScores(sess: Session): Record<string, number> {
  const m = Object.fromEntries(sess.players.map((p) => [p.id, 0]));
  sess.history.forEach((h) => {
    if (m[h.playerId] !== undefined) m[h.playerId] += h.delta;
  });
  return m;
}

export function perRound(sess: Session): RoundData[] {
  const maxR = sess.history.reduce((m, h) => Math.max(m, h.round), 0);
  const run = Object.fromEntries(sess.players.map((p) => [p.id, 0]));
  const arr: RoundData[] = [];
  for (let r = 1; r <= maxR; r++) {
    const pp = Object.fromEntries(sess.players.map((p) => [p.id, 0]));
    let lastTs = 0;
    sess.history
      .filter((h) => h.round === r)
      .forEach((h) => {
        if (pp[h.playerId] !== undefined) {
          pp[h.playerId] += h.delta;
          lastTs = Math.max(lastTs, h.ts);
        }
      });
    sess.players.forEach((p) => (run[p.id] += pp[p.id]));
    arr.push({ round: r, perPlayer: { ...pp }, totals: { ...run }, ts: lastTs });
  }
  return arr;
}
