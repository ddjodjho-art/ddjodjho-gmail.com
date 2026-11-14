export type GameId = "quiz" | "football" | "racing" | "memory" | "puzzle";

export type NavTab = "games" | "challenges" | "leaderboard" | "shop";

export type KinshasaCommune =
  | "Gombe"
  | "Kalamu"
  | "Ngaliema"
  | "Bandalungwa"
  | "Limete"
  | "Lemba"
  | "Matete"
  | "Kintambo"
  | "Masina"
  | "Ndjili"
  | "Lingwala"
  | "Barumbu";

export const KINSHASA_COMMUNES: KinshasaCommune[] = [
  "Gombe",
  "Kalamu",
  "Ngaliema",
  "Bandalungwa",
  "Limete",
  "Lemba",
  "Matete",
  "Kintambo",
  "Masina",
  "Ndjili",
  "Lingwala",
  "Barumbu",
];

export interface GameCatalogItem {
  id: GameId;
  title: string;
  subtitle: string;
  category: string;
  durationLabel: string;
  rewardLabel: string;
  coverImage: string;
  accentHex: string;
  tournamentEligible: boolean;
}

export interface BadgeDef {
  id: string;
  title: string;
  description: string;
  tier: "Bronze" | "Argent" | "Or";
}

export interface ShopItem {
  id: string;
  name: string;
  category: "Tenue" | "Véhicule" | "Cadre" | "Booster";
  description: string;
  priceTokens: number;
  gameId?: GameId;
  previewColor: string;
  consumable: boolean;
}

export interface DailyChallenge {
  id: string;
  title: string;
  gameId: GameId;
  target: number;
  progress: number;
  rewardTokens: number;
  rewardXp: number;
  claimed: boolean;
}

export interface PlayerProfile {
  id: string;
  pseudo: string;
  commune: KinshasaCommune;
  avatarColor: string;
  xp: number;
  level: number;
  levelTitle: string;
  nextLevelXp: number;
  points: number;
  tokens: number;
  gamesPlayed: number;
  badges: string[];
  ownedItems: string[];
  equippedItems: {
    footballSkin?: string;
    racingSkin?: string;
    avatarFrame?: string;
  };
  boosters: {
    quiz5050: number;
    racingShield: number;
    doubleXpGames: number;
  };
  isPro: boolean;
  tournamentPoints: number;
  bestScores: Record<GameId, number>;
  dailyDate: string;
  dailyChallenges: DailyChallenge[];
}

export interface LeaderboardEntry {
  id: string;
  pseudo: string;
  commune: KinshasaCommune;
  level: number;
  points: number;
  tournamentPoints: number;
  avatarColor: string;
  isPro: boolean;
  isSelf?: boolean;
}

export interface SponsorCampaign {
  id: string;
  sponsorName: string;
  sector: string;
  headline: string;
  ctaLabel: string;
  placement: "Accueil" | "Tournoi" | "Inter-Jeu";
  accentColor: string;
  rewardTokens: number;
}

export interface TournamentInfo {
  id: string;
  title: string;
  sponsorName: string;
  endsInLabel: string;
  prizePoolLabel: string;
  eligibleGames: GameId[];
}

export interface ChallengeNotification {
  id: string;
  title: string;
  body: string;
  gameId?: GameId;
  unread: boolean;
}

export interface BootstrapPayload {
  profile: PlayerProfile;
  leaderboard: LeaderboardEntry[];
  tournament: TournamentInfo;
  sponsors: SponsorCampaign[];
  shopItems: ShopItem[];
  badges: BadgeDef[];
  notifications: ChallengeNotification[];
}

export interface ScoreResultPayload {
  profile: PlayerProfile;
  leaderboard: LeaderboardEntry[];
  earnedPoints: number;
  earnedTokens: number;
  earnedXp: number;
  newlyUnlockedBadges: BadgeDef[];
  leveledUp: boolean;
}

export interface GameOutcome {
  gameId: GameId;
  score: number;
  won: boolean;
  summary: string;
  meta?: {
    goals?: number;
    accuracy?: number;
    distanceMeters?: number;
    moves?: number;
    usedQuiz5050?: boolean;
    usedRacingShield?: boolean;
  };
}
