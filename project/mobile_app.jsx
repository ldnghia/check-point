// ============ Mobile Main App ============
const { demoSession, computeScores, perRound, PALETTE, NAMES } = window.MobileUtils;
const { PlayerRow, Numpad, HistoryTab, LeaderTab } = window.Screens;

function MobileApp() {
  const [state, setState] = useState(() => {
    const saved = localStorage.getItem("checkpoint.mobile.v1");
    if (saved) { try { return JSON.parse(saved); } catch(e){} }
    const s1 = demoSession(4);
    const s2 = {...demoSession(3), id:"s2", name:"Ván trưa CN", createdAt: Date.now()-86400e3};
    return { theme:"dark", step:1, sessions:[s1, s2], activeId:s1.id, tab:"play" };
  });
  const [sheet, setSheet] = useState(null); // 'numpad'|'menu'|'sessions'|'share'|'tweaks'|null
  const [numpadPlayer, setNumpadPlayer] = useState(null);
  const [toast, setToast] = useState(null);
  const lastUndoRef = useRef(null);

  useEffect(() => localStorage.setItem("checkpoint.mobile.v1", JSON.stringify(state)), [state]);
  useEffect(() => { document.documentElement.dataset.theme = state.theme; }, [state.theme]);

  useEffect(() => {
    const h = (e) => {
      if (!e.data) return;
      if (e.data.type === "__activate_edit_mode") setSheet("tweaks");
      if (e.data.type === "__deactivate_edit_mode" && sheet === "tweaks") setSheet(null);
    };
    window.addEventListener("message", h);
    try { window.parent.postMessage({type:"__edit_mode_available"}, "*"); } catch(e){}
    return () => window.removeEventListener("message", h);
  }, [sheet]);

  const session = state.sessions.find(s => s.id === state.activeId);
  if (!session) return null;
  const scores = computeScores(session);
  const ranked = [...session.players].sort((a,b) => scores[b.id] - scores[a.id]);
  const leaderId = ranked[0]?.id;
  const rankOf = Object.fromEntries(ranked.map((p,i) => [p.id, i+1]));

  const updateSession = (fn) => setState(s => ({...s, sessions: s.sessions.map(x => x.id===session.id ? fn(x) : x)}));

  const applyDelta = (pid, delta) => {
    const entry = {id:"h-"+Date.now()+"-"+Math.random().toString(36).slice(2,5), round: session.currentRound, playerId: pid, delta, ts: Date.now()};
    updateSession(sess => ({...sess, history:[...sess.history, entry]}));
    lastUndoRef.current = entry.id;
    const p = session.players.find(x => x.id === pid);
    setToast({msg:`${p.name}: ${delta>0?"+":""}${delta}`, id: Date.now()});
    setTimeout(() => setToast(null), 4000);
  };

  const undoLast = () => {
    updateSession(sess => sess.history.length ? {...sess, history: sess.history.slice(0,-1)} : sess);
    setToast(null);
  };

  const endRound = () => {
    updateSession(sess => ({...sess, currentRound: sess.currentRound + 1}));
    setToast({msg:"Đã kết thúc round "+session.currentRound, id: Date.now()});
    setTimeout(() => setToast(null), 2500);
  };

  const newSession = () => {
    const id = "s-"+Date.now();
    const sess = {
      id, name:"Session mới", game:"Tiến lên", createdAt: Date.now(),
      players: Array.from({length:4},(_,i) => ({id:"p"+(i+1)+"-"+Date.now()+i, name:NAMES[i], color: PALETTE[i]})),
      history:[], currentRound:1, mode:"round"
    };
    setState(s => ({...s, sessions:[sess, ...s.sessions], activeId: id, tab:"play"}));
    setSheet("rename"); // prompt to name the session right away
  };

  const addPlayer = (name, color) => {
    const taken = new Set(session.players.map(p => p.color));
    const pickColor = color || PALETTE.find(c => !taken.has(c)) || PALETTE[session.players.length % PALETTE.length];
    const finalName = (name && name.trim()) || (NAMES[session.players.length] || `Người ${session.players.length+1}`);
    const np = { id:"p-"+Date.now()+"-"+Math.random().toString(36).slice(2,5), name: finalName, color: pickColor };
    updateSession(sess => ({...sess, players: [...sess.players, np]}));
    setToast({msg:`Đã thêm ${finalName}`, id: Date.now()});
    setTimeout(() => setToast(null), 2500);
  };

  const removePlayer = (pid) => {
    updateSession(sess => ({
      ...sess,
      players: sess.players.filter(p => p.id !== pid),
      history: sess.history.filter(h => h.playerId !== pid),
    }));
  };

  const renameSession = (name) => {
    const n = (name || "").trim();
    if (!n) return;
    updateSession(s => ({...s, name: n}));
  };

  const lastDeltaFor = (pid) => {
    const h = [...session.history].reverse().find(x => x.playerId === pid);
    return h?.delta ?? null;
  };

  const nRounds = Math.max(0, session.currentRound - 1);
  const matrix = perRound(session);

  return (
    <div className="stage">
      <div className="phone">
        {/* Header */}
        <div className="phd">
          <div className="phd-row">
            <button className="ic-btn" onClick={()=>setSheet("sessions")}><I n="list" s={16}/></button>
            <div style={{flex:1, minWidth:0}} onClick={()=>setSheet("rename")}>
              <h1 className="phd-title">
                {session.name}
                <I n="edit" s={12}/>
              </h1>
              <div className="phd-sub">
                <span>{session.game}</span>
                <span className="dot"/>
                <span>{session.players.length} người</span>
                <span className="dot"/>
                <span>R{session.currentRound}</span>
              </div>
            </div>
            <button className="ic-btn" onClick={()=>setSheet("share")}><I n="share" s={16}/></button>
            <button className="ic-btn" onClick={()=>setSheet("tweaks")}><I n="settings" s={16}/></button>
          </div>

          <div className="seg">
            <button className={session.mode==="round"?"on":""} onClick={()=>updateSession(s=>({...s,mode:"round"}))}><I n="flag" s={12}/> Round</button>
            <button className={session.mode==="free"?"on":""} onClick={()=>updateSession(s=>({...s,mode:"free"}))}><I n="coin" s={12}/> Tự do</button>
          </div>
        </div>

        {/* Body */}
        <div className="scroll">
          {state.tab === "play" && <>
            {session.mode === "round" && (
              <div className="round-card">
                <div style={{display:"flex", flexDirection:"column", gap:2}}>
                  <div className="rc-lbl">Round hiện tại</div>
                  <div className="rc-num">R{String(session.currentRound).padStart(2,"0")}</div>
                </div>
                <div className="rc-mini">
                  {Array.from({length:12}).map((_,i) => {
                    const r = matrix[matrix.length-12+i];
                    const mag = r ? Math.max(...session.players.map(p => Math.abs(r.perPlayer[p.id]))) : 0;
                    const h = r ? Math.max(4, Math.min(28, mag*1.8)) : 4;
                    return <div key={i} className="b" style={{height: h, opacity: r?0.9:0.25}}/>;
                  })}
                </div>
                <button className="rc-endbtn" onClick={endRound}>
                  Xong <I n="check" s={12}/>
                </button>
              </div>
            )}

            {session.players.map(p => (
              <PlayerRow
                key={p.id}
                player={p}
                score={scores[p.id]}
                rank={rankOf[p.id]}
                leader={p.id === leaderId && session.players.length > 1}
                step={state.step}
                lastDelta={lastDeltaFor(p.id)}
                onDelta={(d) => applyDelta(p.id, d)}
                onOpenNumpad={() => { setNumpadPlayer(p); setSheet("numpad"); }}
              />
            ))}

            {session.players.length < 8 && (
              <button className="prow" onClick={()=>setSheet("addplayer")}
                style={{justifyContent:"center", color:"var(--text-2)", borderStyle:"dashed", background:"transparent", gap:8}}>
                <div className="av" style={{background:"var(--bg-2)", color:"var(--text-3)", border:"1px dashed var(--line-2)"}}>+</div>
                <div style={{flex:1, textAlign:"left"}}>
                  <div style={{fontSize:14, fontWeight:500, color:"var(--text)"}}>Thêm người chơi</div>
                  <div style={{fontSize:11, color:"var(--text-3)"}}>Vào giữa ván cũng được — điểm bắt đầu từ 0</div>
                </div>
                <I n="plusc" s={18}/>
              </button>
            )}
          </>}

          {state.tab === "history" && <HistoryTab session={session}/>}
          {state.tab === "leader" && <LeaderTab session={session}/>}
          {state.tab === "sessions" && <SessionsTab state={state} setState={setState} onNew={newSession}/>}
        </div>

        {/* Toast */}
        {toast && <div key={toast.id} className="toast">
          <span>{toast.msg}</span>
          {session.history.length > 0 && <button className="undo" onClick={undoLast}>Hoàn tác</button>}
        </div>}

        {/* Tab bar */}
        <div className="tabbar">
          {[
            {k:"play", n:"home", l:"Chơi"},
            {k:"history", n:"list", l:"Lịch sử"},
            {k:"leader", n:"trophy", l:"Xếp hạng"},
            {k:"sessions", n:"card", l:"Session"},
          ].map(t => (
            <button key={t.k} className={"tab" + (state.tab===t.k?" on":"")} onClick={()=>setState(s=>({...s, tab:t.k}))}>
              <div className="tab-i"><I n={t.n} s={16}/></div>
              <div>{t.l}</div>
            </button>
          ))}
        </div>

        {/* Sheets */}
        {sheet && <div className="sheet-bg" onClick={() => setSheet(null)}>
          {sheet === "numpad" && numpadPlayer && (
            <Numpad player={numpadPlayer} onCancel={()=>setSheet(null)} onApply={(v)=>{applyDelta(numpadPlayer.id, v); setSheet(null);}}/>
          )}
          {sheet === "share" && <ShareSheet session={session} onClose={()=>setSheet(null)}/>}
          {sheet === "sessions" && <SessionsSheet state={state} setState={setState} onNew={newSession} onClose={()=>setSheet(null)}/>}
          {sheet === "tweaks" && <TweaksSheet state={state} setState={setState} session={session} updateSession={updateSession} addPlayer={addPlayer} removePlayer={removePlayer} onClose={()=>setSheet(null)}/>}
          {sheet === "addplayer" && <AddPlayerSheet session={session} onAdd={(n,c)=>{addPlayer(n,c); setSheet(null);}} onClose={()=>setSheet(null)}/>}
          {sheet === "rename" && <RenameSheet session={session} onSave={(n)=>{renameSession(n); setSheet(null);}} onClose={()=>setSheet(null)}/>}
        </div>}
      </div>
    </div>
  );
}

