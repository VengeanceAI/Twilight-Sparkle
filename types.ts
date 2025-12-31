
export type Direction = 'UP' | 'DOWN' | 'LEFT' | 'RIGHT' | 'NONE';

export interface Position {
  x: number;
  y: number;
}

export interface Entity {
  position: Position;
  direction: Direction;
  nextDirection: Direction;
  speed: number;
}

export enum CellType {
  EMPTY = 0,
  WALL = 1,
  PELLET = 2,
  POWER_PELLET = 3,
  GHOST_HOUSE = 4
}

export enum GhostState {
  CHASE = 'CHASE',
  SCATTER = 'SCATTER',
  FRIGHTENED = 'FRIGHTENED',
  EATEN = 'EATEN'
}

export interface Ghost extends Entity {
  id: string;
  color: string;
  state: GhostState;
  homePosition: Position;
  targetPosition: Position;
}

export interface GameState {
  score: number;
  lives: number;
  level: number;
  isGameOver: boolean;
  isPaused: boolean;
  isFrightened: boolean;
  frightenedTimer: number;
  magicQuote: string;
}
