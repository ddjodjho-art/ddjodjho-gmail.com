import fs from "node:fs";
import path from "node:path";
import {
  COMMUNE_DELIVERY,
  type KinshasaCommune,
  type MarketBootstrapPayload,
  type MarketCategory,
  type MarketplaceMetrics,
  type Order,
  type OrderStatus,
  type PaymentMethod,
  type Product,
  type SellerPlan,
  type SellerPlanId,
} from "./types/market";

export const SELLER_PLANS: SellerPlan[] = [
  {
    id: "starter",
    name: "Starter Vendeur",
    monthlyUsd: 0,
    commissionPct: 8,
    description: "Idéal pour lancer votre boutique de vêtements à Kinshasa sans frais fixes.",
    perks: [
      "Jusqu'à 10 produits publiés",
      "Lien direct WhatsApp client",
      "Commission de 8% par vente",
    ],
  },
  {
    id: "pro",
    name: "Joyce Pro",
    monthlyUsd: 15,
    commissionPct: 4,
    description: "Pour les vendeurs réguliers qui veulent réduire leurs commissions de moitié.",
    perks: [
      "Produits illimités multi-catégories",
      "Commission réduite à 4%",
      "1 mise en avant sponsorisée incluse/mois",
    ],
  },
  {
    id: "boutique",
    name: "Boutique 243",
    monthlyUsd: 35,
    commissionPct: 2,
    description: "Conçu pour les showrooms de Gombe, Kalamu et Limete à fort volume.",
    perks: [
      "Commission minimale de 2%",
      "Badge Vendeur Vérifié prioritaire",
      "3 mises en avant sponsorisées incluses/mois",
    ],
  },
];

