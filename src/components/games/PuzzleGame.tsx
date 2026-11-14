import { useEffect, useState } from "react";
import { RotateCcw } from "lucide-react";
import type { GameOutcome } from "../../types/mifa";
import { sfx } from "../../utils/sound";

interface PuzzleGameProps {
  onFinish: (outcome: GameOutcome) => void;
}

function isSolved(board: number[]): boolean {
  for (let i = 0; i < board.length - 1; i++) {
    if (board[i] !== i + 1) return false;
  }
  return board[board.length - 1] === 0;
}

function createShuffledBoard(size: number): number[] {
  const total = size * size;
  const board = Array.from({ length: total }, (_, i) => (i + 1) % total);
  let emptyIdx = total - 1;
  let lastIdx = -1;

  // Perform valid random sliding moves so the puzzle is 100% solvable
  const steps = size === 3 ? 45 : 90;
  for (let s = 0; s < steps; s++) {
    const r = Math.floor(emptyIdx / size);
    const c = emptyIdx % size;
    const neighbors: number[] = [];
    if (r > 0) neighbors.push(emptyIdx - size);
    if (r < size - 1) neighbors.push(emptyIdx + size);
    if (c > 0) neighbors.push(emptyIdx - 1);
    if (c < size - 1) neighbors.push(emptyIdx + 1);
    const filtered = neighbors.filter((n) => n !== lastIdx);
    const pick = filtered[Math.floor(Math.random() * filtered.length)] ?? neighbors[0];
    board[emptyIdx] = board[pick];
    board[pick] = 0;
    lastIdx = emptyIdx;
    emptyIdx = pick;
  }

  if (isSolved(board)) return createShuffledBoard(size);
  return board;
}

export function PuzzleGame({ onFinish }: PuzzleGameProps) {
  const [phase, setPhase] = useState<"TITLE" | "PLAYING">("TITLE");
  const [gridSize, setGridSize] = useState<3 | 4>(3);
  const [board, setBoard] = useState<number[]>([]);
  const [moves, setMoves] = useState(0);
  const [seconds, setSeconds] = useState(0);

  const startPuzzle = (size: 3 | 4) => {
    sfx.tap();
    setGridSize(size);
    setBoard(createShuffledBoard(size));
    setMoves(0);
    setSeconds(0);
    setPhase("PLAYING");
  };

  useEffect(() => {
    if (phase !== "PLAYING") return;
    const interval = window.setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => window.clearInterval(interval);
  }, [phase]);

  const slideTile = (idx: number) => {
    const emptyIdx = board.indexOf(0);
    const r1 = Math.floor(idx / gridSize);
    const c1 = idx % gridSize;
    const r2 = Math.floor(emptyIdx / gridSize);
    const c2 = emptyIdx % gridSize;

    const isAdjacent = Math.abs(r1 - r2) + Math.abs(c1 - c2) === 1;
    if (!isAdjacent) return;

    sfx.tap();
    const nextBoard = [...board];
    nextBoard[emptyIdx] = nextBoard[idx];
    nextBoard[idx] = 0;
    const nextMoves = moves + 1;
    setBoard(nextBoard);
    setMoves(nextMoves);

    if (isSolved(nextBoard)) {
      sfx.win();
      const base = gridSize === 4 ? 1050 : 680;
      const finalScore = Math.max(250, base - nextMoves * 6 - seconds * 2);
      window.setTimeout(() => {
        onFinish({
          gameId: "puzzle",
          score: finalScore,
          won: true,
          summary: `Grille ${gridSize}×${gridSize} résolue en ${nextMoves} mouvements`,
          meta: { moves: nextMoves },
        });
      }, 320);
    }
  };

  if (phase === "TITLE") {
    return (
      <div className="flex flex-col items-center justify-center text-center py-6 px-4 max-w-lg mx-auto">
        <span className="text-xs font-semibold uppercase tracking-wider text-[#0D5C3E] mb-2">
          Logique &amp; Stratégie
        </span>
        <h3 className="text-2xl sm:text-3xl font-bold text-[#14171A] mb-3">
          Défi Logique Limete
        </h3>
        <p className="text-sm sm:text-base text-[#525860] leading-relaxed mb-6">
          Remettez les tuiles numérotées en ordre croissant en les faisant glisser vers la case
          vide. Choisissez votre format de grille.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full">
          <button
            type="button"
            onClick={() => startPuzzle(3)}
            className="min-h-[54px] px-5 py-3 rounded-xl bg-[#0D5C3E] hover:bg-[#094730] text-white font-semibold text-sm sm:text-base transition-colors cursor-pointer"
          >
            Grille Rapide 3×3
          </button>
          <button
            type="button"
            onClick={() => startPuzzle(4)}
            className="min-h-[54px] px-5 py-3 rounded-xl bg-[#14171A] hover:bg-black text-white font-semibold text-sm sm:text-base transition-colors cursor-pointer"
          >
            Grille Maître 4×4
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-sm mx-auto flex flex-col gap-4">
      <div className="flex items-center justify-between text-sm border-b border-black/8 pb-2.5">
        <div className="font-mono tabular-nums font-semibold text-[#14171A]">
          {moves} coups · {seconds}s
        </div>
        <button
          type="button"
          onClick={() => startPuzzle(gridSize)}
          className="min-h-[40px] px-3 py-1.5 rounded-lg border border-black/12 text-xs font-semibold text-[#14171A] hover:bg-black/5 flex items-center gap-1.5 cursor-pointer"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Recommencer</span>
        </button>
      </div>

      <div
        className="grid gap-2.5 bg-[#E7E9E3] p-3 rounded-2xl border border-black/10"
        style={{ gridTemplateColumns: `repeat(${gridSize}, minmax(0, 1fr))` }}
      >
        {board.map((val, idx) => {
          if (val === 0) {
            return (
              <div
                key={`empty-${idx}`}
                className="aspect-square rounded-xl bg-black/6 border border-dashed border-black/15"
              />
            );
          }
          const inCorrectSpot = val === idx + 1;
          return (
            <button
              key={val}
              type="button"
              onClick={() => slideTile(idx)}
              className={`aspect-square min-h-[60px] rounded-xl font-mono tabular-nums text-xl sm:text-2xl font-bold transition-transform active:scale-95 cursor-pointer border ${
                inCorrectSpot
                  ? "bg-[#0D5C3E] text-white border-[#094730]"
                  : "bg-white text-[#14171A] border-black/12 hover:border-[#D97706]"
              }`}
            >
              {val}
            </button>
          );
        })}
      </div>

      <p className="text-center text-xs text-[#525860]">
        Ordre cible : 1 à {gridSize * gridSize - 1} puis case vide en bas à droite.
      </p>
    </div>
  );
}
