import { Container } from "@/components/ui/container";

export function SiteFooter() {
  return (
    <footer className="bg-obsidian py-11 text-porcelain">
      <Container className="space-y-4">
        <p className="font-display text-2xl">DIVERSO OPTICS</p>
        <p className="text-sm">Catalog · Brands · Store · Guides · Policies</p>
        <p className="text-sm leading-6 text-porcelain/60">
          F-11 Markaz, Islamabad · Full shop address and business hours pending
          client confirmation
        </p>
      </Container>
    </footer>
  );
}
