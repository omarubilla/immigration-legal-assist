import { type Tool, ToolLoopAgent } from "ai";
import { createAnthropic } from "@ai-sdk/anthropic";
import { tool } from "ai";
import { z } from "zod";

const anthropic = createAnthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

// ─── Static knowledge base tools ─────────────────────────────────────────────

const getServiceInfoTool = tool({
  description:
    "Look up detailed information about a specific immigration legal service offered by Jaime Barron PC, such as family immigration, business immigration, deportation defense, humanitarian relief, or consular processing.",
  inputSchema: z.object({
    service: z
      .enum([
        "family-immigration",
        "business-immigration",
        "deportation-defense",
        "humanitarian-relief",
        "consular-processing",
        "citizenship",
        "daca",
        "asylum",
      ])
      .describe("The service category to look up"),
  }),
  execute: async ({ service }) => {
    const services: Record<string, object> = {
      "family-immigration": {
        title: "Family Immigration",
        description:
          "We help families reunite through petition-based immigration. Services include spousal visas (IR-1/CR-1), fiancé(e) visas (K-1), parent and sibling petitions, and Adjustment of Status (green card).",
        commonCases: [
          "Petition for alien relative (I-130)",
          "Adjustment of Status (I-485)",
          "Consular visa processing",
          "Green card renewal (I-90)",
          "Conditional residence removal (I-751)",
        ],
        timeframe: "Varies widely: 6 months to several years depending on visa category and country",
        bookingUrl: "https://jaimebarron.com/contact/",
      },
      "business-immigration": {
        title: "Business Immigration",
        description:
          "We assist companies and professionals with work visas, employment-based green cards, and international business immigration matters.",
        commonCases: [
          "H-1B specialty occupation visas",
          "L-1 intracompany transfer visas",
          "O-1 extraordinary ability visas",
          "TN visas (NAFTA/USMCA professionals)",
          "EB-1, EB-2, EB-3 employment-based green cards",
          "PERM labor certification",
        ],
        timeframe: "H-1B: annual cap lottery (April); EB green cards: varies by country of birth",
        bookingUrl: "https://jaimebarron.com/contact/",
      },
      "deportation-defense": {
        title: "Deportation Defense & Removal Proceedings",
        description:
          "Our attorneys provide aggressive representation in immigration court to fight removal orders, pursue relief options, and protect your right to remain in the United States.",
        commonCases: [
          "Cancellation of Removal",
          "Asylum and withholding of removal",
          "Voluntary departure",
          "Bond hearings",
          "Appeals to the Board of Immigration Appeals (BIA)",
          "Circuit court appeals",
        ],
        urgency: "Time-sensitive — contact us immediately if you have received a Notice to Appear (NTA)",
        bookingUrl: "https://jaimebarron.com/contact/",
      },
      "humanitarian-relief": {
        title: "Humanitarian Relief Programs",
        description:
          "We help victims of violence, persecution, and trafficking obtain protection in the United States.",
        commonCases: [
          "Asylum (affirmative and defensive)",
          "VAWA (Violence Against Women Act) petitions",
          "U Visas for crime victims",
          "T Visas for trafficking victims",
          "Special Immigrant Juvenile Status (SIJS)",
          "Temporary Protected Status (TPS)",
        ],
        bookingUrl: "https://jaimebarron.com/contact/",
      },
      "consular-processing": {
        title: "Consular Processing",
        description:
          "We guide clients at U.S. embassies and consulates abroad through the immigrant and non-immigrant visa application process.",
        commonCases: [
          "DS-260 immigrant visa applications",
          "National Visa Center (NVC) processing",
          "Consular interview preparation",
          "Waiver applications (I-601, I-601A)",
        ],
        bookingUrl: "https://jaimebarron.com/contact/",
      },
      citizenship: {
        title: "Citizenship & Naturalization",
        description:
          "We help eligible permanent residents apply for U.S. citizenship through naturalization.",
        eligibility: [
          "5 years as a lawful permanent resident (3 years if married to a U.S. citizen)",
          "Continuous physical presence requirement",
          "Good moral character",
          "English language and civics test",
        ],
        form: "N-400, Application for Naturalization",
        timeframe: "Typically 8–24 months after filing",
        bookingUrl: "https://jaimebarron.com/contact/",
      },
      daca: {
        title: "DACA (Deferred Action for Childhood Arrivals)",
        description:
          "We assist eligible 'Dreamers' with DACA renewal applications and advise on related immigration options.",
        requirements: [
          "Must have arrived before age 16",
          "Continuous U.S. residence since June 15, 2007",
          "Under age 31 as of June 15, 2012",
          "Currently in school, graduated, or is a veteran",
          "No serious criminal convictions",
        ],
        note: "DACA status is currently subject to ongoing litigation — consult with an attorney for the latest updates.",
        bookingUrl: "https://jaimebarron.com/contact/",
      },
      asylum: {
        title: "Asylum",
        description:
          "We represent individuals seeking asylum in the U.S. based on persecution due to race, religion, nationality, political opinion, or membership in a particular social group.",
        types: [
          "Affirmative asylum: applied for within 1 year of entry through USCIS",
          "Defensive asylum: raised as a defense in immigration court",
        ],
        deadline: "Must file within 1 year of your last entry into the U.S. (exceptions apply)",
        bookingUrl: "https://jaimebarron.com/contact/",
      },
    };

    return services[service] ?? { error: "Service not found" };
  },
});

