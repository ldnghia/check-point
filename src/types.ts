export interface Player {
  id: string;
  name: string;
  color: string;
}

export interface HistoryEntry {
  id: string;
  round: number;
  playerId: string;
  delta: number;
  ts: number;
}

export interface Session {
  id: string;
  name: string;
  game: string;
  createdAt: number;
  players: Player[];
  history: HistoryEntry[];
  currentRound: number;
  mode: "round" | "free";
}

export interface AppState {
  theme: "dark" | "light";
  step: number;
  sessions: Session[];
  activeId: string;
  tab: "play" | "history" | "leader" | "sessions";
}

export interface RoundData {
  round: number;
  perPlayer: Record<string, number>;
  totals: Record<string, number>;
  ts: number;
}

export type SheetType =
  | "numpad"
  | "share"
  | "sessions"
  | "tweaks"
  | "addplayer"
  | "rename"
  | "endgame"
  | null;
