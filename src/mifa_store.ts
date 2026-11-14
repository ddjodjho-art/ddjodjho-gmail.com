import fs from "node:fs";
import path from "node:path";
import type {
  BadgeDef,
  BootstrapPayload,
  ChallengeNotification,
  DailyChallenge,
  GameOutcome,
  KinshasaCommune,
  LeaderboardEntry,
  PlayerProfile,
  ScoreResultPayload,
  ShopItem,
  SponsorCampaign,
  TournamentInfo,
} from "./types/mifa";

const LEVELS = [
  { level: 1, minXp: 0, title: "Nouveau Kinois" },
  { level: 2, minXp: 150, title: "Ambianceur" },
  { level: 3, minXp: 380, title: "Joueur de Quartier" },
  { level: 4, minXp: 700, title: "As du Boulevard" },
  { level: 5, minXp: 1150, title: "Champion Kuba" },
  { level: 6, minXp: 1750, title: "Légende de Kinshasa" },
];

export const BADGE_DEFS: BadgeDef[] = [
  {
    id: "first_game",
    title: "Premiers Pas",
    description: "Terminer votre première partie sur MIFA",
    tier: "Bronze",
  },
  {
    id: "quiz_master",
    title: "Génie de Kin",
    description: "Obtenir au moins 80% de réussite au Quiz RDC",
    tier: "Or",
  },
  {
    id: "foot_striker",
    title: "Buteur de Matonge",
    description: "Marquer 4 buts ou plus en une séance Street Foot",
    tier: "Argent",
  },
  {
    id: "road_pilot",
    title: "Pilote du 30 Juin",
    description: "Parcourir au moins 700 m en Kin Boulevard Drift",
    tier: "Argent",
  },
  {
    id: "memory_sage",
    title: "Mémoire Kuba",
    description: "Terminer Mémoire Kuba en 22 coups ou moins",
    tier: "Argent",
  },
  {
    id: "puzzle_architect",
    title: "Esprit Limete",
    description: "Résoudre un plateau complet du Défi Logique",
    tier: "Or",
  },
  {
    id: "shop_collector",
    title: "Sapeur du Jeu",
    description: "Acquérir votre premier objet virtuel en boutique",
    tier: "Bronze",
  },
  {
    id: "daily_winner",
    title: "Fidèle du Jour",
    description: "Compléter et réclamer un défi quotidien",
    tier: "Argent",
  },
];

export const SHOP_ITEMS: ShopItem[] = [
  {
    id: "skin_foot_leopard",
    name: "Maillot Soleil de Kin",
    category: "Tenue",
    description: "Tenue dorée et émeraude pour votre tireur en Street Foot",
    priceTokens: 120,
    gameId: "football",
    previewColor: "#D97706",
    consumable: false,
  },
  {
    id: "skin_foot_emerald",
    name: "Ballon Fleuve Émeraude",
    category: "Tenue",
    description: "Ballon de match haute visibilité aux motifs géométriques Kuba",
    priceTokens: 160,
    gameId: "football",
    previewColor: "#0D5C3E",
    consumable: false,
  },
  {
    id: "skin_race_vip",
    name: "Bolide Cuivre Express",
    category: "Véhicule",
    description: "Carrosserie métalisée cuivre et bandes de course urbaines",
    priceTokens: 180,
    gameId: "racing",
    previewColor: "#B45309",
    consumable: false,
  },
  {
    id: "skin_race_night",
    name: "Bolide Nuit de Gombe",
    category: "Véhicule",
    description: "Peinture ardoise nocturne avec phares dorés haute intensité",
    priceTokens: 220,
    gameId: "racing",
    previewColor: "#1E293B",
    consumable: false,
  },
  {
    id: "frame_kuba_royal",
    name: "Cadre Avatar Kuba Royal",
    category: "Cadre",
    description: "Bordure dorée géométrique affichée sur le classement Kinshasa",
    priceTokens: 140,
    previewColor: "#F59E0B",
    consumable: false,
  },
  {
    id: "boost_quiz_5050",
    name: "Pack 3 Indices 50/50",
    category: "Booster",
    description: "Élimine deux mauvaises réponses pendant vos parties de Quiz",
    priceTokens: 75,
    gameId: "quiz",
    previewColor: "#0D5C3E",
    consumable: true,
  },
  {
    id: "boost_race_shield",
    name: "Pack 2 Boucliers Course",
    category: "Booster",
    description: "Absorbe une collision trafic lors d'une course Kin Boulevard",
    priceTokens: 90,
    gameId: "racing",
    previewColor: "#2563EB",
    consumable: true,
  },
  {
    id: "boost_double_xp",
    name: "Double XP (3 Parties)",
    category: "Booster",
    description: "Double vos gains d'expérience pendant vos 3 prochains matchs",
    priceTokens: 110,
    previewColor: "#7C3AED",
    consumable: true,
  },
];