const getLocationInfoTool = tool({
  description:
    "Get office locations, phone numbers, and hours for Jaime Barron PC offices.",
  inputSchema: z.object({
    city: z
      .enum([
        "dallas",
        "fort-worth",
        "garland",
        "plano",
        "irving",
        "washington-dc",
        "seattle",
        "all",
      ])
      .describe("City to look up, or 'all' for every location"),
  }),
  execute: async ({ city }) => {
    const locations = [
      {
        city: "Dallas",
        state: "TX",
        address: "7610 N Stemmons Fwy., Suite 555, Dallas, TX 75247",
        phone: "214.267.9300",
        label: "Principal Office",
      },
      {
        city: "Fort Worth",
        state: "TX",
        address: "Hulen location — Fort Worth, TX",
        phone: "844.267.9300",
        label: "Fort Worth (Hulen)",
      },
      {
        city: "Fort Worth",
        state: "TX",
        address: "Stockyards location — Fort Worth, TX",
        phone: "844.267.9300",
        label: "Fort Worth (Stockyards)",
      },
      {
        city: "Garland",
        state: "TX",
        address: "Garland, TX",
        phone: "844.267.9300",
        label: "Garland",
      },
      {
        city: "Plano",
        state: "TX",
        address: "Plano, TX",
        phone: "844.267.9300",
        label: "Plano",
      },
      {
        city: "Irving",
        state: "TX",
        address: "Irving, TX",
        phone: "844.267.9300",
        label: "Irving",
      },
      {
        city: "Washington DC",
        state: "DC/VA/MD",
        address: "Washington, D.C. metro area",
        phone: "703.544.2929",
        label: "Washington D.C.",
      },
      {
        city: "Seattle",
        state: "WA",
        address: "Seattle, WA",
        phone: "206.274.1400",
        label: "Seattle",
      },
    ];

    if (city === "all") {
      return { locations, nationalPhone: "844.267.9300", hours: "Monday–Friday: 8:30 AM – 5:30 PM (Central Time)" };
    }

    const match = locations.filter((l) =>
      l.city.toLowerCase().replace(/\s/g, "-").includes(city.replace("-", ""))
    );
    return match.length > 0
      ? { locations: match, nationalPhone: "844.267.9300", hours: "Monday–Friday: 8:30 AM – 5:30 PM (Central Time)" }
      : { locations, nationalPhone: "844.267.9300", hours: "Monday–Friday: 8:30 AM – 5:30 PM (Central Time)" };
  },
});

