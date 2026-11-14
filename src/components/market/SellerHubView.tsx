import { useState } from "react";
import { Check, Megaphone, PlusCircle, Sparkles } from "lucide-react";
import {
  COMMUNE_DELIVERY,
  MARKET_CATEGORIES,
  type KinshasaCommune,
  type MarketCategory,
  type MarketplaceMetrics,
  type Product,
  type SellerPlan,
  type SellerPlanId,
} from "../../types/market";

interface SellerHubViewProps {
  products: Product[];
  sellerPlanId: SellerPlanId;
  sellerPlans: SellerPlan[];
  metrics: MarketplaceMetrics;
  onPublishProduct: (payload: {
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
  }) => Promise<void>;
  onTogglePromote: (productId: string) => Promise<void>;
  onSelectPlan: (planId: SellerPlanId) => Promise<void>;
}

const STUDIO_IMAGES = [
  {
    label: "Chemise Lin & Sandales",
    url: "/src/assets/images/jm_prod_chemise_lin_1794673902850.jpg",
  },
  {
    label: "Baskets Cuir Urbaines",
    url: "/src/assets/images/jm_prod_sneakers_urbain_1794673903455.jpg",
  },
  {
    label: "Ensemble Tailleur & Robe",
    url: "/src/assets/images/jm_prod_robe_wax_1794673903686.jpg",
  },
  {
    label: "Sac Cuir & Raphia",
    url: "/src/assets/images/jm_prod_sac_cuir_1794673904412.jpg",
  },
  {
    label: "Smartphone & Écouteurs",
    url: "/src/assets/images/jm_prod_smartphone_kit_1794673905000.jpg",
  },
  {
    label: "Soin & Cosmétique",
    url: "/src/assets/images/jm_prod_beaute_serum_1794673904860.jpg",
  },
  {
    label: "Articles Maison & Café",
    url: "/src/assets/images/jm_prod_maison_cafe_1794673905086.jpg",
  },
];

