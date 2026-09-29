import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { Price } from "@/components/ui/price";
import { SectionHeading } from "@/components/ui/section-heading";
import { siteConfig } from "@/config/site";

export default function HomePage() {
  return (
    <main className="flex flex-1 items-center py-16">
      <Container size="narrow">
        <SectionHeading
          as="h1"
          eyebrow="Menswear, made to fit"
          title={siteConfig.name}
          description={siteConfig.description}
        />
        <div className="mt-8 flex flex-wrap items-center gap-4">
          <Button size="lg">Shop the collection</Button>
          <Button variant="secondary" size="lg">
            Book a fitting
          </Button>
          <Price amount={12499900} className="text-lg" />
        </div>
      </Container>
    </main>
  );
}