const INITIAL_PRODUCTS: Product[] = [
  {
    id: "prod_chemise_lin",
    title: "Chemise Lin Terracotta & Sandales Cuir",
    category: "Vêtements & Chaussures",
    priceUsd: 38,
    commune: "Gombe",
    sellerName: "Atelier Gombe Style",
    sellerWhatsapp: "243810450112",
    sellerVerified: true,
    description:
      "Chemise légère en lin respirant adaptée au climat de Kinshasa, coupe urbaine soignée avec sandales artisanales en cuir brun.",
    variants: ["M", "L", "XL"],
    stock: 14,
    imageUrl: "/src/assets/images/jm_prod_chemise_lin_1794673902850.jpg",
    promoted: true,
    createdAt: "2026-11-12T09:00:00Z",
  },
  {
    id: "prod_sneakers_urbain",
    title: "Baskets Cuir Émeraude & Crème",
    category: "Vêtements & Chaussures",
    priceUsd: 46,
    commune: "Kalamu",
    sellerName: "Matonge Shoes Studio",
    sellerVerified: true,
    sellerWhatsapp: "243820118904",
    description:
      "Baskets basses en cuir souple semelle cousue, finitions vert forêt et blanc cassé pour un style quotidien élégant.",
    variants: ["40", "41", "42", "43", "44"],
    stock: 11,
    imageUrl: "/src/assets/images/jm_prod_sneakers_urbain_1794673903455.jpg",
    promoted: true,
    createdAt: "2026-11-12T10:30:00Z",
  },
  {
    id: "prod_ensemble_kuba",
    title: "Ensemble Tailleur & Robe Motifs Géométriques",
    category: "Vêtements & Chaussures",
    priceUsd: 58,
    commune: "Ngaliema",
    sellerName: "Maison Joyce Couture",
    sellerWhatsapp: "243890334210",
    sellerVerified: true,
    description:
      "Veste cintrée et robe midi assortie aux motifs géométriques contemporains inspirés du patrimoine congolais.",
    variants: ["S", "M", "L"],
    stock: 7,
    imageUrl: "/src/assets/images/jm_prod_robe_wax_1794673903686.jpg",
    promoted: false,
    createdAt: "2026-11-12T12:00:00Z",
  },
  {
    id: "prod_sac_cuir",
    title: "Sac Cabas Cognac & Pochette Raphia",
    category: "Sacs & Accessoires",
    priceUsd: 42,
    commune: "Gombe",
    sellerName: "Kintambo Maroquinerie",
    sellerWhatsapp: "243840992101",
    sellerVerified: true,
    description:
      "Duo élégant comprenant un sac structuré en cuir cognac avec bandoulière et une pochette tressée à chevrons.",
    variants: ["Cognac + Pochette", "Sac Seul"],
    stock: 9,
    imageUrl: "/src/assets/images/jm_prod_sac_cuir_1794673904412.jpg",
    promoted: false,
    createdAt: "2026-11-13T08:15:00Z",
  },
  {
    id: "prod_smartphone_kit",
    title: "Pack Smartphone 128 Go + Écouteurs Sans Fil",
    category: "Téléphones & Accessoires",
    priceUsd: 195,
    commune: "Limete",
    sellerName: "Limete Connect 243",
    sellerWhatsapp: "243851223344",
    sellerVerified: true,
    description:
      "Téléphone neuf débloqué tous réseaux RDC (128 Go, double SIM) livré avec boîtier d'écouteurs sans fil et câble tressé USB-C.",
    variants: ["128 Go Noir", "256 Go Noir"],
    stock: 6,
    imageUrl: "/src/assets/images/jm_prod_smartphone_kit_1794673905000.jpg",
    promoted: false,
    createdAt: "2026-11-13T09:40:00Z",
  },
  {
    id: "prod_beaute_serum",
    title: "Sérum Éclat Botanique & Crème Karité",
    category: "Beauté & Cosmétiques",
    priceUsd: 24,
    commune: "Bandalungwa",
    sellerName: "Bandal Glow Naturel",
    sellerWhatsapp: "243990778811",
    sellerVerified: true,
    description:
      "Soin visage concentré en flacon ambré accompagné d'une crème hydratante au beurre de karité pur non raffiné.",
    variants: ["Duo Complet", "Sérum 30ml"],
    stock: 22,
    imageUrl: "/src/assets/images/jm_prod_beaute_serum_1794673904860.jpg",
    promoted: false,
    createdAt: "2026-11-13T11:20:00Z",
  },
  {
    id: "prod_maison_cafe",
    title: "Bouilloire Design & Tasses Céramique",
    category: "Articles Maison",
    priceUsd: 52,
    commune: "Lemba",
    sellerName: "Maison Lemba Déco",
    sellerWhatsapp: "243817665544",
    sellerVerified: false,
    description:
      "Bouilloire électrique noir mat à poignée bois avec deux tasses en grès artisanal et dessous de plat tressé.",
    variants: ["Noir Mat 1.2L"],
    stock: 8,
    imageUrl: "/src/assets/images/jm_prod_maison_cafe_1794673905086.jpg",
    promoted: false,
    createdAt: "2026-11-13T14:00:00Z",
  },
  {
    id: "prod_cafe_kivu",
    title: "Coffret Café Arabica du Kivu (2×250g) & Tasses",
    category: "Alimentation",
    priceUsd: 22,
    commune: "Gombe",
    sellerName: "Saveurs du Fleuve",
    sellerWhatsapp: "243823009911",
    sellerVerified: true,
    description:
      "Café moulu ou en grains récolté sur les hauts plateaux du Kivu, torréfaction moyenne aromatique livré frais à Kinshasa.",
    variants: ["Moulu (500g)", "Grains (500g)"],
    stock: 30,
    imageUrl: "/src/assets/images/jm_prod_maison_cafe_1794673905086.jpg",
    promoted: false,
    createdAt: "2026-11-13T15:10:00Z",
  },
];

const INITIAL_ORDERS: Order[] = [
  {
    id: "JM243-8412",
    customerName: "Chancelvie M.",
    customerPhone: "+243 812 345 678",
    commune: "Kalamu",
    addressNote: "Avenue Victoire, près du rond-point",
    paymentMethod: "Paiement à la livraison (Cash)",
    items: [
      {
        productId: "prod_chemise_lin",
        title: "Chemise Lin Terracotta & Sandales Cuir",
        variant: "L",
        quantity: 1,
        unitPriceUsd: 38,
        sellerName: "Atelier Gombe Style",
      },
    ],
    subtotalUsd: 38,
    deliveryFeeUsd: 2,
    commissionUsd: 1.9,
    totalUsd: 40,
    status: "En livraison Kinshasa",
    createdAt: "2026-11-14T07:20:00Z",
  },
];