// ===== Share sheet =====
function ShareSheet({ session, onClose }) {
  const scores = computeScores(session);
  const ranked = [...session.players].map(p => ({...p, score: scores[p.id]})).sort((a,b)=>b.score-a.score);
  const n = Math.max(0, session.currentRound-1);
  const [copied, setCopied] = useState(false);
  const copy = () => {
    const t = `🎲 ${session.name}\n${n} round · ${session.players.length} người\n\n` +
      ranked.map((p,i) => `${i===0?"🏆":(i+1)+"."} ${p.name} — ${p.score}`).join("\n");
    navigator.clipboard?.writeText(t);
    setCopied(true); setTimeout(()=>setCopied(false), 1500);
  };
  return (
    <div className="sheet" onClick={(e)=>e.stopPropagation()}>
      <div className="grab"/>
      <div style={{display:"flex", alignItems:"center"}}>
        <h3>Chia sẻ kết quả</h3>
        <button className="sheet-close" onClick={onClose}><I n="close" s={14}/></button>
      </div>
      <div className="share-card">
        <div className="stitle">Check·point · kết quả</div>
        <div className="sgame">{session.name}</div>
        <div>
          {ranked.map((p,i) => (
            <div key={p.id} className={"share-row " + (i===0?"w":"")}>
              <div className="rk">{i===0?"🏆":i+1}</div>
              <div style={{display:"flex", alignItems:"center", gap:8}}>
                <div style={{width:10, height:10, borderRadius:3, background:p.color}}/>{p.name}
              </div>
              <div className="sc">{p.score}</div>
            </div>
          ))}
        </div>
        <div style={{display:"flex", justifyContent:"space-between", fontSize:11, color:"var(--text-3)"}}>
          <span>{n} round</span>
          <span>{new Date().toLocaleDateString("vi-VN")}</span>
        </div>
      </div>
      <div style={{display:"flex", gap:8}}>
        <button className="chip big" style={{flex:1, justifyContent:"center", height:48}} onClick={copy}>
          <I n="copy" s={14}/> {copied ? "Đã copy" : "Copy"}
        </button>
        <button className="chip big" style={{flex:1, justifyContent:"center", height:48, background:"var(--accent)", color:"var(--accent-ink)", borderColor:"transparent", fontWeight:600}} onClick={onClose}>
          <I n="check" s={14}/> Xong
        </button>
      </div>
    </div>
  );
}

