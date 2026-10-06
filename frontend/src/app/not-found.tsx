import Link from "next/link";
import { ShopShell } from "@/components/layout/shop-shell";
import { Container } from "@/components/ui/container";

export default function NotFound() {
  return (
    <ShopShell>
    <Container size="narrow" className="flex flex-col items-center py-24 text-center sm:py-32">
      <p className="text-xs font-semibold uppercase tracking-[0.25em] text-gold-700">Error 404</p>
      <h1 className="mt-4 text-3xl font-semibold tracking-tight text-navy-800 sm:text-4xl">
        We can&apos;t find that page
      </h1>
      <span aria-hidden="true" className="mt-6 block h-px w-12 bg-gold-500" />
      <p className="mt-6 max-w-md text-navy-500">
        The link may be out of date or the piece may no longer be available. Head back to the
        collection and keep browsing.
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Link
          href="/shop"
          className="inline-flex h-11 items-center rounded-md border border-navy-800 bg-navy-800 px-6 text-sm font-semibold text-white hover:bg-navy-700"
        >
          Shop the collection
        </Link>
        <Link
          href="/"
          className="inline-flex h-11 items-center rounded-md border border-navy-800 px-6 text-sm font-semibold text-navy-800 hover:bg-navy-800 hover:text-white"
        >
          Back to home
        </Link>
      </div>
    </Container>
    </ShopShell>
  );
}
