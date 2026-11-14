import { useState } from "react";
import { ShoppingBag } from "lucide-react";
import { USD_TO_CDF, type Product } from "../../types/market";

interface ProductCardProps {
  product: Product;
  onSelect: (product: Product) => void;
  onQuickAdd: (product: Product) => void;
}

export function ProductCard({ product, onSelect, onQuickAdd }: ProductCardProps) {
  const [imgError, setImgError] = useState(false);
  const priceCdf = (product.priceUsd * USD_TO_CDF).toLocaleString("fr-FR");

  return (
    <article className="group bg-white border border-black/8 rounded-2xl overflow-hidden flex flex-col justify-between transition-transform duration-200 hover:-translate-y-0.5">
      <button
        type="button"
        onClick={() => onSelect(product)}
        className="text-left cursor-pointer focus-visible:outline-2 focus-visible:outline-[#C2410C]"
      >
        <div className="aspect-[4/3] w-full bg-[#EFECE6] overflow-hidden relative">
          {!imgError ? (
            <img
              src={product.imageUrl}
              alt={product.title}
              referrerPolicy="no-referrer"
              onError={() => setImgError(true)}
              className="w-full h-full object-cover block transition-transform duration-300 group-hover:scale-[1.02]"
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center gap-2 text-[#6B675E] p-4">
              <ShoppingBag className="w-8 h-8" />
              <span className="text-xs font-medium text-center">{product.title}</span>
            </div>
          )}
        </div>

        <div className="px-4 pt-4 pb-2">
          <div className="text-xs text-[#6B675E] truncate">
            {product.commune} · {product.category}
            {product.promoted ? " · Sponsorisé" : ""}
          </div>
          <h3 className="text-base font-semibold text-[#14171A] mt-1 line-clamp-2 min-h-[2.75rem]">
            {product.title}
          </h3>
        </div>
      </button>

      <div className="px-4 pb-4 pt-1 flex items-center justify-between gap-3">
        <div>
          <div className="text-[15px] font-bold font-mono tabular-nums text-[#14171A]">
            ${product.priceUsd}
          </div>
          <div className="text-[11px] font-mono tabular-nums text-[#6B675E]">
            {priceCdf} FC
          </div>
        </div>

        <button
          type="button"
          disabled={product.stock <= 0}
          onClick={() => onQuickAdd(product)}
          className={`min-h-[44px] px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap shrink-0 cursor-pointer transition-colors ${
            product.stock > 0
              ? "bg-[#14171A] hover:bg-[#0D5C3E] text-white"
              : "bg-black/8 text-[#8A9199] cursor-not-allowed"
          }`}
        >
          {product.stock > 0 ? "Ajouter" : "Épuisé"}
        </button>
      </div>
    </article>
  );
}