// ===== Sessions sheet =====
function SessionsSheet({ state, setState, onNew, onClose }) {
  return (
    <div className="sheet" onClick={(e)=>e.stopPropagation()}>
      <div className="grab"/>
      <div style={{display:"flex", alignItems:"center"}}>
        <h3>Sessions</h3>
        <button className="sheet-close" onClick={onClose}><I n="close" s={14}/></button>
      </div>
      <div className="slist">
        {state.sessions.map(s => {
          const sc = computeScores(s);
          const leader = [...s.players].sort((a,b)=>sc[b.id]-sc[a.id])[0];
          return (
            <button key={s.id} className={"sitem " + (s.id===state.activeId?"active":"")} onClick={()=>{setState(st=>({...st, activeId:s.id})); onClose();}}>
              <div className="si-ic" style={{background: leader ? `color-mix(in oklab, ${leader.color} 20%, var(--bg-3))`:"var(--bg-3)", color: leader?.color || "var(--text-2)"}}>
                {leader ? leader.name.slice(0,1).toUpperCase() : "?"}
              </div>
              <div className="si-main">
                <div className="sn">{s.name}</div>
                <div className="sm">{s.players.length} người · {Math.max(0,s.currentRound-1)} round{leader ? ` · ${leader.name} dẫn` : ""}</div>
              </div>
              {s.id===state.activeId && <div style={{fontSize:11, color:"var(--text-3)"}}>đang chơi</div>}
            </button>
          );
        })}
        <button className="sitem" onClick={onNew} style={{borderStyle:"dashed", justifyContent:"center", color:"var(--text-2)"}}>
          <I n="plusc" s={18}/> Bắt đầu session mới
        </button>
      </div>
    </div>
  );
}

