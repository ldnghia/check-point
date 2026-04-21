// ============ Data layer + helpers ============

const DEFAULT_COLORS = [
  "var(--p1)",
  "var(--p2)",
  "var(--p3)",
  "var(--p4)",
  "var(--p5)",
  "var(--p6)",
  "var(--p7)",
  "var(--p8)",
];
const PALETTE = [
  "#e6a56a", // p1
  "#7fb3e8", // p2
  "#c79ae6", // p3
  "#6ecbb0", // p4
  "#e68a9b", // p5
  "#d9c463", // p6
  "#9aa8d8", // p7
  "#e8946d", // p8
  "#85d6c5",
  "#d49ac0",
  "#c3d6a0",
  "#a9b6f0",
];

const INITIAL_NAMES = ["Minh", "Linh", "Duy", "Trang", "Huy", "Nga", "An", "Bảo"];

// Make an initial demo session with 6 rounds of data so the UI has content
function buildDemoSession(numPlayers = 4) {
  const players = Array.from({ length: numPlayers }, (_, i) => ({
    id: "p" + (i + 1),
    name: INITIAL_NAMES[i],
    color: PALETTE[i],
  }));
  // round deltas per player (hand-authored for visual rhythm)
  const rounds = [
    [12, -4, -4, -4],
    [-3, 10, -3, -4],
    [-5, -5, 15, -5],
    [8, -2, -3, -3],
    [-6, 14, -4, -4],
    [10, -3, -4, -3],
  ].slice(0, 6).map((row) => row.slice(0, numPlayers));

  const history = [];
  rounds.forEach((row, rIdx) => {
    row.forEach((delta, pIdx) => {
      if (delta !== 0) {
        history.push({
          id: `h${rIdx}-${pIdx}`,
          round: rIdx + 1,
          playerId: players[pIdx].id,
          delta,
          ts: Date.now() - (rounds.length - rIdx) * 60000,
        });
      }
    });
  });

  return {
    id: "s-demo",
    name: "Tiến lên — tối thứ 6",
    game: "Tiến lên",
    createdAt: Date.now() - 2 * 60 * 60 * 1000,
    players,
    history,
    currentRound: rounds.length + 1, // next round to play
    mode: "round", // "round" or "free"
    targetScore: null,
  };
}

function computeScores(session) {
  const map = Object.fromEntries(session.players.map((p) => [p.id, 0]));
  session.history.forEach((h) => {
    map[h.playerId] = (map[h.playerId] || 0) + h.delta;
  });
  return map;
}

function perRoundMatrix(session) {
  // Returns { rounds: [1..n], rows: [{round, perPlayer:{pid:delta}, totals:{pid:running}}] }
  const rounds = [];
  const maxRound = session.history.reduce((m, h) => Math.max(m, h.round), 0);
  const running = Object.fromEntries(session.players.map((p) => [p.id, 0]));
  for (let r = 1; r <= maxRound; r++) {
    const perPlayer = Object.fromEntries(
      session.players.map((p) => [p.id, 0])
    );
    session.history
      .filter((h) => h.round === r)
      .forEach((h) => {
        perPlayer[h.playerId] += h.delta;
      });
    session.players.forEach((p) => {
      running[p.id] += perPlayer[p.id];
    });
    rounds.push({
      round: r,
      perPlayer: { ...perPlayer },
      totals: { ...running },
    });
  }
  return rounds;
}

function fmtTime(ts) {
  const d = new Date(ts);
  const hh = String(d.getHours()).padStart(2, "0");
  const mm = String(d.getMinutes()).padStart(2, "0");
  return `${hh}:${mm}`;
}

function fmtRel(ts) {
  const s = Math.floor((Date.now() - ts) / 1000);
  if (s < 60) return "vừa xong";
  const m = Math.floor(s / 60);
  if (m < 60) return m + " phút trước";
  const h = Math.floor(m / 60);
  if (h < 24) return h + " giờ trước";
  const d = Math.floor(h / 24);
  return d + " ngày trước";
}

window.SessionUtils = {
  buildDemoSession,
  computeScores,
  perRoundMatrix,
  fmtTime,
  fmtRel,
  PALETTE,
  INITIAL_NAMES,
};
