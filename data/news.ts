export interface NewsItem {
  title: string;
  tag: string;
  description: string;
  body?: string;
  image: string;
  imageAlt: string;
  link: string;
}

export const newsItems: NewsItem[] = [
  {
    title: "Enabling Regenerative Peptide Research",
    tag: "Regenerative Medicine",
    description:
      "South Bay Bio supplies high-purity metal reagents and peptide synthesis materials enabling research into regenerative peptides such as GHK-Cu.",
    body: "Copper peptides such as GHK-Cu are widely studied for their role in tissue repair, collagen synthesis, and regenerative biology. Researchers studying these signaling molecules require ultra-high-purity metal reagents and peptide synthesis inputs to ensure reproducibility and experimental accuracy. South Bay Bio provides laboratory-grade materials used by biotechnology labs exploring next-generation regenerative medicine and longevity science.",
    image: "/images/news/ghk-cu-research.jpg",
    imageAlt:
      "Scientific molecular visualization of copper peptide research in a biotech lab with blue and copper tones",
    link: "/news/ghk-cu-research",
  },
  {
    title: "Improving Reproducibility in Peptide Synthesis",
    tag: "Research Quality",
    description:
      "Consistency in precursor quality and handling standards helps labs reduce variance across peptide synthesis workflows.",
    image: "/C-TerminalDerivatives.jpeg",
    imageAlt: "Peptide chemistry workflow and synthesis materials in a laboratory setting",
    link: "/news/peptide-synthesis-reproducibility",
  },
  {
    title: "Metalloprotein Studies Need Precision Inputs",
    tag: "Protein Science",
    description:
      "Metal ion purity and validated assay components are central to confidence in metalloprotein and signaling experiments.",
    image: "/TR-FRET-Ubi-AssaysSlide.jpeg",
    imageAlt: "Biotechnology instrumentation used for advanced protein and assay research",
    link: "/news/metalloprotein-precision-inputs",
  },
  {
    title: "Longevity Labs Expand Copper Peptide Programs",
    tag: "Longevity Science",
    description:
      "As regenerative biology programs scale, demand for high-integrity reagents and peptide inputs continues to grow.",
    image: "/Proteasomes&Substrates.jpeg",
    imageAlt: "Modern biotech research environment focused on regenerative biology",
    link: "/news/longevity-labs-copper-peptides",
  },
];