interface JoyceDatabase {
  products: Product[];
  orders: Order[];
  sellerPlanId: SellerPlanId;
  adRevenueUsd: number;
}

const ORDER_FLOW: OrderStatus[] = [
  "Confirmée",
  "Préparation vendeur",
  "En livraison Kinshasa",
  "Livrée",
];

export class JoyceMarketStore {
  private dbPath: string;
  private db: JoyceDatabase;

  constructor(dataDir: string) {
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
    this.dbPath = path.join(dataDir, "joyce_market_db.json");
    this.db = this.load();
  }

  private load(): JoyceDatabase {
    try {
      if (fs.existsSync(this.dbPath)) {
        const raw = fs.readFileSync(this.dbPath, "utf8");
        const parsed = JSON.parse(raw) as Partial<JoyceDatabase>;
        return {
          products: parsed.products?.length ? parsed.products : [...INITIAL_PRODUCTS],
          orders: parsed.orders ?? [...INITIAL_ORDERS],
          sellerPlanId: parsed.sellerPlanId ?? "pro",
          adRevenueUsd: parsed.adRevenueUsd ?? 10,
        };
      }
    } catch {
      // Fallback to seeded catalog
    }
    return {
      products: [...INITIAL_PRODUCTS],
      orders: [...INITIAL_ORDERS],
      sellerPlanId: "pro",
      adRevenueUsd: 10,
    };
  }

  private save() {
    fs.writeFileSync(this.dbPath, JSON.stringify(this.db, null, 2), "utf8");
  }

  private computeMetrics(): MarketplaceMetrics {
    const grossSalesUsd = this.db.orders.reduce((acc, o) => acc + o.subtotalUsd, 0);
    const commissionEarnedUsd = Number(
      this.db.orders.reduce((acc, o) => acc + o.commissionUsd, 0).toFixed(2),
    );
    const deliveryFeesUsd = this.db.orders.reduce((acc, o) => acc + o.deliveryFeeUsd, 0);
    return {
      grossSalesUsd,
      commissionEarnedUsd,
      deliveryFeesUsd,
      adRevenueUsd: this.db.adRevenueUsd,
      ordersCount: this.db.orders.length,
    };
  }

  getBootstrap(): MarketBootstrapPayload {
    const sortedProducts = [...this.db.products].sort((a, b) => {
      if (a.promoted !== b.promoted) return a.promoted ? -1 : 1;
      return b.createdAt.localeCompare(a.createdAt);
    });

    return {
      products: sortedProducts,
      orders: [...this.db.orders].sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
      sellerPlanId: this.db.sellerPlanId,
      sellerPlans: SELLER_PLANS,
      metrics: this.computeMetrics(),
    };
  }

  createOrder(payload: {
    customerName: string;
    customerPhone: string;
    commune: KinshasaCommune;
    addressNote: string;
    paymentMethod: PaymentMethod;
    items: { productId: string; variant: string; quantity: number }[];
  }): { order: Order; bootstrap: MarketBootstrapPayload } {
    const customerName = (payload.customerName || "").trim().slice(0, 60);
    const customerPhone = (payload.customerPhone || "").trim().slice(0, 30);
    if (customerName.length < 2 || customerPhone.length < 6) {
      throw new Error("Veuillez saisir votre nom et numéro de téléphone Kinshasa.");
    }
    if (!Array.isArray(payload.items) || payload.items.length === 0) {
      throw new Error("Votre panier est vide.");
    }

    const orderItems = payload.items.map((reqItem) => {
      const product = this.db.products.find((p) => p.id === reqItem.productId);
      if (!product) throw new Error("Un article du panier n'existe plus.");
      const qty = Math.max(1, Math.min(product.stock, Math.round(reqItem.quantity || 1)));
      product.stock = Math.max(0, product.stock - qty);
      return {
        productId: product.id,
        title: product.title,
        variant: reqItem.variant || product.variants[0] || "Standard",
        quantity: qty,
        unitPriceUsd: product.priceUsd,
        sellerName: product.sellerName,
      };
    });

    const subtotalUsd = orderItems.reduce((sum, i) => sum + i.unitPriceUsd * i.quantity, 0);
    const communeInfo =
      COMMUNE_DELIVERY.find((c) => c.name === payload.commune) ?? COMMUNE_DELIVERY[0];
    const deliveryFeeUsd = subtotalUsd >= 120 ? 0 : communeInfo.feeUsd;

    const activePlan =
      SELLER_PLANS.find((p) => p.id === this.db.sellerPlanId) ?? SELLER_PLANS[0];
    const commissionUsd = Number(((subtotalUsd * activePlan.commissionPct) / 100).toFixed(2));
    const totalUsd = Number((subtotalUsd + deliveryFeeUsd).toFixed(2));

    const order: Order = {
      id: `JM243-${Math.floor(1000 + Math.random() * 9000)}`,
      customerName,
      customerPhone,
      commune: communeInfo.name,
      addressNote: (payload.addressNote || "").trim().slice(0, 140) || "Livraison standard",
      paymentMethod: payload.paymentMethod || "Paiement à la livraison (Cash)",
      items: orderItems,
      subtotalUsd,
      deliveryFeeUsd,
      commissionUsd,
      totalUsd,
      status: "Confirmée",
      createdAt: new Date().toISOString(),
    };

    this.db.orders.unshift(order);
    this.save();
    return { order, bootstrap: this.getBootstrap() };
  }

