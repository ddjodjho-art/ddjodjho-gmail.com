export type MarketCategory =
  | "Vêtements & Chaussures"
  | "Téléphones & Accessoires"
  | "Beauté & Cosmétiques"
  | "Sacs & Accessoires"
  | "Alimentation"
  | "Articles Maison";

export const MARKET_CATEGORIES: MarketCategory[] = [
  "Vêtements & Chaussures",
  "Téléphones & Accessoires",
  "Beauté & Cosmétiques",
  "Sacs & Accessoires",
  "Alimentation",
  "Articles Maison",
];

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

export interface CommuneDeliveryInfo {
  name: KinshasaCommune;
  feeUsd: number;
  etaLabel: string;
}

export const COMMUNE_DELIVERY: CommuneDeliveryInfo[] = [
  { name: "Gombe", feeUsd: 2, etaLabel: "2–3h" },
  { name: "Kalamu", feeUsd: 2, etaLabel: "2–4h" },
  { name: "Lingwala", feeUsd: 2, etaLabel: "2–4h" },
  { name: "Barumbu", feeUsd: 2, etaLabel: "2–4h" },
  { name: "Bandalungwa", feeUsd: 2.5, etaLabel: "3–4h" },
  { name: "Kintambo", feeUsd: 2.5, etaLabel: "3–4h" },
  { name: "Limete", feeUsd: 3, etaLabel: "3–5h" },
  { name: "Ngaliema", feeUsd: 3, etaLabel: "3–5h" },
  { name: "Lemba", feeUsd: 3.5, etaLabel: "Jour même" },
  { name: "Matete", feeUsd: 3.5, etaLabel: "Jour même" },
  { name: "Masina", feeUsd: 4, etaLabel: "Jour même" },
  { name: "Ndjili", feeUsd: 4, etaLabel: "Jour même" },
];

export const USD_TO_CDF = 2850;

export interface Product {
  id: string;
  title: string;
  category: MarketCategory;
  priceUsd: number;
  commune: KinshasaCommune;
  sellerName: string;
  sellerWhatsapp: string;
  sellerVerified: boolean;
  description: string;
  variants: string[];
  stock: number;
  imageUrl: string;
  promoted: boolean;
  createdAt: string;
}

export interface CartItem {
  product: Product;
  variant: string;
  quantity: number;
}

export type OrderStatus =
  | "Confirmée"
  | "Préparation vendeur"
  | "En livraison Kinshasa"
  | "Livrée";

export type PaymentMethod =
  | "Paiement à la livraison (Cash)"
  | "Mobile Money (M-Pesa / Airtel / Orange)"
  | "Carte bancaire";

export interface OrderItemSummary {
  productId: string;
  title: string;
  variant: string;
  quantity: number;
  unitPriceUsd: number;
  sellerName: string;
}

export interface Order {
  id: string;
  customerName: string;
  customerPhone: string;
  commune: KinshasaCommune;
  addressNote: string;
  paymentMethod: PaymentMethod;
  items: OrderItemSummary[];
  subtotalUsd: number;
  deliveryFeeUsd: number;
  commissionUsd: number;
  totalUsd: number;
  status: OrderStatus;
  createdAt: string;
}

export type SellerPlanId = "starter" | "pro" | "boutique";

export interface SellerPlan {
  id: SellerPlanId;
  name: string;
  monthlyUsd: number;
  commissionPct: number;
  description: string;
  perks: string[];
}

export interface MarketplaceMetrics {
  grossSalesUsd: number;
  commissionEarnedUsd: number;
  deliveryFeesUsd: number;
  adRevenueUsd: number;
  ordersCount: number;
}

export interface MarketBootstrapPayload {
  products: Product[];
  orders: Order[];
  sellerPlanId: SellerPlanId;
  sellerPlans: SellerPlan[];
  metrics: MarketplaceMetrics;
}

export type MarketTab = "catalog" | "orders" | "seller";
