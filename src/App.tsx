import { useEffect, useMemo, useState } from "react";
import {
  MapPin,
  Package,
  Search,
  ShoppingBag,
  Store,
  Tag,
} from "lucide-react";
import { CartDrawer } from "./components/market/CartDrawer";
import { OrdersView } from "./components/market/OrdersView";
import { ProductCard } from "./components/market/ProductCard";
import { ProductDetailModal } from "./components/market/ProductDetailModal";
import { SellerHubView } from "./components/market/SellerHubView";
import {
  COMMUNE_DELIVERY,
  MARKET_CATEGORIES,
  type CartItem,
  type KinshasaCommune,
  type MarketBootstrapPayload,
  type MarketCategory,
  type MarketTab,
  type Order,
  type PaymentMethod,
  type Product,
  type SellerPlanId,
} from "./types/market";
import {
  advanceOrderStatusApi,
  createOrderApi,
  fetchMarketBootstrap,
  publishProductApi,
  togglePromoteProductApi,
  updateSellerPlanApi,
} from "./utils/marketApi";

const HERO_IMAGE = "/src/assets/images/jm_hero_kinshasa_fashion_1794673901267.jpg";

export function App() {
  const [data, setData] = useState<MarketBootstrapPayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [activeTab, setActiveTab] = useState<MarketTab>("catalog");
  const [selectedCategory, setSelectedCategory] = useState<"Tout" | MarketCategory>("Tout");
  const [selectedCommune, setSelectedCommune] = useState<"Toutes" | KinshasaCommune>("Toutes");
  const [searchQuery, setSearchQuery] = useState("");

  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const loadMarket = async () => {
    try {
      setError(null);
      const res = await fetchMarketBootstrap();
      setData(res);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur de chargement du marché.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadMarket();
  }, []);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    window.setTimeout(() => setToastMsg((cur) => (cur === msg ? null : cur)), 2400);
  };

  const addToCart = (product: Product, variant?: string) => {
    const chosenVariant = variant || product.variants[0] || "Standard";
    setCart((prev) => {
      const existing = prev.find(
        (i) => i.product.id === product.id && i.variant === chosenVariant,
      );
      if (existing) {
        return prev.map((i) =>
          i.product.id === product.id && i.variant === chosenVariant
            ? { ...i, quantity: Math.min(product.stock, i.quantity + 1) }
            : i,
        );
      }
      return [...prev, { product, variant: chosenVariant, quantity: 1 }];
    });
    showToast(`Ajouté au panier : ${product.title}`);
  };

  const updateCartQty = (productId: string, variant: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((i) =>
          i.product.id === productId && i.variant === variant
            ? { ...i, quantity: i.quantity + delta }
            : i,
        )
        .filter((i) => i.quantity > 0),
    );
  };

  const removeCartItem = (productId: string, variant: string) => {
    setCart((prev) =>
      prev.filter((i) => !(i.product.id === productId && i.variant === variant)),
    );
  };

  const handleCheckout = async (payload: {
    customerName: string;
    customerPhone: string;
    commune: KinshasaCommune;
    addressNote: string;
    paymentMethod: PaymentMethod;
  }): Promise<Order> => {
    const res = await createOrderApi({
      ...payload,
      items: cart.map((i) => ({
        productId: i.product.id,
        variant: i.variant,
        quantity: i.quantity,
      })),
    });
    setData(res.bootstrap);
    setCart([]);
    return res.order;
  };

  const handleAdvanceOrder = async (orderId: string) => {
    const updated = await advanceOrderStatusApi(orderId);
    setData(updated);
    showToast("Statut de livraison mis à jour.");
  };

  const handlePublishProduct = async (payload: {
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
  }) => {
    const updated = await publishProductApi(payload);
    setData(updated);
  };

  const handleTogglePromote = async (productId: string) => {
    const updated = await togglePromoteProductApi(productId);
    setData(updated);
    showToast("Mise en avant mise à jour.");
  };

  const handleSelectPlan = async (planId: SellerPlanId) => {
    const updated = await updateSellerPlanApi(planId);
    setData(updated);
    showToast("Formule vendeur mise à jour.");
  };

  const filteredProducts = useMemo(() => {
    if (!data) return [];
    const q = searchQuery.trim().toLowerCase();
    return data.products.filter((p) => {
      if (selectedCategory !== "Tout" && p.category !== selectedCategory) return false;
      if (selectedCommune !== "Toutes" && p.commune !== selectedCommune) return false;
      if (
        q &&
        !p.title.toLowerCase().includes(q) &&
        !p.sellerName.toLowerCase().includes(q) &&
        !p.commune.toLowerCase().includes(q)
      ) {
        return false;
      }
      return true;
    });
  }, [data, selectedCategory, selectedCommune, searchQuery]);

  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F7F6F3] p-6">
        <div className="text-center">
          <div className="font-display text-xl font-bold text-[#14171A]">JOYCE MARKET 243</div>
          <p className="text-sm text-[#6B675E] mt-1">Chargement des boutiques de Kinshasa...</p>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F7F6F3] p-6">
        <div className="bg-white border border-black/10 rounded-2xl p-6 max-w-md text-center">
          <h1 className="text-lg font-bold text-[#14171A]">Connexion interrompue</h1>
          <p className="text-sm text-[#6B675E] mt-1 mb-4">{error}</p>
          <button
            type="button"
            onClick={() => void loadMarket()}
            className="min-h-[44px] px-6 py-2.5 rounded-xl bg-[#0D5C3E] text-white text-sm font-semibold cursor-pointer"
          >
            Réessayer
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F7F6F3] text-[#14171A] pb-24 md:pb-12">
      {/* Three-Zone Top Bar (Desktop) & Compact 52px Bar (Mobile) */}
      <header className="sticky top-0 z-30 bg-[#F7F6F3]/92 backdrop-blur-md border-b border-black/8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-[52px] md:h-16 flex items-center justify-between gap-8">
          {/* Zone 1: Single-element wordmark */}
          <button
            type="button"
            onClick={() => {
              setActiveTab("catalog");
              setSelectedCategory("Tout");
            }}
            className="font-display text-base sm:text-lg font-extrabold tracking-tight text-[#14171A] whitespace-nowrap shrink-0 cursor-pointer"
          >
            JOYCE MARKET 243
          </button>

          {/* Zone 2: 4 concise single-line nav links */}
          <nav
            aria-label="Navigation principale"
            className="hidden md:flex items-center gap-7 text-sm font-semibold"
          >
            <button
              type="button"
              onClick={() => {
                setActiveTab("catalog");
                setSelectedCategory("Tout");
              }}
              className={`py-1 whitespace-nowrap shrink-0 cursor-pointer border-b-2 transition-colors ${
                activeTab === "catalog" && selectedCategory === "Tout"
                  ? "text-[#14171A] border-[#14171A]"
                  : "text-[#6B675E] border-transparent hover:text-[#14171A]"
              }`}
            >
              Catalogue
            </button>
            <button
              type="button"
              onClick={() => {
                setActiveTab("catalog");
                setSelectedCategory("Vêtements & Chaussures");
              }}
              className={`py-1 whitespace-nowrap shrink-0 cursor-pointer border-b-2 transition-colors ${
                activeTab === "catalog" && selectedCategory === "Vêtements & Chaussures"
                  ? "text-[#14171A] border-[#14171A]"
                  : "text-[#6B675E] border-transparent hover:text-[#14171A]"
              }`}
            >
              Vêtements
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("orders")}
              className={`py-1 whitespace-nowrap shrink-0 cursor-pointer border-b-2 transition-colors ${
                activeTab === "orders"
                  ? "text-[#14171A] border-[#14171A]"
                  : "text-[#6B675E] border-transparent hover:text-[#14171A]"
              }`}
            >
              Commandes
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("seller")}
              className={`py-1 whitespace-nowrap shrink-0 cursor-pointer border-b-2 transition-colors ${
                activeTab === "seller"
                  ? "text-[#14171A] border-[#14171A]"
                  : "text-[#6B675E] border-transparent hover:text-[#14171A]"
              }`}
            >
              Espace Vendeur
            </button>
          </nav>

          {/* Zone 3: 1 Primary Action */}
          <div className="flex items-center shrink-0">
            <button
              type="button"
              onClick={() => setCartOpen(true)}
              className="min-h-[40px] px-4 py-2 rounded-xl bg-[#14171A] hover:bg-[#0D5C3E] text-white text-xs sm:text-sm font-semibold flex items-center gap-2 whitespace-nowrap shrink-0 cursor-pointer transition-colors"
            >
              <ShoppingBag className="w-4 h-4" />
              <span className="font-mono tabular-nums">Panier ({cartCount})</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 pt-5 sm:pt-8 flex flex-col gap-8">
        {activeTab === "catalog" && (
          <>
            {/* Storefront Hero Split */}
            <section className="grid grid-cols-1 lg:grid-cols-12 gap-5 lg:gap-6 items-stretch">
              <div className="lg:col-span-6 bg-white border border-black/8 rounded-3xl p-6 sm:p-8 flex flex-col justify-between gap-6">
                <div>
                  <div className="text-xs font-medium text-[#6B675E] mb-2">
                    Kinshasa, RDC · Paiement à la livraison · WhatsApp direct
                  </div>
                  <h1 className="text-3xl sm:text-4xl lg:text-[2.65rem] font-extrabold text-[#14171A] leading-[1.1] tracking-tight text-balance">
                    Achetez et vendez facilement dans chaque commune de Kinshasa.
                  </h1>
                  <p className="text-sm sm:text-base text-[#525860] leading-relaxed mt-3 max-w-lg">
                    Démarrez avec notre sélection Vêtements &amp; Chaussures ou explorez les
                    boutiques vérifiées de Gombe, Kalamu, Ngaliema et Limete.
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setSelectedCategory("Vêtements & Chaussures")}
                    className="min-h-[48px] px-6 py-3 rounded-xl bg-[#0D5C3E] hover:bg-[#094730] text-white font-semibold text-sm sm:text-base whitespace-nowrap shrink-0 cursor-pointer transition-colors"
                  >
                    Explorer Vêtements &amp; Chaussures
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab("seller")}
                    className="min-h-[48px] px-5 py-3 rounded-xl border border-black/12 bg-[#F7F6F3] hover:bg-[#ECEAE3] text-[#14171A] font-semibold text-sm whitespace-nowrap shrink-0 cursor-pointer transition-colors"
                  >
                    Vendre un produit
                  </button>
                </div>
              </div>

              <div className="lg:col-span-6 rounded-3xl overflow-hidden border border-black/8 min-h-[220px] sm:min-h-[280px] bg-[#EFECE6]">
                <img
                  src={HERO_IMAGE}
                  alt="Showroom mode et accessoires JOYCE MARKET 243 à Kinshasa"
                  referrerPolicy="no-referrer"
                  className="w-full h-full lg:h-full object-cover block"
                />
              </div>
            </section>

            {/* Search by Commune + Category Filters + Catalog Grid */}
            <section aria-label="Catalogue des produits" className="flex flex-col gap-5">
              {/* Search & Commune Bar */}
              <div className="bg-white border border-black/8 rounded-2xl p-3 sm:p-4 grid grid-cols-1 md:grid-cols-12 gap-3">
                <div className="md:col-span-7 relative">
                  <Search className="w-4 h-4 text-[#6B675E] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="search"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Rechercher un vêtement, téléphone, boutique..."
                    className="w-full min-h-[44px] pl-10 pr-4 rounded-xl border border-black/12 text-sm focus:outline-2 focus:outline-[#0D5C3E]"
                  />
                </div>

                <div className="md:col-span-5 relative">
                  <MapPin className="w-4 h-4 text-[#0D5C3E] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <select
                    aria-label="Filtrer par commune de Kinshasa"
                    value={selectedCommune}
                    onChange={(e) =>
                      setSelectedCommune(e.target.value as "Toutes" | KinshasaCommune)
                    }
                    className="w-full min-h-[44px] pl-10 pr-4 rounded-xl border border-black/12 text-sm bg-white focus:outline-2 focus:outline-[#0D5C3E]"
                  >
                    <option value="Toutes">Toutes les communes de Kinshasa</option>
                    {COMMUNE_DELIVERY.map((c) => (
                      <option key={c.name} value={c.name}>
                        {c.name} (Livraison ${c.feeUsd})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Category Segmented Filter */}
              <div className="flex items-center gap-2 overflow-x-auto pb-1">
                <button
                  type="button"
                  onClick={() => setSelectedCategory("Tout")}
                  className={`min-h-[40px] px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap shrink-0 border cursor-pointer transition-colors ${
                    selectedCategory === "Tout"
                      ? "bg-[#14171A] text-white border-[#14171A]"
                      : "bg-white text-[#525860] border-black/10 hover:text-[#14171A]"
                  }`}
                >
                  Tout voir ({data.products.length})
                </button>
                {MARKET_CATEGORIES.map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setSelectedCategory(cat)}
                    className={`min-h-[40px] px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap shrink-0 border cursor-pointer transition-colors ${
                      selectedCategory === cat
                        ? "bg-[#14171A] text-white border-[#14171A]"
                        : "bg-white text-[#525860] border-black/10 hover:text-[#14171A]"
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              {/* Product Grid */}
              {filteredProducts.length === 0 ? (
                <div className="bg-white border border-black/10 rounded-2xl p-10 text-center flex flex-col items-center gap-3">
                  <p className="text-sm text-[#525860]">
                    Aucun produit trouvé pour cette commune ou catégorie.
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedCategory("Tout");
                      setSelectedCommune("Toutes");
                      setSearchQuery("");
                    }}
                    className="min-h-[42px] px-4 py-2 rounded-xl bg-[#14171A] text-white text-xs font-semibold cursor-pointer"
                  >
                    Réinitialiser les filtres
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredProducts.map((product) => (
                    <ProductCard
                      key={product.id}
                      product={product}
                      onSelect={(p) => setSelectedProduct(p)}
                      onQuickAdd={(p) => addToCart(p)}
                    />
                  ))}
                </div>
              )}
            </section>

            {/* Clean Footer */}
            <footer className="border-t border-black/8 pt-6 pb-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-[#6B675E]">
              <div>
                JOYCE MARKET 243 · Kinshasa, RDC · Paiement à la livraison, Mobile Money &amp;
                contact WhatsApp direct.
              </div>
              <button
                type="button"
                onClick={() => setActiveTab("seller")}
                className="text-left sm:text-right font-semibold text-[#14171A] hover:underline cursor-pointer"
              >
                Ouvrir votre boutique vendeur
              </button>
            </footer>
          </>
        )}

        {activeTab === "orders" && (
          <OrdersView orders={data.orders} onAdvanceStatus={handleAdvanceOrder} />
        )}

        {activeTab === "seller" && (
          <SellerHubView
            products={data.products}
            sellerPlanId={data.sellerPlanId}
            sellerPlans={data.sellerPlans}
            metrics={data.metrics}
            onPublishProduct={handlePublishProduct}
            onTogglePromote={handleTogglePromote}
            onSelectPlan={handleSelectPlan}
          />
        )}
      </main>

      {/* Fixed Bottom Thumb Navigation Bar (Mobile Android Ergonomics) */}
      <nav
        aria-label="Menu mobile"
        className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-black/10"
      >
        <div className="grid grid-cols-4 h-[60px] items-center">
          <button
            type="button"
            onClick={() => setActiveTab("catalog")}
            className={`h-full flex flex-col items-center justify-center gap-0.5 cursor-pointer ${
              activeTab === "catalog" ? "text-[#0D5C3E]" : "text-[#6B675E]"
            }`}
          >
            <Tag className="w-5 h-5" />
            <span className="text-[11px] font-semibold">Catalogue</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("orders")}
            className={`h-full flex flex-col items-center justify-center gap-0.5 cursor-pointer ${
              activeTab === "orders" ? "text-[#0D5C3E]" : "text-[#6B675E]"
            }`}
          >
            <Package className="w-5 h-5" />
            <span className="text-[11px] font-semibold">Commandes</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("seller")}
            className={`h-full flex flex-col items-center justify-center gap-0.5 cursor-pointer ${
              activeTab === "seller" ? "text-[#0D5C3E]" : "text-[#6B675E]"
            }`}
          >
            <Store className="w-5 h-5" />
            <span className="text-[11px] font-semibold">Vendre</span>
          </button>

          <button
            type="button"
            onClick={() => setCartOpen(true)}
            className="h-full flex flex-col items-center justify-center gap-0.5 cursor-pointer text-[#14171A]"
          >
            <ShoppingBag className="w-5 h-5" />
            <span className="text-[11px] font-semibold font-mono tabular-nums">
              Panier ({cartCount})
            </span>
          </button>
        </div>
      </nav>

      {/* Non-blocking Cart Toast */}
      {toastMsg && (
        <div
          role="status"
          aria-live="polite"
          className="fixed bottom-20 md:bottom-6 left-1/2 -translate-x-1/2 z-40 bg-[#14171A] text-white px-4 py-2.5 rounded-xl text-xs sm:text-sm font-medium shadow-lg whitespace-nowrap"
        >
          {toastMsg}
        </div>
      )}

      {/* Product Detail Modal */}
      {selectedProduct && (
        <ProductDetailModal
          product={selectedProduct}
          onAddToCart={addToCart}
          onClose={() => setSelectedProduct(null)}
        />
      )}

      {/* Cart & Checkout Drawer */}
      {cartOpen && (
        <CartDrawer
          items={cart}
          onUpdateQty={updateCartQty}
          onRemoveItem={removeCartItem}
          onCheckout={handleCheckout}
          onGoToOrders={() => setActiveTab("orders")}
          onClose={() => setCartOpen(false)}
        />
      )}
    </div>
  );
}

export default App;
