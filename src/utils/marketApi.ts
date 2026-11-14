import type {
  KinshasaCommune,
  MarketBootstrapPayload,
  MarketCategory,
  Order,
  PaymentMethod,
  SellerPlanId,
} from "../types/market";

async function apiJson<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  const data = (await res.json()) as T & { error?: string };
  if (!res.ok) {
    throw new Error(data.error || "Erreur de connexion");
  }
  return data;
}

export function fetchMarketBootstrap(): Promise<MarketBootstrapPayload> {
  return apiJson<MarketBootstrapPayload>("/api/market/bootstrap");
}

export function createOrderApi(payload: {
  customerName: string;
  customerPhone: string;
  commune: KinshasaCommune;
  addressNote: string;
  paymentMethod: PaymentMethod;
  items: { productId: string; variant: string; quantity: number }[];
}): Promise<{ order: Order; bootstrap: MarketBootstrapPayload }> {
  return apiJson<{ order: Order; bootstrap: MarketBootstrapPayload }>("/api/market/orders", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function advanceOrderStatusApi(orderId: string): Promise<MarketBootstrapPayload> {
  return apiJson<MarketBootstrapPayload>("/api/market/orders/advance", {
    method: "POST",
    body: JSON.stringify({ orderId }),
  });
}

export function publishProductApi(payload: {
  title: string;
  category: MarketCategory;
  priceUsd: number;
  commune: KinshasaCommune;
  sellerName: string;
  sellerWhatsapp: string;
  description: string;
  variantsText: string;
  imageUrl: string;
  promote: boolean;
}): Promise<MarketBootstrapPayload> {
  return apiJson<MarketBootstrapPayload>("/api/market/products", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function togglePromoteProductApi(productId: string): Promise<MarketBootstrapPayload> {
  return apiJson<MarketBootstrapPayload>("/api/market/products/promote", {
    method: "POST",
    body: JSON.stringify({ productId }),
  });
}

export function updateSellerPlanApi(planId: SellerPlanId): Promise<MarketBootstrapPayload> {
  return apiJson<MarketBootstrapPayload>("/api/market/seller/plan", {
    method: "POST",
    body: JSON.stringify({ planId }),
  });
}
