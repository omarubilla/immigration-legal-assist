import type { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getRobotsValue } from "@/lib/site";

type ProteasomeSection =
  | "20S Immunoproteasomes"
  | "20S Proteasomes"
  | "Substrates"
  | "Kits";

type ProteasomeProduct = {
  name: string;
  price: string;
  catalog: string;
  description: string;
  section: ProteasomeSection;
};

const SECTION_ORDER: Array<{ id: string; title: ProteasomeSection }> = [
  { id: "20s-immunoproteasomes", title: "20S Immunoproteasomes" },
  { id: "20s-proteasome", title: "20S Proteasomes" },
  { id: "proteasome-substrates", title: "Substrates" },
  { id: "proteasome-kits", title: "Kits" },
];

const PRODUCTS: ProteasomeProduct[] = [
  {
    name: "20S Immunoproteasome, human PBMC",
    price: "$275.00",
    catalog: "SBB-PP0004, 25 ug",
    section: "20S Immunoproteasomes",
    description:
      "Highly active protein complex purified from human PBMC. Supplied at >95% purity and commonly used between 2-5 nM for assay setup.",
  },
  {
    name: "20S Immunoproteasome, mouse spleen",
    price: "$245.00",
    catalog: "SBB-PP0083, 50 ug",
    section: "20S Immunoproteasomes",
    description:
      "Mouse spleen immunoproteasome supplied at high purity for autoimmune and cancer biology workflows.",
  },
  {
    name: "20S Immunoproteasome, rat spleen",
    price: "$245.00",
    catalog: "SBB-PP0046, 50 ug",
    section: "20S Immunoproteasomes",
    description:
      "Rat spleen immunoproteasome optimized for robust activity profiling and inhibitor evaluation.",
  },
  {
    name: "20S Proteasome, human RBC",
    price: "$189.00",
    catalog: "SBB-PP0005, 50 ug",
    section: "20S Proteasomes",
    description:
      "Human RBC-derived 20S proteasome with ATP-independent substrate degradation. Can be chemically activated with SDS or PA28.",
  },
  {
    name: "20S Proteasome, mouse RBC",
    price: "$198.00",
    catalog: "SBB-PP0047, 50 ug",
    section: "20S Proteasomes",
    description:
      "Mouse RBC-derived 20S proteasome for reproducible proteolytic activity measurements in biochemical assays.",
  },
  {
    name: "20S Proteasome, rat RBC",
    price: "$198.00",
    catalog: "SBB-PP0086, 50 ug",
    section: "20S Proteasomes",
    description:
      "Rat RBC-derived 20S proteasome for ATP-independent degradation and mechanism-focused studies.",
  },
  {
    name: "Suc-Leu-Leu-Val-Tyr-AMC (LLVY-AMC)",
    price: "$69.00",
    catalog: "SBB-PS0010, 2 mg",
    section: "Substrates",
    description:
      "Fluorogenic substrate to measure chymotrypsin-like peptidase activity (Ex 345 nm, Em 445 nm).",
  },
  {
    name: "Ac-Ala-Asn-Trp-AMC (ANW-AMC)",
    price: "$139.00",
    catalog: "SBB-PS0009, 2 mg",
    section: "Substrates",
    description:
      "Fluorogenic substrate for beta5i-mediated immunoproteasome activity readouts.",
  },
  {
    name: "Ac-Trp-Leu-Ala-AMC (WLA-AMC)",
    price: "$139.00",
    catalog: "SBB-PS0008, 2 mg",
    section: "Substrates",
    description:
      "Fluorogenic substrate used to track beta5 20S proteasome activity via fluorescence detection.",
  },
  {
    name: "Ac-Pro-Ala-Leu-AMC (PAL-AMC)",
    price: "$139.00",
    catalog: "SBB-PS0007, 2 mg",
    section: "Substrates",
    description:
      "Fluorogenic substrate for beta1i immunoproteasome caspase-like activity monitoring.",
  },
  {
    name: "Z-Leu-Leu-Glu-AMC (LLE-AMC)",
    price: "$139.00",
    catalog: "SBB-PS0006, 2 mg",
    section: "Substrates",
    description:
      "Fluorogenic substrate for beta1 proteasome caspase-like activity detection.",
  },
  {
    name: "20S Immunoproteasome Kit, human PBMC",
    price: "$525.00",
    catalog: "SBB-KP0037",
    section: "Kits",
    description:
      "Kit for immunoproteasome-specific activity using LLVY-AMC, PAL-AMC, and ANW-AMC substrate workflows.",
  },
  {
    name: "20S Proteasome Kit, human RBC",
    price: "$425.00",
    catalog: "SBB-KP0038",
    section: "Kits",
    description:
      "Kit for 20S proteasome activity using LLVY-AMC, LLE-AMC, and WLA-AMC substrate workflows.",
  },
];

export const metadata: Metadata = {
  title: "Proteasome | South Bay Bio",
  description:
    "Proteasome category landing page with immunoproteasomes, proteasomes, substrates, and kits.",
  alternates: {
    canonical: "/proteasome",
  },
  robots: getRobotsValue(true),
};