export const SPONSOR_CAMPAIGNS: SponsorCampaign[] = [
  {
    id: "sp_kinfibre",
    sponsorName: "KinFibre Locale",
    sector: "Télécoms & Fibre",
    headline: "Connexion rapide dans 14 communes · Testez le spot partenaire",
    ctaLabel: "Voir l'offre (+50 Jetons)",
    placement: "Accueil",
    accentColor: "#0D5C3E",
    rewardTokens: 50,
  },
  {
    id: "sp_boulangerie",
    sponsorName: "Maison du Pain Gombe",
    sector: "Restauration Locale",
    headline: "Sponsor officiel de la Coupe de la Gombe cette semaine",
    ctaLabel: "Découvrir (+50 Jetons)",
    placement: "Tournoi",
    accentColor: "#D97706",
    rewardTokens: 50,
  },
  {
    id: "sp_livraison",
    sponsorName: "Livraison Éclair Kin",
    sector: "Mobilité Urbaine",
    headline: "Courses et colis rapides de Bandal à Limete en 35 min",
    ctaLabel: "Bonus Sponsor (+50 Jetons)",
    placement: "Inter-Jeu",
    accentColor: "#1E293B",
    rewardTokens: 50,
  },
];

export const WEEKLY_TOURNAMENT: TournamentInfo = {
  id: "tournoi_gombe_semaine",
  title: "Coupe Urbaine de Kinshasa",
  sponsorName: "Maison du Pain Gombe",
  endsInLabel: "Se termine dimanche 23:59",
  prizePoolLabel: "2 500 Jetons MIFA + Badge Or",
  eligibleGames: ["quiz", "football", "racing"],
};

interface SponsorInquiryRecord {
  referenceId: string;
  companyName: string;
  contact: string;
  placement: string;
  message: string;
  createdAt: string;
}

interface MifaDatabase {
  profiles: Record<string, PlayerProfile>;
  seededLeaderboard: LeaderboardEntry[];
  inquiries: SponsorInquiryRecord[];
}

const SEED_LEADERBOARD: LeaderboardEntry[] = [
  {
    id: "seed_1",
    pseudo: "Bana_Matonge",
    commune: "Kalamu",
    level: 5,
    points: 4820,
    tournamentPoints: 1340,
    avatarColor: "#0D5C3E",
    isPro: true,
  },
  {
    id: "seed_2",
    pseudo: "Pilote_Gombe",
    commune: "Gombe",
    level: 5,
    points: 4190,
    tournamentPoints: 1120,
    avatarColor: "#D97706",
    isPro: false,
  },
  {
    id: "seed_3",
    pseudo: "Ngaliema_Star",
    commune: "Ngaliema",
    level: 4,
    points: 3560,
    tournamentPoints: 980,
    avatarColor: "#1E293B",
    isPro: true,
  },
  {
    id: "seed_4",
    pseudo: "Limete_Veloce",
    commune: "Limete",
    level: 4,
    points: 2890,
    tournamentPoints: 790,
    avatarColor: "#B45309",
    isPro: false,
  },
  {
    id: "seed_5",
    pseudo: "Lemba_Savant",
    commune: "Lemba",
    level: 3,
    points: 2140,
    tournamentPoints: 620,
    avatarColor: "#0F766E",
    isPro: false,
  },
  {
    id: "seed_6",
    pseudo: "Bandal_Foot",
    commune: "Bandalungwa",
    level: 3,
    points: 1620,
    tournamentPoints: 490,
    avatarColor: "#334155",
    isPro: false,
  },
  {
    id: "seed_7",
    pseudo: "Masina_Rapide",
    commune: "Masina",
    level: 2,
    points: 940,
    tournamentPoints: 310,
    avatarColor: "#9A3412",
    isPro: false,
  },
];