function SessionsTab({ state, setState, onNew }) {
  return (
    <>
      <div className="h-head"><h2>Sessions</h2>
        <button className="chip" onClick={onNew}><I n="plusc" s={12}/> Mới</button>
      </div>
      <div className="slist">
        {state.sessions.map(s => {
          const sc = computeScores(s);
          const leader = [...s.players].sort((a,b)=>sc[b.id]-sc[a.id])[0];
          const d = new Date(s.createdAt);
          return (
            <button key={s.id} className={"sitem " + (s.id===state.activeId?"active":"")} onClick={()=>setState(st=>({...st, activeId:s.id, tab:"play"}))}>
              <div className="si-ic" style={{background: leader ? `color-mix(in oklab, ${leader.color} 20%, var(--bg-3))`:"var(--bg-3)", color: leader?.color || "var(--text-2)"}}>
                {leader ? leader.name.slice(0,1).toUpperCase() : "?"}
              </div>
              <div className="si-main">
                <div className="sn">{s.name}</div>
                <div className="sm">{s.players.length} người · {Math.max(0,s.currentRound-1)} round · {d.toLocaleDateString('vi-VN')}</div>
              </div>
              {s.id===state.activeId && <div style={{fontSize:11, color:"var(--text-3)"}}>đang chơi</div>}
            </button>
          );
        })}
      </div>
    </>
  );
}

