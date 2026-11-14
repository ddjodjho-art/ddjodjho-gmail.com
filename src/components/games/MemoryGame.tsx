import { useEffect, useState } from "react";
import type { GameOutcome } from "../../types/mifa";
import { sfx } from "../../utils/sound";

interface MemoryGameProps {
  onFinish: (outcome: GameOutcome) => void;
}

interface CardItem {
  uid: number;
  pairId: string;
  label: string;
  color: string;
  flipped: boolean;
  matched: boolean;
}

const SYMBOLS = [
  { pairId: "soleil", label: "Soleil", color: "#D97706" },
  { pairId: "fleuve", label: "Fleuve", color: "#0D5C3E" },
  { pairId: "tamtam", label: "Tam-Tam", color: "#B45309" },
  { pairId: "etoile", label: "Étoile", color: "#EAB308" },
  { pairId: "ballon", label: "Ballon", color: "#14171A" },
  { pairId: "kuba", label: "Kuba", color: "#7C3AED" },
  { pairId: "guitare", label: "Rumba", color: "#DC2626" },
  { pairId: "palme", label: "Palme", color: "#15803D" },
];

function SymbolMark({ pairId, color }: { pairId: string; color: string }) {
  switch (pairId) {
    case "soleil":
      return (
        <svg viewBox="0 0 32 32" className="w-8 h-8" fill="none" stroke={color} strokeWidth="2.4">
          <circle cx="16" cy="16" r="6" fill={color} fillOpacity="0.2" />
          <path d="M16 3v4M16 25v4M3 16h4M25 16h4M6.8 6.8l2.8 2.8M22.4 22.4l2.8 2.8M25.2 6.8l-2.8 2.8M9.6 22.4l-2.8 2.8" />
        </svg>
      );
    case "fleuve":
      return (
        <svg viewBox="0 0 32 32" className="w-8 h-8" fill="none" stroke={color} strokeWidth="2.5">
          <path d="M4 11c4-4 8 4 12 0s8 4 12 0" />
          <path d="M4 17c4-4 8 4 12 0s8 4 12 0" />
          <path d="M4 23c4-4 8 4 12 0s8 4 12 0" />
        </svg>
      );
    case "tamtam":
      return (
        <svg viewBox="0 0 32 32" className="w-8 h-8" fill="none" stroke={color} strokeWidth="2.3">
          <ellipse cx="16" cy="8" rx="8" ry="3.5" fill={color} fillOpacity="0.18" />
          <path d="M8 8l2 16c0 2 3 3.5 6 3.5s6-1.5 6-3.5l2-16" />
          <path d="M10 14l12 4M22 14l-12 4" />
        </svg>
      );
    case "etoile":
      return (
        <svg viewBox="0 0 32 32" className="w-8 h-8" fill={color} fillOpacity="0.2" stroke={color} strokeWidth="2.2">
          <polygon points="16,4 19.6,11.6 28,12.8 21.8,18.7 23.4,27 16,23 8.6,27 10.2,18.7 4,12.8 12.4,11.6" />
        </svg>
      );
    case "ballon":
      return (
        <svg viewBox="0 0 32 32" className="w-8 h-8" fill="none" stroke={color} strokeWidth="2.3">
          <circle cx="16" cy="16" r="11" />
          <polygon points="16,10 21,14 19,20 13,20 11,14" fill={color} fillOpacity="0.2" />
        </svg>
      );
    case "kuba":
      return (
        <svg viewBox="0 0 32 32" className="w-8 h-8" fill="none" stroke={color} strokeWidth="2.3">
          <polygon points="16,4 28,16 16,28 4,16" fill={color} fillOpacity="0.14" />
          <polygon points="16,10 22,16 16,22 10,16" />
        </svg>
      );
    case "guitare":
      return (
        <svg viewBox="0 0 32 32" className="w-8 h-8" fill="none" stroke={color} strokeWidth="2.3">
          <circle cx="13" cy="20" r="6" fill={color} fillOpacity="0.16" />
          <path d="M17.5 15.5L26 7M23 6l3 3" />
          <circle cx="13" cy="20" r="2" fill={color} />
        </svg>
      );
    default:
      return (
        <svg viewBox="0 0 32 32" className="w-8 h-8" fill="none" stroke={color} strokeWidth="2.3">
          <path d="M16 26V12" />
          <path d="M16 12C12 7 6 8 5 12c4 0 8 1 11 0z" fill={color} fillOpacity="0.2" />
          <path d="M16 12c4-5 10-4 11 0-4 0-8 1-11 0z" fill={color} fillOpacity="0.2" />
          <path d="M16 11c-2-5 2-7 0-7" />
        </svg>
      );
  }
}