function todayKey(): string {
  return new Date().toISOString().slice(0, 10);
}

function createDailyChallenges(): DailyChallenge[] {
  return [
    {
      id: "dc_quiz",
      title: "Réussir 70%+ au Quiz Kin & RDC",
      gameId: "quiz",
      target: 1,
      progress: 0,
      rewardTokens: 80,
      rewardXp: 90,
      claimed: false,
    },
    {
      id: "dc_foot",
      title: "Marquer 5 buts cumulés en Street Foot",
      gameId: "football",
      target: 5,
      progress: 0,
      rewardTokens: 90,
      rewardXp: 100,
      claimed: false,
    },
    {
      id: "dc_race",
      title: "Parcourir 1 000 m cumulés en Course",
      gameId: "racing",
      target: 1000,
      progress: 0,
      rewardTokens: 100,
      rewardXp: 110,
      claimed: false,
    },
  ];
}

function computeLevel(xp: number): { level: number; title: string; nextLevelXp: number } {
  let current = LEVELS[0];
  let nextXp = LEVELS[1].minXp;
  for (let i = 0; i < LEVELS.length; i++) {
    if (xp >= LEVELS[i].minXp) {
      current = LEVELS[i];
      nextXp = LEVELS[i + 1]?.minXp ?? LEVELS[i].minXp + 1000;
    }
  }
  return { level: current.level, title: current.title, nextLevelXp: nextXp };
}

function createDefaultProfile(id: string): PlayerProfile {
  const lvl = computeLevel(0);
  return {
    id,
    pseudo: "Kinois_Joueur",
    commune: "Gombe",
    avatarColor: "#0D5C3E",
    xp: 0,
    level: lvl.level,
    levelTitle: lvl.title,
    nextLevelXp: lvl.nextLevelXp,
    points: 0,
    tokens: 150,
    gamesPlayed: 0,
    badges: [],
    ownedItems: [],
    equippedItems: {},
    boosters: {
      quiz5050: 1,
      racingShield: 1,
      doubleXpGames: 0,
    },
    isPro: false,
    tournamentPoints: 0,
    bestScores: {
      quiz: 0,
      football: 0,
      racing: 0,
      memory: 0,
      puzzle: 0,
    },
    dailyDate: todayKey(),
    dailyChallenges: createDailyChallenges(),
  };
}

export class MifaStore {
  private dbPath: string;
  private db: MifaDatabase;

  constructor(dataDir: string) {
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
    this.dbPath = path.join(dataDir, "mifa_db.json");
    this.db = this.load();
  }

  private load(): MifaDatabase {
    try {
      if (fs.existsSync(this.dbPath)) {
        const raw = fs.readFileSync(this.dbPath, "utf8");
        const parsed = JSON.parse(raw) as Partial<MifaDatabase>;
        return {
          profiles: parsed.profiles ?? {},
          seededLeaderboard: parsed.seededLeaderboard ?? [...SEED_LEADERBOARD],
          inquiries: parsed.inquiries ?? [],
        };
      }
    } catch {
      // Fallback cleanly to fresh database if file corrupted
    }
    return {
      profiles: {},
      seededLeaderboard: [...SEED_LEADERBOARD],
      inquiries: [],
    };
  }

  private save() {
    fs.writeFileSync(this.dbPath, JSON.stringify(this.db, null, 2), "utf8");
  }