// ===== Tweaks sheet =====
function TweaksSheet({ state, setState, session, updateSession, addPlayer, removePlayer, onClose }) {
  const [openSw, setOpenSw] = useState(null);
  const scores = computeScores(session);
  const changeCount = (n) => {
    updateSession(sess => {
      let players = [...sess.players];
      while (players.length < n) {
        const i = players.length;
        players.push({id:"p"+(i+1)+"-"+Date.now(), name: NAMES[i] || "Người "+(i+1), color: PALETTE[i%PALETTE.length]});
      }
      while (players.length > n) {
        const r = players.pop();
        sess = {...sess, history: sess.history.filter(h => h.playerId !== r.id)};
      }
      return {...sess, players};
    });
  };
  return (
    <div className="sheet" onClick={(e)=>e.stopPropagation()}>
      <div className="grab"/>
      <div style={{display:"flex", alignItems:"center"}}>
        <h3>Cài đặt</h3>
        <button className="sheet-close" onClick={onClose}><I n="close" s={14}/></button>
      </div>

      <div className="tw-grp">
        <div className="tw-lbl">Tên session</div>
        <input type="text" value={session.name} onChange={(e)=>updateSession(s=>({...s, name: e.target.value}))}
          style={{background:"var(--bg-2)", border:"1px solid var(--line)", borderRadius:10, padding:"10px 12px", fontSize:14}}/>
      </div>

      <div className="tw-grp">
        <div className="tw-lbl">Giao diện</div>
        <div className="tw-segw">
          <button className={state.theme==="dark"?"on":""} onClick={()=>setState(s=>({...s, theme:"dark"}))}><I n="moon" s={12}/> Tối</button>
          <button className={state.theme==="light"?"on":""} onClick={()=>setState(s=>({...s, theme:"light"}))}><I n="sun" s={12}/> Sáng</button>
        </div>
      </div>

      <div className="tw-grp">
        <div className="tw-lbl">Số người chơi · {session.players.length}</div>
        <div className="tw-segw">
          {[2,3,4,5,6,7,8].map(n => (
            <button key={n} className={session.players.length===n?"on":""} onClick={()=>changeCount(n)}>{n}</button>
          ))}
        </div>
      </div>

      <div className="tw-grp">
        <div className="tw-lbl">Điểm bước mặc định khi +/−</div>
        <div className="tw-segw">
          {[1,5,10,25,100].map(n => (
            <button key={n} className={state.step===n?"on":""} onClick={()=>setState(s=>({...s, step:n}))}>{n}</button>
          ))}
        </div>
      </div>

      <div className="tw-grp">
        <div style={{display:"flex", alignItems:"center", gap:8}}>
          <div className="tw-lbl" style={{flex:1}}>Người chơi · {session.players.length}</div>
          {session.players.length < 8 && (
            <button className="chip" onClick={()=>addPlayer()} style={{padding:"4px 10px", fontSize:12}}>
              <I n="plusc" s={12}/> Thêm
            </button>
          )}
        </div>
        <div className="tw-plist">
          {session.players.map(p => (
            <div key={p.id}>
              <div className="tw-prow" style={{"--pc":p.color}}>
                <button className="tw-av" onClick={()=>setOpenSw(openSw===p.id?null:p.id)}/>
                <input className="tw-nm" value={p.name} onChange={(e)=>updateSession(s=>({...s, players: s.players.map(x => x.id===p.id ? {...x, name:e.target.value} : x)}))}/>
                <div className="tw-sc">{scores[p.id]}đ</div>
                {session.players.length > 2 && (
                  <button onClick={()=>{if(confirm(`Xoá ${p.name} khỏi session?`)) removePlayer(p.id);}}
                    style={{width:28, height:28, borderRadius:8, background:"transparent", color:"var(--text-3)", display:"grid", placeItems:"center"}}>
                    <I n="close" s={14}/>
                  </button>
                )}
              </div>
              {openSw === p.id && (
                <div className="swatches-row" style={{marginTop:6, padding:"8px 10px", background:"var(--bg-2)", border:"1px solid var(--line)", borderRadius:12}}>
                  {PALETTE.map(c => (
                    <button key={c} className={"sw-opt " + (p.color===c?"on":"")} style={{"--c":c}}
                      onClick={()=>{updateSession(s=>({...s, players: s.players.map(x => x.id===p.id ? {...x, color:c} : x)})); setOpenSw(null);}}/>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<MobileApp/>);

// ===== Rename session sheet =====
function RenameSheet({ session, onSave, onClose }) {
  const [name, setName] = useState(session.name);
  const inputRef = useRef(null);
  useEffect(() => {
    setTimeout(() => inputRef.current?.focus(), 50);
  }, []);
  const suggestions = ["Tiến lên — tối thứ 6", "Ván trưa CN", "Chung kết nhà An", "Tiền lẻ quán cafe"];
  return (
    <div className="sheet" onClick={(e)=>e.stopPropagation()}>
      <div className="grab"/>
      <div style={{display:"flex", alignItems:"center"}}>
        <h3>Đặt tên session</h3>
        <button className="sheet-close" onClick={onClose}><I n="close" s={14}/></button>
      </div>
      <div className="tw-grp">
        <div className="tw-lbl">Tên hiển thị</div>
        <input ref={inputRef} type="text" value={name} onChange={(e)=>setName(e.target.value)}
          onKeyDown={(e)=>{if(e.key==="Enter" && name.trim()) onSave(name);}}
          placeholder="VD: Tiến lên tối thứ 6"
          style={{background:"var(--bg-2)", border:"1px solid var(--line)", borderRadius:12, padding:"14px 16px", fontSize:16, fontWeight:500}}/>
      </div>
      <div className="tw-grp">
        <div className="tw-lbl">Gợi ý</div>
        <div className="tw-segw">
          {suggestions.map(s => (
            <button key={s} onClick={()=>setName(s)} style={{fontSize:12}}>{s}</button>
          ))}
        </div>
      </div>
      <button className="chip big" style={{height:52, borderRadius:14, background:"var(--accent)", color:"var(--accent-ink)", fontWeight:600, fontSize:16, justifyContent:"center"}}
        onClick={()=>{if(name.trim()) onSave(name);}}>
        <I n="check" s={16}/> Lưu tên
      </button>
    </div>
  );
}

// ===== Add player sheet =====
function AddPlayerSheet({ session, onAdd, onClose }) {
  const taken = new Set(session.players.map(p => p.color));
  const defaultColor = PALETTE.find(c => !taken.has(c)) || PALETTE[session.players.length % PALETTE.length];
  const [name, setName] = useState("");
  const [color, setColor] = useState(defaultColor);
  const inputRef = useRef(null);
  useEffect(() => {
    setTimeout(() => inputRef.current?.focus(), 50);
  }, []);
  const available = NAMES.filter(n => !session.players.some(p => p.name === n));
  return (
    <div className="sheet" onClick={(e)=>e.stopPropagation()}>
      <div className="grab"/>
      <div style={{display:"flex", alignItems:"center"}}>
        <h3>Thêm người chơi</h3>
        <button className="sheet-close" onClick={onClose}><I n="close" s={14}/></button>
      </div>

      <div style={{display:"flex", alignItems:"center", gap:12, padding:"4px 2px"}}>
        <div className="av" style={{"--pc":color, width:52, height:52, fontSize:20, background:`color-mix(in oklab, ${color} 22%, var(--bg-2))`, color: color, border:`1px solid color-mix(in oklab, ${color} 35%, transparent)`}}>
          {(name.trim() || "?").slice(0,1).toUpperCase()}
        </div>
        <div style={{flex:1, fontSize:12, color:"var(--text-3)"}}>
          Người thứ {session.players.length+1} · bắt đầu với 0 điểm ở <b style={{color:"var(--text)"}}>R{session.currentRound}</b>
        </div>
      </div>

      <div className="tw-grp">
        <div className="tw-lbl">Tên</div>
        <input ref={inputRef} type="text" value={name} onChange={(e)=>setName(e.target.value)}
          onKeyDown={(e)=>{if(e.key==="Enter") onAdd(name, color);}}
          placeholder={available[0] || "Nhập tên..."}
          style={{background:"var(--bg-2)", border:"1px solid var(--line)", borderRadius:12, padding:"14px 16px", fontSize:16, fontWeight:500}}/>
        {available.length > 0 && (
          <div className="tw-segw" style={{marginTop:6}}>
            {available.slice(0,6).map(n => (
              <button key={n} onClick={()=>setName(n)} style={{fontSize:12}}>{n}</button>
            ))}
          </div>
        )}
      </div>

      <div className="tw-grp">
        <div className="tw-lbl">Màu</div>
        <div className="swatches-row" style={{padding:"4px 0"}}>
          {PALETTE.map(c => {
            const used = taken.has(c);
            return (
              <button key={c} className={"sw-opt " + (color===c?"on":"")} style={{"--c":c, opacity: used ? 0.3 : 1}}
                disabled={used && color !== c}
                onClick={()=>setColor(c)}/>
            );
          })}
        </div>
      </div>

      <button className="chip big" style={{height:52, borderRadius:14, background:"var(--accent)", color:"var(--accent-ink)", fontWeight:600, fontSize:16, justifyContent:"center"}}
        onClick={()=>onAdd(name, color)}>
        <I n="plusc" s={16}/> Thêm {name.trim() || "người chơi"}
      </button>
    </div>
  );
}