export function MemoryGame({ onFinish }: MemoryGameProps) {
  const [phase, setPhase] = useState<"TITLE" | "PLAYING">("TITLE");
  const [cards, setCards] = useState<CardItem[]>([]);
  const [openIndices, setOpenIndices] = useState<number[]>([]);
  const [moves, setMoves] = useState(0);
  const [matches, setMatches] = useState(0);
  const [locked, setLocked] = useState(false);

  const startMemory = () => {
    sfx.tap();
    const deck: CardItem[] = [...SYMBOLS, ...SYMBOLS]
      .sort(() => Math.random() - 0.5)
      .map((item, idx) => ({
        uid: idx,
        pairId: item.pairId,
        label: item.label,
        color: item.color,
        flipped: false,
        matched: false,
      }));
    setCards(deck);
    setOpenIndices([]);
    setMoves(0);
    setMatches(0);
    setLocked(false);
    setPhase("PLAYING");
  };

  const handleCardClick = (idx: number) => {
    if (locked || cards[idx].flipped || cards[idx].matched) return;
    sfx.flip();

    const updated = cards.map((c, i) => (i === idx ? { ...c, flipped: true } : c));
    const nextOpen = [...openIndices, idx];
    setCards(updated);
    setOpenIndices(nextOpen);

    if (nextOpen.length === 2) {
      setLocked(true);
      const nextMoves = moves + 1;
      setMoves(nextMoves);
      const [firstIdx, secondIdx] = nextOpen;
      const isMatch = updated[firstIdx].pairId === updated[secondIdx].pairId;

      if (isMatch) {
        window.setTimeout(() => {
          sfx.success();
          setCards((prev) =>
            prev.map((c, i) =>
              i === firstIdx || i === secondIdx ? { ...c, matched: true } : c,
            ),
          );
          const nextMatches = matches + 1;
          setMatches(nextMatches);
          setOpenIndices([]);
          setLocked(false);

          if (nextMatches === SYMBOLS.length) {
            const finalScore = Math.max(250, 950 - nextMoves * 20);
            window.setTimeout(() => {
              onFinish({
                gameId: "memory",
                score: finalScore,
                won: true,
                summary: `8 paires trouvées en ${nextMoves} coups`,
                meta: { moves: nextMoves },
              });
            }, 350);
          }
        }, 280);
      } else {
        window.setTimeout(() => {
          setCards((prev) =>
            prev.map((c, i) =>
              i === firstIdx || i === secondIdx ? { ...c, flipped: false } : c,
            ),
          );
          setOpenIndices([]);
          setLocked(false);
        }, 650);
      }
    }
  };

  useEffect(() => {
    return () => {
      // Cleanup safety
    };
  }, []);

  if (phase === "TITLE") {
    return (
      <div className="flex flex-col items-center justify-center text-center py-6 px-4 max-w-lg mx-auto">
        <span className="text-xs font-semibold uppercase tracking-wider text-[#0D5C3E] mb-2">
          Attention &amp; Mémoire
        </span>
        <h3 className="text-2xl sm:text-3xl font-bold text-[#14171A] mb-3">
          Mémoire Kuba
        </h3>
        <p className="text-sm sm:text-base text-[#525860] leading-relaxed mb-6">
          Retrouvez les 8 paires de symboles kinois en un minimum de coups. Moins de 22 coups
          débloque le badge « Mémoire Kuba ».
        </p>
        <button
          type="button"
          onClick={startMemory}
          className="w-full sm:w-auto min-h-[48px] px-8 py-3 rounded-xl bg-[#0D5C3E] hover:bg-[#094730] text-white font-semibold text-base transition-colors cursor-pointer"
        >
          Mélanger les cartes
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto flex flex-col gap-4">
      <div className="flex items-center justify-between text-sm border-b border-black/8 pb-2.5">
        <div className="font-mono tabular-nums font-semibold text-[#14171A]">
          Paires : {matches}/{SYMBOLS.length}
        </div>
        <div className="font-mono tabular-nums font-bold text-[#0D5C3E]">{moves} coups</div>
      </div>

      <div className="grid grid-cols-4 gap-2.5 sm:gap-3">
        {cards.map((card, idx) => {
          const revealed = card.flipped || card.matched;
          return (
            <button
              key={card.uid}
              type="button"
              onClick={() => handleCardClick(idx)}
              aria-label={revealed ? card.label : "Carte cachée"}
              className="aspect-square min-h-[64px] perspective-1000 cursor-pointer focus-visible:outline-2 focus-visible:outline-[#D97706]"
            >
              <div
                className={`relative w-full h-full transition-transform duration-300 preserve-3d ${
                  revealed ? "rotate-y-180" : ""
                }`}
              >
                {/* Card Back */}
                <div className="absolute inset-0 backface-hidden rounded-xl bg-[#14171A] border border-black/15 flex items-center justify-center kuba-strip">
                  <div className="w-5 h-5 rotate-45 border-2 border-[#D97706]/80" />
                </div>

                {/* Card Front */}
                <div
                  className={`absolute inset-0 backface-hidden rotate-y-180 rounded-xl border flex flex-col items-center justify-center gap-1 p-1 ${
                    card.matched
                      ? "bg-[#0D5C3E]/10 border-[#0D5C3E]"
                      : "bg-white border-black/15"
                  }`}
                >
                  <SymbolMark pairId={card.pairId} color={card.color} />
                  <span className="text-[10px] sm:text-xs font-semibold text-[#14171A] truncate max-w-full">
                    {card.label}
                  </span>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
