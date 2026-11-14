import { ArrowRight, CheckCircle2, MapPin, Package } from "lucide-react";
import type { Order, OrderStatus } from "../../types/market";

interface OrdersViewProps {
  orders: Order[];
  onAdvanceStatus: (orderId: string) => Promise<void>;
}

const STEPS: OrderStatus[] = [
  "Confirmée",
  "Préparation vendeur",
  "En livraison Kinshasa",
  "Livrée",
];

export function OrdersView({ orders, onAdvanceStatus }: OrdersViewProps) {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-xl sm:text-2xl font-bold text-[#14171A]">
          Suivi des Commandes &amp; Livraisons
        </h2>
        <p className="text-sm text-[#525860] mt-0.5">
          Consultez l&apos;avancement de chaque colis dans les communes de Kinshasa.
        </p>
      </div>

      {orders.length === 0 ? (
        <div className="bg-white border border-black/10 rounded-2xl p-10 text-center text-sm text-[#525860]">
          Aucune commande enregistrée pour le moment.
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {orders.map((order) => {
            const currentIdx = STEPS.indexOf(order.status);
            const isDelivered = currentIdx >= STEPS.length - 1;

            return (
              <article
                key={order.id}
                className="bg-white border border-black/10 rounded-2xl p-5 flex flex-col gap-4"
              >
                <div className="flex flex-wrap items-start justify-between gap-3 border-b border-black/8 pb-3.5">
                  <div>
                    <div className="text-xs text-[#6B675E] font-mono tabular-nums">
                      Commande {order.id} · {order.paymentMethod}
                    </div>
                    <h3 className="text-base font-bold text-[#14171A] mt-0.5">
                      {order.customerName} — {order.commune}
                    </h3>
                    <div className="text-xs text-[#525860] flex items-center gap-1.5 mt-0.5">
                      <MapPin className="w-3.5 h-3.5" />
                      <span>
                        {order.addressNote} · {order.customerPhone}
                      </span>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="text-xs text-[#6B675E]">Total</div>
                    <div className="text-lg font-bold font-mono tabular-nums text-[#14171A]">
                      ${order.totalUsd}
                    </div>
                  </div>
                </div>

                {/* Progress Stepper */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {STEPS.map((step, idx) => {
                    const done = idx <= currentIdx;
                    return (
                      <div
                        key={step}
                        className={`rounded-xl border px-3 py-2.5 text-xs flex items-center gap-2 ${
                          done
                            ? "bg-[#0D5C3E]/8 border-[#0D5C3E]/35 text-[#094730] font-semibold"
                            : "bg-[#F7F6F3] border-black/8 text-[#6B675E]"
                        }`}
                      >
                        {done ? (
                          <CheckCircle2 className="w-4 h-4 shrink-0 text-[#0D5C3E]" />
                        ) : (
                          <Package className="w-4 h-4 shrink-0" />
                        )}
                        <span className="truncate">{step}</span>
                      </div>
                    );
                  })}
                </div>

                {/* Itemized Summary + Step Simulator */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
                  <div className="text-xs text-[#525860]">
                    {order.items
                      .map((it) => `${it.quantity}× ${it.title} (${it.variant})`)
                      .join(" · ")}
                  </div>

                  {!isDelivered && (
                    <button
                      type="button"
                      onClick={() => void onAdvanceStatus(order.id)}
                      className="min-h-[40px] px-4 py-2 rounded-xl border border-black/12 bg-[#F7F6F3] hover:bg-[#14171A] hover:text-white text-xs font-semibold text-[#14171A] flex items-center gap-1.5 whitespace-nowrap shrink-0 cursor-pointer transition-colors"
                    >
                      <span>Étape suivante</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
