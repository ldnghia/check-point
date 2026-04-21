// ============ Sidebar ============
const { useState, useEffect, useMemo, useRef } = React;

function Sidebar({ sessions, activeId, onSelect, onNew, theme, onToggleTheme }) {
  return (
    <aside className="sidebar">
      <div className="brand">
        <div className="brand-mark">✓</div>
        <div className="brand-name">
          Check<em>.point</em>
        </div>
      </div>

      <div>
        <div className="side-label">Sessions</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 2, marginTop: 6 }}>
          {sessions.map((s) => (
            <button
              key={s.id}
              className={"session-item " + (s.id === activeId ? "active" : "")}
              onClick={() => onSelect(s.id)}
            >
              <div style={{ display: "flex", flexDirection: "column", gap: 2, minWidth: 0, flex: 1 }}>
                <div style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {s.name}
                </div>
                <div className="meta">
                  {s.players.length} người · R{Math.max(1, s.currentRound - 1)}
                </div>
              </div>
            </button>
          ))}
          <button className="side-new" onClick={onNew}>
            <Icon name="plusSquare" /> Session mới
          </button>
        </div>
      </div>

      <div>
        <div className="side-label">Template game</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 2, marginTop: 6 }}>
          {["Tiến lên", "Uno", "Phỏm", "Tá lả", "Tự chọn"].map((g, i) => (
            <button
              key={g}
              className={"session-item " + (i === 0 ? "active" : "")}
            >
              <span>{g}</span>
              <span className="meta">
                {i === 0 ? "đang dùng" : ""}
              </span>
            </button>
          ))}
        </div>
      </div>

      <div className="side-foot">
        <button
          className="btn sm ghost"
          onClick={onToggleTheme}
          style={{ width: "100%", justifyContent: "space-between" }}
        >
          <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
            <Icon name={theme === "dark" ? "moon" : "sun"} />
            {theme === "dark" ? "Tối" : "Sáng"}
          </span>
          <span className="kbd">⌘K</span>
        </button>
      </div>
    </aside>
  );
}

window.Sidebar = Sidebar;