  private ensureProfile(playerId: string): PlayerProfile {
    const cleanId = playerId.replace(/[^a-zA-Z0-9_-]/g, "").slice(0, 64) || "player_kin_default";
    let profile = this.db.profiles[cleanId];
    if (!profile) {
      profile = createDefaultProfile(cleanId);
      this.db.profiles[cleanId] = profile;
      this.save();
    }
    const today = todayKey();
    if (profile.dailyDate !== today) {
      profile.dailyDate = today;
      profile.dailyChallenges = createDailyChallenges();
      this.save();
    }
    return profile;
  }

  private buildLeaderboard(currentPlayerId: string): LeaderboardEntry[] {
    const entries: LeaderboardEntry[] = [...this.db.seededLeaderboard];
    for (const p of Object.values(this.db.profiles)) {
      entries.push({
        id: p.id,
        pseudo: p.pseudo,
        commune: p.commune,
        level: p.level,
        points: p.points,
        tournamentPoints: p.tournamentPoints,
        avatarColor: p.avatarColor,
        isPro: p.isPro,
        isSelf: p.id === currentPlayerId,
      });
    }
    return entries.sort((a, b) => b.points - a.points).slice(0, 25);
  }

  private buildNotifications(profile: PlayerProfile): ChallengeNotification[] {
    const notifs: ChallengeNotification[] = [];
    const unclaimed = profile.dailyChallenges.filter((c) => c.progress >= c.target && !c.claimed);
    for (const c of unclaimed) {
      notifs.push({
        id: `notif_claim_${c.id}`,
        title: "Récompense prête à réclamer",
        body: `${c.title} (+${c.rewardTokens} Jetons)`,
        gameId: c.gameId,
        unread: true,
      });
    }
    const active = profile.dailyChallenges.filter((c) => c.progress < c.target);
    if (active.length > 0) {
      notifs.push({
        id: `notif_daily_${profile.dailyDate}`,
        title: "Nouveaux défis quotidiens disponibles",
        body: `${active.length} mission(s) active(s) aujourd'hui à Kinshasa`,
        gameId: active[0].gameId,
        unread: profile.gamesPlayed === 0,
      });
    }
    notifs.push({
      id: "notif_tournoi",
      title: WEEKLY_TOURNAMENT.title,
      body: `Sponsorisé par ${WEEKLY_TOURNAMENT.sponsorName} · ${WEEKLY_TOURNAMENT.prizePoolLabel}`,
      gameId: "quiz",
      unread: false,
    });
    return notifs;
  }

  getBootstrap(playerId: string): BootstrapPayload {
    const profile = this.ensureProfile(playerId);
    return {
      profile,
      leaderboard: this.buildLeaderboard(profile.id),
      tournament: WEEKLY_TOURNAMENT,
      sponsors: SPONSOR_CAMPAIGNS,
      shopItems: SHOP_ITEMS,
      badges: BADGE_DEFS,
      notifications: this.buildNotifications(profile),
    };
  }

  updateProfile(
    playerId: string,
    updates: { pseudo?: string; commune?: KinshasaCommune; avatarColor?: string },
  ): BootstrapPayload {
    const profile = this.ensureProfile(playerId);
    if (typeof updates.pseudo === "string") {
      const clean = updates.pseudo.trim().replace(/[<>]/g, "").slice(0, 22);
      if (clean.length >= 2) profile.pseudo = clean;
    }
    if (updates.commune) {
      profile.commune = updates.commune;
    }
    if (typeof updates.avatarColor === "string" && /^#[0-9A-Fa-f]{6}$/.test(updates.avatarColor)) {
      profile.avatarColor = updates.avatarColor;
    }
    this.save();
    return this.getBootstrap(profile.id);
  }

