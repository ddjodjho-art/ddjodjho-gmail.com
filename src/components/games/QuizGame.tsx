import { useEffect, useMemo, useState } from "react";
import { CheckCircle2, Clock, Sparkles, XCircle } from "lucide-react";
import { QUIZ_QUESTIONS, type QuizQuestion } from "../../data/quizQuestions";
import type { GameOutcome, PlayerProfile } from "../../types/mifa";
import { sfx } from "../../utils/sound";

interface QuizGameProps {
  profile: PlayerProfile;
  onFinish: (outcome: GameOutcome) => void;
}

const QUESTIONS_PER_ROUND = 8;
const SECONDS_PER_QUESTION = 15;

export function QuizGame({ profile, onFinish }: QuizGameProps) {
  const [phase, setPhase] = useState<"TITLE" | "PLAYING">("TITLE");
  const [deck, setDeck] = useState<QuizQuestion[]>([]);
  const [index, setIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState(SECONDS_PER_QUESTION);
  const [selected, setSelected] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [streak, setStreak] = useState(0);
  const [eliminated, setEliminated] = useState<number[]>([]);
  const [used5050InGame, setUsed5050InGame] = useState(false);

  const current = deck[index];

  const startRound = () => {
    sfx.tap();
    const shuffled = [...QUIZ_QUESTIONS].sort(() => Math.random() - 0.5).slice(0, QUESTIONS_PER_ROUND);
    setDeck(shuffled);
    setIndex(0);
    setTimeLeft(SECONDS_PER_QUESTION);
    setSelected(null);
    setScore(0);
    setCorrectCount(0);
    setStreak(0);
    setEliminated([]);
    setUsed5050InGame(false);
    setPhase("PLAYING");
  };

  useEffect(() => {
    if (phase !== "PLAYING" || selected !== null) return;
    if (timeLeft <= 0) {
      sfx.error();
      setSelected(-1);
      setStreak(0);
      return;
    }
    const timer = window.setTimeout(() => setTimeLeft((t) => t - 1), 1000);
    return () => window.clearTimeout(timer);
  }, [phase, selected, timeLeft]);

  const canUse5050 = useMemo(() => {
    return (
      phase === "PLAYING" &&
      selected === null &&
      eliminated.length === 0 &&
      !used5050InGame &&
      profile.boosters.quiz5050 > 0
    );
  }, [phase, selected, eliminated.length, used5050InGame, profile.boosters.quiz5050]);

  const handle5050 = () => {
    if (!current || !canUse5050) return;
    sfx.tap();
    const wrongIndices = [0, 1, 2, 3].filter((i) => i !== current.correctIndex);
    const picked = wrongIndices.sort(() => Math.random() - 0.5).slice(0, 2);
    setEliminated(picked);
    setUsed5050InGame(true);
  };

  const handleAnswer = (optIdx: number) => {
    if (!current || selected !== null || eliminated.includes(optIdx)) return;
    setSelected(optIdx);
    if (optIdx === current.correctIndex) {
      sfx.success();
      const nextStreak = streak + 1;
      const gained = 75 + timeLeft * 5 + (nextStreak > 1 ? nextStreak * 15 : 0);
      setScore((s) => s + gained);
      setCorrectCount((c) => c + 1);
      setStreak(nextStreak);
    } else {
      sfx.error();
      setStreak(0);
    }
  };

  const handleNext = () => {
    sfx.tap();
    if (index + 1 >= deck.length) {
      const accuracy = Math.round((correctCount / deck.length) * 100);
      onFinish({
        gameId: "quiz",
        score,
        won: accuracy >= 60,
        summary: `${correctCount}/${deck.length} bonnes réponses (${accuracy}%)`,
        meta: { accuracy, usedQuiz5050: used5050InGame },
      });
      return;
    }
    setIndex((i) => i + 1);
    setSelected(null);
    setTimeLeft(SECONDS_PER_QUESTION);
    setEliminated([]);
  };

  if (phase === "TITLE") {
    return (
      <div className="flex flex-col items-center justify-center text-center py-6 px-4 max-w-lg mx-auto">
        <span className="text-xs font-semibold uppercase tracking-wider text-[#0D5C3E] mb-2">
          Culture Kinshasa &amp; RDC
        </span>
        <h3 className="text-2xl sm:text-3xl font-bold text-[#14171A] mb-3">
          Quiz Kin &amp; Culture RDC
        </h3>
        <p className="text-sm sm:text-base text-[#525860] leading-relaxed mb-6">
          8 questions chronométrées sur les communes de Kinshasa, la géographie congolaise, le
          sport et la culture urbaine. Plus vous répondez vite, plus votre score grimpe.
        </p>

        <div className="grid grid-cols-3 gap-3 w-full mb-7 text-left">
          <div className="bg-[#F6F7F4] border border-black/8 rounded-xl p-3">
            <div className="text-xs text-[#525860]">Questions</div>
            <div className="text-lg font-bold font-mono tabular-nums text-[#14171A]">8</div>
          </div>
          <div className="bg-[#F6F7F4] border border-black/8 rounded-xl p-3">
            <div className="text-xs text-[#525860]">Chrono</div>
            <div className="text-lg font-bold font-mono tabular-nums text-[#14171A]">15s</div>
          </div>
          <div className="bg-[#F6F7F4] border border-black/8 rounded-xl p-3">
            <div className="text-xs text-[#525860]">Indices 50/50</div>
            <div className="text-lg font-bold font-mono tabular-nums text-[#0D5C3E]">
              {profile.boosters.quiz5050}
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={startRound}
          className="w-full sm:w-auto min-h-[48px] px-8 py-3 rounded-xl bg-[#0D5C3E] hover:bg-[#094730] text-white font-semibold text-base transition-colors cursor-pointer"
        >
          Commencer le Quiz
        </button>
      </div>
    );
  }

  if (!current) return null;

  return (
    <div className="max-w-xl mx-auto flex flex-col gap-4">
      <div className="flex items-center justify-between gap-4 border-b border-black/8 pb-3">
        <div className="text-xs font-medium text-[#525860] flex items-center gap-2">
          <span className="font-mono tabular-nums font-semibold text-[#14171A]">
            {index + 1}/{deck.length}
          </span>
          <span aria-hidden="true">·</span>
          <span>{current.category}</span>
          {streak >= 2 && (
            <>
              <span aria-hidden="true">·</span>
              <span className="text-[#D97706] font-semibold">Série ×{streak}</span>
            </>
          )}
        </div>
        <div className="flex items-center gap-4">
          <div
            className={`flex items-center gap-1.5 font-mono tabular-nums text-sm font-bold ${
              timeLeft <= 5 && selected === null ? "text-[#DC2626]" : "text-[#14171A]"
            }`}
          >
            <Clock className="w-4 h-4" />
            <span>{timeLeft}s</span>
          </div>
          <div className="font-mono tabular-nums text-sm font-bold text-[#0D5C3E]">
            {score} pts
          </div>
        </div>
      </div>

      {/* Progress timer bar */}
      <div className="w-full h-1.5 bg-black/8 rounded-full overflow-hidden">
        <div
          className="h-full bg-[#0D5C3E] transition-all duration-300"
          style={{ width: `${(timeLeft / SECONDS_PER_QUESTION) * 100}%` }}
        />
      </div>

      <h3 className="text-lg sm:text-xl font-bold text-[#14171A] leading-snug pt-1">
        {current.question}
      </h3>

      <div className="grid grid-cols-1 gap-2.5">
        {current.options.map((opt, idx) => {
          const isEliminated = eliminated.includes(idx);
          const isCorrect = idx === current.correctIndex;
          const isPicked = idx === selected;

          let btnStyle =
            "bg-white border-black/12 text-[#14171A] hover:border-[#0D5C3E] hover:bg-[#0D5C3E]/4";

          if (isEliminated) {
            btnStyle = "bg-black/5 border-black/5 text-[#8A9199] opacity-40 cursor-not-allowed";
          } else if (selected !== null) {
            if (isCorrect) {
              btnStyle = "bg-[#0D5C3E]/12 border-[#0D5C3E] text-[#094730] font-semibold";
            } else if (isPicked) {
              btnStyle = "bg-[#DC2626]/10 border-[#DC2626] text-[#991B1B]";
            } else {
              btnStyle = "bg-white border-black/8 text-[#6B7280] opacity-75";
            }
          }

          return (
            <button
              key={idx}
              type="button"
              disabled={selected !== null || isEliminated}
              onClick={() => handleAnswer(idx)}
              className={`min-h-[52px] w-full text-left px-4 py-3 rounded-xl border transition-all flex items-center justify-between gap-3 cursor-pointer ${btnStyle}`}
            >
              <span className="text-sm sm:text-base">{opt}</span>
              {selected !== null && isCorrect && (
                <CheckCircle2 className="w-5 h-5 text-[#0D5C3E] shrink-0" />
              )}
              {selected !== null && isPicked && !isCorrect && (
                <XCircle className="w-5 h-5 text-[#DC2626] shrink-0" />
              )}
            </button>
          );
        })}
      </div>

      {selected === null ? (
        <div className="flex items-center justify-between pt-2">
          <button
            type="button"
            disabled={!canUse5050}
            onClick={handle5050}
            className={`min-h-[44px] px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold flex items-center gap-2 border transition-colors ${
              canUse5050
                ? "border-[#D97706] text-[#B45309] bg-[#D97706]/8 hover:bg-[#D97706]/15 cursor-pointer"
                : "border-black/10 text-[#8A9199] bg-black/4 cursor-not-allowed"
            }`}
          >
            <Sparkles className="w-4 h-4" />
            <span>Indice 50/50 ({profile.boosters.quiz5050})</span>
          </button>
          <span className="text-xs text-[#525860]">Touchez une réponse</span>
        </div>
      ) : (
        <div className="bg-[#F6F7F4] border border-black/8 rounded-xl p-4 flex flex-col gap-3">
          <div className="text-xs sm:text-sm text-[#14171A] leading-relaxed">
            <span className="font-semibold">
              {selected === current.correctIndex
                ? "Bien joué !"
                : selected === -1
                  ? "Temps écoulé."
                  : "Mauvaise réponse."}
            </span>{" "}
            {current.factoid}
          </div>
          <button
            type="button"
            onClick={handleNext}
            className="w-full min-h-[46px] rounded-xl bg-[#14171A] hover:bg-black text-white font-semibold text-sm cursor-pointer transition-colors"
          >
            {index + 1 >= deck.length ? "Voir mon score" : "Question suivante"}
          </button>
        </div>
      )}
    </div>
  );
}
