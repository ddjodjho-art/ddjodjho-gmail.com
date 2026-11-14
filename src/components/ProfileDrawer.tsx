import { useState } from "react";
import { Award, Check, MapPin, User, X } from "lucide-react";
import {
  KINSHASA_COMMUNES,
  type BadgeDef,
  type KinshasaCommune,
  type PlayerProfile,
} from "../types/mifa";

interface ProfileDrawerProps {
  profile: PlayerProfile;
  allBadges: BadgeDef[];
  onSaveProfile: (payload: {
    pseudo: string;
    commune: KinshasaCommune;
    avatarColor: string;
  }) => Promise<void>;
  onClose: () => void;
}

const AVATAR_COLORS = ["#0D5C3E", "#D97706", "#14171A", "#B45309", "#1E3A8A", "#9F1239"];

export function ProfileDrawer({
  profile,
  allBadges,
  onSaveProfile,
  onClose,
}: ProfileDrawerProps) {
  const [pseudo, setPseudo] = useState(profile.pseudo);
  const [commune, setCommune] = useState<KinshasaCommune>(profile.commune);
  const [avatarColor, setAvatarColor] = useState(profile.avatarColor);
  const [saving, setSaving] = useState(false);
  const [savedNotice, setSavedNotice] = useState(false);

  const xpProgress = Math.min(100, Math.round((profile.xp / profile.nextLevelXp) * 100));

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await onSaveProfile({ pseudo, commune, avatarColor });
      setSavedNotice(true);
      window.setTimeout(() => setSavedNotice(false), 2000);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/55 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-label="Mon Profil Kinshasa"
    >
      <div className="w-full sm:max-w-xl bg-white rounded-t-3xl sm:rounded-3xl border border-black/10 max-h-[92dvh] flex flex-col overflow-hidden">
        <div className="flex items-center justify-between px-5 h-14 border-b border-black/8 shrink-0">
          <div className="flex items-center gap-2 text-base font-bold text-[#14171A]">
            <User className="w-4 h-4 text-[#0D5C3E]" />
            <span>Profil Joueur</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Fermer le profil"
            className="min-h-[40px] min-w-[40px] rounded-xl border border-black/10 flex items-center justify-center text-[#525860] hover:text-[#14171A] cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5 overflow-y-auto flex flex-col gap-6">
          {/* Level & Stats Overview */}
          <div className="bg-[#F6F7F4] border border-black/8 rounded-2xl p-4 flex flex-col gap-3">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div
                  className={`w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold text-lg shrink-0 ${
                    profile.equippedItems.avatarFrame ? "ring-2 ring-[#F59E0B] ring-offset-2" : ""
                  }`}
                  style={{ backgroundColor: avatarColor }}
                >
                  {pseudo.slice(0, 2).toUpperCase() || "MK"}
                </div>
                <div>
                  <div className="text-base font-bold text-[#14171A]">{profile.pseudo}</div>
                  <div className="text-xs text-[#525860] flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5" />
                    <span>{profile.commune}, Kinshasa</span>
                    <span aria-hidden="true">·</span>
                    <span>
                      Niveau {profile.level} ({profile.levelTitle})
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between text-xs text-[#525860] mb-1">
                <span>Progression XP</span>
                <span className="font-mono tabular-nums font-semibold text-[#14171A]">
                  {profile.xp} / {profile.nextLevelXp} XP
                </span>
              </div>
              <div className="w-full h-2 bg-black/8 rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#0D5C3E] transition-all duration-300"
                  style={{ width: `${xpProgress}%` }}
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2 pt-1">
              <div className="bg-white rounded-xl p-2.5 border border-black/8">
                <div className="text-[11px] text-[#525860]">Points</div>
                <div className="text-sm font-bold font-mono tabular-nums text-[#14171A]">
                  {profile.points}
                </div>
              </div>
              <div className="bg-white rounded-xl p-2.5 border border-black/8">
                <div className="text-[11px] text-[#525860]">Jetons</div>
                <div className="text-sm font-bold font-mono tabular-nums text-[#D97706]">
                  {profile.tokens}
                </div>
              </div>
              <div className="bg-white rounded-xl p-2.5 border border-black/8">
                <div className="text-[11px] text-[#525860]">Parties</div>
                <div className="text-sm font-bold font-mono tabular-nums text-[#14171A]">
                  {profile.gamesPlayed}
                </div>
              </div>
            </div>
          </div>

          {/* Edit Pseudo / Commune */}
          <form onSubmit={handleSave} className="flex flex-col gap-3">
            <h3 className="text-sm font-bold text-[#14171A]">Personnaliser mon identité</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-[#525860] mb-1">
                  Pseudo joueur
                </label>
                <input
                  type="text"
                  required
                  minLength={2}
                  maxLength={22}
                  value={pseudo}
                  onChange={(e) => setPseudo(e.target.value)}
                  className="w-full min-h-[44px] px-3.5 rounded-xl border border-black/15 text-sm focus:outline-2 focus:outline-[#0D5C3E]"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#525860] mb-1">
                  Commune à Kinshasa
                </label>
                <select
                  value={commune}
                  onChange={(e) => setCommune(e.target.value as KinshasaCommune)}
                  className="w-full min-h-[44px] px-3.5 rounded-xl border border-black/15 text-sm bg-white focus:outline-2 focus:outline-[#0D5C3E]"
                >
                  {KINSHASA_COMMUNES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex items-center justify-between gap-3 pt-1">
              <div className="flex items-center gap-2">
                {AVATAR_COLORS.map((c) => (
                  <button
                    key={c}
                    type="button"
                    aria-label={`Couleur ${c}`}
                    onClick={() => setAvatarColor(c)}
                    className={`w-8 h-8 rounded-lg cursor-pointer transition-transform ${
                      avatarColor === c ? "scale-110 ring-2 ring-[#14171A] ring-offset-2" : ""
                    }`}
                    style={{ backgroundColor: c }}
                  />
                ))}
              </div>
              <button
                type="submit"
                disabled={saving}
                className="min-h-[44px] px-5 py-2 rounded-xl bg-[#14171A] hover:bg-black text-white text-xs sm:text-sm font-semibold flex items-center gap-1.5 cursor-pointer"
              >
                {savedNotice && <Check className="w-4 h-4 text-[#10B981]" />}
                <span>{savedNotice ? "Enregistré" : "Enregistrer"}</span>
              </button>
            </div>
          </form>

          {/* Badges Gallery */}
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-[#14171A] flex items-center gap-1.5">
                <Award className="w-4 h-4 text-[#D97706]" />
                <span>Badges ({profile.badges.length}/{allBadges.length})</span>
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {allBadges.map((b) => {
                const unlocked = profile.badges.includes(b.id);
                return (
                  <div
                    key={b.id}
                    className={`rounded-xl border p-3 flex items-start gap-2.5 ${
                      unlocked
                        ? "bg-white border-[#0D5C3E]/35"
                        : "bg-[#F6F7F4] border-black/8 opacity-60"
                    }`}
                  >
                    <Award
                      className={`w-4 h-4 mt-0.5 shrink-0 ${
                        unlocked ? "text-[#D97706]" : "text-[#8A9199]"
                      }`}
                    />
                    <div>
                      <div className="text-xs font-bold text-[#14171A]">
                        {b.title} · <span className="font-normal text-[#525860]">{b.tier}</span>
                      </div>
                      <div className="text-[11px] text-[#525860] mt-0.5">{b.description}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