  recordScore(playerId: string, outcome: GameOutcome): ScoreResultPayload {
    const profile = this.ensureProfile(playerId);
    const prevLevel = profile.level;
    const rawScore = Math.max(0, Math.min(10000, Math.round(outcome.score || 0)));

    const earnedPoints = Math.max(25, rawScore);
    const baseTokens = Math.max(15, Math.round(rawScore / 18) + (outcome.won ? 20 : 5));
    const earnedTokens = profile.isPro ? baseTokens * 2 : baseTokens;
    let earnedXp = Math.max(25, Math.round(rawScore / 12) + (outcome.won ? 25 : 10));
    if (profile.boosters.doubleXpGames > 0) {
      earnedXp *= 2;
      profile.boosters.doubleXpGames = Math.max(0, profile.boosters.doubleXpGames - 1);
    }

    if (outcome.meta?.usedQuiz5050 && profile.boosters.quiz5050 > 0) {
      profile.boosters.quiz5050 -= 1;
    }
    if (outcome.meta?.usedRacingShield && profile.boosters.racingShield > 0) {
      profile.boosters.racingShield -= 1;
    }

    profile.points += earnedPoints;
    profile.tokens += earnedTokens;
    profile.xp += earnedXp;
    profile.gamesPlayed += 1;

    if (rawScore > (profile.bestScores[outcome.gameId] ?? 0)) {
      profile.bestScores[outcome.gameId] = rawScore;
    }

    if (WEEKLY_TOURNAMENT.eligibleGames.includes(outcome.gameId)) {
      profile.tournamentPoints += Math.round(earnedPoints * 0.65);
    }

    // Update daily challenge progress
    for (const c of profile.dailyChallenges) {
      if (c.id === "dc_quiz" && outcome.gameId === "quiz" && (outcome.meta?.accuracy ?? 0) >= 70) {
        c.progress = Math.min(c.target, c.progress + 1);
      }
      if (c.id === "dc_foot" && outcome.gameId === "football") {
        c.progress = Math.min(c.target, c.progress + (outcome.meta?.goals ?? 0));
      }
      if (c.id === "dc_race" && outcome.gameId === "racing") {
        c.progress = Math.min(c.target, c.progress + (outcome.meta?.distanceMeters ?? 0));
      }
    }

    // Evaluate badges
    const newlyUnlockedBadges: BadgeDef[] = [];
    const unlock = (badgeId: string) => {
      if (!profile.badges.includes(badgeId)) {
        profile.badges.push(badgeId);
        const def = BADGE_DEFS.find((b) => b.id === badgeId);
        if (def) newlyUnlockedBadges.push(def);
      }
    };

    unlock("first_game");
    if (outcome.gameId === "quiz" && (outcome.meta?.accuracy ?? 0) >= 80) {
      unlock("quiz_master");
    }
    if (outcome.gameId === "football" && (outcome.meta?.goals ?? 0) >= 4) {
      unlock("foot_striker");
    }
    if (outcome.gameId === "racing" && (outcome.meta?.distanceMeters ?? 0) >= 700) {
      unlock("road_pilot");
    }
    if (outcome.gameId === "memory" && outcome.won && (outcome.meta?.moves ?? 99) <= 22) {
      unlock("memory_sage");
    }
    if (outcome.gameId === "puzzle" && outcome.won) {
      unlock("puzzle_architect");
    }

    const lvl = computeLevel(profile.xp);
    profile.level = lvl.level;
    profile.levelTitle = lvl.title;
    profile.nextLevelXp = lvl.nextLevelXp;

    this.save();

    return {
      profile,
      leaderboard: this.buildLeaderboard(profile.id),
      earnedPoints,
      earnedTokens,
      earnedXp,
      newlyUnlockedBadges,
      leveledUp: lvl.level > prevLevel,
    };
  }

  claimDailyChallenge(playerId: string, challengeId: string): BootstrapPayload {
    const profile = this.ensureProfile(playerId);
    const ch = profile.dailyChallenges.find((c) => c.id === challengeId);
    if (!ch) throw new Error("Défi introuvable.");
    if (ch.claimed) throw new Error("Récompense déjà réclamée.");
    if (ch.progress < ch.target) throw new Error("Défi pas encore terminé.");

    ch.claimed = true;
    profile.tokens += ch.rewardTokens;
    profile.xp += ch.rewardXp;

    if (!profile.badges.includes("daily_winner")) {
      profile.badges.push("daily_winner");
    }
    const lvl = computeLevel(profile.xp);
    profile.level = lvl.level;
    profile.levelTitle = lvl.title;
    profile.nextLevelXp = lvl.nextLevelXp;

    this.save();
    return this.getBootstrap(profile.id);
  }

