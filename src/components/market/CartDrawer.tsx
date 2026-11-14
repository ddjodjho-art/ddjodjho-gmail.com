import { useState } from "react";
import { CheckCircle2, Minus, Plus, Trash2, Truck, X } from "lucide-react";
import {
  COMMUNE_DELIVERY,
  USD_TO_CDF,
  type CartItem,
  type KinshasaCommune,
  type Order,
  type PaymentMethod,
} from "../../types/market";

interface CartDrawerProps {
  items: CartItem[];
  onUpdateQty: (productId: string, variant: string, delta: number) => void;
  onRemoveItem: (productId: string, variant: string) => void;
  onCheckout: (payload: {
    customerName: string;
    customerPhone: string;
    commune: KinshasaCommune;
    addressNote: string;
    paymentMethod: PaymentMethod;
  }) => Promise<Order>;
  onGoToOrders: () => void;
  onClose: () => void;
}

const PAYMENT_METHODS: PaymentMethod[] = [
  "Paiement à la livraison (Cash)",
  "Mobile Money (M-Pesa / Airtel / Orange)",
  "Carte bancaire",
];

export function CartDrawer({
  items,
  onUpdateQty,
  onRemoveItem,
  onCheckout,
  onGoToOrders,
  onClose,
}: CartDrawerProps) {
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [commune, setCommune] = useState<KinshasaCommune>("Gombe");
  const [addressNote, setAddressNote] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(PAYMENT_METHODS[0]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmedOrder, setConfirmedOrder] = useState<Order | null>(null);

  const subtotalUsd = items.reduce((sum, item) => sum + item.product.priceUsd * item.quantity, 0);
  const communeInfo = COMMUNE_DELIVERY.find((c) => c.name === commune) ?? COMMUNE_DELIVERY[0];
  const deliveryFeeUsd = subtotalUsd === 0 ? 0 : subtotalUsd >= 120 ? 0 : communeInfo.feeUsd;
  const totalUsd = Number((subtotalUsd + deliveryFeeUsd).toFixed(2));
  const totalCdf = Math.round(totalUsd * USD_TO_CDF).toLocaleString("fr-FR");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const order = await onCheckout({
        customerName,
        customerPhone,
        commune,
        addressNote,
        paymentMethod,
      });
      setConfirmedOrder(order);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Impossible de valider la commande.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/55 backdrop-blur-xs flex justify-end"
      role="dialog"
      aria-modal="true"
      aria-label="Panier et commande Kinshasa"
    >
      <div className="w-full max-w-lg bg-white h-full flex flex-col border-l border-black/10 overflow-hidden">
        <div className="flex items-center justify-between px-5 h-14 border-b border-black/8 shrink-0">
          <h2 className="text-base font-bold text-[#14171A]">
            {confirmedOrder ? "Commande confirmée" : `Mon Panier (${items.reduce((a, b) => a + b.quantity, 0)})`}
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Fermer le panier"
            className="min-h-[40px] min-w-[40px] rounded-xl border border-black/10 flex items-center justify-center text-[#525860] hover:text-[#14171A] cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5 flex flex-col gap-5">
          {confirmedOrder ? (
            <div className="py-4 flex flex-col gap-5">
              <div className="bg-[#0D5C3E]/8 border border-[#0D5C3E]/25 rounded-2xl p-5 flex flex-col gap-2">
                <div className="flex items-center gap-2 text-[#0D5C3E] font-bold text-base">
                  <CheckCircle2 className="w-5 h-5" />
                  <span>Commande {confirmedOrder.id} enregistrée</span>
                </div>
                <p className="text-sm text-[#525860]">
                  Livraison prévue à <strong className="text-[#14171A]">{confirmedOrder.commune}</strong>{" "}
                  ({confirmedOrder.addressNote}) · {confirmedOrder.paymentMethod}.
                </p>
              </div>

              <div className="bg-[#F7F6F3] border border-black/8 rounded-2xl p-4 flex flex-col gap-2 text-sm">
                <div className="font-semibold text-[#14171A] mb-1">Reçu détaillé</div>
                {confirmedOrder.items.map((it, idx) => (
                  <div key={idx} className="flex justify-between gap-3 text-xs text-[#525860]">
                    <span>
                      {it.quantity}× {it.title} ({it.variant})
                    </span>
                    <span className="font-mono tabular-nums text-[#14171A]">
                      ${it.unitPriceUsd * it.quantity}
                    </span>
                  </div>
                ))}
                <div className="border-t border-black/8 pt-2 mt-1 flex justify-between text-xs text-[#525860]">
                  <span>Livraison {confirmedOrder.commune}</span>
                  <span className="font-mono tabular-nums">
                    {confirmedOrder.deliveryFeeUsd === 0 ? "Gratuite" : `$${confirmedOrder.deliveryFeeUsd}`}
                  </span>
                </div>
                <div className="flex justify-between font-bold text-[#14171A] pt-1">
                  <span>Total à régler</span>
                  <span className="font-mono tabular-nums">${confirmedOrder.totalUsd}</span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  onClose();
                  onGoToOrders();
                }}
                className="w-full min-h-[48px] rounded-xl bg-[#14171A] hover:bg-black text-white font-semibold text-sm cursor-pointer"
              >
                Suivre ma commande en direct
              </button>
            </div>
          ) : items.length === 0 ? (
            <div className="py-16 text-center flex flex-col items-center gap-3">
              <p className="text-sm text-[#525860]">
                Votre panier est vide. Parcourez les articles disponibles à Kinshasa.
              </p>
              <button
                type="button"
                onClick={onClose}
                className="min-h-[44px] px-5 py-2 rounded-xl bg-[#14171A] text-white text-sm font-semibold cursor-pointer"
              >
                Découvrir le catalogue
              </button>
            </div>
          ) : (
            <>
              {/* Itemized List */}
              <div className="divide-y divide-black/8">
                {items.map((item) => (
                  <div
                    key={`${item.product.id}-${item.variant}`}
                    className="py-3.5 first:pt-0 flex items-start gap-3"
                  >
                    <img
                      src={item.product.imageUrl}
                      alt={item.product.title}
                      referrerPolicy="no-referrer"
                      className="w-16 h-16 rounded-xl object-cover bg-[#EFECE6] shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-semibold text-[#14171A] truncate">
                        {item.product.title}
                      </div>
                      <div className="text-xs text-[#6B675E] mt-0.5">
                        {item.variant} · {item.product.commune}
                      </div>
                      <div className="flex items-center justify-between gap-2 mt-2">
                        <div className="inline-flex items-center border border-black/12 rounded-lg">
                          <button
                            type="button"
                            aria-label="Diminuer quantité"
                            onClick={() => onUpdateQty(item.product.id, item.variant, -1)}
                            className="w-8 h-8 flex items-center justify-center text-[#14171A] cursor-pointer"
                          >
                            <Minus className="w-3.5 h-3.5" />
                          </button>
                          <span className="px-2.5 text-xs font-mono tabular-nums font-semibold">
                            {item.quantity}
                          </span>
                          <button
                            type="button"
                            aria-label="Augmenter quantité"
                            onClick={() => onUpdateQty(item.product.id, item.variant, 1)}
                            className="w-8 h-8 flex items-center justify-center text-[#14171A] cursor-pointer"
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        <div className="flex items-center gap-3">
                          <span className="font-mono tabular-nums text-sm font-bold text-[#14171A]">
                            ${item.product.priceUsd * item.quantity}
                          </span>
                          <button
                            type="button"
                            aria-label="Retirer l'article"
                            onClick={() => onRemoveItem(item.product.id, item.variant)}
                            className="text-[#6B675E] hover:text-[#DC2626] p-1 cursor-pointer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Delivery & Payment Form */}
              <form id="checkout-form" onSubmit={handleSubmit} className="flex flex-col gap-3.5 pt-2 border-t border-black/8">
                <div className="flex items-center gap-2 text-sm font-bold text-[#14171A]">
                  <Truck className="w-4 h-4 text-[#0D5C3E]" />
                  <span>Livraison à Kinshasa &amp; Paiement</span>
                </div>

                {error && (
                  <div className="bg-[#DC2626]/10 border border-[#DC2626]/30 rounded-xl p-3 text-xs font-medium text-[#991B1B]">
                    {error}
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-[#525860] mb-1">
                      Nom complet
                    </label>
                    <input
                      type="text"
                      required
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      placeholder="Ex : Joyce L."
                      className="w-full min-h-[44px] px-3.5 rounded-xl border border-black/15 text-sm focus:outline-2 focus:outline-[#0D5C3E]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#525860] mb-1">
                      Téléphone Kinshasa
                    </label>
                    <input
                      type="tel"
                      required
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value)}
                      placeholder="+243 81..."
                      className="w-full min-h-[44px] px-3.5 rounded-xl border border-black/15 text-sm focus:outline-2 focus:outline-[#0D5C3E]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-[#525860] mb-1">
                      Commune de livraison
                    </label>
                    <select
                      value={commune}
                      onChange={(e) => setCommune(e.target.value as KinshasaCommune)}
                      className="w-full min-h-[44px] px-3.5 rounded-xl border border-black/15 text-sm bg-white focus:outline-2 focus:outline-[#0D5C3E]"
                    >
                      {COMMUNE_DELIVERY.map((c) => (
                        <option key={c.name} value={c.name}>
                          {c.name} (${c.feeUsd} · {c.etaLabel})
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#525860] mb-1">
                      Moyen de paiement
                    </label>
                    <select
                      value={paymentMethod}
                      onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
                      className="w-full min-h-[44px] px-3.5 rounded-xl border border-black/15 text-sm bg-white focus:outline-2 focus:outline-[#0D5C3E]"
                    >
                      {PAYMENT_METHODS.map((pm) => (
                        <option key={pm} value={pm}>
                          {pm}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#525860] mb-1">
                    Avenue / Point de repère à {commune}
                  </label>
                  <input
                    type="text"
                    required
                    value={addressNote}
                    onChange={(e) => setAddressNote(e.target.value)}
                    placeholder="Ex : Av. Kasa-Vubu, arrêt marché..."
                    className="w-full min-h-[44px] px-3.5 rounded-xl border border-black/15 text-sm focus:outline-2 focus:outline-[#0D5C3E]"
                  />
                </div>
              </form>
            </>
          )}
        </div>

        {/* Sticky Checkout Summary Footer */}
        {!confirmedOrder && items.length > 0 && (
          <div className="border-t border-black/10 bg-[#F7F6F3] p-5 flex flex-col gap-3 shrink-0">
            <div className="flex flex-col gap-1 text-xs text-[#525860]">
              <div className="flex justify-between">
                <span>Sous-total articles</span>
                <span className="font-mono tabular-nums text-[#14171A]">${subtotalUsd}</span>
              </div>
              <div className="flex justify-between">
                <span>Livraison {commune} (gratuite dès $120)</span>
                <span className="font-mono tabular-nums text-[#14171A]">
                  {deliveryFeeUsd === 0 ? "Gratuite" : `$${deliveryFeeUsd}`}
                </span>
              </div>
              <div className="flex justify-between text-base font-bold text-[#14171A] pt-1">
                <span>Total</span>
                <span className="font-mono tabular-nums">
                  ${totalUsd} · {totalCdf} FC
                </span>
              </div>
            </div>

            <button
              type="submit"
              form="checkout-form"
              disabled={submitting}
              className="w-full min-h-[48px] rounded-xl bg-[#0D5C3E] hover:bg-[#094730] text-white font-semibold text-sm cursor-pointer transition-colors disabled:opacity-60"
            >
              {submitting ? "Validation..." : `Confirmer la commande ($${totalUsd})`}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
