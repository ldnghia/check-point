import { useState, useEffect, useRef } from "react";
import type { Session } from "../../types";
import Icon from "../Icon";

const SUGGESTIONS = ["Bi a Hoàng Cầu", "Bi a Cầu Giấy", "Bi a NCT", "Bi a Kim Mã", "Bi a Láng Hạ"];

interface Props {
  session: Session;
  onSave: (name: string) => void;
  onClose: () => void;
}

export default function RenameSheet({ session, onSave, onClose }: Props) {
  const [name, setName] = useState(session.name);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { setTimeout(() => inputRef.current?.focus(), 50); }, []);

  return (
    <div className="sheet" onClick={(e) => e.stopPropagation()}>
      <div className="grab" />
      <div style={{ display: "flex", alignItems: "center" }}>
        <h3>Đặt tên session</h3>
        <button className="sheet-close" onClick={onClose}><Icon n="close" s={14} /></button>
      </div>
      <div className="tw-grp">
        <div className="tw-lbl">Tên hiển thị</div>
        <input
          ref={inputRef}
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter" && name.trim()) onSave(name); }}
          placeholder="VD: Tiến lên tối thứ 6"
          style={{ background: "var(--bg-2)", border: "1px solid var(--line)", borderRadius: 12, padding: "14px 16px", fontSize: 16, fontWeight: 500, color: "var(--text)" }}
        />
      </div>
      <div className="tw-grp">
        <div className="tw-lbl">Gợi ý</div>
        <div className="tw-segw">
          {SUGGESTIONS.map((s) => (
            <button key={s} onClick={() => setName(s)} style={{ fontSize: 12 }}>{s}</button>
          ))}
        </div>
      </div>
      <button className="apply-btn" onClick={() => { if (name.trim()) onSave(name); }}>
        <Icon n="check" s={16} /> Lưu tên
      </button>
    </div>
  );
}
