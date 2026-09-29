"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import { CloseIcon } from "@/components/layout/icons";
import { cn } from "@/lib/utils";
import type { ProductImage } from "@/types";

type GalleryImage = Pick<ProductImage, "id" | "url" | "alt">;

function ArrowIcon({ direction }: { direction: "left" | "right" }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="size-6" aria-hidden="true">
      <path d={direction === "left" ? "M15 5l-7 7 7 7" : "M9 5l7 7-7 7"} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function ProductGallery({ images, productName }: { images: GalleryImage[]; productName: string }) {
  const [active, setActive] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const scrollerRef = useRef<HTMLUListElement>(null);
  const dialogRef = useRef<HTMLDialogElement>(null);

  const count = images.length;
  const altFor = (image: GalleryImage) => image.alt || productName;

  const onScroll = useCallback(() => {
    const scroller = scrollerRef.current;
    if (!scroller) return;
    setActive(Math.round(scroller.scrollLeft / scroller.clientWidth));
  }, []);

  const step = useCallback(
    (delta: number) => setActive((current) => (current + delta + count) % count),
    [count],
  );

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (lightboxOpen && !dialog.open) dialog.showModal();
    if (!lightboxOpen && dialog.open) dialog.close();
  }, [lightboxOpen]);

  useEffect(() => {
    if (!lightboxOpen) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "ArrowLeft") step(-1);
      if (event.key === "ArrowRight") step(1);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [lightboxOpen, step]);

  if (count === 0) {
    return <div className="aspect-[4/5] w-full rounded-md bg-cream-200" role="img" aria-label={`${productName}, no photo available`} />;
  }

  const current = images[active] ?? images[0];

  return (
    <div className="lg:flex lg:gap-4">
      {/* Desktop thumbnails */}
      {count > 1 && (
        <ul className="hidden lg:flex lg:w-20 lg:shrink-0 lg:flex-col lg:gap-3" aria-label="Product photos">
          {images.map((image, index) => (
            <li key={image.id}>
              <button
                type="button"
                onClick={() => setActive(index)}
                aria-label={`Show photo ${index + 1} of ${count}`}
                aria-current={index === active ? "true" : undefined}
                className={cn(
                  "relative block aspect-[4/5] w-full overflow-hidden rounded-sm border-2 bg-cream-200",
                  index === active ? "border-gold-500" : "border-transparent hover:border-navy-200",
                )}
              >
                <Image src={image.url} alt="" fill sizes="80px" className="object-cover" />
              </button>
            </li>
          ))}
        </ul>
      )}

      <div className="min-w-0 flex-1">
        {/* Mobile: swipeable, snap-scrolling */}
        <div className="relative -mx-4 sm:mx-0 lg:hidden">
          <ul
            ref={scrollerRef}
            onScroll={onScroll}
            className="flex snap-x snap-mandatory overflow-x-auto [scrollbar-width:none] sm:rounded-md [&::-webkit-scrollbar]:hidden"
            aria-label="Product photos"
          >
            {images.map((image, index) => (
              <li key={image.id} className="w-full shrink-0 snap-center">
                <button
                  type="button"
                  onClick={() => setLightboxOpen(true)}
                  aria-label="Zoom photo"
                  className="relative block aspect-[4/5] w-full bg-cream-200"
                >
                  <Image
                    src={image.url}
                    alt={altFor(image)}
                    fill
                    sizes="(min-width: 640px) 60vw, 100vw"
                    priority={index === 0}
                    className="object-cover"
                  />
                </button>
              </li>
            ))}
          </ul>
          {count > 1 && (
            <div className="pointer-events-none absolute inset-x-0 bottom-3 flex justify-center gap-1.5" aria-hidden="true">
              {images.map((image, index) => (
                <span
                  key={image.id}
                  className={cn("size-2 rounded-full", index === active ? "bg-navy-800" : "bg-navy-800/25")}
                />
              ))}
            </div>
          )}
        </div>

        {/* Desktop: selected image, click to zoom */}
        <button
          type="button"
          onClick={() => setLightboxOpen(true)}
          aria-label="Zoom photo"
          className="relative hidden aspect-[4/5] w-full cursor-zoom-in overflow-hidden rounded-md bg-cream-200 lg:block"
        >
          <Image
            src={current.url}
            alt={altFor(current)}
            fill
            sizes="(min-width: 1280px) 40vw, 45vw"
            loading="eager"
            className="object-cover"
          />
        </button>
      </div>

      <dialog
        ref={dialogRef}
        onClose={() => setLightboxOpen(false)}
        onClick={(event) => {
          if (event.target === dialogRef.current) setLightboxOpen(false);
        }}
        aria-label={`${productName} photos`}
        className="m-auto h-dvh max-h-none w-screen max-w-none bg-transparent p-0 backdrop:bg-navy-900/90"
      >
        {lightboxOpen && (
          <div className="relative mx-auto flex h-full max-w-3xl items-center justify-center p-4">
            <div className="relative aspect-[4/5] h-full max-h-[90dvh] max-w-full">
              <Image
                src={current.url}
                alt={altFor(current)}
                fill
                sizes="(min-width: 768px) 768px, 100vw"
                className="rounded-md object-contain"
              />
            </div>
            <button
              type="button"
              onClick={() => setLightboxOpen(false)}
              aria-label="Close"
              className="absolute right-3 top-3 inline-flex size-11 items-center justify-center rounded-full bg-cream-100 text-navy-800"
            >
              <CloseIcon />
            </button>
            {count > 1 && (
              <>
                <button
                  type="button"
                  onClick={() => step(-1)}
                  aria-label="Previous photo"
                  className="absolute left-3 top-1/2 inline-flex size-11 -translate-y-1/2 items-center justify-center rounded-full bg-cream-100 text-navy-800"
                >
                  <ArrowIcon direction="left" />
                </button>
                <button
                  type="button"
                  onClick={() => step(1)}
                  aria-label="Next photo"
                  className="absolute right-3 top-1/2 inline-flex size-11 -translate-y-1/2 items-center justify-center rounded-full bg-cream-100 text-navy-800"
                >
                  <ArrowIcon direction="right" />
                </button>
              </>
            )}
          </div>
        )}
      </dialog>
    </div>
  );
}
