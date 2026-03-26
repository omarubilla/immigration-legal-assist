import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, FlaskConical, Microscope, ScanSearch, TestTube2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getRobotsValue, isProteasomeSeoExperiment } from "@/lib/site";

export const metadata: Metadata = {
  title: "Services | South Bay Bio",
  description:
    "Custom assay development, protein labeling, and purification services from South Bay Bio.",
  alternates: {
    canonical: "/services",
  },
  robots: getRobotsValue(!isProteasomeSeoExperiment()),
};

const PAGE_ANCHORS = [
  { label: "Overview", href: "#overview" },
  { label: "Key Services", href: "#key-services" },
  { label: "Methodologies", href: "#methodologies" },
  { label: "Process", href: "#process" },
  { label: "Contact", href: "#contact" },
];

const KEY_SERVICES = [
  {
    title: "Custom Assay Design",
    description:
      "Phase-gated assay design for TR-FRET, ELISA, FP, and thermal shift workflows with reproducibility at the center.",
    icon: FlaskConical,
  },
  {
    title: "Protein and Antibody Labeling",
    description:
      "Site-specific and amine-reactive labeling strategies tuned for high signal-to-noise and low assay interference.",
    icon: TestTube2,
  },
  {
    title: "Protein Production and Purification",
    description:
      "In-house expression and purification across bacterial, insect, and mammalian systems with >95% purity targets.",
    icon: Microscope,
  },
  {
    title: "Validation and Hit Characterization",
    description:
      "Follow-on support for dose-response, IC/EC50, binding affinity, and mechanism-focused confirmation studies.",
    icon: ScanSearch,
  },
];

const METHODOLOGIES = [
  "TR-FRET and time-resolved fluorescence workflows",
  "ELISA and chemiluminescent assay formats",
  "Fluorescence polarization and kinetic readouts",
  "Thermal shift and affinity characterization",
  "Substrate and complex disruption validation",
  "Custom data packages for transfer to internal teams",
];

const PROCESS_STEPS = [
  {
    step: "01",
    title: "Feasibility Review",
    body: "We align on target biology, sample availability, timelines, and success criteria.",
  },
  {
    step: "02",
    title: "Development Plan",
    body: "A project plan is drafted with milestones, risk controls, and reporting cadence.",
  },
  {
    step: "03",
    title: "Build and Optimize",
    body: "Reagent generation, labeling, and optimization cycles are executed with benchmark reporting.",
  },
  {
    step: "04",
    title: "Validate and Transfer",
    body: "Final validation datasets, SOP recommendations, and implementation support are provided.",
  },
];

