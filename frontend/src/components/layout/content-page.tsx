import type { ReactNode } from "react";
import { Breadcrumbs } from "@/components/shop/breadcrumbs";
import { Container } from "@/components/ui/container";
import { Prose } from "@/components/ui/prose";
import { SectionHeading } from "@/components/ui/section-heading";

type ContentPageProps = {
  title: string;
  path: string;
  intro?: string;
  /** Shown under the heading, e.g. "Last updated 6 October 2026". */
  meta?: string;
  children: ReactNode;
};

/** Shared frame for the static pages: breadcrumbs, heading and readable body text. */
export function ContentPage({ title, path, intro, meta, children }: ContentPageProps) {
  return (
    <Container size="narrow" className="py-8 sm:py-14">
      <Breadcrumbs
        crumbs={[
          { label: "Home", href: "/" },
          { label: title, href: path },
        ]}
      />
      <SectionHeading as="h1" title={title} description={intro} className="my-8 sm:mb-10" />
      {meta && <p className="-mt-4 mb-8 text-sm text-navy-400">{meta}</p>}
      <Prose>{children}</Prose>
    </Container>
  );
}
