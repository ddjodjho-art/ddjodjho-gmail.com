import { Bell, Check, Gift, Play, Trophy } from "lucide-react";
import type {
  ChallengeNotification,
  DailyChallenge,
  GameId,
  PlayerProfile,
  TournamentInfo,
} from "../types/mifa";

interface ChallengesViewProps {
  profile: PlayerProfile;
  tournament: TournamentInfo;
  notifications: ChallengeNotification[];
  onPlayGame: (gameId: GameId) => void;
  onClaimChallenge: (challengeId: string) => Promise<void>;
}

const GAME_NAMES: Record<GameId, string> = {
  quiz: "Quiz Kin & RDC",
  football: "Street Foot",
  racing: "Kin Drift",
  memory: "Mémoire Kuba",
  puzzle: "Défi Logique",
};

export function ChallengesView({
  profile,
  tournament,
  notifications,
  onPlayGame,
  onClaimChallenge,
}: ChallengesViewProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      {/* Left Column: Daily Challenges */}
      <div className="lg:col-span-7 flex flex-col gap-5">
        <div className="flex items-baseline justify-between gap-4">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-[#14171A]">Défis du Jour</h2>
            <p className="text-sm text-[#525860] mt-0.5">
              Complétez vos missions quotidiennes pour gagner des Jetons MIFA et de l&apos;XP.
            </p>
          </div>
          <span className="text-xs font-mono tabular-nums text-[#525860] shrink-0">
            {profile.dailyChallenges.filter((c) => c.claimed).length}/
            {profile.dailyChallenges.length} terminés
          </span>
        </div>

        <div className="bg-white border border-black/10 rounded-2xl divide-y divide-black/8">
          {profile.dailyChallenges.map((ch: DailyChallenge) => {
            const pct = Math.min(100, Math.round((ch.progress / ch.target) * 100));
            const completed = ch.progress >= ch.target;

            return (
              <div key={ch.id} className="p-4 sm:p-5 flex flex-col gap-3">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="text-xs text-[#525860] mb-1">
                      {GAME_NAMES[ch.gameId]} · +{ch.rewardTokens} Jetons · +{ch.rewardXp} XP
                    </div>
                    <h3 className="text-base font-semibold text-[#14171A]">{ch.title}</h3>
                  </div>

                  {ch.claimed ? (
                    <span className="inline-flex items-center gap-1 text-xs font-semibold text-[#0D5C3E] shrink-0 py-2">
                      <Check className="w-4 h-4" />
                      <span>Réclamé</span>
                    </span>
                  ) : completed ? (
                    <button
                      type="button"
                      onClick={() => void onClaimChallenge(ch.id)}
                      className="min-h-[44px] px-4 py-2 rounded-xl bg-[#D97706] hover:bg-[#B45309] text-white text-xs sm:text-sm font-semibold flex items-center gap-1.5 shrink-0 cursor-pointer transition-colors"
                    >
                      <Gift className="w-4 h-4" />
                      <span>Réclamer</span>
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => onPlayGame(ch.gameId)}
                      className="min-h-[44px] px-4 py-2 rounded-xl border border-black/12 bg-[#F6F7F4] hover:bg-[#14171A] hover:text-white text-[#14171A] text-xs sm:text-sm font-semibold flex items-center gap-1.5 shrink-0 cursor-pointer transition-colors"
                    >
                      <Play className="w-3.5 h-3.5" />
                      <span>Jouer</span>
                    </button>
                  )}
                </div>

                <div className="flex items-center gap-3">
                  <div className="flex-1 h-2 bg-[#ECEEE8] rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all duration-300 ${
                        completed ? "bg-[#0D5C3E]" : "bg-[#D97706]"
                      }`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <span className="text-xs font-mono tabular-nums font-semibold text-[#14171A] shrink-0">
                    {ch.progress}/{ch.target}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Right Column: Weekly Tournament + Challenge Notifications */}
      <div className="lg:col-span-5 flex flex-col gap-5">
        <div className="bg-[#14171A] text-white rounded-2xl p-5 sm:p-6 flex flex-col gap-4">
          <div className="flex items-center justify-between gap-2 text-xs text-white/70">
            <span>Tournoi de la semaine</span>
            <span>{tournament.endsInLabel}</span>
          </div>
          <div>
            <div className="flex items-center gap-2.5 mb-1.5">
              <Trophy className="w-5 h-5 text-[#F59E0B] shrink-0" />
              <h3 className="text-xl font-bold">{tournament.title}</h3>
            </div>
            <p className="text-sm text-white/75">
              Sponsorisé par {tournament.sponsorName}. Jouez au Quiz, Street Foot ou Kin Drift
              pour cumuler des points tournoi.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 border-t border-white/12 pt-4">
            <div>
              <div className="text-xs text-white/60">Dotation</div>
              <div className="text-sm font-semibold text-[#FBBF24] mt-0.5">
                {tournament.prizePoolLabel}
              </div>
            </div>
            <div>
              <div className="text-xs text-white/60">Votre score tournoi</div>
              <div className="text-lg font-bold font-mono tabular-nums mt-0.5">
                {profile.tournamentPoints} pts
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={() => onPlayGame(tournament.eligibleGames[0])}
            className="w-full min-h-[46px] rounded-xl bg-[#D97706] hover:bg-[#B45309] text-white font-semibold text-sm cursor-pointer transition-colors"
          >
            Participer maintenant
          </button>
        </div>

        {/* Notifications des nouveaux défis */}
        <div className="bg-white border border-black/10 rounded-2xl p-5 flex flex-col gap-3">
          <div className="flex items-center gap-2 text-sm font-bold text-[#14171A]">
            <Bell className="w-4 h-4 text-[#0D5C3E]" />
            <span>Alertes &amp; Nouveaux Défis</span>
          </div>

          <div className="divide-y divide-black/8">
            {notifications.map((n) => (
              <div key={n.id} className="py-3 first:pt-1 last:pb-1 flex items-start justify-between gap-3">
                <div>
                  <div className="text-sm font-semibold text-[#14171A]">{n.title}</div>
                  <div className="text-xs text-[#525860] mt-0.5">{n.body}</div>
                </div>
                {n.gameId && (
                  <button
                    type="button"
                    onClick={() => onPlayGame(n.gameId!)}
                    className="min-h-[38px] px-3 py-1.5 rounded-lg text-xs font-semibold text-[#0D5C3E] hover:bg-[#0D5C3E]/8 shrink-0 cursor-pointer"
                  >
                    Ouvrir
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
