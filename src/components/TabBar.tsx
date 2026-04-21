import type { AppState } from "../types";
import Icon from "./Icon";

const TABS = [
  { k: "play",     n: "home",   l: "Chơi" },
  { k: "history",  n: "list",   l: "Lịch sử" },
  { k: "leader",   n: "trophy", l: "Xếp hạng" },
  { k: "sessions", n: "card",   l: "Session" },
] as const;

interface Props {
  tab: AppState["tab"];
  onChange: (t: AppState["tab"]) => void;
}

export default function TabBar({ tab, onChange }: Props) {
  return (
    <div className="tabbar">
      {TABS.map((t) => (
        <button key={t.k} className={"tab" + (tab === t.k ? " on" : "")} onClick={() => onChange(t.k)}>
          <div className="tab-i"><Icon n={t.n} s={16} /></div>
          <div>{t.l}</div>
        </button>
      ))}
    </div>
  );
}