  buyShopItem(playerId: string, itemId: string): BootstrapPayload {
    const profile = this.ensureProfile(playerId);
    const item = SHOP_ITEMS.find((i) => i.id === itemId);
    if (!item) throw new Error("Objet introuvable.");
    if (!item.consumable && profile.ownedItems.includes(item.id)) {
      throw new Error("Vous possédez déjà cet objet.");
    }
    if (profile.tokens < item.priceTokens) {
      throw new Error("Solde de Jetons MIFA insuffisant.");
    }

    profile.tokens -= item.priceTokens;
    if (item.consumable) {
      if (item.id === "boost_quiz_5050") profile.boosters.quiz5050 += 3;
      if (item.id === "boost_race_shield") profile.boosters.racingShield += 2;
      if (item.id === "boost_double_xp") profile.boosters.doubleXpGames += 3;
    } else {
      profile.ownedItems.push(item.id);
      if (item.gameId === "football") profile.equippedItems.footballSkin = item.id;
      if (item.gameId === "racing") profile.equippedItems.racingSkin = item.id;
      if (item.category === "Cadre") profile.equippedItems.avatarFrame = item.id;
    }

    if (!profile.badges.includes("shop_collector")) {
      profile.badges.push("shop_collector");
    }

    this.save();
    return this.getBootstrap(profile.id);
  }

  equipShopItem(playerId: string, itemId: string): BootstrapPayload {
    const profile = this.ensureProfile(playerId);
    if (!profile.ownedItems.includes(itemId)) {
      throw new Error("Objet non débloqué.");
    }
    const item = SHOP_ITEMS.find((i) => i.id === itemId);
    if (!item) throw new Error("Objet introuvable.");

    if (item.gameId === "football") {
      profile.equippedItems.footballSkin =
        profile.equippedItems.footballSkin === itemId ? undefined : itemId;
    } else if (item.gameId === "racing") {
      profile.equippedItems.racingSkin =
        profile.equippedItems.racingSkin === itemId ? undefined : itemId;
    } else if (item.category === "Cadre") {
      profile.equippedItems.avatarFrame =
        profile.equippedItems.avatarFrame === itemId ? undefined : itemId;
    }
    this.save();
    return this.getBootstrap(profile.id);
  }

  grantSponsorReward(playerId: string, sponsorId: string): BootstrapPayload {
    const profile = this.ensureProfile(playerId);
    const sp = SPONSOR_CAMPAIGNS.find((s) => s.id === sponsorId);
    profile.tokens += sp?.rewardTokens ?? 50;
    this.save();
    return this.getBootstrap(profile.id);
  }

  toggleProPass(playerId: string): BootstrapPayload {
    const profile = this.ensureProfile(playerId);
    profile.isPro = !profile.isPro;
    this.save();
    return this.getBootstrap(profile.id);
  }

  saveSponsorInquiry(payload: {
    companyName: string;
    contact: string;
    placement: string;
    message: string;
  }): { ok: boolean; referenceId: string } {
    const companyName = (payload.companyName || "").trim().slice(0, 80);
    const contact = (payload.contact || "").trim().slice(0, 80);
    if (companyName.length < 2 || contact.length < 3) {
      throw new Error("Veuillez indiquer le nom de votre entreprise et un contact.");
    }
    const referenceId = `KIN-PUB-${Date.now().toString(36).toUpperCase()}`;
    this.db.inquiries.push({
      referenceId,
      companyName,
      contact,
      placement: (payload.placement || "Accueil").slice(0, 40),
      message: (payload.message || "").trim().slice(0, 400),
      createdAt: new Date().toISOString(),
    });
    this.save();
    return { ok: true, referenceId };
  }
}
