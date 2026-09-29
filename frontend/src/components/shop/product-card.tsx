import Image from "next/image";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Price } from "@/components/ui/price";
import { cn, isNewProduct, isSoldOut } from "@/lib/utils";
import type { ProductWithDetails } from "@/types";

const IMAGE_SIZES = "(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw";

type ProductCardProps = {
  product: ProductWithDetails;
  /** Mark the first above-the-fold cards so their images load eagerly. */
  priority?: boolean;
  className?: string;
};

export function ProductCard({ product, priority = false, className }: ProductCardProps) {
  const [primary, secondary] = product.images;
  const onSale =
    product.compare_at_price_paise !== null && product.compare_at_price_paise > product.price_paise;

  const soldOut = isSoldOut(product);
  const isNew = isNewProduct(product.created_at);

  return (
    <article className={cn("group relative", className)}>
      <Link href={`/product/${product.slug}`} className="block">
        <div className="relative aspect-[4/5] overflow-hidden rounded-md bg-cream-200">
          {primary && (
            <Image
              src={primary.url}
              alt={primary.alt || product.name}
              fill
              sizes={IMAGE_SIZES}
              priority={priority}
              className="object-cover"
            />
          )}
          {secondary && (
            <Image
              src={secondary.url}
              alt=""
              fill
              sizes={IMAGE_SIZES}
              className="object-cover opacity-0 transition-opacity duration-300 hover:opacity-100 group-hover:opacity-100"
            />
          )}
          <div className="absolute left-2 top-2 flex flex-col items-start gap-1">
            {isNew && <Badge variant="navy">New</Badge>}
            {onSale && !soldOut && <Badge variant="gold">Sale</Badge>}
          </div>
          {soldOut && (
            <div className="absolute inset-0 flex items-end justify-center bg-cream-100/55 pb-3">
              <Badge variant="outline" className="bg-cream-100">
                Sold out
              </Badge>
            </div>
          )}
        </div>

        <div className="mt-3 flex flex-col gap-1">
          <p className="text-xs uppercase tracking-wider text-navy-400">{product.category.name}</p>
          <h3 className="text-sm font-medium leading-snug text-navy-800 sm:text-base">{product.name}</h3>
          <Price
            amount={product.price_paise}
            compareAt={product.compare_at_price_paise ?? undefined}
            className={cn("text-sm sm:text-base", soldOut && "text-navy-300")}
          />
        </div>
      </Link>
    </article>
  );
}
