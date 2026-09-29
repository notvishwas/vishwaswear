import Image from "next/image";
import Link from "next/link";
import type { Category } from "@/types";

export function CategoryCard({ category }: { category: Category }) {
  return (
    <Link
      href={`/shop/${category.slug}`}
      className="group relative block aspect-[4/5] overflow-hidden rounded-md bg-navy-800"
    >
      {category.image_url && (
        <Image
          src={category.image_url}
          alt=""
          fill
          sizes="(min-width: 1024px) 20vw, (min-width: 640px) 33vw, 50vw"
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />
      )}
      <span className="absolute inset-x-0 bottom-0 flex items-center justify-between bg-cream-100/95 px-3 py-3 text-sm font-semibold text-navy-800 sm:px-4 sm:text-base">
        {category.name}
        <span aria-hidden="true" className="text-gold-600 transition-transform group-hover:translate-x-1">
          →
        </span>
      </span>
    </Link>
  );
}