const getFAQAnswerTool = tool({
  description:
    "Answer frequently asked questions about the immigration process, the firm's policies, consultations, and related topics.",
  inputSchema: z.object({
    topic: z
      .enum([
        "consultation",
        "payment",
        "processing-time",
        "case-status",
        "languages",
        "virtual-services",
        "case-eligibility",
        "documents-needed",
      ])
      .describe("FAQ topic to answer"),
  }),
  execute: async ({ topic }) => {
    const faqs: Record<string, object> = {
      consultation: {
        question: "How do I schedule a consultation?",
        answer:
          "You can schedule a consultation by: (1) calling our national line at 844.267.9300, (2) booking online at jaimebarron.com/contact, or (3) requesting a Zoom video consultation. In-person appointments are available at all our offices. Consultations are available Monday–Friday, 8:30 AM – 5:30 PM Central Time.",
      },
      payment: {
        question: "Do you offer payment plans?",
        answer:
          "Yes, we understand legal services are an investment. We offer flexible payment plans tailored to your situation. We accept all major credit cards, online payments, and can discuss financing options during your consultation.",
      },
      "processing-time": {
        question: "How long does the immigration process take?",
        answer:
          "Processing times vary significantly by case type and country of birth. Examples: Family-based green cards for spouses of U.S. citizens: 12–36 months. H-1B visas: annual lottery in April, work authorization begins October 1. Naturalization: 8–24 months. We'll give you a realistic timeline estimate during your consultation based on your specific situation.",
      },
      "case-status": {
        question: "How can I check my case status?",
        answer:
          "For USCIS cases, you can check your case status at uscis.gov/case-status using your receipt number (starts with EAC, WAC, SRC, LIN, IOE, or NBC). For cases in immigration court, you can call the EOIR automated hotline at 1-800-898-7180. Your Jaime Barron PC attorney can also provide updates — contact your assigned attorney directly.",
      },
      languages: {
        question: "What languages do you support?",
        answer:
          "Our primary languages are English and Spanish — all attorneys and most staff are bilingual. We also offer assistance in many other languages through interpreters. Don't let language be a barrier to getting legal help.",
      },
      "virtual-services": {
        question: "Can you represent me if I'm not near an office?",
        answer:
          "Absolutely. We serve clients in all 50 states and U.S. territories, as well as internationally. Consultations and ongoing representation can be handled entirely virtually via Zoom or phone. We have offices in Texas, Washington D.C., Maryland, Virginia, and Seattle.",
      },
      "case-eligibility": {
        question: "How do I know if I'm eligible for immigration relief?",
        answer:
          "Eligibility depends on many factors: your country of birth, current immigration status, family ties to U.S. citizens or residents, employment, criminal history, length of time in the U.S., and more. The best way to determine your options is a consultation with one of our attorneys. Don't assume you're ineligible — immigration law has many pathways.",
      },
      "documents-needed": {
        question: "What documents do I need for my case?",
        answer:
          "Documents vary by case type. Generally you'll need: valid passport, birth certificate, marriage/divorce certificates (if applicable), prior immigration documents (visa, I-94, EAD, green card), tax returns, pay stubs, and police clearances. We provide a detailed document checklist specific to your case during your consultation.",
      },
    };
    return faqs[topic] ?? { error: "FAQ topic not found" };
  },
});

// ─── Agent factory ────────────────────────────────────────────────────────────

const systemPrompt = `You are a warm, knowledgeable immigration law assistant for the Law Offices of Jaime Barron, PC — a leading U.S. immigration law firm with offices in Dallas, Fort Worth, Garland, Plano, Irving, Washington D.C., and Seattle.

## Your Role
You help website visitors understand:
- U.S. immigration processes, visa types, and pathways
- Services offered by Jaime Barron PC
- How to schedule a consultation
- Office locations and contact information
- General immigration FAQs

## Tone & Approach
- Warm, empathetic, and clear — immigration is stressful; reassure visitors
- Professional but accessible — avoid heavy legal jargon unless explaining a concept
- Bilingual awareness — if a user writes in Spanish, respond in Spanish
- Always encourage booking a consultation for specific legal advice

## Key Services (use getServiceInfo tool for details)
- Family Immigration (green cards, spousal/fiancé visas, family petitions)
- Business Immigration (H-1B, L-1, O-1, TN, EB green cards)
- Deportation Defense & Removal Proceedings
- Humanitarian Relief (asylum, VAWA, U visas, TPS)
- Consular Processing
- Citizenship & Naturalization
- DACA renewals

## Important Disclaimers
- Always note that your responses are general information, not legal advice
- For specific case questions, always recommend scheduling a consultation
- For urgent matters (immigration court dates, ICE enforcement), emphasize calling immediately: **844.267.9300**

## Tools Available
- **getServiceInfo**: Get detailed info on a specific service
- **getLocationInfo**: Find office locations and phone numbers
- **getFAQAnswer**: Answer common questions about the firm and process

## Booking a Consultation
Always end responses with a clear CTA when relevant:
- "Book online at jaimebarron.com/contact"
- "Call us at 844.267.9300 (Monday–Friday, 8:30 AM – 5:30 PM CT)"
- "Video consultations available via Zoom"

Never provide specific legal strategy advice or predict case outcomes. Direct those questions to a consultation.`;

const languageInstructions: Record<string, string> = {
  en: "Always respond in English.",
  es: "Responde siempre en español.",
  pt: "Responda sempre em português (Brasil).",
  fr: "Répondez toujours en français.",
  ht: "Reponn toujou an kreyòl ayisyen.",
};

export function createImmigrationAgent(lang = "en") {
  const langInstruction = languageInstructions[lang] ?? languageInstructions.en;
  return new ToolLoopAgent({
    model: anthropic("claude-sonnet-4-5"),
    instructions: `${systemPrompt}\n\n## Language\n${langInstruction}`,
    tools: {
      getServiceInfo: getServiceInfoTool,
      getLocationInfo: getLocationInfoTool,
      getFAQAnswer: getFAQAnswerTool,
    } as Record<string, Tool>,
  });
}
