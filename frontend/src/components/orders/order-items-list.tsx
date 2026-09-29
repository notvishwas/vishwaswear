import Image from "next/image";
import { Price } from "@/components/ui/price";
import type { OrderItem } from "@/types";

export function OrderItemsList({ items }: { items: OrderItem[] }) {
  return (
    <ul className="divide-y divide-cream-300">
      {items.map((item) => (
        <li key={item.id} className="flex gap-4 py-4">
          <div className="relative aspect-[4/5] w-16 shrink-0 overflow-hidden rounded-sm bg-cream-200 sm:w-20">
            {item.image_url && <Image src={item.image_url} alt="" fill sizes="80px" className="object-cover" />}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium leading-snug text-navy-800 sm:text-base">{item.product_name}</p>
            <p className="mt-1 text-xs text-navy-500 sm:text-sm">
              Size {item.size} · {item.color} · Qty {item.quantity}
            </p>
          </div>
          <Price amount={item.unit_price_paise * item.quantity} className="shrink-0 text-sm sm:text-base" />
        </li>
      ))}
    </ul>
  );
}
