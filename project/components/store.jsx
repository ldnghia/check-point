// Pure reducer + helpers for score sessions

const uid = () => Math.random().toString(36).slice(2, 9);

// A session:
// { id, name, createdAt, mode: 'round' | 'free',
//   players: [{id, name, colorIdx}],
//   rounds: [{id, index, scores: {playerId: delta}, at}]
//   draft: {playerId: delta}  -- pending round (mode === 'round')
// }

const makeSession = (name = 'Tiến lên') => ({
  id: uid(),
  name,
  createdAt: Date.now(),
  mode: 'round',
  target: null, // optional score target
  players: [
    { id: uid(), name: 'Long',   colorIdx: 0 },
    { id: uid(), name: 'Trường', colorIdx: 1 },
    { id: uid(), name: 'Hoàng',  colorIdx: 2 },
    { id: uid(), name: 'Đăng',   colorIdx: 3 },
  ],
  rounds: [],
  draft: {},
});

const totalFor = (session, playerId) =>
  session.rounds.reduce((s, r) => s + (r.scores[playerId] || 0), 0);

const totalsList = (session) =>
  session.players.map(p => ({ ...p, total: totalFor(session, p.id) }));

const rankedPlayers = (session) =>
  [...totalsList(session)].sort((a, b) => b.total - a.total);

const leaderId = (session) => {
  const r = rankedPlayers(session);
  if (!r.length) return null;
  if (r.length > 1 && r[0].total === r[1].total) return null;
  return r[0].id;
};

Object.assign(window, {
  uid, makeSession, totalFor, totalsList, rankedPlayers, leaderId,
});
