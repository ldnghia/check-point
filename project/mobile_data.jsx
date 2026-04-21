// ============ Mobile App ============
const { useState, useEffect, useRef, useMemo } = React;

// ---- Utilities ----
const PALETTE = ["#e6a56a","#7fb3e8","#c79ae6","#6ecbb0","#e68a9b","#d9c463","#9aa8d8","#e8946d","#85d6c5","#d49ac0","#c3d6a0","#a9b6f0"];
const NAMES = ["Minh","Linh","Duy","Trang","Huy","Nga","An","Bảo"];

function demoSession(n = 4) {
  const players = Array.from({length:n}, (_,i) => ({
    id:"p"+(i+1), name: NAMES[i], color: PALETTE[i]
  }));
  const rows = [
    [12,-4,-4,-4],[-3,10,-3,-4],[-5,-5,15,-5],
    [8,-2,-3,-3],[-6,14,-4,-4],[10,-3,-4,-3]
  ].map(r => r.slice(0,n));
  const history = [];
  rows.forEach((row, rIdx) => row.forEach((d, pIdx) => {
    if (d !== 0) history.push({
      id:`h${rIdx}-${pIdx}`, round: rIdx+1, playerId: players[pIdx].id,
      delta: d, ts: Date.now() - (rows.length-rIdx)*60000
    });
  }));
  return {
    id: "s-demo", name: "Tiến lên — tối thứ 6", game: "Tiến lên",
    createdAt: Date.now() - 2*3600e3, players, history,
    currentRound: rows.length+1, mode: "round"
  };
}
const computeScores = (sess) => {
  const m = Object.fromEntries(sess.players.map(p => [p.id, 0]));
  sess.history.forEach(h => m[h.playerId] += h.delta);
  return m;
};
const perRound = (sess) => {
  const maxR = sess.history.reduce((m,h) => Math.max(m, h.round), 0);
  const run = Object.fromEntries(sess.players.map(p => [p.id, 0]));
  const arr = [];
  for (let r = 1; r <= maxR; r++) {
    const pp = Object.fromEntries(sess.players.map(p => [p.id, 0]));
    let lastTs = 0;
    sess.history.filter(h => h.round === r).forEach(h => { pp[h.playerId] += h.delta; lastTs = Math.max(lastTs, h.ts); });
    sess.players.forEach(p => run[p.id] += pp[p.id]);
    arr.push({ round: r, perPlayer: {...pp}, totals: {...run}, ts: lastTs });
  }
  return arr;
};

// ---- Icons (minimal) ----
const I = ({n, s=18}) => {
  const paths = {
    plus: <path d="M12 5v14M5 12h14"/>,
    minus: <path d="M5 12h14"/>,
    back: <path d="M15 18l-6-6 6-6"/>,
    close: <path d="M6 6l12 12M6 18L18 6"/>,
    undo: <><path d="M3 7v6h6"/><path d="M3 13a9 9 0 1 0 3-6.7L3 9"/></>,
    check: <path d="M4 12l5 5L20 6"/>,
    share: <><path d="M4 12v7a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-7"/><path d="M16 6l-4-4-4 4"/><path d="M12 2v14"/></>,
    settings: <><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 0 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 0 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 0 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 0 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z"/></>,
    home: <><path d="M3 11l9-8 9 8"/><path d="M5 10v10h14V10"/></>,
    list: <><path d="M8 6h13M8 12h13M8 18h13"/><circle cx="4" cy="6" r="1"/><circle cx="4" cy="12" r="1"/><circle cx="4" cy="18" r="1"/></>,
    trophy: <><path d="M8 21h8M12 17v4M7 4h10v5a5 5 0 0 1-10 0V4z"/><path d="M17 5h3v3a3 3 0 0 1-3 3M7 5H4v3a3 3 0 0 0 3 3"/></>,
    chart: <><path d="M3 3v18h18"/><path d="M7 15l4-4 3 3 5-7"/></>,
    table: <><rect x="3" y="4" width="18" height="16" rx="2"/><path d="M3 10h18M9 4v16"/></>,
    flag: <path d="M4 21V4M4 15s2-2 6-2 6 2 10 2V4c-4 0-6-2-10-2S4 4 4 4"/>,
    coin: <><circle cx="12" cy="12" r="9"/><path d="M12 7v10M9 10h4.5a1.5 1.5 0 0 1 0 3H9M9 13h5.5a1.5 1.5 0 0 1 0 3H9"/></>,
    copy: <><rect x="9" y="9" width="11" height="11" rx="2"/><path d="M5 15V5a2 2 0 0 1 2-2h10"/></>,
    plusc: <><circle cx="12" cy="12" r="9"/><path d="M12 8v8M8 12h8"/></>,
    moon: <path d="M21 13A9 9 0 1 1 11 3a7 7 0 0 0 10 10z"/>,
    sun: <><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"/></>,
    card: <><rect x="2" y="5" width="20" height="14" rx="2"/><path d="M2 10h20"/></>,
    edit: <><path d="M12 20h9"/><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4z"/></>,
  };
  return <svg viewBox="0 0 24 24" width={s} height={s} className="i">{paths[n]}</svg>;
};
window.I = I;
window.MobileUtils = { demoSession, computeScores, perRound, PALETTE, NAMES };