export function SellerHubView({
  products,
  sellerPlanId,
  sellerPlans,
  metrics,
  onPublishProduct,
  onTogglePromote,
  onSelectPlan,
}: SellerHubViewProps) {
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState<MarketCategory>("Vêtements & Chaussures");
  const [priceUsd, setPriceUsd] = useState("35");
  const [commune, setCommune] = useState<KinshasaCommune>("Gombe");
  const [sellerName, setSellerName] = useState("Boutique Joyce Kin");
  const [sellerWhatsapp, setSellerWhatsapp] = useState("243810450112");
  const [variantsText, setVariantsText] = useState("S, M, L");
  const [description, setDescription] = useState("");
  const [imageUrl, setImageUrl] = useState(STUDIO_IMAGES[0].url);
  const [promote, setPromote] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  const handlePublish = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setFeedback(null);
    try {
      await onPublishProduct({
        title,
        category,
        priceUsd: Number(priceUsd),
        commune,
        sellerName,
        sellerWhatsapp,
        description,
        variantsText,
        imageUrl,
        promote,
      });
      setTitle("");
      setDescription("");
      setPromote(false);
      setFeedback("Votre produit est maintenant publié dans le catalogue Kinshasa.");
    } catch (err) {
      setFeedback(err instanceof Error ? err.message : "Erreur de publication.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h2 className="text-xl sm:text-2xl font-bold text-[#14171A]">
          Espace Vendeur &amp; Revenus JOYCE MARKET 243
        </h2>
        <p className="text-sm text-[#525860] mt-0.5">
          Publiez vos articles, suivez les commissions et boostez vos annonces dans les communes de
          Kinshasa.
        </p>
      </div>

      {/* 4-Column Monetization KPIs */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white border border-black/10 rounded-2xl p-4">
          <div className="text-xs text-[#6B675E]">Volume de ventes</div>
          <div className="text-xl sm:text-2xl font-bold font-mono tabular-nums text-[#14171A] mt-1">
            ${metrics.grossSalesUsd}
          </div>
        </div>
        <div className="bg-white border border-black/10 rounded-2xl p-4">
          <div className="text-xs text-[#6B675E]">Commissions perçues</div>
          <div className="text-xl sm:text-2xl font-bold font-mono tabular-nums text-[#0D5C3E] mt-1">
            ${metrics.commissionEarnedUsd}
          </div>
        </div>
        <div className="bg-white border border-black/10 rounded-2xl p-4">
          <div className="text-xs text-[#6B675E]">Frais livraison Kin</div>
          <div className="text-xl sm:text-2xl font-bold font-mono tabular-nums text-[#14171A] mt-1">
            ${metrics.deliveryFeesUsd}
          </div>
        </div>
        <div className="bg-white border border-black/10 rounded-2xl p-4">
          <div className="text-xs text-[#6B675E]">Revenus publicités</div>
          <div className="text-xl sm:text-2xl font-bold font-mono tabular-nums text-[#C2410C] mt-1">
            ${metrics.adRevenueUsd}
          </div>
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Publish Product Form */}
        <section className="lg:col-span-7 bg-white border border-black/10 rounded-2xl p-5 sm:p-6 flex flex-col gap-4">
          <div className="flex items-center gap-2 text-base font-bold text-[#14171A]">
            <PlusCircle className="w-5 h-5 text-[#0D5C3E]" />
            <span>Publier un nouveau produit</span>
          </div>

          {feedback && (
            <div className="bg-[#0D5C3E]/10 border border-[#0D5C3E]/25 rounded-xl p-3 text-xs sm:text-sm font-medium text-[#094730]">
              {feedback}
            </div>
          )}

          <form onSubmit={handlePublish} className="flex flex-col gap-3.5">
            <div>
              <label className="block text-xs font-semibold text-[#525860] mb-1">
                Titre de l&apos;article
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Ex : Ensemble Chemise Lin & Pantalon Coupe Droite"
                className="w-full min-h-[44px] px-3.5 rounded-xl border border-black/15 text-sm focus:outline-2 focus:outline-[#0D5C3E]"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-semibold text-[#525860] mb-1">
                  Catégorie
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as MarketCategory)}
                  className="w-full min-h-[44px] px-3 rounded-xl border border-black/15 text-sm bg-white focus:outline-2 focus:outline-[#0D5C3E]"
                >
                  {MARKET_CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#525860] mb-1">
                  Prix (USD)
                </label>
                <input
                  type="number"
                  required
                  min={1}
                  max={5000}
                  value={priceUsd}
                  onChange={(e) => setPriceUsd(e.target.value)}
                  className="w-full min-h-[44px] px-3.5 rounded-xl border border-black/15 text-sm font-mono tabular-nums focus:outline-2 focus:outline-[#0D5C3E]"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#525860] mb-1">
                  Commune vendeur
                </label>
                <select
                  value={commune}
                  onChange={(e) => setCommune(e.target.value as KinshasaCommune)}
                  className="w-full min-h-[44px] px-3 rounded-xl border border-black/15 text-sm bg-white focus:outline-2 focus:outline-[#0D5C3E]"
                >
                  {COMMUNE_DELIVERY.map((c) => (
                    <option key={c.name} value={c.name}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-[#525860] mb-1">
                  Nom de votre boutique
                </label>
                <input
                  type="text"
                  required
                  value={sellerName}
                  onChange={(e) => setSellerName(e.target.value)}
                  className="w-full min-h-[44px] px-3.5 rounded-xl border border-black/15 text-sm focus:outline-2 focus:outline-[#0D5C3E]"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#525860] mb-1">
                  Numéro WhatsApp (format 243...)
                </label>
                <input
                  type="text"
                  required
                  value={sellerWhatsapp}
                  onChange={(e) => setSellerWhatsapp(e.target.value)}
                  className="w-full min-h-[44px] px-3.5 rounded-xl border border-black/15 text-sm font-mono focus:outline-2 focus:outline-[#0D5C3E]"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-[#525860] mb-1">
                  Tailles / Variantes (séparées par virgule)
                </label>
                <input
                  type="text"
                  value={variantsText}
                  onChange={(e) => setVariantsText(e.target.value)}
                  placeholder="S, M, L, XL"
                  className="w-full min-h-[44px] px-3.5 rounded-xl border border-black/15 text-sm focus:outline-2 focus:outline-[#0D5C3E]"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#525860] mb-1">
                  Visuel studio
                </label>
                <select
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  className="w-full min-h-[44px] px-3 rounded-xl border border-black/15 text-sm bg-white focus:outline-2 focus:outline-[#0D5C3E]"
                >
                  {STUDIO_IMAGES.map((img) => (
                    <option key={img.url} value={img.url}>
                      {img.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#525860] mb-1">
                Description courte
              </label>
              <textarea
                rows={2}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Matière, état neuf, livraison possible le jour même..."
                className="w-full p-3 rounded-xl border border-black/15 text-sm focus:outline-2 focus:outline-[#0D5C3E]"
              />
            </div>

            <label className="flex items-center gap-3 p-3.5 rounded-xl bg-[#F7F6F3] border border-black/8 cursor-pointer">
              <input
                type="checkbox"
                checked={promote}
                onChange={(e) => setPromote(e.target.checked)}
                className="w-4 h-4 accent-[#C2410C]"
              />
              <div className="text-xs sm:text-sm">
                <span className="font-semibold text-[#14171A]">
                  Mettre ce produit en avant (Publicité payante +$5)
                </span>
                <span className="block text-[#525860]">
                  Place votre article tout en haut du catalogue pour attirer plus d&apos;acheteurs.
                </span>
              </div>
            </label>

            <button
              type="submit"
              disabled={submitting}
              className="min-h-[48px] px-5 py-3 rounded-xl bg-[#0D5C3E] hover:bg-[#094730] text-white font-semibold text-sm cursor-pointer transition-colors disabled:opacity-60"
            >
              {submitting ? "Publication..." : "Publier sur JOYCE MARKET 243"}
            </button>
          </form>
        </section>

        {/* Seller Subscription Plans */}
        <section className="lg:col-span-5 flex flex-col gap-4">
          <div className="bg-white border border-black/10 rounded-2xl p-5 flex flex-col gap-3.5">
            <div className="flex items-center gap-2 text-base font-bold text-[#14171A]">
              <Sparkles className="w-5 h-5 text-[#C2410C]" />
              <span>Abonnement Vendeur</span>
            </div>

            <div className="flex flex-col gap-3">
              {sellerPlans.map((plan: SellerPlan) => {
                const active = plan.id === sellerPlanId;
                return (
                  <div
                    key={plan.id}
                    className={`rounded-xl border p-4 flex flex-col gap-2 ${
                      active ? "border-[#0D5C3E] bg-[#0D5C3E]/5" : "border-black/10 bg-[#F7F6F3]"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="font-bold text-sm text-[#14171A]">{plan.name}</div>
                      <div className="font-mono tabular-nums text-sm font-bold text-[#14171A]">
                        {plan.monthlyUsd === 0 ? "Gratuit" : `$${plan.monthlyUsd}/mois`}
                      </div>
                    </div>
                    <p className="text-xs text-[#525860]">{plan.description}</p>
                    <ul className="text-xs text-[#14171A] space-y-1">
                      {plan.perks.map((perk) => (
                        <li key={perk} className="flex items-center gap-1.5">
                          <Check className="w-3.5 h-3.5 text-[#0D5C3E] shrink-0" />
                          <span>{perk}</span>
                        </li>
                      ))}
                    </ul>
                    <button
                      type="button"
                      disabled={active}
                      onClick={() => void onSelectPlan(plan.id)}
                      className={`mt-1 min-h-[40px] rounded-xl text-xs font-semibold cursor-pointer ${
                        active
                          ? "bg-[#0D5C3E] text-white cursor-default"
                          : "bg-white border border-black/12 text-[#14171A] hover:bg-black/5"
                      }`}
                    >
                      {active ? "Formule active" : `Choisir ${plan.name}`}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Quick Promote Existing Products */}
          <div className="bg-white border border-black/10 rounded-2xl p-5 flex flex-col gap-3">
            <div className="flex items-center gap-2 text-sm font-bold text-[#14171A]">
              <Megaphone className="w-4 h-4 text-[#C2410C]" />
              <span>Publicité payante sur vos fiches</span>
            </div>
            <div className="divide-y divide-black/8 max-h-72 overflow-y-auto">
              {products.slice(0, 6).map((p) => (
                <div key={p.id} className="py-2.5 flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <div className="text-xs font-semibold text-[#14171A] truncate">{p.title}</div>
                    <div className="text-[11px] text-[#6B675E]">
                      ${p.priceUsd} · {p.commune}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => void onTogglePromote(p.id)}
                    className={`min-h-[36px] px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap shrink-0 cursor-pointer ${
                      p.promoted
                        ? "bg-[#C2410C] text-white"
                        : "border border-black/12 text-[#14171A] hover:bg-black/5"
                    }`}
                  >
                    {p.promoted ? "Sponsorisé" : "Booster ($5)"}
                  </button>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