export default function ServicesPage() {
  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-900">
      <section id="overview" className="border-b border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 py-10 sm:px-6 lg:grid-cols-2 lg:gap-12 lg:px-8 lg:py-14">
          <div>
            <Badge className="bg-blue-500/10 text-blue-700 hover:bg-blue-500/20 dark:bg-blue-500/20 dark:text-blue-300">
              Custom Order Services
            </Badge>
            <h1 className="mt-4 text-3xl font-bold tracking-tight text-zinc-950 dark:text-zinc-100 sm:text-4xl lg:text-5xl">
              Assay Development and Custom Biochemistry
            </h1>
            <p className="mt-4 max-w-2xl text-base leading-relaxed text-zinc-600 dark:text-zinc-300 sm:text-lg">
              Advanced service workflows for discovery teams who need high-confidence data, reproducible execution,
              and clear transfer paths from exploratory studies to screening programs.
            </p>
            <p className="mt-4 max-w-2xl text-base leading-relaxed text-zinc-600 dark:text-zinc-300 sm:text-lg">
              We design around your biological question, then build, optimize, and validate with a project model that
              keeps quality and turnaround aligned to your milestone needs.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <Button asChild className="bg-gradient-to-r from-sky-400 to-blue-600 text-white hover:from-sky-500 hover:to-blue-700">
                <Link href="#contact">
                  Start a Custom Order
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button asChild variant="outline" className="border-zinc-300 bg-white hover:bg-zinc-100 dark:border-zinc-700 dark:bg-zinc-900 dark:hover:bg-zinc-800">
                <Link href="#key-services">Explore Services</Link>
              </Button>
            </div>
          </div>

          <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-zinc-100 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
            <Image
              src="/10HallmarksofC.jpeg"
              alt="The 10 Hallmarks of Cancer scientific diagram"
              width={1056}
              height={768}
              className="h-full w-full object-cover"
              priority
              sizes="(max-width: 1024px) 100vw, 50vw"
            />
          </div>
        </div>
      </section>

      <section className="sticky top-16 z-30 border-b border-zinc-200 bg-white/90 backdrop-blur-md dark:border-zinc-800 dark:bg-zinc-950/90">
        <div className="mx-auto max-w-7xl px-4 py-3 sm:px-6 lg:px-8">
          <nav aria-label="Services page sections" className="flex flex-wrap gap-2">
            {PAGE_ANCHORS.map((anchor) => (
              <a
                key={anchor.href}
                href={anchor.href}
                className="rounded-full border border-zinc-300 bg-white px-3 py-1.5 text-xs font-medium text-zinc-700 transition-colors hover:bg-zinc-100 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800"
              >
                {anchor.label}
              </a>
            ))}
          </nav>
        </div>
      </section>

      <section id="key-services" className="border-b border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900/40">
        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-zinc-500 dark:text-zinc-400">Key Services</p>
          <h2 className="mt-2 text-2xl font-bold tracking-tight text-zinc-950 dark:text-zinc-100 sm:text-3xl">
            Discovery to Validation Support
          </h2>

          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            {KEY_SERVICES.map((service) => {
              const Icon = service.icon;

              return (
                <Card key={service.title} className="rounded-2xl border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
                  <CardHeader>
                    <div className="mb-2 inline-flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-r from-sky-400 to-blue-600 text-white">
                      <Icon className="h-5 w-5" />
                    </div>
                    <CardTitle className="text-xl text-zinc-950 dark:text-zinc-100">{service.title}</CardTitle>
                    <CardDescription className="text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
                      {service.description}
                    </CardDescription>
                  </CardHeader>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      <section id="methodologies" className="border-b border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950">
        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-zinc-500 dark:text-zinc-400">Methodologies</p>
          <h2 className="mt-2 text-2xl font-bold tracking-tight text-zinc-950 dark:text-zinc-100 sm:text-3xl">
            Biochemical and Biophysical Toolset
          </h2>

          <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {METHODOLOGIES.map((item) => (
              <div
                key={item}
                className="rounded-xl border border-zinc-200 bg-zinc-50 p-4 text-sm leading-relaxed text-zinc-700 dark:border-zinc-800 dark:bg-zinc-900/60 dark:text-zinc-300"
              >
                {item}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="process" className="border-b border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900/40">
        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-zinc-500 dark:text-zinc-400">Process</p>
          <h2 className="mt-2 text-2xl font-bold tracking-tight text-zinc-950 dark:text-zinc-100 sm:text-3xl">
            Project Lifecycle
          </h2>

          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {PROCESS_STEPS.map((item) => (
              <Card key={item.step} className="rounded-2xl border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
                <CardHeader>
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-zinc-500 dark:text-zinc-400">{item.step}</p>
                  <CardTitle className="text-lg text-zinc-950 dark:text-zinc-100">{item.title}</CardTitle>
                  <CardDescription className="text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
                    {item.body}
                  </CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section id="contact" className="bg-white dark:bg-zinc-950">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-6 dark:border-zinc-800 dark:bg-zinc-900/50 sm:p-8">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-zinc-500 dark:text-zinc-400">Need Help?</p>
            <h2 className="mt-2 text-2xl font-bold tracking-tight text-zinc-950 dark:text-zinc-100 sm:text-3xl">
              Tell us your target, assay format, and timeline
            </h2>
            <p className="mt-3 max-w-2xl text-sm leading-relaxed text-zinc-600 dark:text-zinc-400 sm:text-base">
              We will propose a practical experimental plan, recommended workflow, and a scope aligned to your project stage.
            </p>

            <div className="mt-6 flex flex-wrap gap-3">
              <Button asChild className="bg-gradient-to-r from-sky-400 to-blue-600 text-white hover:from-sky-500 hover:to-blue-700">
                <Link href="mailto:support@south-bay-bio.com">
                  Contact Scientific Support
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button asChild variant="outline" className="border-zinc-300 bg-white hover:bg-zinc-100 dark:border-zinc-700 dark:bg-zinc-900 dark:hover:bg-zinc-800">
                <Link href="tel:+14159353226">Call (415) 935-3226</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
