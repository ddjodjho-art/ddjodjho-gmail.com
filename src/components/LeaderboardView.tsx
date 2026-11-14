import { useMemo, useState } from "react";
import { Medal, Trophy } from "lucide-react";
import type { LeaderboardEntry, PlayerProfile, TournamentInfo } from "../types/mifa";

interface LeaderboardViewProps {
  profile: PlayerProfile;
  leaderboard: LeaderboardEntry[];
  tournament: TournamentInfo;
}

export function LeaderboardView({ profile, leaderboard, tournament }: LeaderboardViewProps) {
  const [mode, setMode] = useState<"general" | "tournament">("general");
  const [communeFilter, setCommuneFilter] = useState<string>("Toutes");

  const communes = useMemo(() => {
    const set = new Set<string>(leaderboard.map((e) => e.commune));
    return ["Toutes", ...Array.from(set)];
  }, [leaderboard]);

  const ranked = useMemo(() => {
    const filtered =
      communeFilter === "Toutes"
        ? leaderboard
        : leaderboard.filter((e) => e.commune === communeFilter);
    return [...filtered].sort((a, b) =>
      mode === "general" ? b.points - a.points : b.tournamentPoints - a.tournamentPoints,
    );
  }, [leaderboard, communeFilter, mode]);

  const myRank = ranked.findIndex((e) => e.isSelf) + 1;

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-[#14171A]">
            Classements de Kinshasa
          </h2>
          <p className="text-sm text-[#525860] mt-0.5">
            {mode === "general"
              ? "Meilleurs joueurs cumulés sur tous les mini-jeux MIFA."
              : `${tournament.title} · Sponsorisé par ${tournament.sponsorName}`}
          </p>
        </div>

        {/* Interactive mode switch */}
        <div className="inline-flex items-center p-1 bg-[#ECEEE8] rounded-xl self-start">
          <button
            type="button"
            onClick={() => setMode("general")}
            className={`min-h-[40px] px-4 py-1.5 text-xs sm:text-sm font-semibold rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
              mode === "general"
                ? "bg-white text-[#14171A] shadow-xs"
                : "text-[#525860] hover:text-[#14171A]"
            }`}
          >
            Classement Général
          </button>
          <button
            type="button"
            onClick={() => setMode("tournament")}
            className={`min-h-[40px] px-4 py-1.5 text-xs sm:text-sm font-semibold rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
              mode === "tournament"
                ? "bg-white text-[#14171A] shadow-xs"
                : "text-[#525860] hover:text-[#14171A]"
            }`}
          >
            Tournoi Semaine
          </button>
        </div>
      </div>

      {/* Commune interactive filter */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {communes.map((c) => (
          <button
            key={c}
            type="button"
            onClick={() => setCommuneFilter(c)}
            className={`min-h-[38px] px-3.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap shrink-0 border transition-colors cursor-pointer ${
              communeFilter === c
                ? "bg-[#14171A] text-white border-[#14171A]"
                : "bg-white text-[#525860] border-black/10 hover:text-[#14171A]"
            }`}
          >
            {c}
          </button>
        ))}
      </div>

      {/* Player current standing bar */}
      <div className="bg-white border border-black/10 rounded-2xl p-4 sm:p-5 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div
            className="w-11 h-11 rounded-xl flex items-center justify-center text-white font-bold text-base shrink-0"
            style={{ backgroundColor: profile.avatarColor }}
          >
            {profile.pseudo.slice(0, 2).toUpperCase()}
          </div>
          <div>
            <div className="text-sm font-bold text-[#14171A]">
              {profile.pseudo} <span className="font-normal text-[#525860]">· Vous</span>
            </div>
            <div className="text-xs text-[#525860]">
              {profile.commune} · Niveau {profile.level}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-6">
          <div>
            <div className="text-xs text-[#525860]">Rang</div>
            <div className="text-lg font-bold font-mono tabular-nums text-[#0D5C3E]">
              {myRank > 0 ? `#${myRank}` : "—"}
            </div>
          </div>
          <div>
            <div className="text-xs text-[#525860]">Score</div>
            <div className="text-lg font-bold font-mono tabular-nums text-[#14171A]">
              {mode === "general" ? profile.points : profile.tournamentPoints} pts
            </div>
          </div>
        </div>
      </div>

      {/* Ranked Table */}
      <div className="bg-white border border-black/10 rounded-2xl overflow-hidden">
        <div className="divide-y divide-black/8">
          {ranked.map((entry, idx) => {
            const rank = idx + 1;
            const scoreVal = mode === "general" ? entry.points : entry.tournamentPoints;
            return (
              <div
                key={entry.id}
                className={`px-4 sm:px-5 py-3.5 flex items-center justify-between gap-3 ${
                  entry.isSelf ? "bg-[#0D5C3E]/6" : ""
                }`}
              >
                <div className="flex items-center gap-3.5 min-w-0">
                  <div className="w-7 text-center font-mono tabular-nums text-sm font-bold text-[#525860] shrink-0">
                    {rank === 1 ? (
                      <Trophy className="w-4 h-4 text-[#D97706] mx-auto" />
                    ) : rank <= 3 ? (
                      <Medal className="w-4 h-4 text-[#0D5C3E] mx-auto" />
                    ) : (
                      `#${rank}`
                    )}
                  </div>

                  <div
                    className="w-9 h-9 rounded-lg flex items-center justify-center text-white text-xs font-bold shrink-0"
                    style={{ backgroundColor: entry.avatarColor }}
                  >
                    {entry.pseudo.slice(0, 2).toUpperCase()}
                  </div>

                  <div className="min-w-0">
                    <div className="text-sm font-semibold text-[#14171A] truncate">
                      {entry.pseudo}
                      {entry.isSelf ? " (Vous)" : ""}
                    </div>
                    <div className="text-xs text-[#525860] truncate">
                      {entry.commune} · Niv. {entry.level}
                      {entry.isPro ? " · Pass Pro" : ""}
                    </div>
                  </div>
                </div>

                <div className="font-mono tabular-nums text-sm sm:text-base font-bold text-[#14171A] shrink-0">
                  {scoreVal.toLocaleString("fr-FR")} pts
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
