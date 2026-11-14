import type {
  BootstrapPayload,
  GameOutcome,
  KinshasaCommune,
  ScoreResultPayload,
} from "../types/mifa";

const PLAYER_ID_KEY = "mifa_player_id_v1";

export function getOrCreatePlayerId(): string {
  if (typeof window === "undefined") return "player_kin_local";
  let existing = window.localStorage.getItem(PLAYER_ID_KEY);
  if (!existing) {
    existing = `kin_${Math.random().toString(36).slice(2, 10)}_${Date.now().toString(36)}`;
    window.localStorage.setItem(PLAYER_ID_KEY, existing);
  }
  return existing;
}

async function apiJson<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  const data = (await res.json()) as T & { ok?: boolean; error?: string };
  if (!res.ok) {
    throw new Error(data.error || "Erreur réseau");
  }
  return data;
}

export async function fetchBootstrap(): Promise<BootstrapPayload> {
  const playerId = getOrCreatePlayerId();
  return apiJson<BootstrapPayload>(`/api/bootstrap?playerId=${encodeURIComponent(playerId)}`);
}

export async function updateProfileApi(payload: {
  pseudo: string;
  commune: KinshasaCommune;
  avatarColor: string;
}): Promise<BootstrapPayload> {
  const playerId = getOrCreatePlayerId();
  return apiJson<BootstrapPayload>("/api/profile", {
    method: "POST",
    body: JSON.stringify({ playerId, ...payload }),
  });
}

export async function submitScoreApi(outcome: GameOutcome): Promise<ScoreResultPayload> {
  const playerId = getOrCreatePlayerId();
  return apiJson<ScoreResultPayload>("/api/score", {
    method: "POST",
    body: JSON.stringify({ playerId, ...outcome }),
  });
}

export async function claimChallengeApi(challengeId: string): Promise<BootstrapPayload> {
  const playerId = getOrCreatePlayerId();
  return apiJson<BootstrapPayload>("/api/challenges/claim", {
    method: "POST",
    body: JSON.stringify({ playerId, challengeId }),
  });
}

export async function buyShopItemApi(itemId: string): Promise<BootstrapPayload> {
  const playerId = getOrCreatePlayerId();
  return apiJson<BootstrapPayload>("/api/shop/buy", {
    method: "POST",
    body: JSON.stringify({ playerId, itemId }),
  });
}

export async function equipShopItemApi(itemId: string): Promise<BootstrapPayload> {
  const playerId = getOrCreatePlayerId();
  return apiJson<BootstrapPayload>("/api/shop/equip", {
    method: "POST",
    body: JSON.stringify({ playerId, itemId }),
  });
}

export async function claimSponsoredRewardApi(sponsorId: string): Promise<BootstrapPayload> {
  const playerId = getOrCreatePlayerId();
  return apiJson<BootstrapPayload>("/api/ads/reward", {
    method: "POST",
    body: JSON.stringify({ playerId, sponsorId }),
  });
}

export async function submitSponsorInquiryApi(payload: {
  companyName: string;
  contact: string;
  placement: string;
  message: string;
}): Promise<{ ok: boolean; referenceId: string }> {
  return apiJson<{ ok: boolean; referenceId: string }>("/api/ads/inquiry", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function toggleProPassApi(): Promise<BootstrapPayload> {
  const playerId = getOrCreatePlayerId();
  return apiJson<BootstrapPayload>("/api/subscription/toggle", {
    method: "POST",
    body: JSON.stringify({ playerId }),
  });
}