  advanceOrderStatus(orderId: string): MarketBootstrapPayload {
    const order = this.db.orders.find((o) => o.id === orderId);
    if (!order) throw new Error("Commande introuvable.");
    const idx = ORDER_FLOW.indexOf(order.status);
    if (idx < ORDER_FLOW.length - 1) {
      order.status = ORDER_FLOW[idx + 1];
      this.save();
    }
    return this.getBootstrap();
  }

  publishProduct(payload: {
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
  }): MarketBootstrapPayload {
    const title = (payload.title || "").trim().slice(0, 75);
    const sellerName = (payload.sellerName || "").trim().slice(0, 50);
    const whatsappClean = (payload.sellerWhatsapp || "").replace(/[^\d]/g, "").slice(0, 15);
    const priceUsd = Number(payload.priceUsd);

    if (title.length < 3 || sellerName.length < 2) {
      throw new Error("Nom du produit et nom de la boutique requis.");
    }
    if (!Number.isFinite(priceUsd) || priceUsd < 1 || priceUsd > 5000) {
      throw new Error("Prix invalide (entre 1$ et 5000$).");
    }

    const variants = (payload.variantsText || "Standard")
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean)
      .slice(0, 6);

    const newProduct: Product = {
      id: `prod_${Date.now().toString(36)}`,
      title,
      category: payload.category || "Vêtements & Chaussures",
      priceUsd: Math.round(priceUsd),
      commune: payload.commune || "Gombe",
      sellerName,
      sellerWhatsapp: whatsappClean || "243810000243",
      sellerVerified: this.db.sellerPlanId !== "starter",
      description:
        (payload.description || "").trim().slice(0, 260) ||
        "Article disponible immédiatement à Kinshasa avec livraison rapide.",
      variants: variants.length ? variants : ["Standard"],
      stock: 15,
      imageUrl: payload.imageUrl || INITIAL_PRODUCTS[0].imageUrl,
      promoted: Boolean(payload.promote),
      createdAt: new Date().toISOString(),
    };

    if (payload.promote) {
      this.db.adRevenueUsd += 5;
    }

    this.db.products.unshift(newProduct);
    this.save();
    return this.getBootstrap();
  }

  togglePromoteProduct(productId: string): MarketBootstrapPayload {
    const product = this.db.products.find((p) => p.id === productId);
    if (!product) throw new Error("Produit introuvable.");
    if (!product.promoted) {
      product.promoted = true;
      this.db.adRevenueUsd += 5;
    } else {
      product.promoted = false;
    }
    this.save();
    return this.getBootstrap();
  }

  updateSellerPlan(planId: SellerPlanId): MarketBootstrapPayload {
    const exists = SELLER_PLANS.some((p) => p.id === planId);
    if (!exists) throw new Error("Formule invalide.");
    this.db.sellerPlanId = planId;
    this.save();
    return this.getBootstrap();
  }
}