export default function ProteasomeLandingPage() {
  const grouped = SECTION_ORDER.map((section) => ({
    ...section,
    products: PRODUCTS.filter((product) => product.section === section.title),
  }));

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-900">
      <section className="border-b border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950">
        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            <Link href="/" className="hover:text-zinc-800 dark:hover:text-zinc-200">
              Home
            </Link>{" "}
            / Proteasome
          </p>
          <h1 className="mt-3 text-4xl font-bold tracking-tight text-zinc-950 dark:text-zinc-100 sm:text-5xl">
            Proteasome
          </h1>
          <p className="mt-4 max-w-4xl text-base leading-7 text-zinc-600 dark:text-zinc-300">
            Legacy-inspired Proteasome catalog landing page featuring 20S immunoproteasomes, 20S proteasomes,
            fluorogenic substrates, and assay kits.
          </p>
        </div>
      </section>

      <section className="border-b border-zinc-200 bg-zinc-100/50 dark:border-zinc-800 dark:bg-zinc-900/60">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-2 px-4 py-4 sm:px-6 lg:px-8">
          {SECTION_ORDER.map((section) => (
            <a
              key={section.id}
              href={`#${section.id}`}
              className="rounded-full border border-zinc-300 bg-white px-3 py-1.5 text-xs font-medium text-zinc-700 transition-colors hover:bg-zinc-100 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-300 dark:hover:bg-zinc-800"
            >
              {section.title}
            </a>
          ))}
          <span className="ml-auto text-sm font-semibold text-zinc-700 dark:text-zinc-200">13 Items</span>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl grid-cols-1 gap-6 px-4 py-8 sm:px-6 lg:grid-cols-[1fr_280px] lg:px-8">
        <div className="space-y-8">
          {/* Backward-compatible anchor for category menus that still reference 26s-proteasome. */}
          <span id="26s-proteasome" className="block scroll-mt-28" />

          {grouped.map((section) => (
            <div key={section.id} id={section.id} className="scroll-mt-28">
              <h2 className="text-2xl font-bold tracking-tight text-zinc-950 dark:text-zinc-100">
                {section.title}
              </h2>
              <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">{section.products.length} items</p>

              <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {section.products.map((product) => (
                  <Card key={product.name} className="gap-3 border-zinc-200 bg-white py-4 dark:border-zinc-800 dark:bg-zinc-950">
                    <CardHeader className="px-4">
                      <div className="flex items-start justify-between gap-3">
                        <CardTitle className="text-base leading-6 text-zinc-900 dark:text-zinc-100">
                          {product.name}
                        </CardTitle>
                        <p className="whitespace-nowrap text-base font-bold text-zinc-900 dark:text-zinc-100">
                          {product.price}
                        </p>
                      </div>
                      <p className="text-xs font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
                        Catalog: {product.catalog}
                      </p>
                    </CardHeader>
                    <CardContent className="px-4">
                      <p className="text-sm leading-6 text-zinc-600 dark:text-zinc-300">{product.description}</p>

                      <div className="mt-4 flex flex-wrap gap-2">
                        <Button variant="outline" size="sm">
                          Compare
                        </Button>
                        <Button size="sm">Add to Cart</Button>
                        <Button asChild variant="ghost" size="sm">
                          <Link href="/products">Learn More</Link>
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          ))}
        </div>

        <aside className="space-y-4">
          <Card className="gap-3 border-zinc-200 bg-white py-4 dark:border-zinc-800 dark:bg-zinc-950 lg:sticky lg:top-24">
            <CardHeader className="px-4">
              <CardTitle className="text-lg">Shop By</CardTitle>
            </CardHeader>
            <CardContent className="px-4">
              <div className="space-y-2 text-sm">
                {grouped.map((section) => (
                  <a
                    key={section.id}
                    href={`#${section.id}`}
                    className="flex items-center justify-between rounded-md px-2 py-1.5 text-zinc-700 transition-colors hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-900"
                  >
                    <span>{section.title}</span>
                    <span className="font-medium">{section.products.length}</span>
                  </a>
                ))}
              </div>

              <div className="mt-6 border-t border-zinc-200 pt-4 dark:border-zinc-800">
                <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">Legacy Links</h3>
                <div className="mt-2 flex flex-col gap-1 text-sm">
                  <Link href="/privacy-policy" className="text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-200">
                    Privacy and Cookie Policy
                  </Link>
                  <Link href="/terms-of-sale" className="text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-200">
                    Terms of Sale
                  </Link>
                  <Link href="/sitemap" className="text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-200">
                    Sitemap
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>
        </aside>
      </section>

      <section className="border-t border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950">
        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold tracking-tight text-zinc-950 dark:text-zinc-100">Custom Biochemistry</h2>
          <p className="mt-3 max-w-3xl text-sm leading-7 text-zinc-600 dark:text-zinc-300 sm:text-base">
            We offer assay design and development (TR-FRET, ELISA, fluorescence polarization), protein and antibody
            labeling, expression and purification, and enzyme kinetics support to help your team move into lead
            identification with confidence.
          </p>
          <div className="mt-5">
            <Button asChild>
              <Link href="/services">Learn more</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
