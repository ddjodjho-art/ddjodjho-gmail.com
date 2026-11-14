import { useState } from "react";
import { Award, RotateCcw, Volume2, VolumeX, X } from "lucide-react";
import type {
  GameId,
  GameOutcome,
  PlayerProfile,
  ScoreResultPayload,
  SponsorCampaign,
} from "../types/mifa";
import { sfx } from "../utils/sound";
import { FootballGame } from "./games/FootballGame";
import { MemoryGame } from "./games/MemoryGame";
import { PuzzleGame } from "./games/PuzzleGame";
import { QuizGame } from "./games/QuizGame";
import { RacingGame } from "./games/RacingGame";

interface GameModalProps {
  gameId: GameId;
  gameTitle: string;
  profile: PlayerProfile;
  interGameSponsor?: SponsorCampaign;
  onSubmitOutcome: (outcome: GameOutcome) => Promise<ScoreResultPayload>;
  onClose: () => void;
}

export function GameModal({
  gameId,
  gameTitle,
  profile,
  interGameSponsor,
  onSubmitOutcome,
  onClose,
}: GameModalProps) {
  const [muted, setMuted] = useState(sfx.muted);
  const [sessionKey, setSessionKey] = useState(0);
  const [summary, setSummary] = useState<{
    outcome: GameOutcome;
    result: ScoreResultPayload;
  } | null>(null);
  const [saving, setSaving] = useState(false);

  const toggleMute = () => {
    sfx.muted = !sfx.muted;
    setMuted(sfx.muted);
  };

  const handleFinish = async (outcome: GameOutcome) => {
    setSaving(true);
    try {
      const result = await onSubmitOutcome(outcome);
      if (outcome.won) sfx.win();
      setSummary({ outcome, result });
    } finally {
      setSaving(false);
    }
  };

  const handleReplay = () => {
    sfx.tap();
    setSummary(null);
    setSessionKey((k) => k + 1);
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-label={gameTitle}
    >
      <div className="w-full sm:max-w-2xl bg-white rounded-t-3xl sm:rounded-3xl border border-black/10 max-h-[94dvh] flex flex-col overflow-hidden">
        {/* Compact Arena Header */}
        <div className="flex items-center justify-between gap-4 px-4 sm:px-6 h-14 border-b border-black/8 shrink-0">
          <h2 className="text-base sm:text-lg font-bold text-[#14171A] truncate">
            {gameTitle}
          </h2>
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={toggleMute}
              aria-label={muted ? "Activer le son" : "Couper le son"}
              className="min-h-[40px] min-w-[40px] rounded-xl border border-black/10 flex items-center justify-center text-[#525860] hover:text-[#14171A] cursor-pointer"
            >
              {muted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            </button>
            <button
              type="button"
              onClick={onClose}
              aria-label="Quitter le jeu"
              className="min-h-[40px] min-w-[40px] rounded-xl border border-black/10 flex items-center justify-center text-[#525860] hover:text-[#14171A] cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Scrollable Game Body */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1">
          {saving ? (
            <div className="py-16 text-center text-sm text-[#525860]">
              Enregistrement de votre score à Kinshasa...
            </div>
          ) : summary ? (
            <div className="max-w-md mx-auto text-center py-2 flex flex-col gap-5">
              <div>
                <div className="text-xs font-semibold uppercase tracking-wider text-[#0D5C3E] mb-1">
                  {summary.outcome.won ? "Victoire" : "Partie terminée"}
                </div>
                <h3 className="text-2xl sm:text-3xl font-bold font-mono tabular-nums text-[#14171A]">
                  {summary.outcome.score} pts
                </h3>
                <p className="text-sm text-[#525860] mt-1">{summary.outcome.summary}</p>
              </div>

              <div className="grid grid-cols-3 gap-2.5 text-left">
                <div className="bg-[#F6F7F4] border border-black/8 rounded-xl p-3">
                  <div className="text-xs text-[#525860]">Points</div>
                  <div className="text-base font-bold font-mono tabular-nums text-[#14171A]">
                    +{summary.result.earnedPoints}
                  </div>
                </div>
                <div className="bg-[#F6F7F4] border border-black/8 rounded-xl p-3">
                  <div className="text-xs text-[#525860]">Jetons</div>
                  <div className="text-base font-bold font-mono tabular-nums text-[#D97706]">
                    +{summary.result.earnedTokens}
                  </div>
                </div>
                <div className="bg-[#F6F7F4] border border-black/8 rounded-xl p-3">
                  <div className="text-xs text-[#525860]">XP</div>
                  <div className="text-base font-bold font-mono tabular-nums text-[#0D5C3E]">
                    +{summary.result.earnedXp}
                  </div>
                </div>
              </div>

              {summary.result.leveledUp && (
                <div className="bg-[#0D5C3E]/10 border border-[#0D5C3E]/30 rounded-xl p-3 text-sm font-semibold text-[#094730]">
                  Niveau supérieur atteint : Niveau {summary.result.profile.level} ·{" "}
                  {summary.result.profile.levelTitle}
                </div>
              )}

              {summary.result.newlyUnlockedBadges.length > 0 && (
                <div className="bg-[#D97706]/10 border border-[#D97706]/30 rounded-xl p-3 text-left flex flex-col gap-1.5">
                  <div className="text-xs font-semibold uppercase tracking-wider text-[#B45309] flex items-center gap-1.5">
                    <Award className="w-4 h-4" />
                    <span>Nouveau badge débloqué</span>
                  </div>
                  {summary.result.newlyUnlockedBadges.map((b) => (
                    <div key={b.id} className="text-sm font-semibold text-[#14171A]">
                      {b.title} — <span className="font-normal text-[#525860]">{b.description}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Inter-Game Local Sponsor Placement (hidden for Pro Pass) */}
              {!profile.isPro && interGameSponsor && (
                <div className="bg-[#F6F7F4] border border-black/10 rounded-xl p-3.5 text-left">
                  <div className="text-[11px] font-medium text-[#525860] mb-1">
                    Espace Sponsor · {interGameSponsor.sponsorName}
                  </div>
                  <div className="text-xs sm:text-sm font-medium text-[#14171A]">
                    {interGameSponsor.headline}
                  </div>
                </div>
              )}

              <div className="flex flex-col sm:flex-row gap-2.5 pt-1">
                <button
                  type="button"
                  onClick={handleReplay}
                  className="flex-1 min-h-[48px] px-5 py-3 rounded-xl bg-[#0D5C3E] hover:bg-[#094730] text-white font-semibold text-sm flex items-center justify-center gap-2 cursor-pointer transition-colors"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>Rejouer</span>
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 min-h-[48px] px-5 py-3 rounded-xl border border-black/12 bg-white hover:bg-[#F6F7F4] text-[#14171A] font-semibold text-sm cursor-pointer transition-colors"
                >
                  Retour aux jeux
                </button>
              </div>
            </div>
          ) : (
            <div key={sessionKey}>
              {gameId === "quiz" && <QuizGame profile={profile} onFinish={handleFinish} />}
              {gameId === "football" && <FootballGame profile={profile} onFinish={handleFinish} />}
              {gameId === "racing" && <RacingGame profile={profile} onFinish={handleFinish} />}
              {gameId === "memory" && <MemoryGame onFinish={handleFinish} />}
              {gameId === "puzzle" && <PuzzleGame onFinish={handleFinish} />}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
