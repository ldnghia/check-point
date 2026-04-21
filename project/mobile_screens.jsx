// ============ Mobile Screens ============

function PlayerRow({ player, score, rank, leader, step, lastDelta, onDelta, onOpenNumpad }) {
  const [float, setFloat] = useState(null);
  const [pop, setPop] = useState(false);
  const apply = (n) => {
    onDelta(n);
    setFloat({v:n, id: Date.now()});
    setPop(true);
    setTimeout(() => setPop(false), 400);
    setTimeout(() => setFloat(null), 900);
  };
  return (
    <div className={"prow" + (leader ? " leader" : "")} style={{"--pc": player.color}}>
      <div className="av">
        {player.name.slice(0,1).toUpperCase()}
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
          ) : <span className="last">mới</span>}
        </div>
      </div>
      <div className={"p-score" + (pop ? " pop" : "")} onClick={onOpenNumpad}>
        {score}
        {float && <div key={float.id} className={"float-d " + (float.v>0?"up":"down")}>{float.v>0?"+":""}{float.v}</div>}
      </div>
      <div className="p-btns">
        <button className="p-btn" onClick={() => apply(step)}>+</button>
        <button className="p-btn" onClick={() => apply(-step)}>−</button>
      </div>
    </div>
  );
}

function Numpad({ player, onCancel, onApply }) {
  const [val, setVal] = useState("");
  const [sign, setSign] = useState(1);
  const press = (k) => {
    if (k === "del") return setVal(v => v.slice(0, -1));
    if (k === "clr") return setVal("");
    if (val.length >= 4) return;
    setVal(v => v + k);
  };
  const n = parseInt(val, 10);
  const final = isNaN(n) ? 0 : n * sign;
  return (
    <div className="sheet" onClick={(e) => e.stopPropagation()}>
      <div className="grab" />
      <div style={{display:"flex", alignItems:"center", gap:10}}>
        <div className="av" style={{"--pc": player.color, width: 36, height: 36, fontSize: 14, background:"color-mix(in oklab, "+player.color+" 22%, var(--bg-2))", color: player.color, border:"1px solid color-mix(in oklab, "+player.color+" 35%, transparent)"}}>
          {player.name.slice(0,1).toUpperCase()}
        </div>
        <h3 style={{flex:1}}>{player.name}</h3>
        <button className="sheet-close" onClick={onCancel}><I n="close" s={14}/></button>
      </div>
      <div className="np-display">
        {val === "" ? <span className="hint">nhập điểm…</span> : (
          <><span className={"sgn " + (sign>0?"pos":"neg")}>{sign>0?"+":"−"}</span>{val}</>
        )}
      </div>
      <div style={{display:"grid", gridTemplateColumns:"1fr 1fr", gap:6}}>
        <button className="chip big" style={{background: sign>0 ? "color-mix(in oklab, var(--positive) 18%, var(--bg-2))" : "var(--bg-2)", color: sign>0 ? "var(--positive)" : "var(--text-2)"}} onClick={()=>setSign(1)}>+ Cộng</button>
        <button className="chip big" style={{background: sign<0 ? "color-mix(in oklab, var(--danger) 18%, var(--bg-2))" : "var(--bg-2)", color: sign<0 ? "var(--danger)" : "var(--text-2)"}} onClick={()=>setSign(-1)}>− Trừ</button>
      </div>
      <div className="numpad">
        {["1","2","3","4","5","6","7","8","9"].map(k => (
          <button key={k} onClick={() => press(k)}>{k}</button>
        ))}
        <button className="fn" onClick={() => press("clr")}>C</button>
        <button onClick={() => press("0")}>0</button>
        <button className="fn" onClick={() => press("del")}>⌫</button>
      </div>
      <button className="numpad-apply chip big" style={{
        height: 52, borderRadius: 14, background: "var(--accent)",
        color: "var(--accent-ink)", fontWeight: 600, fontSize: 16,
        justifyContent: "center"
      }} onClick={() => { if (final !== 0) onApply(final); }}>
        Xác nhận {final !== 0 && (final > 0 ? "+" : "") + final}
      </button>
    </div>
  );
}

