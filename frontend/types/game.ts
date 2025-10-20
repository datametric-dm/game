export interface Position {
  x: number;
  y: number;
}

export interface Size {
  width: number;
  height: number;
}

export interface Block {
  id: string;
  position: Position;
  size: Size;
  speed: number;
}

export interface Player {
  position: Position;
  size: Size;
  invincible: boolean;
}

export interface GameState {
  isPlaying: boolean;
  isPaused: boolean;
  score: number;
  blocks: Block[];
  player: Player;
  speed: number;
  hasExtraLife: boolean;
}
