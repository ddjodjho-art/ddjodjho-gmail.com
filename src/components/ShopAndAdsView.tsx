import { useEffect, useState } from "react";
import { Check, Coins, Crown, Megaphone, PlayCircle, ShoppingBag } from "lucide-react";
import type { PlayerProfile, ShopItem, SponsorCampaign } from "../types/mifa";
import { sfx } from "../utils/sound";

interface ShopAndAdsViewProps {
  profile: PlayerProfile;
  shopItems: ShopItem[];
  sponsors: SponsorCampaign[];
  onBuyItem: (itemId: string) => Promise<void>;
  onEquipItem: (itemId: string) => Promise<void>;
  onClaimSponsorReward: (sponsorId: string) => Promise<void>;
  onTogglePro: () => Promise<void>;
  onSubmitInquiry: (payload: {
    companyName: string;
    contact: string;
    placement: string;
    message: string;
  }) => Promise<{ referenceId: string }>;
}

export function ShopAndAdsView({
  profile,
  shopItems,
  sponsors,
  onBuyItem,
  onEquipItem,
  onClaimSponsorReward,
  onTogglePro,
  onSubmitInquiry,
}: ShopAndAdsViewProps) {
  const [catFilter, setCatFilter] = useState<string>("Tout");
  const [feedback, setFeedback] = useState<string | null>(null);
  const [adModalSponsor, setAdModalSponsor] = useState<SponsorCampaign | null>(null);
  const [adCountdown, setAdCountdown] = useState(5);

  const [companyName, setCompanyName] = useState("");
  const [contact, setContact] = useState("");
  const [placement, setPlacement] = useState("Accueil");
  const [message, setMessage] = useState("");
  const [inquiryDone, setInquiryDone] = useState<string | null>(null);

  useEffect(() => {
    if (!adModalSponsor || adCountdown <= 0) return;
    const t = window.setTimeout(() => setAdCountdown((c) => c - 1), 1000);
    return () => window.clearTimeout(t);
  }, [adModalSponsor, adCountdown]);

  const categories = ["Tout", "Tenue", "Véhicule", "Cadre", "Booster"];
  const visibleItems =
    catFilter === "Tout" ? shopItems : shopItems.filter((i) => i.category === catFilter);

  const isEquipped = (item: ShopItem) =>
    profile.equippedItems.footballSkin === item.id ||
    profile.equippedItems.racingSkin === item.id ||
    profile.equippedItems.avatarFrame === item.id;

  const handleAction = async (fn: () => Promise<void>, successMsg: string) => {
    try {
      setFeedback(null);
      await fn();
      sfx.success();
      setFeedback(successMsg);
    } catch (err) {
      sfx.error();
      setFeedback(err instanceof Error ? err.message : "Action impossible.");
    }
  };

  const handleInquirySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setFeedback(null);
      const res = await onSubmitInquiry({ companyName, contact, placement, message });
      sfx.success();
      setInquiryDone(res.referenceId);
      setCompanyName("");
      setContact("");
      setMessage("");
    } catch (err) {
      sfx.error();
      setFeedback(err instanceof Error ? err.message : "Erreur d'envoi.");
    }
  };

  return (
    <div className="flex flex-col gap-8">
      {/* Header + Virtual Balance */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-[#14171A]">
            Boutique Virtuelle &amp; Espace Sponsors
          </h2>
          <p className="text-sm text-[#525860] mt-0.5">
            Dépensez vos Jetons MIFA gagnés en jouant — zéro mise d&apos;argent réel.
          </p>
        </div>

        <div className="bg-white border border-black/10 rounded-xl px-4 py-2.5 flex items-center gap-3 self-start">
          <Coins className="w-5 h-5 text-[#D97706]" />
          <div>
            <div className="text-[11px] text-[#525860]">Votre solde</div>
            <div className="text-base font-bold font-mono tabular-nums text-[#14171A]">
              {profile.tokens} Jetons MIFA
            </div>
          </div>
        </div>
      </div>

      {feedback && (
        <div className="bg-[#0D5C3E]/10 border border-[#0D5C3E]/25 rounded-xl px-4 py-3 text-sm font-medium text-[#094730]">
          {feedback}
        </div>
      )}

      {/* Virtual Item Shop */}
      <section className="flex flex-col gap-4">
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setCatFilter(cat)}
              className={`min-h-[38px] px-3.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap shrink-0 border transition-colors cursor-pointer ${
                catFilter === cat
                  ? "bg-[#14171A] text-white border-[#14171A]"
                  : "bg-white text-[#525860] border-black/10 hover:text-[#14171A]"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {visibleItems.map((item) => {
            const owned = !item.consumable && profile.ownedItems.includes(item.id);
            const equipped = isEquipped(item);
            const canAfford = profile.tokens >= item.priceTokens;

            return (
              <div
                key={item.id}
                className="bg-white border border-black/10 rounded-2xl p-4 flex flex-col justify-between gap-4"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center text-white"
                      style={{ backgroundColor: item.previewColor }}
                    >
                      <ShoppingBag className="w-5 h-5" />
                    </div>
                    <span className="text-xs text-[#525860]">{item.category}</span>
                  </div>
                  <h3 className="text-base font-bold text-[#14171A]">{item.name}</h3>
                  <p className="text-xs text-[#525860] mt-1 leading-relaxed">{item.description}</p>
                </div>

                <div className="pt-2 border-t border-black/8 flex items-center justify-between gap-2">
                  <span className="font-mono tabular-nums text-sm font-bold text-[#14171A]">
                    {item.priceTokens} Jetons
                  </span>

                  {owned ? (
                    <button
                      type="button"
                      onClick={() =>
                        void handleAction(
                          () => onEquipItem(item.id),
                          equipped ? `${item.name} retiré.` : `${item.name} équipé !`,
                        )
                      }
                      className={`min-h-[40px] px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-1 cursor-pointer transition-colors ${
                        equipped
                          ? "bg-[#0D5C3E] text-white"
                          : "bg-[#F6F7F4] border border-black/12 text-[#14171A] hover:bg-black/5"
                      }`}
                    >
                      {equipped && <Check className="w-3.5 h-3.5" />}
                      <span>{equipped ? "Équipé" : "Équiper"}</span>
                    </button>
                  ) : (
                    <button
                      type="button"
                      disabled={!canAfford}
                      onClick={() =>
                        void handleAction(
                          () => onBuyItem(item.id),
                          `${item.name} ajouté à votre compte !`,
                        )
                      }
                      className={`min-h-[40px] px-3.5 py-2 rounded-xl text-xs font-semibold cursor-pointer transition-colors ${
                        canAfford
                          ? "bg-[#14171A] hover:bg-black text-white"
                          : "bg-black/8 text-[#8A9199] cursor-not-allowed"
                      }`}
                    >
                      Acheter
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Monetization Pillars: Pro Pass + Rewarded Ads + Local Advertiser Form */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: MIFA Pro + Rewarded Partner Spot */}
        <div className="lg:col-span-6 flex flex-col gap-5">
          <div className="bg-[#14171A] text-white rounded-2xl p-5 sm:p-6 flex flex-col gap-4">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <Crown className="w-5 h-5 text-[#FBBF24]" />
                <h3 className="text-lg font-bold">Abonnement MIFA Pro</h3>
              </div>
              <span className="text-xs font-mono tabular-nums text-[#FBBF24]">
                {profile.isPro ? "ACTIF (APERÇU)" : "OPTIONNEL"}
              </span>
            </div>
            <p className="text-sm text-white/75 leading-relaxed">
              Modèle premium sans bannières sponsorisées entre les parties et Jetons MIFA doublés
              après chaque mini-jeu.
            </p>
            <button
              type="button"
              onClick={() =>
                void handleAction(
                  onTogglePro,
                  profile.isPro
                    ? "Mode standard réactivé."
                    : "Pass MIFA Pro activé : Jetons x2 et interface sans pub !",
                )
              }
              className="w-full min-h-[46px] rounded-xl bg-[#D97706] hover:bg-[#B45309] text-white font-semibold text-sm cursor-pointer transition-colors"
            >
              {profile.isPro ? "Désactiver l'aperçu MIFA Pro" : "Tester le Pass MIFA Pro (x2 Jetons)"}
            </button>
          </div>

          <div className="bg-white border border-black/10 rounded-2xl p-5 flex flex-col gap-3">
            <div className="flex items-center gap-2 text-base font-bold text-[#14171A]">
              <PlayCircle className="w-5 h-5 text-[#0D5C3E]" />
              <span>Spots Sponsorisés (+50 Jetons)</span>
            </div>
            <p className="text-xs text-[#525860]">
              Regardez une annonce locale pendant 5 secondes pour recevoir des jetons virtuels
              gratuits.
            </p>
            <div className="divide-y divide-black/8">
              {sponsors.map((sp) => (
                <div key={sp.id} className="py-3 flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <div className="text-sm font-semibold text-[#14171A] truncate">
                      {sp.sponsorName}
                    </div>
                    <div className="text-xs text-[#525860] truncate">
                      {sp.sector} · Emplacement {sp.placement}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setAdModalSponsor(sp);
                      setAdCountdown(5);
                    }}
                    className="min-h-[40px] px-3.5 py-2 rounded-xl bg-[#0D5C3E]/10 hover:bg-[#0D5C3E]/18 text-[#094730] text-xs font-semibold whitespace-nowrap shrink-0 cursor-pointer"
                  >
                    +50 Jetons
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right: Espace Publicitaire Entreprises (B2B Lead Capture) */}
        <div className="lg:col-span-6 bg-white border border-black/10 rounded-2xl p-5 sm:p-6 flex flex-col gap-4">
          <div className="flex items-center gap-2">
            <Megaphone className="w-5 h-5 text-[#D97706]" />
            <h3 className="text-lg font-bold text-[#14171A]">
              Espace Publicitaire Entreprises (Kinshasa)
            </h3>
          </div>
          <p className="text-sm text-[#525860]">
            Vous êtes une entreprise, boutique, restaurant ou service à Kinshasa ? Sponsorisez un
            tournoi hebdomadaire ou réservez une bannière mobile.
          </p>

          {inquiryDone && (
            <div className="bg-[#0D5C3E]/10 border border-[#0D5C3E]/30 rounded-xl p-3 text-sm text-[#094730]">
              Demande enregistrée sous la référence{" "}
              <span className="font-mono font-bold">{inquiryDone}</span>.
            </div>
          )}

          <form onSubmit={handleInquirySubmit} className="flex flex-col gap-3">
            <div>
              <label className="block text-xs font-semibold text-[#14171A] mb-1">
                Nom de l&apos;entreprise ou marque locale
              </label>
              <input
                type="text"
                required
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                placeholder="Ex : Boulangerie du Fleuve"
                className="w-full min-h-[44px] px-3.5 rounded-xl border border-black/15 text-sm focus:outline-2 focus:outline-[#0D5C3E]"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-[#14171A] mb-1">
                  Téléphone / WhatsApp / Email
                </label>
                <input
                  type="text"
                  required
                  value={contact}
                  onChange={(e) => setContact(e.target.value)}
                  placeholder="+243 ..."
                  className="w-full min-h-[44px] px-3.5 rounded-xl border border-black/15 text-sm focus:outline-2 focus:outline-[#0D5C3E]"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#14171A] mb-1">
                  Format souhaité
                </label>
                <select
                  value={placement}
                  onChange={(e) => setPlacement(e.target.value)}
                  className="w-full min-h-[44px] px-3.5 rounded-xl border border-black/15 text-sm bg-white focus:outline-2 focus:outline-[#0D5C3E]"
                >
                  <option value="Accueil">Bannière Accueil</option>
                  <option value="Tournoi">Sponsor de Tournoi</option>
                  <option value="Inter-Jeu">Spot Inter-Jeu (+Jetons)</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#14171A] mb-1">
                Objectif de campagne
              </label>
              <textarea
                rows={3}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Promouvoir une offre dans les communes de Gombe, Kalamu, Limete..."
                className="w-full p-3.5 rounded-xl border border-black/15 text-sm focus:outline-2 focus:outline-[#0D5C3E]"
              />
            </div>

            <button
              type="submit"
              className="min-h-[48px] px-5 py-3 rounded-xl bg-[#14171A] hover:bg-black text-white font-semibold text-sm cursor-pointer transition-colors"
            >
              Réserver un espace sponsor
            </button>
          </form>
        </div>
      </div>

      {/* Rewarded Ad Simulation Modal */}
      {adModalSponsor && (
        <div
          className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
        >
          <div className="w-full max-w-md bg-white rounded-3xl p-6 flex flex-col gap-4 text-center">
            <div className="text-xs font-semibold uppercase tracking-wider text-[#0D5C3E]">
              Annonce Partenaire · {adModalSponsor.sector}
            </div>
            <h3 className="text-xl font-bold text-[#14171A]">{adModalSponsor.sponsorName}</h3>
            <p className="text-sm text-[#525860] leading-relaxed">{adModalSponsor.headline}</p>

            <div className="bg-[#F6F7F4] border border-black/8 rounded-2xl py-6 px-4">
              {adCountdown > 0 ? (
                <div className="text-sm text-[#525860]">
                  Récompense disponible dans{" "}
                  <span className="font-mono tabular-nums font-bold text-[#14171A]">
                    {adCountdown}s
                  </span>
                </div>
              ) : (
                <div className="text-sm font-semibold text-[#0D5C3E]">
                  Spot visionné ! Vos +{adModalSponsor.rewardTokens} Jetons sont prêts.
                </div>
              )}
            </div>

            <div className="flex gap-2.5">
              <button
                type="button"
                onClick={() => setAdModalSponsor(null)}
                className="flex-1 min-h-[46px] rounded-xl border border-black/12 text-sm font-semibold text-[#525860] cursor-pointer"
              >
                Fermer
              </button>
              <button
                type="button"
                disabled={adCountdown > 0}
                onClick={async () => {
                  const id = adModalSponsor.id;
                  setAdModalSponsor(null);
                  await handleAction(
                    () => onClaimSponsorReward(id),
                    "+50 Jetons MIFA crédités grâce au sponsor !",
                  );
                }}
                className={`flex-1 min-h-[46px] rounded-xl text-sm font-semibold cursor-pointer ${
                  adCountdown > 0
                    ? "bg-black/10 text-[#8A9199] cursor-not-allowed"
                    : "bg-[#0D5C3E] text-white hover:bg-[#094730]"
                }`}
              >
                Réclamer +50 Jetons
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
