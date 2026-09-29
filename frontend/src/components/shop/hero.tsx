import Image from "next/image";
import Link from "next/link";
import { Container } from "@/components/ui/container";
import type { ProductImage } from "@/types";

type HeroProps = {
  /** Image from the first featured product; the hero degrades to a solid panel without one. */
  image?: Pick<ProductImage, "url" | "alt">;
};

export function Hero({ image }: HeroProps) {
  return (
    <section aria-labelledby="hero-heading" className="lg:grid lg:min-h-[36rem] lg:grid-cols-2">
      <div className="relative aspect-[4/5] w-full bg-navy-800 sm:aspect-[16/10] lg:order-2 lg:aspect-auto">
        {image && (
          <Image
            src={image.url}
            alt={image.alt}
            fill
            priority
            sizes="(min-width: 1024px) 50vw, 100vw"
            className="object-cover"
          />
        )}
      </div>

      <div className="flex items-center bg-cream-100 py-12 lg:order-1 lg:py-20">
        <Container className="lg:ml-auto lg:mr-0 lg:max-w-[40rem] lg:px-12">
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-gold-600">
            New season
          </p>
          <h1
            id="hero-heading"
            className="mt-4 text-4xl font-semibold leading-[1.1] tracking-tight text-navy-800 sm:text-5xl xl:text-6xl"
          >
            Tailoring that fits the way you live.
          </h1>
          <span aria-hidden="true" className="mt-6 block h-px w-14 bg-gold-500" />
          <p className="mt-6 max-w-md text-base leading-relaxed text-navy-500 sm:text-lg">
            Suits, blazers and coats cut from fine wool and finished by hand, with alterations
            included so every piece sits right the first time you wear it.
          </p>
          <Link
            href="/shop"
            className="mt-8 inline-flex h-12 items-center justify-center rounded-md border border-navy-800 bg-navy-800 px-8 text-base font-semibold tracking-wide text-white transition-colors hover:bg-navy-700"
          >
            Shop the collection
          </Link>
        </Container>
      </div>
    </section>
  );
}