// ===== History views =====
function HistoryTab({ session }) {
  const [view, setView] = useState("rounds");
  const matrix = perRound(session);
  const scores = computeScores(session);

  return (
    <>
      <div className="h-head">
        <h2>Lịch sử</h2>
        <div className="h-tabs">
          <button className={view==="rounds"?"on":""} onClick={()=>setView("rounds")}><I n="list" s={12}/> Round</button>
          <button className={view==="chart"?"on":""} onClick={()=>setView("chart")}><I n="chart" s={12}/> Đồ thị</button>
          <button className={view==="table"?"on":""} onClick={()=>setView("table")}><I n="table" s={12}/> Bảng</button>
        </div>
      </div>

      {view === "rounds" && <RoundsList session={session} matrix={matrix} />}
      {view === "chart" && <ChartView session={session} matrix={matrix} />}
      {view === "table" && <TableView session={session} matrix={matrix} scores={scores} />}
    </>
  );
}

function RoundsList({ session, matrix }) {
  if (matrix.length === 0) {
    return <div className="panel" style={{padding:32, textAlign:"center", color:"var(--text-3)", fontSize:13}}>Chưa có round nào. Cộng/trừ điểm rồi bấm <b>Xong round</b>.</div>;
  }
  return (
    <div className="panel">
      <div className="rlist">
        {[...matrix].reverse().map((r) => {
          const winnerId = session.players.reduce((w, p) =>
            r.perPlayer[p.id] > (r.perPlayer[w] ?? -Infinity) ? p.id : w,
            session.players[0].id);
          const winner = session.players.find(p => p.id === winnerId);
          const time = r.ts ? new Date(r.ts).toLocaleTimeString('vi-VN',{hour:'2-digit',minute:'2-digit'}) : "";
          return (
            <div key={r.round} className="rrow">
              <div className="rrow-top">
                <div className="rn">R{String(r.round).padStart(2,"0")}</div>
                <div className="rt">{time}</div>
                {winner && <div className="rwinner" style={{"--pc": winner.color}}>
                  <div className="wd"/>{winner.name} thắng
                </div>}
              </div>
              <div className="rrow-body">
                {session.players.map(p => {
                  const d = r.perPlayer[p.id];
                  return (
                    <div key={p.id} className="rcell" style={{"--pc": p.color}}>
                      <div className="cn"/>
                      <div className="cnm">{p.name}</div>
                      <div className={"cd " + (d>0?"pos":d<0?"neg":"zero")}>{d===0?"—":(d>0?"+":"")+d}</div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function ChartView({ session, matrix }) {
  const W = 360, H = 220;
  const pad = { l: 28, r: 50, t: 12, b: 24 };
  const innerW = W - pad.l - pad.r;
  const innerH = H - pad.t - pad.b;
  const all = [0, ...matrix.flatMap(r => session.players.map(p => r.totals[p.id]))];
  const maxY = Math.max(10, ...all);
  const minY = Math.min(0, ...all);
  const rY = maxY - minY || 1;
  const n = Math.max(matrix.length, 1);
  const x = (i) => pad.l + (n<=1 ? innerW/2 : (i/(n-1||1))*innerW);
  const y = (v) => pad.t + (1 - (v-minY)/rY)*innerH;
  const ticks = [];
  for (let i = 0; i <= 4; i++) ticks.push(Math.round(minY + (rY*i)/4));

  return (
    <>
      <div className="chart-legend">
        {session.players.map(p => (
          <span key={p.id} className="lg" style={{"--pc": p.color}}>
            <span className="dot"/>{p.name}
          </span>
        ))}
      </div>
      <div className="panel" style={{marginTop: 10}}>
        <div className="chart-box">
          <svg viewBox={`0 0 ${W} ${H}`} style={{width:"100%", display:"block"}}>
            {ticks.map((v,i) => (
              <g key={i}>
                <line x1={pad.l} x2={W-pad.r} y1={y(v)} y2={y(v)} stroke="var(--line)" strokeDasharray={v===0?"0":"2 4"} />
                <text x={pad.l-4} y={y(v)+3} fill="var(--text-3)" fontSize="9" textAnchor="end" fontFamily="var(--mono)">{v}</text>
              </g>
            ))}
            {matrix.map((r,i) => (
              <text key={r.round} x={x(i)} y={H-6} fill="var(--text-3)" fontSize="9" textAnchor="middle" fontFamily="var(--mono)">R{r.round}</text>
            ))}
            {session.players.map(p => {
              const pts = matrix.map((r,i) => [x(i), y(r.totals[p.id])]);
              const d = pts.map((pt,i) => (i===0?"M":"L")+pt[0]+","+pt[1]).join(" ");
              return (
                <g key={p.id}>
                  <path d={d} fill="none" stroke={p.color} strokeWidth="2" strokeLinejoin="round" strokeLinecap="round"/>
                  {pts.map((pt,i) => <circle key={i} cx={pt[0]} cy={pt[1]} r={i===pts.length-1?3.5:2} fill={p.color}/>)}
                  {pts.length>0 && <text x={pts[pts.length-1][0]+5} y={pts[pts.length-1][1]+3} fill={p.color} fontSize="10" fontFamily="var(--mono)">{p.name}</text>}
                </g>
              );
            })}
          </svg>
        </div>
      </div>
    </>
  );
}

function TableView({ session, matrix, scores }) {
  return (
    <div className="panel" style={{overflow:"auto"}}>
      <table style={{width:"100%", borderCollapse:"collapse", fontSize:13, fontVariantNumeric:"tabular-nums"}}>
        <thead>
          <tr style={{background:"var(--bg-2)"}}>
            <th style={{padding:"8px 10px", textAlign:"left", fontSize:10, color:"var(--text-3)", textTransform:"uppercase", letterSpacing:.04+"em"}}>R</th>
            {session.players.map(p => (
              <th key={p.id} style={{padding:"8px 10px", textAlign:"right", fontSize:11, color:"var(--text)", fontWeight:500}}>
                <span style={{display:"inline-flex", alignItems:"center", gap:5}}>
                  <span style={{width:6, height:6, borderRadius:2, background:p.color, display:"inline-block"}}/>
                  {p.name}
                </span>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {matrix.map(r => (
            <tr key={r.round} style={{borderTop:"1px solid var(--line)"}}>
              <td style={{padding:"8px 10px", color:"var(--text-3)", fontSize:11}}>R{String(r.round).padStart(2,"0")}</td>
              {session.players.map(p => {
                const d = r.perPlayer[p.id];
                return (
                  <td key={p.id} style={{padding:"8px 10px", textAlign:"right"}}>
                    <div style={{display:"flex", justifyContent:"flex-end", alignItems:"center", gap:6}}>
                      <span style={{fontSize:11, padding:"1px 6px", borderRadius:999, color: d>0?"var(--positive)":d<0?"var(--danger)":"var(--text-3)", background: d===0?"transparent":`color-mix(in oklab, ${d>0?"var(--positive)":"var(--danger)"} 14%, transparent)`}}>
                        {d===0?"—":(d>0?"+":"")+d}
                      </span>
                      <span style={{color:"var(--text-3)", fontSize:11, minWidth:24, textAlign:"right"}}>{r.totals[p.id]}</span>
                    </div>
                  </td>
                );
              })}
            </tr>
          ))}
          <tr style={{background:"var(--bg-2)", fontWeight:600, borderTop:"1px solid var(--line)"}}>
            <td style={{padding:"10px", color:"var(--text)"}}>Tổng</td>
            {session.players.map(p => (
              <td key={p.id} style={{padding:"10px", textAlign:"right", fontSize:14}}>{scores[p.id]}</td>
            ))}
          </tr>
        </tbody>
      </table>
    </div>
  );
}

function LeaderTab({ session }) {
  const scores = computeScores(session);
  const ranked = [...session.players].map(p => ({...p, score: scores[p.id]})).sort((a,b)=>b.score-a.score);
  const matrix = perRound(session);
  const last = matrix[matrix.length-1];
  return (
    <>
      <div className="h-head"><h2>Xếp hạng</h2></div>
      <div className="lb">
        {ranked.map((p,i) => (
          <div key={p.id} className={"lb-item " + (i===0?"top":"")} style={{"--pc":p.color}}>
            <div className="lr">{i===0?"★":String(i+1).padStart(2,"0")}</div>
            <div className="av" style={{"--pc":p.color, width:40, height:40}}>{p.name.slice(0,1).toUpperCase()}</div>
            <div className="lname">
              <div className="nn">{p.name}</div>
              <div className="mm">
                {last ? (<span style={{color: last.perPlayer[p.id]>0?"var(--positive)":last.perPlayer[p.id]<0?"var(--danger)":"var(--text-3)"}}>
                  round vừa rồi {last.perPlayer[p.id]>0?"+":""}{last.perPlayer[p.id]}
                </span>) : "chưa có round"}
              </div>
            </div>
            <div className="lbsc">{p.score}</div>
          </div>
        ))}
      </div>
    </>
  );
}

window.Screens = { PlayerRow, Numpad, HistoryTab, RoundsList, ChartView, TableView, LeaderTab };
