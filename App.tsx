
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  Direction, 
  Position, 
  CellType, 
  GameState, 
  Ghost, 
  GhostState 
} from './types';
import { 
  INITIAL_MAZE, 
  TILE_SIZE, 
  MAZE_WIDTH, 
  MAZE_HEIGHT, 
  COLORS, 
  INITIAL_LIVES,
  FRIGHTENED_DURATION 
} from './constants';
import TwilightIcon from './components/TwilightIcon';
import GhostIcon from './components/GhostIcon';
import { fetchFriendshipQuote } from './services/geminiService';

const App: React.FC = () => {
  // Game State
  const [maze, setMaze] = useState<number[][]>(INITIAL_MAZE.map(row => [...row]));
  const [player, setPlayer] = useState<Position>({ x: 9, y: 15 });
  const [direction, setDirection] = useState<Direction>('NONE');
  const [nextDirection, setNextDirection] = useState<Direction>('NONE');
  const [gameState, setGameState] = useState<GameState>({
    score: 0,
    lives: INITIAL_LIVES,
    level: 1,
    isGameOver: false,
    isPaused: true,
    isFrightened: false,
    frightenedTimer: 0,
    magicQuote: "Ready for adventure!"
  });

  const [ghosts, setGhosts] = useState<Ghost[]>([
    { id: 'blinky', color: '#FF0000', position: { x: 9, y: 9 }, direction: 'LEFT', nextDirection: 'LEFT', speed: 1, state: GhostState.SCATTER, homePosition: { x: 17, y: 1 }, targetPosition: { x: 17, y: 1 } },
    { id: 'pinky', color: '#FFB8FF', position: { x: 9, y: 9 }, direction: 'UP', nextDirection: 'UP', speed: 1, state: GhostState.SCATTER, homePosition: { x: 1, y: 1 }, targetPosition: { x: 1, y: 1 } },
    { id: 'inky', color: '#00FFFF', position: { x: 8, y: 9 }, direction: 'RIGHT', nextDirection: 'RIGHT', speed: 1, state: GhostState.SCATTER, homePosition: { x: 17, y: 19 }, targetPosition: { x: 17, y: 19 } },
    { id: 'clyde', color: '#FFB852', position: { x: 10, y: 9 }, direction: 'LEFT', nextDirection: 'LEFT', speed: 1, state: GhostState.SCATTER, homePosition: { x: 1, y: 19 }, targetPosition: { x: 1, y: 19 } },
  ]);

  const gameLoopRef = useRef<number>(0);
  const lastUpdateRef = useRef<number>(0);
  const collisionHandledRef = useRef<boolean>(false);

  // Helper: check if a position is valid (not a wall)
  const isValidMove = useCallback((pos: Position) => {
    const x = Math.floor(pos.x);
    const y = Math.floor(pos.y);
    if (x < 0 || x >= MAZE_WIDTH || y < 0 || y >= MAZE_HEIGHT) return false;
    return maze[y][x] !== CellType.WALL;
  }, [maze]);

  const getNextPosition = (pos: Position, dir: Direction): Position => {
    switch (dir) {
      case 'UP': return { x: pos.x, y: pos.y - 1 };
      case 'DOWN': return { x: pos.x, y: pos.y + 1 };
      case 'LEFT': {
        const nextX = pos.x - 1;
        return { x: nextX < 0 ? MAZE_WIDTH - 1 : nextX, y: pos.y };
      }
      case 'RIGHT': {
        const nextX = pos.x + 1;
        return { x: nextX >= MAZE_WIDTH ? 0 : nextX, y: pos.y };
      }
      default: return pos;
    }
  };

  const handleLevelUp = useCallback(async () => {
    const newQuote = await fetchFriendshipQuote();
    setGameState(prev => ({
      ...prev,
      level: prev.level + 1,
      magicQuote: newQuote,
      isPaused: true
    }));
    setMaze(INITIAL_MAZE.map(row => [...row]));
    setPlayer({ x: 9, y: 15 });
    setDirection('NONE');
    setGhosts(prev => prev.map(g => ({ ...g, position: { x: 9, y: 9 } })));
  }, []);

  const movePlayer = useCallback(() => {
    if (gameState.isPaused || gameState.isGameOver) return;

    const potentialNextPos = getNextPosition(player, nextDirection);
    let finalDir = direction;
    let finalPos = player;

    if (nextDirection !== 'NONE' && isValidMove(potentialNextPos)) {
      finalDir = nextDirection;
      finalPos = potentialNextPos;
    } else {
      const standardNextPos = getNextPosition(player, direction);
      if (isValidMove(standardNextPos)) {
        finalPos = standardNextPos;
      } else {
        finalDir = 'NONE';
      }
    }

    setDirection(finalDir);
    setPlayer(finalPos);

    // Collect pellets
    const cell = maze[finalPos.y][finalPos.x];
    if (cell === CellType.PELLET || cell === CellType.POWER_PELLET) {
      const newMaze = [...maze];
      newMaze[finalPos.y][finalPos.x] = CellType.EMPTY;
      setMaze(newMaze);

      const points = cell === CellType.PELLET ? 10 : 50;
      setGameState(prev => ({
        ...prev,
        score: prev.score + points,
        isFrightened: cell === CellType.POWER_PELLET ? true : prev.isFrightened,
        frightenedTimer: cell === CellType.POWER_PELLET ? Date.now() + FRIGHTENED_DURATION : prev.frightenedTimer
      }));

      if (cell === CellType.POWER_PELLET) {
        setGhosts(prev => prev.map(g => ({ ...g, state: GhostState.FRIGHTENED })));
      }

      const remaining = newMaze.flat().filter(c => c === CellType.PELLET || c === CellType.POWER_PELLET).length;
      if (remaining === 0) handleLevelUp();
    }
  }, [player, direction, nextDirection, maze, isValidMove, gameState.isPaused, gameState.isGameOver, handleLevelUp]);

  const moveGhosts = useCallback(() => {
    if (gameState.isPaused || gameState.isGameOver) return;

    setGhosts(prevGhosts => prevGhosts.map(ghost => {
      const directions: Direction[] = ['UP', 'DOWN', 'LEFT', 'RIGHT'];
      const opposite: Record<Direction, Direction> = {
        'UP': 'DOWN', 'DOWN': 'UP', 'LEFT': 'RIGHT', 'RIGHT': 'LEFT', 'NONE': 'NONE'
      };

      const possibleDirs = directions.filter(d => {
        const next = getNextPosition(ghost.position, d);
        return isValidMove(next) && d !== opposite[ghost.direction];
      });

      let nextDir = ghost.direction;
      if (possibleDirs.length > 0) {
        if (ghost.state === GhostState.FRIGHTENED) {
          nextDir = possibleDirs[Math.floor(Math.random() * possibleDirs.length)];
        } else {
          possibleDirs.sort((a, b) => {
            const posA = getNextPosition(ghost.position, a);
            const posB = getNextPosition(ghost.position, b);
            const distA = Math.sqrt(Math.pow(posA.x - player.x, 2) + Math.pow(posA.y - player.y, 2));
            const distB = Math.sqrt(Math.pow(posB.x - player.x, 2) + Math.pow(posB.y - player.y, 2));
            return distA - distB;
          });
          nextDir = possibleDirs[0];
        }
      } else {
        nextDir = opposite[ghost.direction] || 'LEFT';
      }

      return {
        ...ghost,
        direction: nextDir,
        position: getNextPosition(ghost.position, nextDir)
      };
    }));
  }, [gameState.isPaused, gameState.isGameOver, player, isValidMove]);

  const checkCollisions = useCallback(() => {
    if (gameState.isPaused || gameState.isGameOver || collisionHandledRef.current) return;

    for (const ghost of ghosts) {
      if (ghost.position.x === player.x && ghost.position.y === player.y) {
        if (gameState.isFrightened) {
          setGameState(prev => ({ ...prev, score: prev.score + 200 }));
          setGhosts(prev => prev.map(g => g.id === ghost.id ? { ...g, position: { x: 9, y: 9 }, state: GhostState.CHASE } : g));
        } else {
          collisionHandledRef.current = true;
          setGameState(prev => {
            const nextLives = Math.max(0, prev.lives - 1);
            return {
              ...prev,
              lives: nextLives,
              isGameOver: nextLives <= 0,
              isPaused: true
            };
          });
          setPlayer({ x: 9, y: 15 });
          setDirection('NONE');
          setGhosts(prev => prev.map(g => ({ ...g, position: { x: 9, y: 9 } })));
          
          setTimeout(() => {
            collisionHandledRef.current = false;
          }, 500);
          break;
        }
      }
    }
  }, [ghosts, player, gameState.isFrightened, gameState.isPaused, gameState.isGameOver]);

  useEffect(() => {
    const loop = (time: number) => {
      if (time - lastUpdateRef.current > 180) { // Slight speed increase for better feel
        movePlayer();
        moveGhosts();
        checkCollisions();
        lastUpdateRef.current = time;
      }

      if (gameState.isFrightened && Date.now() > gameState.frightenedTimer) {
        setGameState(prev => ({ ...prev, isFrightened: false }));
        setGhosts(prev => prev.map(g => ({ ...g, state: GhostState.CHASE })));
      }

      gameLoopRef.current = requestAnimationFrame(loop);
    };

    gameLoopRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(gameLoopRef.current!);
  }, [movePlayer, moveGhosts, checkCollisions, gameState.isFrightened, gameState.frightenedTimer]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (gameState.isGameOver) return;
      
      switch (e.key) {
        case 'ArrowUp': case 'w': setNextDirection('UP'); setGameState(s => ({ ...s, isPaused: false })); break;
        case 'ArrowDown': case 's': setNextDirection('DOWN'); setGameState(s => ({ ...s, isPaused: false })); break;
        case 'ArrowLeft': case 'a': setNextDirection('LEFT'); setGameState(s => ({ ...s, isPaused: false })); break;
        case 'ArrowRight': case 'd': setNextDirection('RIGHT'); setGameState(s => ({ ...s, isPaused: false })); break;
        case ' ': setGameState(prev => ({ ...prev, isPaused: !prev.isPaused })); break;
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [gameState.isGameOver]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[#0f0c29] p-4 text-white">
      <div className="w-full max-w-lg mb-4 flex justify-between items-end">
        <div className="flex flex-col">
          <span className="text-pink-400 text-xs retro-font uppercase mb-1">Score</span>
          <span className="text-2xl font-bold retro-font tracking-wider">{gameState.score.toString().padStart(6, '0')}</span>
        </div>
        <div className="flex flex-col items-center">
          <span className="text-purple-400 text-xs retro-font uppercase mb-1">Level</span>
          <span className="text-xl font-bold retro-font">{gameState.level}</span>
        </div>
        <div className="flex flex-col items-end">
          <span className="text-cyan-400 text-xs retro-font uppercase mb-1">Lives</span>
          <div className="flex gap-2">
            {/* Safe rendering of lives array */}
            {[...Array(Math.max(0, gameState.lives))].map((_, i) => (
              <div key={i} className="w-6 h-6">
                <TwilightIcon direction="NONE" size={24} />
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="relative p-4 rounded-xl bg-[#1a1a2e] border-4 border-indigo-500 shadow-[0_0_20px_rgba(75,0,130,0.5)]">
        <div className="absolute -top-12 left-0 right-0 flex justify-center pointer-events-none">
          <div className="bg-white text-indigo-900 px-4 py-2 rounded-full text-sm font-bold shadow-lg animate-bounce max-w-[90%] text-center border-2 border-pink-400">
            "{gameState.magicQuote}"
          </div>
        </div>

        <div 
          className="grid gap-0" 
          style={{ 
            gridTemplateColumns: `repeat(${MAZE_WIDTH}, ${TILE_SIZE}px)`,
            gridTemplateRows: `repeat(${MAZE_HEIGHT}, ${TILE_SIZE}px)`
          }}
        >
          {maze.map((row, y) => row.map((cell, x) => (
            <div 
              key={`${x}-${y}`} 
              className="relative flex items-center justify-center"
              style={{ width: TILE_SIZE, height: TILE_SIZE }}
            >
              {cell === CellType.WALL && (
                <div className="w-full h-full bg-indigo-900 border border-indigo-700 rounded-sm" />
              )}
              {cell === CellType.PELLET && (
                <div className="w-1.5 h-1.5 bg-yellow-400 rounded-full shadow-[0_0_5px_#facc15]" />
              )}
              {cell === CellType.POWER_PELLET && (
                <div className="w-4 h-4 bg-white rounded-full animate-pulse shadow-[0_0_10px_#fff]" />
              )}
              {cell === CellType.GHOST_HOUSE && (
                <div className="w-full h-full border-t-2 border-pink-400 opacity-50" />
              )}

              {player.x === x && player.y === y && (
                <div className="absolute z-20">
                  <TwilightIcon direction={direction} size={TILE_SIZE * 1.5} />
                </div>
              )}

              {ghosts.map(ghost => ghost.position.x === x && ghost.position.y === y && (
                <div key={ghost.id} className="absolute z-10">
                  <GhostIcon 
                    color={ghost.color} 
                    state={gameState.isFrightened ? 'FRIGHTENED' : 'CHASE'} 
                    size={TILE_SIZE * 1.4} 
                  />
                </div>
              ))}
            </div>
          )))}
        </div>

        {(gameState.isPaused || gameState.isGameOver) && (
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center rounded-lg z-50">
            <div className="text-center p-8">
              {gameState.isGameOver ? (
                <>
                  <h2 className="text-4xl font-bold text-red-500 mb-4 retro-font">GAME OVER</h2>
                  <p className="text-lg mb-6">Friendship needs to be recharged...</p>
                  <button 
                    onClick={() => window.location.reload()}
                    className="px-8 py-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-full font-bold retro-font text-sm transition-all shadow-[0_5px_0_rgb(67,56,202)] active:translate-y-1 active:shadow-none"
                  >
                    TRY AGAIN
                  </button>
                </>
              ) : (
                <>
                  <h2 className="text-3xl font-bold text-pink-400 mb-4 retro-font">PAUSED</h2>
                  <p className="mb-6 opacity-75">Press Arrow Keys or WASD to Move!</p>
                  <div className="flex flex-col gap-4 items-center">
                    <div className="flex gap-2">
                       <div className="w-10 h-10 border-2 border-white/20 rounded flex items-center justify-center">W</div>
                    </div>
                    <div className="flex gap-2">
                       <div className="w-10 h-10 border-2 border-white/20 rounded flex items-center justify-center">A</div>
                       <div className="w-10 h-10 border-2 border-white/20 rounded flex items-center justify-center">S</div>
                       <div className="w-10 h-10 border-2 border-white/20 rounded flex items-center justify-center">D</div>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </div>

      <div className="mt-8 flex flex-col items-center gap-2">
        <p className="text-sm text-purple-300 opacity-70">Every level brings more magic!</p>
        <div className="flex gap-4">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
            <span className="text-xs uppercase retro-font">Crystal</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-white rounded-full"></div>
            <span className="text-xs uppercase retro-font">Magic Star</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;
