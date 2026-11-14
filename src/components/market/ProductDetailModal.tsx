import { useState } from "react";
import { Check, Copy, MapPin, MessageCircle, ShieldCheck, Truck, X } from "lucide-react";
import { COMMUNE_DELIVERY, USD_TO_CDF, type Product } from "../../types/market";

interface ProductDetailModalProps {
  product: Product;
  onAddToCart: (product: Product, variant: string) => void;
  onClose: () => void;
}

export function ProductDetailModal({
  product,
  onAddToCart,
  onClose,
}: ProductDetailModalProps) {
  const [selectedVariant, setSelectedVariant] = useState(product.variants[0] || "Standard");
  const [copiedPhone, setCopiedPhone] = useState(false);

  const communeDelivery =
    COMMUNE_DELIVERY.find((c) => c.name === product.commune) ?? COMMUNE_DELIVERY[0];
  const priceCdf = (product.priceUsd * USD_TO_CDF).toLocaleString("fr-FR");

  const whatsappMessage = encodeURIComponent(
    `Bonjour ${product.sellerName}, je souhaite commander "${product.title}" (${selectedVariant}) à $${product.priceUsd} sur JOYCE MARKET 243.`,
  );
  const whatsappUrl = `https://wa.me/${product.sellerWhatsapp}?text=${whatsappMessage}`;

  const handleCopyPhone = async () => {
    try {
      await navigator.clipboard.writeText(`+${product.sellerWhatsapp}`);
      setCopiedPhone(true);
      window.setTimeout(() => setCopiedPhone(false), 2000);
    } catch {
      // Clipboard blocked in restricted context; ignore gracefully
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/55 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-label={product.title}
    >
      <div className="w-full sm:max-w-3xl bg-white rounded-t-3xl sm:rounded-3xl border border-black/10 max-h-[92dvh] flex flex-col overflow-hidden">
        <div className="flex items-center justify-between px-5 h-14 border-b border-black/8 shrink-0">
          <div className="text-xs text-[#6B675E] truncate">
            {product.category} · {product.commune}, Kinshasa
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Fermer la fiche produit"
            className="min-h-[40px] min-w-[40px] rounded-xl border border-black/10 flex items-center justify-center text-[#525860] hover:text-[#14171A] cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5 sm:p-6 overflow-y-auto grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
          {/* Left Studio Gallery */}
          <div className="md:col-span-6 rounded-2xl overflow-hidden bg-[#EFECE6] border border-black/8 aspect-[4/3]">
            <img
              src={product.imageUrl}
              alt={product.title}
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover block"
            />
          </div>

          {/* Right Contiguous Purchase Module */}
          <div className="md:col-span-6 flex flex-col gap-4">
            <div>
              <div className="flex items-center gap-1.5 text-xs font-medium text-[#0D5C3E]">
                {product.sellerVerified && <ShieldCheck className="w-4 h-4 shrink-0" />}
                <span>{product.sellerName}</span>
                <span aria-hidden="true">·</span>
                <span className="text-[#6B675E]">{product.stock} en stock</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-[#14171A] mt-1">
                {product.title}
              </h2>
              <div className="flex items-baseline gap-2.5 mt-2">
                <span className="text-2xl font-bold font-mono tabular-nums text-[#14171A]">
                  ${product.priceUsd}
                </span>
                <span className="text-sm font-mono tabular-nums text-[#6B675E]">
                  {priceCdf} FC
                </span>
              </div>
            </div>

            <p className="text-sm text-[#525860] leading-relaxed">{product.description}</p>

            {/* Variant Selector */}
            <div>
              <div className="text-xs font-semibold text-[#14171A] mb-2">
                Option / Taille : <span className="font-normal text-[#6B675E]">{selectedVariant}</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {product.variants.map((v) => (
                  <button
                    key={v}
                    type="button"
                    onClick={() => setSelectedVariant(v)}
                    className={`min-h-[40px] px-3.5 py-1.5 rounded-xl text-xs font-semibold border cursor-pointer transition-colors ${
                      selectedVariant === v
                        ? "bg-[#14171A] text-white border-[#14171A]"
                        : "bg-white text-[#14171A] border-black/12 hover:border-black/30"
                    }`}
                  >
                    {v}
                  </button>
                ))}
              </div>
            </div>

            {/* Kinshasa Delivery Info */}
            <div className="bg-[#F7F6F3] border border-black/8 rounded-xl p-3.5 flex flex-col gap-1.5 text-xs text-[#525860]">
              <div className="flex items-center gap-2 text-[#14171A] font-semibold">
                <Truck className="w-4 h-4 text-[#0D5C3E]" />
                <span>Livraison Kinshasa · {communeDelivery.etaLabel}</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="w-3.5 h-3.5" />
                <span>
                  Départ {product.commune} · Frais dès ${communeDelivery.feeUsd} (gratuit dès $120)
                </span>
              </div>
            </div>

            {/* Primary Actions: Add to Cart + WhatsApp Seller */}
            <div className="flex flex-col gap-2.5 pt-1">
              <button
                type="button"
                disabled={product.stock <= 0}
                onClick={() => {
                  onAddToCart(product, selectedVariant);
                  onClose();
                }}
                className="w-full min-h-[48px] px-5 py-3 rounded-xl bg-[#0D5C3E] hover:bg-[#094730] text-white font-semibold text-sm cursor-pointer transition-colors disabled:opacity-50"
              >
                Ajouter au panier — ${product.priceUsd}
              </button>

              <div className="flex gap-2">
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 min-h-[44px] px-4 py-2.5 rounded-xl border border-[#0D5C3E]/35 bg-[#0D5C3E]/6 hover:bg-[#0D5C3E]/12 text-[#094730] font-semibold text-xs sm:text-sm flex items-center justify-center gap-2 transition-colors"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>Contacter sur WhatsApp</span>
                </a>

                <button
                  type="button"
                  onClick={() => void handleCopyPhone()}
                  aria-label="Copier le numéro WhatsApp"
                  className="min-h-[44px] px-3.5 rounded-xl border border-black/12 text-xs font-semibold text-[#14171A] hover:bg-black/5 flex items-center gap-1.5 cursor-pointer"
                >
                  {copiedPhone ? (
                    <>
                      <Check className="w-4 h-4 text-[#0D5C3E]" />
                      <span>Copié</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" />
                      <span>+{product.sellerWhatsapp}</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
