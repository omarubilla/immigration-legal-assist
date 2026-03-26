"use client";

import { useState, useRef, useEffect } from "react";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { Scale, Send, Loader2, X, User, Phone, ChevronLeft, Mic, Square } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ImmigrationWelcomeScreen } from "./ImmigrationWelcomeScreen";
import type { UIMessage } from "ai";

interface ImmigrationChatSheetProps {
  isOpen: boolean;
  onClose: () => void;
}

interface ConsultationMessage {
  id: string;
  role: "assistant" | "user";
  text: string;
}

interface ConsultationTripRow {
  entryDate: string;
  exitDate: string;
  entryLocation: string;
  validDocuments: "yes" | "no" | "unknown" | "";
}

interface ConsultationArrestRow {
  arrestDate: string;
  chargeType: string;
  arrestLocation: string;
  outcomeSentence: string;
}

interface PendingExitEstimate {
  rowIndex: number;
  inferredExitDate: string;
  prompt: string;
}

interface PendingChargeConfirmation {
  rowIndex: number;
  proposedCharge: string;
}

interface InferredExitEstimate {
  inferredExitDate: string;
  prompt: string;
}

type ConsultationTripField = keyof ConsultationTripRow;
type ConsultationArrestField = keyof ConsultationArrestRow;
type BinaryAnswer = "yes" | "no" | "unknown" | "";
type PoliceHelpStage =
  | "initialNarrative"
  | "confirmNarrative"
  | "askReportTaken"
  | "askNameListed"
  | "askHasReportCopy"
  | "askWantsFirmRequest"
  | "finalConfirmation";

type ChatMode = "chat" | "consultation";
type ConsultationStep = "idle" | "entries" | "arrests" | "policeHelp" | "complete";

const ENTRY_COUNT_WORDS: Record<LangCode, Record<string, number>> = {
  en: {
    one: 1,
    two: 2,
    three: 3,
    four: 4,
    five: 5,
    six: 6,
    seven: 7,
    eight: 8,
    nine: 9,
    ten: 10,
  },
  es: {
    uno: 1,
    una: 1,
    dos: 2,
    tres: 3,
    cuatro: 4,
    cinco: 5,
    seis: 6,
    siete: 7,
    ocho: 8,
    nueve: 9,
    diez: 10,
  },
  pt: {
    um: 1,
    uma: 1,
    dois: 2,
    tres: 3,
    três: 3,
    quatro: 4,
    cinco: 5,
    seis: 6,
    sete: 7,
    oito: 8,
    nove: 9,
    dez: 10,
  },
  fr: {
    un: 1,
    une: 1,
    deux: 2,
    trois: 3,
    quatre: 4,
    cinq: 5,
    six: 6,
    sept: 7,
    huit: 8,
    neuf: 9,
    dix: 10,
  },
};

function getMessageText(message: UIMessage): string {
  if (!message.parts || message.parts.length === 0) return "";
  return message.parts
    .filter((p) => p.type === "text")
    .map((p) => (p as { type: "text"; text: string }).text)
    .join("\n");
}

function getToolParts(message: UIMessage) {
  if (!message.parts || message.parts.length === 0) return [];
  return message.parts.filter((p) => p.type.startsWith("tool-"));
}

function shouldShowConsultationCTA(content: string): boolean {
  return /(necesitas\s+ayuda\??|need\s+help\??|precisa\s+de\s+ajuda\??|besoin\s+d'aide\s*\??)/i.test(
    content,
  );
}

const LANGUAGES = [
  { code: "en", label: "English", flag: "🇺🇸" },
  { code: "es", label: "Español", flag: "🇪🇸" },
  { code: "pt", label: "Português", flag: "🇧🇷" },
  { code: "fr", label: "Français", flag: "🇫🇷" },
] as const;

type BrowserSpeechRecognition = {
  lang: string;
  interimResults: boolean;
  maxAlternatives: number;
  continuous: boolean;
  start: () => void;
  stop: () => void;
  onresult:
    | ((event: {
        resultIndex: number;
        results: ArrayLike<{
          isFinal: boolean;
          length: number;
          0?: { transcript: string };
        }>;
      }) => void)
    | null;
  onerror: ((event: { error?: string }) => void) | null;
  onend: (() => void) | null;
};

type BrowserSpeechRecognitionCtor = new () => BrowserSpeechRecognition;

type VoiceStatusCode = "idle" | "listening" | "processing" | "unsupported" | "permission-denied" | "error";

const AUTO_SPEAK_STORAGE_KEY = "jaime-barron-chat-auto-speak";

const SPEECH_LANG_BY_UI_LANG: Record<LangCode, string> = {
  en: "en-US",
  es: "es-ES",
  pt: "pt-BR",
  fr: "fr-FR",
};

function getVoiceStatusLabel(lang: LangCode, status: VoiceStatusCode): string {
  const copyByLang: Record<LangCode, Record<VoiceStatusCode, string>> = {
    en: {
      idle: "Voice ready",
      listening: "Listening... speak now",
      processing: "Processing voice input...",
      unsupported: "Voice input is not supported in this browser",
      "permission-denied": "Microphone permission denied",
      error: "Voice input error. Please try again",
    },
    es: {
      idle: "Voz lista",
      listening: "Escuchando... hable ahora",
      processing: "Procesando entrada de voz...",
      unsupported: "La entrada de voz no es compatible con este navegador",
      "permission-denied": "Permiso de microfono denegado",
      error: "Error de voz. Intentelo de nuevo",
    },
    pt: {
      idle: "Voz pronta",
      listening: "Ouvindo... fale agora",
      processing: "Processando entrada de voz...",
      unsupported: "Entrada de voz nao suportada neste navegador",
      "permission-denied": "Permissao de microfone negada",
      error: "Erro de voz. Tente novamente",
    },
    fr: {
      idle: "Voix prete",
      listening: "Ecoute en cours... parlez maintenant",
      processing: "Traitement de la voix en cours...",
      unsupported: "La saisie vocale n'est pas prise en charge par ce navigateur",
      "permission-denied": "Autorisation du microphone refusee",
      error: "Erreur vocale. Veuillez reessayer",
    },
  };

  return copyByLang[lang][status];
}

type LangCode = (typeof LANGUAGES)[number]["code"];

const YES_PATTERNS: Record<LangCode, RegExp> = {
  en: /\b(yes|yeah|yep|i did|i have|helped)\b/i,
  es: /\b(si|s[ií]|claro|ayude|ayud[eé])\b/i,
  pt: /\b(sim|claro|ajudei|ajude)\b/i,
  fr: /\b(oui|j'ai aide|aide)\b/i,
};

const NO_PATTERNS: Record<LangCode, RegExp> = {
  en: /\b(no|nope|did not|didn't|without)\b/i,
  es: /\b(no|nunca|sin)\b/i,
  pt: /\b(nao|não|nunca|sem)\b/i,
  fr: /\b(non|jamais|sans)\b/i,
};

const UNKNOWN_PATTERNS: Record<LangCode, RegExp> = {
  en: /\b(not sure|don't know|dont know|unknown|unsure|maybe)\b/i,
  es: /\b(no se|no sé|quizas|quizás|tal vez)\b/i,
  pt: /\b(nao sei|não sei|talvez)\b/i,
  fr: /\b(je ne sais pas|pas sur|incertain|peut-etre|peut-être)\b/i,
};

const MONTHS_BY_TOKEN: Record<string, string> = {
  january: "01",
  jan: "01",
  febrero: "02",
  february: "02",
  feb: "02",
  fevrier: "02",
  fevr: "02",
  février: "02",
  fev: "02",
  fevereiro: "02",
  march: "03",
  mar: "03",
  marzo: "03",
  mars: "03",
  abril: "04",
  april: "04",
  avr: "04",
  avril: "04",
  abr: "04",
  may: "05",
  mayo: "05",
  mai: "05",
  maio: "05",
  june: "06",
  jun: "06",
  junio: "06",
  juin: "06",
  junho: "06",
  july: "07",
  jul: "07",
  julio: "07",
  juillet: "07",
  julho: "07",
  august: "08",
  aug: "08",
  agosto: "08",
  aout: "08",
  août: "08",
  setembro: "09",
  septiembre: "09",
  september: "09",
  sep: "09",
  sept: "09",
  septembre: "09",
  october: "10",
  oct: "10",
  octubre: "10",
  octobre: "10",
  outubro: "10",
  november: "11",
  nov: "11",
  noviembre: "11",
  novembre: "11",
  dezembro: "12",
  diciembre: "12",
  december: "12",
  dec: "12",
  decembre: "12",
  décembre: "12",
  dezembro: "12",
};

const SEASONS_BY_TOKEN: Record<string, string> = {
  spring: "04",
  primavera: "04",
  summer: "07",
  verano: "07",
  ete: "07",
  eté: "07",
  ete: "07",
  verano: "07",
  verao: "07",
  verão: "07",
  fall: "10",
  autumn: "10",
  otoño: "10",
  otono: "10",
  automne: "10",
  outono: "10",
  winter: "01",
  invierno: "01",
  hiver: "01",
  inverno: "01",
};

const PREFERRED_FEMININE_VOICE_NAMES = [
  "monica",
  "paulina",
  "sabina",
  "helena",
  "maria",
  "paloma",
  "soledad",
  "lucia",
  "luciana",
  "elvira",
  "carmen",
];

const ORDINAL_WORDS_ES = [
  "primera",
  "segunda",
  "tercera",
  "cuarta",
  "quinta",
  "sexta",
  "septima",
  "octava",
  "novena",
  "decima",
];

function normalizeText(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/(\d)(st|nd|rd|th)\b/g, "$1")
    .toLowerCase()
    .replace(/,/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function formatIsoDate(year: string, month: string, day: string): string {
  return `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
}

function parseConsultationDate(text: string, lang: LangCode): string | null {
  const normalized = normalizeText(text);
  const yearMatch = normalized.match(/\b(19|20)\d{2}\b/);

  const monthYearMatch = normalized.match(/\b(?:around|about|circa|aproximadamente|aprox|cerca de|vers|environ)?\s*([a-z]+)\s+(\d{4})\b/);
  if (monthYearMatch) {
    const month = MONTHS_BY_TOKEN[monthYearMatch[1]];
    if (month) {
      return formatIsoDate(monthYearMatch[2], month, "15");
    }
  }

  const seasonYearMatch = normalized.match(/\b([a-z]+)\s+(?:of\s+|de\s+|du\s+)?(\d{4})\b/);
  if (seasonYearMatch) {
    const month = SEASONS_BY_TOKEN[seasonYearMatch[1]];
    if (month) {
      return formatIsoDate(seasonYearMatch[2], month, "15");
    }
  }

  const isoMatch = normalized.match(/\b(\d{4})[-/.](\d{1,2})[-/.](\d{1,2})\b/);
  if (isoMatch) {
    return formatIsoDate(isoMatch[1], isoMatch[2], isoMatch[3]);
  }

  const numericMatch = normalized.match(/\b(\d{1,2})[/-](\d{1,2})[/-](\d{2,4})\b/);
  if (numericMatch) {
    const first = numericMatch[1];
    const second = numericMatch[2];
    const rawYear = numericMatch[3];
    const year = rawYear.length === 2 ? `20${rawYear}` : rawYear;
    const month = lang === "en" ? first : second;
    const day = lang === "en" ? second : first;
    return formatIsoDate(year, month, day);
  }

  const monthDayYearMatch = normalized.match(/\b([a-z]+)\s+(\d{1,2})\s+(\d{4})\b/);
  if (monthDayYearMatch) {
    const month = MONTHS_BY_TOKEN[monthDayYearMatch[1]];
    if (month) {
      return formatIsoDate(monthDayYearMatch[3], month, monthDayYearMatch[2]);
    }
  }

  const dayMonthYearMatch = normalized.match(/\b(\d{1,2})\s+([a-z]+)\s+(\d{4})\b/);
  if (dayMonthYearMatch) {
    const month = MONTHS_BY_TOKEN[dayMonthYearMatch[2]];
    if (month) {
      return formatIsoDate(dayMonthYearMatch[3], month, dayMonthYearMatch[1]);
    }
  }

  if (yearMatch) {
    const year = yearMatch[0];

    for (const [token, month] of Object.entries(MONTHS_BY_TOKEN)) {
      if (normalized.includes(token)) {
        return formatIsoDate(year, month, "15");
      }
    }

    for (const [token, month] of Object.entries(SEASONS_BY_TOKEN)) {
      if (normalized.includes(token)) {
        return formatIsoDate(year, month, "15");
      }
    }

    // Last-resort estimate when only year is known.
    return formatIsoDate(year, "07", "01");
  }

  return null;
}

function parseDurationYears(text: string): { minYears: number; maxYears: number } | null {
  const normalized = normalizeText(text);

  const rangeMatch = normalized.match(/\b(\d{1,2})\s*(?:o|or|to|a|-)\s*(\d{1,2})\s*(?:anos|ano|años|years|year|ans|an)\b/);
  if (rangeMatch) {
    const first = Number(rangeMatch[1]);
    const second = Number(rangeMatch[2]);
    return {
      minYears: Math.min(first, second),
      maxYears: Math.max(first, second),
    };
  }

  const singleMatch = normalized.match(/\b(\d{1,2})\s*(?:anos|ano|años|years|year|ans|an)\b/);
  if (singleMatch) {
    const years = Number(singleMatch[1]);
    return { minYears: years, maxYears: years };
  }

  return null;
}

function parseEntryLocation(text: string): string | null {
  const locationMatch = text.match(
    /(?:por|via|through|at|en|in)\s+([\p{L}0-9\s.,'-]{3,80}?)(?=(?:\s+(?:y|and|con|with|pero|despues|after|then)\b|[.;]|$))/iu,
  );

  if (!locationMatch) return null;

  const location = locationMatch[1]
    .replace(/\s+/g, " ")
    .replace(/[.,;:\-]+$/g, "")
    .trim();

  return location.length >= 3 ? location : null;
}

function inferTripRowFromUtterance(
  row: ConsultationTripRow,
  text: string,
  lang: LangCode,
): ConsultationTripRow {
  const inferredDate = parseConsultationDate(text, lang);
  const inferredLocation = parseEntryLocation(text);

  return {
    ...row,
    entryDate: row.entryDate || inferredDate || "",
    entryLocation: row.entryLocation || inferredLocation || "",
  };
}

function inferExitDateFromDuration(
  entryDate: string,
  duration: { minYears: number; maxYears: number },
  lang: LangCode,
): InferredExitEstimate {
  const entryYear = Number(entryDate.slice(0, 4));
  const entryMonth = entryDate.slice(5, 7) || "07";
  const entryDay = entryDate.slice(8, 10) || "01";
  const estimatedYear = entryYear + duration.minYears;
  const maxEstimatedYear = entryYear + duration.maxYears;
  const inferredExitDate = formatIsoDate(String(estimatedYear), entryMonth, entryDay);

  if (lang === "es") {
    if (duration.minYears !== duration.maxYears) {
      return {
        inferredExitDate,
        prompt: `Ok, te entiendo. Si entraste en ${entryYear} y estuviste aqui entre ${duration.minYears} y ${duration.maxYears} anos, tu salida aproximada seria alrededor de ${estimatedYear} (quizas hasta ${maxEstimatedYear}). Suena correcto o fue otra fecha?`,
      };
    }

    return {
      inferredExitDate,
      prompt: `Ok, te entiendo. Si entraste en ${entryYear} y estuviste aqui ${duration.minYears} anos, entonces saliste aproximadamente en ${estimatedYear}. Suena correcto o fue otra fecha?`,
    };
  }

  return {
    inferredExitDate,
    prompt: `If you entered in ${entryYear} and stayed about ${duration.minYears}${
      duration.minYears !== duration.maxYears ? `-${duration.maxYears}` : ""
    } years, your approximate exit would be around ${estimatedYear}. Does that sound right?`,
  };
}

function parseValidDocumentsAnswer(text: string, lang: LangCode): ConsultationTripRow["validDocuments"] | null {
  if (UNKNOWN_PATTERNS[lang].test(text)) return "unknown";
  if (YES_PATTERNS[lang].test(text)) return "yes";
  if (NO_PATTERNS[lang].test(text)) return "no";
  return null;
}

function findNextIncompleteTripField(
  rows: ConsultationTripRow[],
): { rowIndex: number; field: ConsultationTripField } | null {
  for (const [rowIndex, row] of rows.entries()) {
    if (!row.entryDate) return { rowIndex, field: "entryDate" };
    if (!row.exitDate) return { rowIndex, field: "exitDate" };
    if (!row.entryLocation.trim()) return { rowIndex, field: "entryLocation" };
    if (!row.validDocuments) return { rowIndex, field: "validDocuments" };
  }

  return null;
}

function findNextIncompleteArrestField(
  rows: ConsultationArrestRow[],
): { rowIndex: number; field: ConsultationArrestField } | null {
  for (const [rowIndex, row] of rows.entries()) {
    if (!row.arrestDate) return { rowIndex, field: "arrestDate" };
    if (!row.chargeType.trim()) return { rowIndex, field: "chargeType" };
    if (!row.arrestLocation.trim()) return { rowIndex, field: "arrestLocation" };
    if (!row.outcomeSentence.trim()) return { rowIndex, field: "outcomeSentence" };
  }

  return null;
}

function isTripRowComplete(row: ConsultationTripRow): boolean {
  return Boolean(row.entryDate && row.exitDate && row.entryLocation.trim() && row.validDocuments);
}

function isArrestRowComplete(row: ConsultationArrestRow): boolean {
  return Boolean(row.arrestDate && row.chargeType.trim() && row.arrestLocation.trim() && row.outcomeSentence.trim());
}

function normalizeChargeTypeFromSpeech(text: string, lang: LangCode): string {
  const trimmed = text.trim();
  const normalized = normalizeText(trimmed);

  if (
    /\b(dui|dwi|dj|d j|d-j|dei|dji)\b/.test(normalized) ||
    /manejar\s+bajo\s+la\s+influencia|driving\s+under\s+the\s+influence/.test(normalized)
  ) {
    return lang === "es" ? "DUI (manejar bajo la influencia)" : "DUI (driving under the influence)";
  }

  return trimmed;
}

function getOrdinalLabel(lang: LangCode, index: number): string {
  if (lang === "es") {
    return ORDINAL_WORDS_ES[index] || `${index + 1}`;
  }

  return String(index + 1);
}

function getValidDocumentsSummary(lang: LangCode, value: ConsultationTripRow["validDocuments"]): string {
  if (lang === "es") {
    if (value === "yes") return "si ingresaste con documentos validos";
    if (value === "no") return "no ingresaste con documentos validos";
    return "no estas segura sobre los documentos validos";
  }

  if (value === "yes") return "you entered with valid documents";
  if (value === "no") return "you did not enter with valid documents";
  return "you are not sure about valid documents";
}

function buildTripReadbackMessage(lang: LangCode, row: ConsultationTripRow, rowIndex: number): string {
  const ordinal = getOrdinalLabel(lang, rowIndex);

  if (lang === "es") {
    return `Perfecto, tu ${ordinal} entrada fue el ${row.entryDate}, tu salida fue el ${row.exitDate}, entraste por ${row.entryLocation}, y ${getValidDocumentsSummary(lang, row.validDocuments)}.`;
  }

  return `Perfect. Trip ${rowIndex + 1}: entry date ${row.entryDate}, exit date ${row.exitDate}, entry location ${row.entryLocation}, and ${getValidDocumentsSummary(lang, row.validDocuments)}.`;
}

function buildTripTransitionMessage(
  lang: LangCode,
  completedRowIndex: number,
  nextPrompt: { rowIndex: number; field: ConsultationTripField },
): string {
  const nextOrdinal = getOrdinalLabel(lang, nextPrompt.rowIndex);

  if (lang === "es") {
    if (nextPrompt.rowIndex > completedRowIndex) {
      return `Ahora continuamos con tu ${nextOrdinal} entrada. ${getTripFieldPrompt(lang, nextPrompt.rowIndex, nextPrompt.field)}`;
    }

    return `Seguimos con tu ${nextOrdinal} entrada. ${getTripFieldPrompt(lang, nextPrompt.rowIndex, nextPrompt.field)}`;
  }

  return `Now let's continue with trip ${nextPrompt.rowIndex + 1}. ${getTripFieldPrompt(lang, nextPrompt.rowIndex, nextPrompt.field)}`;
}

function buildArrestChargeReadbackMessage(lang: LangCode, rowIndex: number, chargeType: string): string {
  const ordinal = getOrdinalLabel(lang, rowIndex);

  if (lang === "es") {
    return `Perfecto, en tu ${ordinal} incidencia te escuche: ${chargeType}. Si no esta correcto, corrigeme y lo ajusto.`;
  }

  return `Got it. For incident ${rowIndex + 1}, I captured the charge as: ${chargeType}.`;
}

function buildArrestReadbackMessage(lang: LangCode, row: ConsultationArrestRow, rowIndex: number): string {
  const ordinal = getOrdinalLabel(lang, rowIndex);

  if (lang === "es") {
    return `Perfecto, en tu ${ordinal} incidencia registre: fecha ${row.arrestDate}, cargo ${row.chargeType}, lugar ${row.arrestLocation}, y resultado ${row.outcomeSentence}.`;
  }

  return `Perfect. Incident ${rowIndex + 1}: date ${row.arrestDate}, charge ${row.chargeType}, location ${row.arrestLocation}, and outcome ${row.outcomeSentence}.`;
}

function buildArrestTransitionMessage(
  lang: LangCode,
  completedRowIndex: number,
  nextPrompt: { rowIndex: number; field: ConsultationArrestField },
): string {
  const nextOrdinal = getOrdinalLabel(lang, nextPrompt.rowIndex);

  if (lang === "es") {
    if (nextPrompt.rowIndex > completedRowIndex) {
      return `Ahora continuamos con tu ${nextOrdinal} incidencia. ${getArrestFieldPrompt(lang, nextPrompt.rowIndex, nextPrompt.field)}`;
    }

    return `Seguimos con tu ${nextOrdinal} incidencia. ${getArrestFieldPrompt(lang, nextPrompt.rowIndex, nextPrompt.field)}`;
  }

  return `Now let's continue with incident ${nextPrompt.rowIndex + 1}. ${getArrestFieldPrompt(lang, nextPrompt.rowIndex, nextPrompt.field)}`;
}

function getTripFieldPrompt(lang: LangCode, rowIndex: number, field: ConsultationTripField): string {
  const tripNumber = rowIndex + 1;

  if (lang === "es") {
    if (field === "entryDate") return `Viaje ${tripNumber}: cual fue la fecha de entrada?`;
    if (field === "exitDate") return `Viaje ${tripNumber}: cual fue la fecha de salida?`;
    if (field === "entryLocation") return `Viaje ${tripNumber}: por donde entro a Estados Unidos?`;
    return `Viaje ${tripNumber}: entro con documentos validos? Responda si, no, o no se.`;
  }

  if (lang === "pt") {
    if (field === "entryDate") return `Viagem ${tripNumber}: qual foi a data de entrada?`;
    if (field === "exitDate") return `Viagem ${tripNumber}: qual foi a data de saida?`;
    if (field === "entryLocation") return `Viagem ${tripNumber}: por onde voce entrou nos Estados Unidos?`;
    return `Viagem ${tripNumber}: voce entrou com documentos validos? Responda sim, nao, ou nao sei.`;
  }

  if (lang === "fr") {
    if (field === "entryDate") return `Voyage ${tripNumber} : quelle etait la date d'entree ?`;
    if (field === "exitDate") return `Voyage ${tripNumber} : quelle etait la date de sortie ?`;
    if (field === "entryLocation") return `Voyage ${tripNumber} : par ou etes-vous entre aux Etats-Unis ?`;
    return `Voyage ${tripNumber} : etiez-vous entre avec des documents valides ? Repondez oui, non ou je ne sais pas.`;
  }

  if (field === "entryDate") return `Trip ${tripNumber}: what was the entry date?`;
  if (field === "exitDate") return `Trip ${tripNumber}: what was the exit date?`;
  if (field === "entryLocation") return `Trip ${tripNumber}: where did you enter the United States?`;
  return `Trip ${tripNumber}: did you enter with valid documents? Reply yes, no, or not sure.`;
}

function getTripFieldRetryPrompt(lang: LangCode, rowIndex: number, field: ConsultationTripField): string {
  const tripNumber = rowIndex + 1;

  if (lang === "es") {
    if (field === "entryDate" || field === "exitDate") return `Viaje ${tripNumber}: esta bien una fecha aproximada, por ejemplo "junio 2018" o "en 2019".`;
    if (field === "entryLocation") return `Viaje ${tripNumber}: por favor diga la ciudad, puerto o cruce fronterizo por donde entro.`;
    return `Viaje ${tripNumber}: responda si, no, o no se sobre los documentos validos.`;
  }

  if (lang === "pt") {
    if (field === "entryDate" || field === "exitDate") return `Viagem ${tripNumber}: uma data aproximada funciona, como "junho de 2018" ou "em 2019".`;
    if (field === "entryLocation") return `Viagem ${tripNumber}: diga a cidade, porto ou fronteira por onde entrou.`;
    return `Viagem ${tripNumber}: responda sim, nao, ou nao sei sobre os documentos validos.`;
  }

  if (lang === "fr") {
    if (field === "entryDate" || field === "exitDate") return `Voyage ${tripNumber} : une date approximative convient, par exemple "juin 2018" ou "en 2019".`;
    if (field === "entryLocation") return `Voyage ${tripNumber} : indiquez la ville, le port ou le poste-frontiere d'entree.`;
    return `Voyage ${tripNumber} : repondez oui, non ou je ne sais pas pour les documents valides.`;
  }

  if (field === "entryDate" || field === "exitDate") return `Trip ${tripNumber}: an approximate date is fine, like "June 2018" or "in 2019".`;
  if (field === "entryLocation") return `Trip ${tripNumber}: please say the city, port, or border crossing where you entered.`;
  return `Trip ${tripNumber}: please reply yes, no, or not sure about valid documents.`;
}

function getArrestFieldPrompt(lang: LangCode, rowIndex: number, field: ConsultationArrestField): string {
  const incidentNumber = rowIndex + 1;

  if (lang === "es") {
    if (field === "arrestDate") return `Incidencia ${incidentNumber}: cual fue la fecha del arresto?`;
    if (field === "chargeType") return `Incidencia ${incidentNumber}: cual fue el tipo de cargo o delito?`;
    if (field === "arrestLocation") return `Incidencia ${incidentNumber}: en que ciudad y estado ocurrio?`;
    return `Incidencia ${incidentNumber}: cual fue la sentencia final o el resultado?`;
  }

  if (lang === "pt") {
    if (field === "arrestDate") return `Incidente ${incidentNumber}: qual foi a data da prisao?`;
    if (field === "chargeType") return `Incidente ${incidentNumber}: qual foi o tipo de acusacao?`;
    if (field === "arrestLocation") return `Incidente ${incidentNumber}: em que cidade e estado aconteceu?`;
    return `Incidente ${incidentNumber}: qual foi a sentenca final ou o resultado?`;
  }

  if (lang === "fr") {
    if (field === "arrestDate") return `Incident ${incidentNumber} : quelle etait la date de l'arrestation ?`;
    if (field === "chargeType") return `Incident ${incidentNumber} : quel etait le type d'infraction ?`;
    if (field === "arrestLocation") return `Incident ${incidentNumber} : dans quelle ville et quel etat cela s'est-il produit ?`;
    return `Incident ${incidentNumber} : quelle a ete la peine finale ou le resultat ?`;
  }

  if (field === "arrestDate") return `Incident ${incidentNumber}: what was the arrest date?`;
  if (field === "chargeType") return `Incident ${incidentNumber}: what was the charge or offense?`;
  if (field === "arrestLocation") return `Incident ${incidentNumber}: what city and state did it happen in?`;
  return `Incident ${incidentNumber}: what was the final sentence or outcome?`;
}

function getArrestFieldRetryPrompt(lang: LangCode, rowIndex: number, field: ConsultationArrestField): string {
  const incidentNumber = rowIndex + 1;

  if (lang === "es") {
    if (field === "arrestDate") return `Incidencia ${incidentNumber}: una fecha aproximada esta bien, por ejemplo "junio 2018" o "en 2019".`;
    if (field === "chargeType") return `Incidencia ${incidentNumber}: por favor diga el cargo o delito principal.`;
    if (field === "arrestLocation") return `Incidencia ${incidentNumber}: por favor diga la ciudad y el estado.`;
    return `Incidencia ${incidentNumber}: por favor diga la sentencia final o el resultado del caso.`;
  }

  if (lang === "pt") {
    if (field === "arrestDate") return `Incidente ${incidentNumber}: uma data aproximada funciona, como "junho de 2018" ou "em 2019".`;
    if (field === "chargeType") return `Incidente ${incidentNumber}: diga a acusacao principal.`;
    if (field === "arrestLocation") return `Incidente ${incidentNumber}: diga a cidade e o estado.`;
    return `Incidente ${incidentNumber}: diga a sentenca final ou o resultado.`;
  }

  if (lang === "fr") {
    if (field === "arrestDate") return `Incident ${incidentNumber} : une date approximative convient, par exemple "juin 2018" ou "en 2019".`;
    if (field === "chargeType") return `Incident ${incidentNumber} : indiquez l'infraction principale.`;
    if (field === "arrestLocation") return `Incident ${incidentNumber} : indiquez la ville et l'etat.`;
    return `Incident ${incidentNumber} : indiquez la peine finale ou le resultat.`;
  }

  if (field === "arrestDate") return `Incident ${incidentNumber}: an approximate date is fine, like "June 2018" or "in 2019".`;
  if (field === "chargeType") return `Incident ${incidentNumber}: please say the main charge or offense.`;
  if (field === "arrestLocation") return `Incident ${incidentNumber}: please say the city and state.`;
  return `Incident ${incidentNumber}: please describe the final sentence or outcome.`;
}

function getCurrentCollectionLabel(
  lang: LangCode,
  section: "entries" | "arrests",
  rowIndex: number,
  field: ConsultationTripField | ConsultationArrestField,
): string {
  const itemNumber = rowIndex + 1;

  if (lang === "es") {
    const labels =
      section === "entries"
        ? {
            entryDate: "fecha de entrada",
            exitDate: "fecha de salida",
            entryLocation: "lugar de entrada",
            validDocuments: "documentos validos",
          }
        : {
            arrestDate: "fecha del arresto",
            chargeType: "tipo de cargo",
            arrestLocation: "ciudad y estado",
            outcomeSentence: "sentencia o resultado",
          };
    return `${section === "entries" ? "Llenando viaje" : "Llenando incidencia"} ${itemNumber}: ${labels[field as keyof typeof labels]}`;
  }

  if (lang === "pt") {
    const labels =
      section === "entries"
        ? {
            entryDate: "data de entrada",
            exitDate: "data de saida",
            entryLocation: "local de entrada",
            validDocuments: "documentos validos",
          }
        : {
            arrestDate: "data da prisao",
            chargeType: "tipo de acusacao",
            arrestLocation: "cidade e estado",
            outcomeSentence: "sentenca ou resultado",
          };
    return `${section === "entries" ? "Preenchendo viagem" : "Preenchendo incidente"} ${itemNumber}: ${labels[field as keyof typeof labels]}`;
  }

  if (lang === "fr") {
    const labels =
      section === "entries"
        ? {
            entryDate: "date d'entree",
            exitDate: "date de sortie",
            entryLocation: "lieu d'entree",
            validDocuments: "documents valides",
          }
        : {
            arrestDate: "date d'arrestation",
            chargeType: "type d'infraction",
            arrestLocation: "ville et etat",
            outcomeSentence: "peine ou resultat",
          };
    return `${section === "entries" ? "Remplissage du voyage" : "Remplissage de l'incident"} ${itemNumber} : ${labels[field as keyof typeof labels]}`;
  }

  const labels =
    section === "entries"
      ? {
          entryDate: "entry date",
          exitDate: "exit date",
          entryLocation: "entry location",
          validDocuments: "valid documents",
        }
      : {
          arrestDate: "arrest date",
          chargeType: "charge type",
          arrestLocation: "city and state",
          outcomeSentence: "sentence or outcome",
        };
  return `Currently filling ${section === "entries" ? "trip" : "incident"} ${itemNumber}: ${labels[field as keyof typeof labels]}`;
}

function pickPreferredVoice(voices: SpeechSynthesisVoice[], lang: LangCode): SpeechSynthesisVoice | undefined {
  const prefix = SPEECH_LANG_BY_UI_LANG[lang].slice(0, 2).toLowerCase();
  const candidates = voices.filter((voice) => voice.lang.toLowerCase().startsWith(prefix));
  if (candidates.length === 0) return undefined;

  if (lang === "es") {
    const preferred = candidates.find((voice) => {
      const normalizedName = normalizeText(voice.name);
      return PREFERRED_FEMININE_VOICE_NAMES.some((token) => normalizedName.includes(token));
    });
    if (preferred) return preferred;
  }

  return candidates[0];
}

function extractEntryCount(text: string, lang: LangCode): number | null {
  const normalized = normalizeText(text);

  const numberMatch = text.match(/\b(\d{1,2})\b/);
  if (numberMatch) {
    return Number(numberMatch[1]);
  }

  // Handle ordinal-style "first/primera/premiere" phrasing commonly used in voice input.
  if (
    /\b(first|1st|primer|primera|primeira|premier|premiere|premiere)\b/.test(normalized)
  ) {
    return 1;
  }

  if (/\b(second|2nd|segundo|segunda|deuxieme|deuxieme|segunda)\b/.test(normalized)) {
    return 2;
  }

  if (/\b(third|3rd|tercer|tercera|terceiro|troisieme|troisieme)\b/.test(normalized)) {
    return 3;
  }

  for (const [word, value] of Object.entries(ENTRY_COUNT_WORDS[lang])) {
    if (normalized.includes(word)) {
      return value;
    }
  }

  return null;
}

function createEmptyTripRows(count: number): ConsultationTripRow[] {
  return Array.from({ length: count }, () => ({
    entryDate: "",
    exitDate: "",
    entryLocation: "",
    validDocuments: "",
  }));
}

function createEmptyArrestRows(count: number): ConsultationArrestRow[] {
  return Array.from({ length: count }, () => ({
    arrestDate: "",
    chargeType: "",
    arrestLocation: "",
    outcomeSentence: "",
  }));
}

function parseBinaryAnswer(text: string, lang: LangCode): BinaryAnswer {
  if (UNKNOWN_PATTERNS[lang].test(text)) return "unknown";
  if (YES_PATTERNS[lang].test(text)) return "yes";
  if (NO_PATTERNS[lang].test(text)) return "no";
  return "";
}

function getBinaryAnswerLabel(lang: LangCode, value: BinaryAnswer): string {
  if (lang === "es") {
    if (value === "yes") return "Si";
    if (value === "no") return "No";
    if (value === "unknown") return "No esta seguro";
    return "Pendiente";
  }

  if (value === "yes") return "Yes";
  if (value === "no") return "No";
  if (value === "unknown") return "Not sure";
  return "Pending";
}

function buildPoliceHelpNarrativeReadback(lang: LangCode, narrative: string): string {
  if (lang === "es") {
    return `Entendi esto para su posible U-Visa: ${narrative}`;
  }

  return `Here is what I understood for your possible U-Visa claim: ${narrative}`;
}

function buildPoliceHelpFinalSummary(args: {
  lang: LangCode;
  narrative: string;
  reportTaken: BinaryAnswer;
  nameListed: BinaryAnswer;
  hasReportCopy: BinaryAnswer;
  wantsFirmRequest: BinaryAnswer;
}): string {
  const {
    lang,
    narrative,
    reportTaken,
    nameListed,
    hasReportCopy,
    wantsFirmRequest,
  } = args;

  if (lang === "es") {
    const details = [
      `Resumen U-Visa para confirmar:`,
      `1) Lo que usted reporta: ${narrative}`,
      `2) Se tomo reporte policial: ${getBinaryAnswerLabel(lang, reportTaken)}`,
      `3) Su nombre aparece en el reporte: ${getBinaryAnswerLabel(lang, nameListed)}`,
      `4) Tiene copia del reporte: ${getBinaryAnswerLabel(lang, hasReportCopy)}`,
      `5) Quiere que la firma le ayude a obtener el reporte: ${getBinaryAnswerLabel(lang, wantsFirmRequest)}`,
    ];

    if (reportTaken === "yes" && nameListed === "yes" && hasReportCopy === "yes") {
      details.push(
        `Siguiente paso: por favor envielo a jaimebarron@legal.com o suba una foto del reporte en este chat.`,
      );
    } else if (reportTaken === "yes" && nameListed === "yes" && hasReportCopy !== "yes") {
      if (wantsFirmRequest === "yes") {
        details.push(`Siguiente paso: perfecto, nuestro equipo legal puede ayudarle a solicitar ese reporte policial.`);
      } else {
        details.push(
          `Siguiente paso: por favor consiga una copia del reporte y luego enviela a jaimebarron@legal.com o suba una foto en este chat.`,
        );
      }
    } else {
      details.push(`Siguiente paso: un abogado revisara su caso para confirmar la mejor estrategia y elegibilidad para U-Visa.`);
    }

    details.push("Es correcto todo lo anterior? Responda si o no.");
    return details.join("\n");
  }

  const details = [
    `U-Visa summary for confirmation:`,
    `1) What you reported: ${narrative}`,
    `2) Police report was taken: ${getBinaryAnswerLabel(lang, reportTaken)}`,
    `3) Your name appears on that report: ${getBinaryAnswerLabel(lang, nameListed)}`,
    `4) You currently have a copy of the report: ${getBinaryAnswerLabel(lang, hasReportCopy)}`,
    `5) You want our firm to help request that report: ${getBinaryAnswerLabel(lang, wantsFirmRequest)}`,
    "Is everything above correct? Please answer yes or no.",
  ];

  return details.join("\n");
}

const uiCopy: Record<
  LangCode,
  {
    assistantLabel: string;
    backLabel: string;
    chooseLanguage: string;
    placeholder: string;
    disclaimer: string;
    consultationHeading: string;
    consultationButton: string;
    consultNow: string;
    consultationPromo: string;
    consultationIntro: string;
    entriesQuestion: string;
    entriesNeedCount: string;
    entriesTableIntro: string;
    entriesTableHeading: string;
    entriesTableDescription: string;
    entryDateLabel: string;
    exitDateLabel: string;
    entryLocationLabel: string;
    validDocumentsLabel: string;
    validDocumentsOptions: {
      placeholder: string;
      yes: string;
      no: string;
      unknown: string;
    };
    tripLabel: string;
    entriesContinue: string;
    entriesTableLockedPlaceholder: string;
    arrestsQuestion: string;
    arrestsNeedCount: string;
    arrestsTableIntro: string;
    arrestsTableHeading: string;
    arrestsTableDescription: string;
    arrestDateLabel: string;
    chargeTypeLabel: string;
    arrestLocationLabel: string;
    outcomeLabel: string;
    incidentLabel: string;
    arrestsContinue: string;
    arrestsTableLockedPlaceholder: string;
    policeHelpQuestion: string;
    uvNote: string;
    consultationThanks: string;
    consultationCallNow: string;
    consultationCallBack: string;
    consultationCallbackNote: string;
    consultationFinishedPlaceholder: string;
    consultationPlaceholders: {
      entries: string;
      arrests: string;
      policeHelp: string;
    };
    toolLabels: Record<string, string>;
  }
> = {
  en: {
    assistantLabel: "Immigration Assistant",
    backLabel: "Back to home",
    chooseLanguage: "Choose Language",
    placeholder: "Ask about visas, green cards, citizenship...",
    disclaimer: "General information only - not legal advice",
    consultationHeading: "Find out immediately whether you may qualify for an immigration benefit",
    consultationButton: "Proceed to Consultation",
    consultNow: "Consult now",
    consultationPromo: "Private intake available now. Share a few details securely before you speak with the firm.",
    consultationIntro:
      "This secure intake is private and protected. Your information is not shared with ICE, DHS, CBP, or other U.S. immigration authorities.",
    entriesQuestion:
      "First, as best as you remember, how many separate times have you entered the United States? Please count every entry, even if you are not completely sure. We need the date for every entry and every exit before we continue. If you are unsure whether it was 2, 3, or more times, give your best estimate and list each trip as clearly as you can.",
    entriesNeedCount:
      "Before we continue, I need the total number of times you entered the United States, plus the date of every entry and every exit you remember.",
    entriesTableIntro:
      "You mentioned {count} entries. Please complete one row for each trip with the entry date, exit date, location of entry, and whether you entered with valid documents.",
    entriesTableHeading: "Entry history",
    entriesTableDescription:
      "Fill in every trip before continuing. If you do not know whether documents were valid, choose the closest option.",
    entryDateLabel: "Entry date",
    exitDateLabel: "Exit date",
    entryLocationLabel: "Entry location",
    validDocumentsLabel: "Entered with valid documents",
    validDocumentsOptions: {
      placeholder: "Select",
      yes: "Yes",
      no: "No",
      unknown: "Not sure",
    },
    tripLabel: "Trip",
    entriesContinue: "Continue",
    entriesTableLockedPlaceholder: "Complete the trip table below to continue",
    arrestsQuestion:
      "Next, how many arrest incidents or criminal cases should we review with you? Enter 0 if none.",
    arrestsNeedCount:
      "Before we continue, please tell me how many arrest incidents or criminal cases to record. Enter 0 if none.",
    arrestsTableIntro:
      "You mentioned {count} incidents. Please complete one row per incident with the arrest date, charge type, location, and final sentence or outcome.",
    arrestsTableHeading: "Criminal history",
    arrestsTableDescription:
      "Complete all incidents before continuing. Use approximate dates if exact dates are not available.",
    arrestDateLabel: "Arrest date",
    chargeTypeLabel: "Charge type",
    arrestLocationLabel: "City and state",
    outcomeLabel: "Final sentence or outcome",
    incidentLabel: "Incident",
    arrestsContinue: "Continue",
    arrestsTableLockedPlaceholder: "Complete the criminal history table below to continue",
    policeHelpQuestion:
      "Have you ever helped police or prosecutors with a case, or do you have any police reports showing you assisted law enforcement? If yes, please explain briefly because you may qualify for a U-Visa.",
    uvNote:
      "Thank you. Based on what you shared about helping law enforcement, a U-Visa may be worth reviewing with an attorney.",
    consultationThanks:
      "Thank you for sharing this information. A legal team member can review it with you and help identify the strongest next step.",
    consultationCallNow: "Call now",
    consultationCallBack: "Have us call you",
    consultationCallbackNote: "Use our secure consultation form to request a callback from the team.",
    consultationFinishedPlaceholder: "Consultation intake complete",
    consultationPlaceholders: {
      entries: "Example: 3 times, but I may be forgetting one border crossing...",
      arrests: "Example: June 2018, DUI, Dallas TX, 12 months probation...",
      policeHelp: "Example: Yes, I gave a statement in Houston in 2021...",
    },
    toolLabels: {
      getServiceInfo: "Looking up service info...",
      getLocationInfo: "Finding office locations...",
      getFAQAnswer: "Finding answer...",
    },
  },
  es: {
    assistantLabel: "Asistente de Inmigracion",
    backLabel: "Volver al inicio",
    chooseLanguage: "Elegir idioma",
    placeholder: "Pregunte sobre visas, green cards, ciudadania...",
    disclaimer: "Informacion general solamente - no es asesoria legal",
    consultationHeading: "Enterese inmediatamente si usted califica para algun beneficio migratorio",
    consultationButton: "Proceder Con Consulta",
    consultNow: "Consultar ahora",
    consultationPromo: "Haga una evaluacion privada ahora. Comparta algunos detalles de forma segura antes de hablar con la firma.",
    consultationIntro:
      "Esta evaluacion segura es privada y protegida. Su informacion no se comparte con ICE, DHS, CBP ni con otras autoridades migratorias de Estados Unidos.",
    entriesQuestion:
      "Primero, segun lo que usted recuerde, cuantas veces ha entrado a Estados Unidos? Cuente cada entrada por separado, aunque no este completamente seguro. Necesitamos la fecha de cada entrada y de cada salida antes de continuar. Si no recuerda si fueron 2, 3 o mas veces, denos su mejor estimado y enumere cada viaje lo mejor posible.",
    entriesNeedCount:
      "Antes de continuar, necesito saber cuantas veces ha entrado a Estados Unidos y la fecha de cada entrada y cada salida que usted recuerde.",
    entriesTableIntro:
      "Usted menciono {count} entradas. Complete una fila por cada viaje con la fecha de entrada, la fecha de salida, el lugar por donde entro y si entro con documentos validos.",
    entriesTableHeading: "Historial de entradas",
    entriesTableDescription:
      "Complete todos los viajes antes de continuar. Si no esta seguro sobre los documentos, elija la opcion mas cercana.",
    entryDateLabel: "Fecha de entrada",
    exitDateLabel: "Fecha de salida",
    entryLocationLabel: "Lugar de entrada",
    validDocumentsLabel: "Entro con documentos validos",
    validDocumentsOptions: {
      placeholder: "Seleccione",
      yes: "Si",
      no: "No",
      unknown: "No se",
    },
    tripLabel: "Viaje",
    entriesContinue: "Continuar",
    entriesTableLockedPlaceholder: "Complete la tabla de viajes para continuar",
    arrestsQuestion:
      "Ahora, cuantas incidencias de arresto o casos penales debemos revisar con usted? Escriba 0 si no tiene ninguna.",
    arrestsNeedCount:
      "Antes de continuar, indiqueme cuantas incidencias de arresto o casos penales debemos registrar. Escriba 0 si no tiene ninguna.",
    arrestsTableIntro:
      "Usted menciono {count} incidencias. Complete una fila por cada una con la fecha del arresto, el tipo de cargo, la ciudad y estado, y la sentencia final o resultado.",
    arrestsTableHeading: "Historial penal",
    arrestsTableDescription:
      "Complete todas las incidencias antes de continuar. Puede usar fechas aproximadas si no recuerda la fecha exacta.",
    arrestDateLabel: "Fecha del arresto",
    chargeTypeLabel: "Tipo de cargo",
    arrestLocationLabel: "Ciudad y estado",
    outcomeLabel: "Sentencia final o resultado",
    incidentLabel: "Incidencia",
    arrestsContinue: "Continuar",
    arrestsTableLockedPlaceholder: "Complete la tabla de historial penal para continuar",
    policeHelpQuestion:
      "Ha ayudado alguna vez a la policia o a los fiscales con un caso, o tiene reportes policiacos donde conste que ayudo a las autoridades? Si la respuesta es si, expliquelo brevemente porque podria calificar para una U-Visa.",
    uvNote:
      "Gracias. Segun lo que compartio sobre haber ayudado a las autoridades, vale la pena revisar con un abogado si podria calificar para una U-Visa.",
    consultationThanks:
      "Gracias por compartir esta informacion. Un miembro del equipo legal puede revisarla con usted y ayudarle a identificar el mejor siguiente paso.",
    consultationCallNow: "Llamar ahora",
    consultationCallBack: "Que me llamen",
    consultationCallbackNote: "Use nuestro formulario seguro de consulta para solicitar que el equipo le devuelva la llamada.",
    consultationFinishedPlaceholder: "Evaluacion completada",
    consultationPlaceholders: {
      entries: "Ejemplo: 3 veces, pero tal vez olvido un cruce...",
      arrests: "Ejemplo: Junio 2018, DUI, Dallas TX, 12 meses de probacion...",
      policeHelp: "Ejemplo: Si, di una declaracion en Houston en 2021...",
    },
    toolLabels: {
      getServiceInfo: "Buscando informacion del servicio...",
      getLocationInfo: "Buscando ubicaciones de oficinas...",
      getFAQAnswer: "Buscando respuesta...",
    },
  },
  pt: {
    assistantLabel: "Assistente de Imigracao",
    backLabel: "Voltar ao inicio",
    chooseLanguage: "Escolher idioma",
    placeholder: "Pergunte sobre vistos, green cards, cidadania...",
    disclaimer: "Apenas informacoes gerais - nao constitui orientacao juridica",
    consultationHeading: "Descubra imediatamente se voce pode se qualificar para algum beneficio imigratorio",
    consultationButton: "Prosseguir para Consulta",
    consultNow: "Consultar agora",
    consultationPromo: "Triagem privada disponivel agora. Compartilhe alguns detalhes com seguranca antes de falar com o escritorio.",
    consultationIntro:
      "Esta triagem segura e privada e protegida. Suas informacoes nao sao compartilhadas com ICE, DHS, CBP ou outras autoridades migratorias dos Estados Unidos.",
    entriesQuestion:
      "Primeiro, da melhor forma que voce se lembrar, quantas vezes entrou nos Estados Unidos? Conte cada entrada separadamente, mesmo se nao tiver certeza completa. Precisamos da data de cada entrada e de cada saida antes de continuar. Se nao souber se foram 2, 3 ou mais vezes, informe sua melhor estimativa e liste cada viagem da melhor forma possivel.",
    entriesNeedCount:
      "Antes de continuar, preciso saber o numero total de entradas nos Estados Unidos e a data de cada entrada e cada saida que voce lembrar.",
    entriesTableIntro:
      "Voce mencionou {count} entradas. Preencha uma linha para cada viagem com a data de entrada, a data de saida, o local de entrada e se voce entrou com documentos validos.",
    entriesTableHeading: "Historico de entradas",
    entriesTableDescription:
      "Preencha todas as viagens antes de continuar. Se nao tiver certeza sobre os documentos, escolha a opcao mais proxima.",
    entryDateLabel: "Data de entrada",
    exitDateLabel: "Data de saida",
    entryLocationLabel: "Local de entrada",
    validDocumentsLabel: "Entrou com documentos validos",
    validDocumentsOptions: {
      placeholder: "Selecione",
      yes: "Sim",
      no: "Nao",
      unknown: "Nao sei",
    },
    tripLabel: "Viagem",
    entriesContinue: "Continuar",
    entriesTableLockedPlaceholder: "Preencha a tabela de viagens para continuar",
    arrestsQuestion:
      "Agora, quantos incidentes de prisao ou casos criminais devemos revisar com voce? Digite 0 se nao houver nenhum.",
    arrestsNeedCount:
      "Antes de continuar, informe quantos incidentes de prisao ou casos criminais devemos registrar. Digite 0 se nao houver nenhum.",
    arrestsTableIntro:
      "Voce mencionou {count} incidentes. Preencha uma linha para cada incidente com a data da prisao, tipo de acusacao, local (cidade e estado) e sentenca final ou resultado.",
    arrestsTableHeading: "Historico criminal",
    arrestsTableDescription:
      "Preencha todos os incidentes antes de continuar. Use datas aproximadas quando nao souber a data exata.",
    arrestDateLabel: "Data da prisao",
    chargeTypeLabel: "Tipo de acusacao",
    arrestLocationLabel: "Cidade e estado",
    outcomeLabel: "Sentenca final ou resultado",
    incidentLabel: "Incidente",
    arrestsContinue: "Continuar",
    arrestsTableLockedPlaceholder: "Preencha a tabela de historico criminal para continuar",
    policeHelpQuestion:
      "Voce ja ajudou a policia ou promotores em algum caso, ou tem relatorios policiais mostrando que ajudou as autoridades? Se sim, explique brevemente porque voce pode se qualificar para um U-Visa.",
    uvNote:
      "Obrigado. Com base no que voce compartilhou sobre ter ajudado as autoridades, pode valer a pena analisar com um advogado se ha possibilidade de U-Visa.",
    consultationThanks:
      "Obrigado por compartilhar essas informacoes. Um membro da equipe juridica pode revisar tudo com voce e ajudar a identificar o melhor proximo passo.",
    consultationCallNow: "Ligar agora",
    consultationCallBack: "Pedir que me liguem",
    consultationCallbackNote: "Use nosso formulario seguro de consulta para pedir um retorno da equipe.",
    consultationFinishedPlaceholder: "Triagem concluida",
    consultationPlaceholders: {
      entries: "Exemplo: 3 vezes, mas talvez eu tenha esquecido uma entrada...",
      arrests: "Exemplo: Junho de 2018, DUI, Dallas TX, 12 meses de liberdade condicional...",
      policeHelp: "Exemplo: Sim, dei um depoimento em Houston em 2021...",
    },
    toolLabels: {
      getServiceInfo: "Buscando informacoes do servico...",
      getLocationInfo: "Buscando enderecos dos escritorios...",
      getFAQAnswer: "Buscando resposta...",
    },
  },
  fr: {
    assistantLabel: "Assistant en immigration",
    backLabel: "Retour a l'accueil",
    chooseLanguage: "Choisir la langue",
    placeholder: "Posez une question sur les visas, les green cards, la citoyennete...",
    disclaimer: "Informations generales uniquement - pas un conseil juridique",
    consultationHeading: "Decouvrez immediatement si vous pourriez etre admissible a un avantage en immigration",
    consultationButton: "Passer a la consultation",
    consultNow: "Consulter maintenant",
    consultationPromo: "Evaluation privee disponible maintenant. Partagez quelques details en toute securite avant de parler au cabinet.",
    consultationIntro:
      "Cette evaluation securisee est privee et protegee. Vos informations ne sont pas partagees avec l'ICE, le DHS, le CBP ni avec d'autres autorites d'immigration des Etats-Unis.",
    entriesQuestion:
      "D'abord, selon vos souvenirs, combien de fois etes-vous entre aux Etats-Unis ? Comptez chaque entree separement, meme si vous n'etes pas totalement certain. Nous avons besoin de la date de chaque entree et de chaque sortie avant de continuer. Si vous hésitez entre 2, 3 ou plus, donnez votre meilleure estimation et listez chaque voyage aussi clairement que possible.",
    entriesNeedCount:
      "Avant de continuer, j'ai besoin du nombre total d'entrees aux Etats-Unis ainsi que de la date de chaque entree et de chaque sortie dont vous vous souvenez.",
    entriesTableIntro:
      "Vous avez mentionne {count} entrees. Remplissez une ligne par voyage avec la date d'entree, la date de sortie, le lieu d'entree et si vous etiez muni de documents valides.",
    entriesTableHeading: "Historique des entrees",
    entriesTableDescription:
      "Remplissez chaque voyage avant de continuer. Si vous n'etes pas certain pour les documents, choisissez l'option la plus proche.",
    entryDateLabel: "Date d'entree",
    exitDateLabel: "Date de sortie",
    entryLocationLabel: "Lieu d'entree",
    validDocumentsLabel: "Entree avec documents valides",
    validDocumentsOptions: {
      placeholder: "Selectionner",
      yes: "Oui",
      no: "Non",
      unknown: "Je ne sais pas",
    },
    tripLabel: "Voyage",
    entriesContinue: "Continuer",
    entriesTableLockedPlaceholder: "Remplissez le tableau des voyages pour continuer",
    arrestsQuestion:
      "Ensuite, combien d'incidents d'arrestation ou de dossiers penaux devons-nous examiner avec vous ? Saisissez 0 s'il n'y en a aucun.",
    arrestsNeedCount:
      "Avant de continuer, indiquez combien d'incidents d'arrestation ou de dossiers penaux doivent etre enregistres. Saisissez 0 s'il n'y en a aucun.",
    arrestsTableIntro:
      "Vous avez mentionne {count} incidents. Remplissez une ligne par incident avec la date d'arrestation, le type d'infraction, le lieu (ville et etat) et la peine finale ou le resultat.",
    arrestsTableHeading: "Historique penal",
    arrestsTableDescription:
      "Remplissez tous les incidents avant de continuer. Utilisez des dates approximatives si necessaire.",
    arrestDateLabel: "Date d'arrestation",
    chargeTypeLabel: "Type d'infraction",
    arrestLocationLabel: "Ville et etat",
    outcomeLabel: "Peine finale ou resultat",
    incidentLabel: "Incident",
    arrestsContinue: "Continuer",
    arrestsTableLockedPlaceholder: "Remplissez le tableau des antecedents penaux pour continuer",
    policeHelpQuestion:
      "Avez-vous deja aide la police ou le procureur dans une affaire, ou possedez-vous des rapports de police montrant que vous avez coopere avec les autorites ? Si oui, expliquez brievement car vous pourriez etre admissible a un visa U.",
    uvNote:
      "Merci. D'apres ce que vous avez partage sur votre cooperation avec les autorites, un avocat devrait verifier si une piste de visa U est possible.",
    consultationThanks:
      "Merci d'avoir partage ces informations. Un membre de l'equipe juridique peut les examiner avec vous et vous aider a identifier la meilleure suite.",
    consultationCallNow: "Appeler maintenant",
    consultationCallBack: "Demander a etre rappele",
    consultationCallbackNote: "Utilisez notre formulaire de consultation securise pour demander un rappel de l'equipe.",
    consultationFinishedPlaceholder: "Evaluation terminee",
    consultationPlaceholders: {
      entries: "Exemple : 3 fois, mais j'ai peut-etre oublie un passage...",
      arrests: "Exemple : Juin 2018, DUI, Dallas TX, 12 mois de probation...",
      policeHelp: "Exemple : Oui, j'ai donne une declaration a Houston en 2021...",
    },
    toolLabels: {
      getServiceInfo: "Recherche d'informations sur le service...",
      getLocationInfo: "Recherche des bureaux...",
      getFAQAnswer: "Recherche de la reponse...",
    },
  },
};

export function ImmigrationChatSheet({ isOpen, onClose }: ImmigrationChatSheetProps) {
  const [input, setInput] = useState("");
  const [lang, setLang] = useState<LangCode>("es");
  const [showWelcome, setShowWelcome] = useState(true);
  const [mode, setMode] = useState<ChatMode>("chat");
  const [consultationStep, setConsultationStep] = useState<ConsultationStep>("idle");
  const [consultationMessages, setConsultationMessages] = useState<ConsultationMessage[]>([]);
  const [consultationEntryCount, setConsultationEntryCount] = useState<number | null>(null);
  const [consultationTripRows, setConsultationTripRows] = useState<ConsultationTripRow[]>([]);
  const [consultationArrestCount, setConsultationArrestCount] = useState<number | null>(null);
  const [consultationArrestRows, setConsultationArrestRows] = useState<ConsultationArrestRow[]>([]);
  const [pendingExitEstimate, setPendingExitEstimate] = useState<PendingExitEstimate | null>(null);
  const [pendingChargeConfirmation, setPendingChargeConfirmation] = useState<PendingChargeConfirmation | null>(null);
  const [policeHelpStage, setPoliceHelpStage] = useState<PoliceHelpStage>("initialNarrative");
  const [policeHelpNarrative, setPoliceHelpNarrative] = useState("");
  const [policeReportTaken, setPoliceReportTaken] = useState<BinaryAnswer>("");
  const [policeNameListed, setPoliceNameListed] = useState<BinaryAnswer>("");
  const [policeReportCopy, setPoliceReportCopy] = useState<BinaryAnswer>("");
  const [policeWantsFirmRequest, setPoliceWantsFirmRequest] = useState<BinaryAnswer>("");
  const [isListening, setIsListening] = useState(false);
  const [isVoiceInputSupported, setIsVoiceInputSupported] = useState(false);
  const [isSpeechOutputSupported, setIsSpeechOutputSupported] = useState(false);
  const [autoSpeakEnabled, setAutoSpeakEnabled] = useState(true);
  const [voiceStatus, setVoiceStatus] = useState<VoiceStatusCode>("idle");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const consultationIdRef = useRef(0);
  const recognitionRef = useRef<BrowserSpeechRecognition | null>(null);
  const voiceFinalTranscriptRef = useRef("");
  const voiceSubmitTimerRef = useRef<number | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const audioUrlRef = useRef<string | null>(null);
  const lastSpokenAssistantIdRef = useRef<string | null>(null);
  const lastSpokenConsultationIdRef = useRef<string | null>(null);
  const copy = uiCopy[lang];
  const isConsultationMode = mode === "consultation";
  const isEntryTableActive = isConsultationMode && consultationStep === "entries" && consultationEntryCount !== null;
  const isArrestsTableActive =
    isConsultationMode && consultationStep === "arrests" && consultationArrestCount !== null && consultationArrestCount > 0;

  const { messages, sendMessage, status } = useChat({
    transport: new DefaultChatTransport({
      api: `/api/chat/immigration?lang=${lang}`,
    }),
  });

  const isLoading = status === "streaming" || status === "submitted";
  const isInputLocked =
    isLoading ||
    (isConsultationMode && consultationStep === "complete");
  const nextIncompleteTripField = findNextIncompleteTripField(consultationTripRows);
  const nextIncompleteArrestField = findNextIncompleteArrestField(consultationArrestRows);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, consultationMessages, isLoading]);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const speechWindow = window as Window & {
      SpeechRecognition?: BrowserSpeechRecognitionCtor;
      webkitSpeechRecognition?: BrowserSpeechRecognitionCtor;
    };

    const SpeechRecognitionCtor = speechWindow.SpeechRecognition ?? speechWindow.webkitSpeechRecognition;
    setIsVoiceInputSupported(Boolean(SpeechRecognitionCtor));
    setIsSpeechOutputSupported("speechSynthesis" in window || typeof Audio !== "undefined");
    setVoiceStatus(SpeechRecognitionCtor ? "idle" : "unsupported");

    const persistedAutoSpeak = window.localStorage.getItem(AUTO_SPEAK_STORAGE_KEY);
    if (persistedAutoSpeak === "true") {
      setAutoSpeakEnabled(true);
    } else if (persistedAutoSpeak === "false") {
      setAutoSpeakEnabled(false);
    }
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(AUTO_SPEAK_STORAGE_KEY, String(autoSpeakEnabled));
  }, [autoSpeakEnabled]);

  const stopSpeechOutput = () => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }

    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.src = "";
      audioRef.current = null;
    }

    if (audioUrlRef.current) {
      URL.revokeObjectURL(audioUrlRef.current);
      audioUrlRef.current = null;
    }
  };

  const speakWithBrowser = (text: string, targetLang: LangCode, context: ChatMode) => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;

    const utterance = new SpeechSynthesisUtterance(text);
    const speechLang = targetLang === "es" ? "es-MX" : SPEECH_LANG_BY_UI_LANG[targetLang];
    utterance.lang = speechLang;
    utterance.rate = context === "consultation" ? 0.93 : 0.96;
    utterance.pitch = targetLang === "es" ? (context === "consultation" ? 1.12 : 1.08) : 1;

    const matchedVoice = pickPreferredVoice(window.speechSynthesis.getVoices(), targetLang);
    if (matchedVoice) {
      utterance.voice = matchedVoice;
    }

    stopSpeechOutput();
    window.speechSynthesis.speak(utterance);
  };

  const speakWithElevenLabs = async (text: string, targetLang: LangCode, context: ChatMode) => {
    if (typeof window === "undefined") return false;

    try {
      const response = await fetch("/api/voice/elevenlabs", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          text,
          lang: targetLang,
          context,
        }),
      });

      if (!response.ok) return false;

      const blob = await response.blob();
      if (!blob.size) return false;

      stopSpeechOutput();

      const audioUrl = URL.createObjectURL(blob);
      audioUrlRef.current = audioUrl;

      const audio = new Audio(audioUrl);
      audioRef.current = audio;
      audio.onended = () => {
        if (audioUrlRef.current === audioUrl) {
          URL.revokeObjectURL(audioUrl);
          audioUrlRef.current = null;
        }
        if (audioRef.current === audio) {
          audioRef.current = null;
        }
      };

      await audio.play();
      return true;
    } catch {
      return false;
    }
  };

  const playAssistantSpeech = async (text: string, targetLang: LangCode, context: ChatMode) => {
    const usedElevenLabs = await speakWithElevenLabs(text, targetLang, context);
    if (!usedElevenLabs) {
      speakWithBrowser(text, targetLang, context);
    }
  };

  useEffect(() => {
    if (!isOpen || mode !== "chat" || isLoading || !autoSpeakEnabled || isListening || typeof window === "undefined") return;

    const lastAssistant = [...messages].reverse().find((message) => message.role === "assistant");
    if (!lastAssistant) return;
    if (lastSpokenAssistantIdRef.current === lastAssistant.id) return;

    const text = getMessageText(lastAssistant).trim();
    if (!text) return;

    lastSpokenAssistantIdRef.current = lastAssistant.id;

    void playAssistantSpeech(text, lang, "chat");
  }, [isOpen, mode, messages, isLoading, lang, autoSpeakEnabled, isListening]);

  useEffect(() => {
    if (!isOpen || mode !== "consultation" || isLoading || !autoSpeakEnabled || isListening || typeof window === "undefined") return;

    const lastAssistant = [...consultationMessages].reverse().find((message) => message.role === "assistant");
    if (!lastAssistant) return;
    if (lastSpokenConsultationIdRef.current === lastAssistant.id) return;

    const text = lastAssistant.text.trim();
    if (!text) return;

    lastSpokenConsultationIdRef.current = lastAssistant.id;

    void playAssistantSpeech(text, lang, "consultation");
  }, [isOpen, mode, consultationMessages, isLoading, lang, autoSpeakEnabled, isListening]);

  useEffect(() => {
    return () => {
      recognitionRef.current?.stop();
      if (voiceSubmitTimerRef.current !== null && typeof window !== "undefined") {
        window.clearTimeout(voiceSubmitTimerRef.current);
        voiceSubmitTimerRef.current = null;
      }
      stopSpeechOutput();
    };
  }, []);

  const nextConsultationId = () => `consult-${consultationIdRef.current++}`;

  const pushConsultationMessages = (...items: Array<Omit<ConsultationMessage, "id">>) => {
    setConsultationMessages((current) => [
      ...current,
      ...items.map((item) => ({ id: nextConsultationId(), ...item })),
    ]);
  };

  const resetPoliceHelpFlow = () => {
    setPoliceHelpStage("initialNarrative");
    setPoliceHelpNarrative("");
    setPoliceReportTaken("");
    setPoliceNameListed("");
    setPoliceReportCopy("");
    setPoliceWantsFirmRequest("");
  };

  const resetToWelcome = () => {
    setShowWelcome(true);
    setMode("chat");
    setConsultationStep("idle");
    setConsultationMessages([]);
    setConsultationEntryCount(null);
    setConsultationTripRows([]);
    setConsultationArrestCount(null);
    setConsultationArrestRows([]);
    setPendingExitEstimate(null);
    setPendingChargeConfirmation(null);
    resetPoliceHelpFlow();
    setInput("");
  };

  const startConsultationFlow = () => {
    setShowWelcome(false);
    setMode("consultation");
    setConsultationStep("entries");
    setConsultationEntryCount(null);
    setConsultationTripRows([]);
    setConsultationArrestCount(null);
    setConsultationArrestRows([]);
    setPendingExitEstimate(null);
    setPendingChargeConfirmation(null);
    resetPoliceHelpFlow();
    setConsultationMessages([
      {
        id: nextConsultationId(),
        role: "assistant",
        text: `${copy.consultationIntro}\n\n${copy.entriesQuestion}`,
      },
    ]);
    setInput("");
  };

  const submitTripRows = (rows: ConsultationTripRow[]) => {
    const documentsLabels = copy.validDocumentsOptions;
    const summary = rows
      .map((row, index) => {
        const documentsLabel =
          row.validDocuments === "yes"
            ? documentsLabels.yes
            : row.validDocuments === "no"
              ? documentsLabels.no
              : documentsLabels.unknown;

        return `${copy.tripLabel} ${index + 1}: ${copy.entryDateLabel} ${row.entryDate}, ${copy.exitDateLabel} ${row.exitDate}, ${copy.entryLocationLabel} ${row.entryLocation}, ${copy.validDocumentsLabel} ${documentsLabel}`;
      })
      .join("\n");

    pushConsultationMessages({ role: "user", text: summary });
    setConsultationArrestCount(null);
    setConsultationArrestRows([]);
    pushConsultationMessages({ role: "assistant", text: copy.arrestsQuestion });
    setConsultationStep("arrests");
  };

  const submitArrestRows = (rows: ConsultationArrestRow[]) => {
    const summary = rows
      .map(
        (row, index) =>
          `${copy.incidentLabel} ${index + 1}: ${copy.arrestDateLabel} ${row.arrestDate}, ${copy.chargeTypeLabel} ${row.chargeType}, ${copy.arrestLocationLabel} ${row.arrestLocation}, ${copy.outcomeLabel} ${row.outcomeSentence}`,
      )
      .join("\n");

    pushConsultationMessages({ role: "user", text: summary });
    resetPoliceHelpFlow();
    pushConsultationMessages({ role: "assistant", text: copy.policeHelpQuestion });
    setConsultationStep("policeHelp");
  };

  const applyPoliceHelpAnswer = (value: string) => {
    const normalized = normalizeText(value);

    if (policeHelpStage === "initialNarrative") {
      const narrative = value.trim();
      if (!narrative) {
        pushConsultationMessages({
          role: "assistant",
          text:
            lang === "es"
              ? "Por favor expliqueme brevemente como ayudo a la policia o a los fiscales."
              : "Please briefly explain how you helped law enforcement or prosecutors.",
        });
        return;
      }

      setPoliceHelpNarrative(narrative);
      setPoliceHelpStage("confirmNarrative");
      pushConsultationMessages({
        role: "assistant",
        text:
          `${buildPoliceHelpNarrativeReadback(lang, narrative)}\n\n` +
          (lang === "es" ? "Es correcto? Responda si o no." : "Is that correct? Please answer yes or no."),
      });
      return;
    }

    if (policeHelpStage === "confirmNarrative") {
      if (YES_PATTERNS[lang].test(normalized)) {
        setPoliceHelpStage("askReportTaken");
        pushConsultationMessages({
          role: "assistant",
          text:
            lang === "es"
              ? "Gracias. Primera pregunta clave: se tomo un reporte policial oficial?"
              : "Thank you. First key detail: was an official police report taken?",
        });
        return;
      }

      if (NO_PATTERNS[lang].test(normalized)) {
        resetPoliceHelpFlow();
        setPoliceHelpStage("initialNarrative");
        pushConsultationMessages({
          role: "assistant",
          text:
            lang === "es"
              ? "Gracias por corregirme. Por favor expliquelo otra vez brevemente y lo vuelvo a confirmar."
              : "Thanks for correcting me. Please explain it again briefly and I will confirm it again.",
        });
        return;
      }

      pushConsultationMessages({
        role: "assistant",
        text: lang === "es" ? "Solo para confirmar, responda si o no." : "Just to confirm, please answer yes or no.",
      });
      return;
    }

    if (policeHelpStage === "askReportTaken") {
      const answer = parseBinaryAnswer(value, lang);
      if (!answer) {
        pushConsultationMessages({
          role: "assistant",
          text:
            lang === "es"
              ? "Necesito confirmar: se tomo reporte policial? Responda si, no, o no esta seguro."
              : "I need to confirm: was a police report taken? Answer yes, no, or not sure.",
        });
        return;
      }

      setPoliceReportTaken(answer);
      setPoliceHelpStage("askNameListed");
      pushConsultationMessages({
        role: "assistant",
        text:
          lang === "es"
            ? "Segunda pregunta clave: su nombre aparece en ese reporte policial?"
            : "Second key detail: is your name listed on that police report?",
      });
      return;
    }

    if (policeHelpStage === "askNameListed") {
      const answer = parseBinaryAnswer(value, lang);
      if (!answer) {
        pushConsultationMessages({
          role: "assistant",
          text:
            lang === "es"
              ? "Necesito confirmar: su nombre aparece en el reporte? Responda si, no, o no esta seguro."
              : "I need to confirm: is your name listed in the report? Answer yes, no, or not sure.",
        });
        return;
      }

      setPoliceNameListed(answer);

      if (policeReportTaken === "yes") {
        setPoliceHelpStage("askHasReportCopy");
        pushConsultationMessages({
          role: "assistant",
          text:
            lang === "es"
              ? "Tiene una copia del reporte policial en este momento?"
              : "Do you currently have a copy of the police report?",
        });
        return;
      }

      setPoliceReportCopy("unknown");
      setPoliceHelpStage("askWantsFirmRequest");
      pushConsultationMessages({
        role: "assistant",
        text:
          lang === "es"
            ? "Si no tiene ese reporte, quiere que le ayudemos a solicitarlo? Tambien puede obtenerlo usted y compartirlo despues."
            : "If you do not have the report, would you like us to help request it? You can also obtain it and share it later.",
      });
      return;
    }

    if (policeHelpStage === "askHasReportCopy") {
      const answer = parseBinaryAnswer(value, lang);
      if (!answer) {
        pushConsultationMessages({
          role: "assistant",
          text:
            lang === "es"
              ? "Tiene copia del reporte ahora? Responda si, no, o no esta seguro."
              : "Do you have a copy of the report now? Answer yes, no, or not sure.",
        });
        return;
      }

      setPoliceReportCopy(answer);
      if (answer === "yes") {
        setPoliceWantsFirmRequest("no");
        setPoliceHelpStage("finalConfirmation");
        pushConsultationMessages({
          role: "assistant",
          text: buildPoliceHelpFinalSummary({
            lang,
            narrative: policeHelpNarrative,
            reportTaken: policeReportTaken,
            nameListed: policeNameListed,
            hasReportCopy: answer,
            wantsFirmRequest: "no",
          }),
        });
        return;
      }

      setPoliceHelpStage("askWantsFirmRequest");
      pushConsultationMessages({
        role: "assistant",
        text:
          lang === "es"
            ? "Entendido. Quiere que la firma le ayude a obtener ese reporte policial? Si prefiere, tambien puede ir a pedirlo y luego enviarlo."
            : "Understood. Do you want our firm to help obtain that police report? You can also request it yourself and send it later.",
      });
      return;
    }

    if (policeHelpStage === "askWantsFirmRequest") {
      const answer = parseBinaryAnswer(value, lang);
      if (!answer) {
        pushConsultationMessages({
          role: "assistant",
          text:
            lang === "es"
              ? "Para confirmar: quiere que la firma le ayude a obtener el reporte? Responda si, no, o no esta seguro."
              : "To confirm: do you want the firm to help obtain the report? Answer yes, no, or not sure.",
        });
        return;
      }

      setPoliceWantsFirmRequest(answer);
      setPoliceHelpStage("finalConfirmation");
      pushConsultationMessages({
        role: "assistant",
        text: buildPoliceHelpFinalSummary({
          lang,
          narrative: policeHelpNarrative,
          reportTaken: policeReportTaken,
          nameListed: policeNameListed,
          hasReportCopy: policeReportCopy,
          wantsFirmRequest: answer,
        }),
      });
      return;
    }

    if (policeHelpStage === "finalConfirmation") {
      if (YES_PATTERNS[lang].test(normalized)) {
        const followUp = `${copy.uvNote}\n\n${copy.consultationThanks}`;
        pushConsultationMessages({ role: "assistant", text: followUp });
        setConsultationStep("complete");
        return;
      }

      if (NO_PATTERNS[lang].test(normalized)) {
        resetPoliceHelpFlow();
        setPoliceHelpStage("initialNarrative");
        pushConsultationMessages({
          role: "assistant",
          text:
            lang === "es"
              ? "Gracias. Corrijamos todo desde el inicio para verificar bien su reclamo U-Visa. Expliqueme otra vez que paso con la policia."
              : "Thank you. Let's correct everything from the start so we can verify your U-Visa claim. Please explain again what happened with police.",
        });
        return;
      }

      pushConsultationMessages({
        role: "assistant",
        text: lang === "es" ? "Para cerrar, confirme con si o no." : "To finish, please confirm with yes or no.",
      });
    }
  };

  const applyEntryAnswer = (value: string) => {
    const nextMissing = findNextIncompleteTripField(consultationTripRows);
    if (!nextMissing) {
      submitTripRows(consultationTripRows);
      return;
    }

    let parsedValue: string | ConsultationTripRow["validDocuments"] | null = value.trim();
    const normalizedValue = normalizeText(value);

    if (nextMissing.field === "entryDate" || nextMissing.field === "exitDate") {
      if (
        nextMissing.field === "exitDate" &&
        pendingExitEstimate &&
        pendingExitEstimate.rowIndex === nextMissing.rowIndex
      ) {
        if (YES_PATTERNS[lang].test(normalizedValue)) {
          parsedValue = pendingExitEstimate.inferredExitDate;
          setPendingExitEstimate(null);
        } else if (NO_PATTERNS[lang].test(normalizedValue)) {
          setPendingExitEstimate(null);
          pushConsultationMessages({
            role: "assistant",
            text:
              lang === "es"
                ? `Viaje ${nextMissing.rowIndex + 1}: perfecto, cual fue la fecha aproximada de salida?`
                : getTripFieldRetryPrompt(lang, nextMissing.rowIndex, nextMissing.field),
          });
          return;
        } else {
          parsedValue = parseConsultationDate(value, lang);
          if (!parsedValue) {
            pushConsultationMessages({
              role: "assistant",
              text:
                lang === "es"
                  ? "Solo para confirmar: suena correcta la fecha estimada o prefieres dar otra fecha aproximada?"
                  : "Does the estimated date sound right, or would you like to provide a different date?",
            });
            return;
          }
          setPendingExitEstimate(null);
        }
      } else {
        parsedValue = parseConsultationDate(value, lang);

        if (!parsedValue && nextMissing.field === "exitDate") {
          const duration = parseDurationYears(value);
          const entryDate = consultationTripRows[nextMissing.rowIndex]?.entryDate;

          if (duration && entryDate) {
            const inferred = inferExitDateFromDuration(entryDate, duration, lang);
            const estimate: PendingExitEstimate = {
              rowIndex: nextMissing.rowIndex,
              inferredExitDate: inferred.inferredExitDate,
              prompt: inferred.prompt,
            };
            setPendingExitEstimate(estimate);
            pushConsultationMessages({ role: "assistant", text: estimate.prompt });
            return;
          }
        }
      }
    } else if (nextMissing.field === "validDocuments") {
      parsedValue = parseValidDocumentsAnswer(value, lang);
    }

    if (!parsedValue) {
      pushConsultationMessages({
        role: "assistant",
        text: getTripFieldRetryPrompt(lang, nextMissing.rowIndex, nextMissing.field),
      });
      return;
    }

    if (nextMissing.field === "exitDate") {
      setPendingExitEstimate(null);
    }

    const updatedRows = consultationTripRows.map((row, rowIndex) => {
      if (rowIndex !== nextMissing.rowIndex) {
        return row;
      }

      const baseRow = {
        ...row,
        [nextMissing.field]: parsedValue,
      };

      if (nextMissing.field === "entryDate") {
        return inferTripRowFromUtterance(baseRow, value, lang);
      }

      return baseRow;
    });

    setConsultationTripRows(updatedRows);
    const completedRowIndex = nextMissing.rowIndex;
    const rowJustCompleted =
      isTripRowComplete(updatedRows[completedRowIndex]) &&
      !isTripRowComplete(consultationTripRows[completedRowIndex]);

    const nextPrompt = findNextIncompleteTripField(updatedRows);

    if (rowJustCompleted) {
      const readback = buildTripReadbackMessage(lang, updatedRows[completedRowIndex], completedRowIndex);

      if (!nextPrompt) {
        pushConsultationMessages({ role: "assistant", text: readback });
        submitTripRows(updatedRows);
        return;
      }

      pushConsultationMessages({
        role: "assistant",
        text: `${readback}\n\n${buildTripTransitionMessage(lang, completedRowIndex, nextPrompt)}`,
      });
      return;
    }

    if (!nextPrompt) {
      submitTripRows(updatedRows);
      return;
    }

    pushConsultationMessages({
      role: "assistant",
      text: getTripFieldPrompt(lang, nextPrompt.rowIndex, nextPrompt.field),
    });
  };

  const applyArrestAnswer = (value: string) => {
    const nextMissing = findNextIncompleteArrestField(consultationArrestRows);
    if (!nextMissing) {
      submitArrestRows(consultationArrestRows);
      return;
    }

    let parsedValue: string | null = value.trim();

    if (nextMissing.field === "arrestDate") {
      parsedValue = parseConsultationDate(value, lang);
    } else if (nextMissing.field === "chargeType") {
      const normalizedValue = normalizeText(value);

      if (pendingChargeConfirmation && pendingChargeConfirmation.rowIndex === nextMissing.rowIndex) {
        if (YES_PATTERNS[lang].test(normalizedValue)) {
          parsedValue = pendingChargeConfirmation.proposedCharge;
          setPendingChargeConfirmation(null);
        } else if (NO_PATTERNS[lang].test(normalizedValue)) {
          setPendingChargeConfirmation(null);
          pushConsultationMessages({
            role: "assistant",
            text:
              lang === "es"
                ? `Incidencia ${nextMissing.rowIndex + 1}: entendido, por favor dilo de nuevo con tus palabras para registrarlo bien.`
                : getArrestFieldRetryPrompt(lang, nextMissing.rowIndex, nextMissing.field),
          });
          return;
        } else {
          const candidate = normalizeChargeTypeFromSpeech(value, lang);
          if (candidate) {
            setPendingChargeConfirmation({
              rowIndex: nextMissing.rowIndex,
              proposedCharge: candidate,
            });
            pushConsultationMessages({
              role: "assistant",
              text:
                lang === "es"
                  ? `Solo para confirmar: te escuche "${candidate}". Es correcto?`
                  : `Just to confirm, I heard "${candidate}". Is that correct?`,
            });
            return;
          }
        }
      } else {
        const candidate = normalizeChargeTypeFromSpeech(value, lang);
        if (candidate) {
          setPendingChargeConfirmation({
            rowIndex: nextMissing.rowIndex,
            proposedCharge: candidate,
          });
          pushConsultationMessages({
            role: "assistant",
            text:
              lang === "es"
                ? `Solo para confirmar: te escuche "${candidate}". Es correcto?`
                : `Just to confirm, I heard "${candidate}". Is that correct?`,
          });
          return;
        }
      }
    }

    if (!parsedValue) {
      pushConsultationMessages({
        role: "assistant",
        text: getArrestFieldRetryPrompt(lang, nextMissing.rowIndex, nextMissing.field),
      });
      return;
    }

    const updatedRows = consultationArrestRows.map((row, rowIndex) =>
      rowIndex === nextMissing.rowIndex
        ? {
            ...row,
            [nextMissing.field]: parsedValue,
          }
        : row,
    );

    setConsultationArrestRows(updatedRows);
    const completedRowIndex = nextMissing.rowIndex;
    const rowJustCompleted =
      isArrestRowComplete(updatedRows[completedRowIndex]) &&
      !isArrestRowComplete(consultationArrestRows[completedRowIndex]);

    const nextPrompt = findNextIncompleteArrestField(updatedRows);

    if (rowJustCompleted) {
      const readback = buildArrestReadbackMessage(lang, updatedRows[completedRowIndex], completedRowIndex);

      if (!nextPrompt) {
        pushConsultationMessages({ role: "assistant", text: readback });
        submitArrestRows(updatedRows);
        return;
      }

      pushConsultationMessages({
        role: "assistant",
        text: `${readback}\n\n${buildArrestTransitionMessage(lang, completedRowIndex, nextPrompt)}`,
      });
      return;
    }

    if (nextMissing.field === "chargeType") {
      setPendingChargeConfirmation(null);
      const chargeReadback = buildArrestChargeReadbackMessage(lang, nextMissing.rowIndex, parsedValue);
      if (nextPrompt) {
        pushConsultationMessages({
          role: "assistant",
          text: `${chargeReadback}\n\n${getArrestFieldPrompt(lang, nextPrompt.rowIndex, nextPrompt.field)}`,
        });
        return;
      }
    }

    if (!nextPrompt) {
      submitArrestRows(updatedRows);
      return;
    }

    pushConsultationMessages({
      role: "assistant",
      text: getArrestFieldPrompt(lang, nextPrompt.rowIndex, nextPrompt.field),
    });
  };

  const completeConsultationStep = (value: string) => {
    pushConsultationMessages({ role: "user", text: value });

    if (consultationStep === "entries") {
      if (consultationEntryCount !== null) {
        applyEntryAnswer(value);
        return;
      }

      const nextEntryCount = extractEntryCount(value, lang);

      if (nextEntryCount === null) {
        pushConsultationMessages({ role: "assistant", text: copy.entriesNeedCount });
        return;
      }

      setConsultationEntryCount(nextEntryCount);
      const nextRows = createEmptyTripRows(nextEntryCount);
      nextRows[0] = inferTripRowFromUtterance(nextRows[0], value, lang);
      setConsultationTripRows(nextRows);
      const nextPrompt = findNextIncompleteTripField(nextRows);
      pushConsultationMessages({
        role: "assistant",
        text: `${copy.entriesTableIntro.replace("{count}", String(nextEntryCount))}\n\n${
          nextPrompt ? getTripFieldPrompt(lang, nextPrompt.rowIndex, nextPrompt.field) : ""
        }`,
      });
      return;
    }

    if (consultationStep === "arrests") {
      if (consultationArrestCount !== null && consultationArrestCount > 0) {
        applyArrestAnswer(value);
        return;
      }

      const nextArrestCount = extractEntryCount(value, lang);

      if (nextArrestCount === null) {
        pushConsultationMessages({ role: "assistant", text: copy.arrestsNeedCount });
        return;
      }

      if (nextArrestCount === 0) {
        setConsultationArrestCount(0);
        setConsultationArrestRows([]);
        resetPoliceHelpFlow();
        pushConsultationMessages({ role: "assistant", text: copy.policeHelpQuestion });
        setConsultationStep("policeHelp");
        return;
      }

      setConsultationArrestCount(nextArrestCount);
      const nextRows = createEmptyArrestRows(nextArrestCount);
      setConsultationArrestRows(nextRows);
      const nextPrompt = findNextIncompleteArrestField(nextRows);
      pushConsultationMessages({
        role: "assistant",
        text: `${copy.arrestsTableIntro.replace("{count}", String(nextArrestCount))}\n\n${
          nextPrompt ? getArrestFieldPrompt(lang, nextPrompt.rowIndex, nextPrompt.field) : ""
        }`,
      });
      return;
    }

    if (consultationStep === "policeHelp") {
      applyPoliceHelpAnswer(value);
    }
  };

  const updateTripRow = (
    index: number,
    field: keyof ConsultationTripRow,
    value: ConsultationTripRow[keyof ConsultationTripRow],
  ) => {
    setConsultationTripRows((current) =>
      current.map((row, rowIndex) =>
        rowIndex === index
          ? {
              ...row,
              [field]: value,
            }
          : row,
      ),
    );
  };

  const isTripTableComplete =
    consultationTripRows.length > 0 &&
    consultationTripRows.every(
      (row) => row.entryDate && row.exitDate && row.entryLocation.trim() && row.validDocuments,
    );

  const submitTripTable = () => {
    if (!isTripTableComplete) return;
    submitTripRows(consultationTripRows);
  };

  const updateArrestRow = (
    index: number,
    field: keyof ConsultationArrestRow,
    value: ConsultationArrestRow[keyof ConsultationArrestRow],
  ) => {
    setConsultationArrestRows((current) =>
      current.map((row, rowIndex) =>
        rowIndex === index
          ? {
              ...row,
              [field]: value,
            }
          : row,
      ),
    );
  };

  const isArrestTableComplete =
    consultationArrestRows.length > 0 &&
    consultationArrestRows.every(
      (row) => row.arrestDate && row.chargeType.trim() && row.arrestLocation.trim() && row.outcomeSentence.trim(),
    );

  const submitArrestTable = () => {
    if (!isArrestTableComplete) return;
    submitArrestRows(consultationArrestRows);
  };

  const submitText = (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || isLoading) return;

    if (isConsultationMode && consultationStep !== "complete") {
      completeConsultationStep(trimmed);
      return;
    }

    setShowWelcome(false);
    setMode("chat");
    sendMessage({ text: trimmed });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    submitText(input);
    setInput("");
  };

  const toggleVoiceInput = () => {
    if (!isVoiceInputSupported || isInputLocked || typeof window === "undefined") return;

    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
      if (voiceSubmitTimerRef.current !== null && typeof window !== "undefined") {
        window.clearTimeout(voiceSubmitTimerRef.current);
        voiceSubmitTimerRef.current = null;
      }
      voiceFinalTranscriptRef.current = "";
      setVoiceStatus("idle");
      return;
    }

    const speechWindow = window as Window & {
      SpeechRecognition?: BrowserSpeechRecognitionCtor;
      webkitSpeechRecognition?: BrowserSpeechRecognitionCtor;
    };
    const SpeechRecognitionCtor = speechWindow.SpeechRecognition ?? speechWindow.webkitSpeechRecognition;
    if (!SpeechRecognitionCtor) return;

    const recognition = new SpeechRecognitionCtor();
    recognitionRef.current = recognition;
    recognition.lang = SPEECH_LANG_BY_UI_LANG[lang];
    recognition.interimResults = true;
    recognition.maxAlternatives = 1;
    recognition.continuous = true;

    stopSpeechOutput();
    voiceFinalTranscriptRef.current = "";

    recognition.onresult = (event) => {
      setVoiceStatus("processing");
      let interimTranscript = "";

      for (let index = event.resultIndex; index < event.results.length; index += 1) {
        const result = event.results[index];
        const transcript = result[0]?.transcript?.trim() ?? "";
        if (!transcript) continue;

        if (result.isFinal) {
          voiceFinalTranscriptRef.current = `${voiceFinalTranscriptRef.current} ${transcript}`.trim();
        } else {
          interimTranscript = `${interimTranscript} ${transcript}`.trim();
        }
      }

      const displayTranscript = `${voiceFinalTranscriptRef.current} ${interimTranscript}`.trim();
      if (displayTranscript) {
        setInput(displayTranscript);
      }

      if (voiceSubmitTimerRef.current !== null && typeof window !== "undefined") {
        window.clearTimeout(voiceSubmitTimerRef.current);
      }

      voiceSubmitTimerRef.current = window.setTimeout(() => {
        const finalText = voiceFinalTranscriptRef.current.trim();
        if (finalText) {
          submitText(finalText);
          setInput("");
        }
        voiceFinalTranscriptRef.current = "";
        setVoiceStatus("listening");
      }, 850);
    };

    recognition.onerror = (event) => {
      setVoiceStatus(event.error === "not-allowed" ? "permission-denied" : "error");
      setIsListening(false);
      if (voiceSubmitTimerRef.current !== null && typeof window !== "undefined") {
        window.clearTimeout(voiceSubmitTimerRef.current);
        voiceSubmitTimerRef.current = null;
      }
      voiceFinalTranscriptRef.current = "";
    };

    recognition.onend = () => {
      setIsListening(false);
      if (voiceSubmitTimerRef.current !== null && typeof window !== "undefined") {
        window.clearTimeout(voiceSubmitTimerRef.current);
        voiceSubmitTimerRef.current = null;
      }
      voiceFinalTranscriptRef.current = "";
      setVoiceStatus((previous) =>
        previous === "listening" || previous === "processing" ? "idle" : previous,
      );
    };

    recognition.start();
    setIsListening(true);
    setVoiceStatus("listening");
  };

  const handleSuggestionClick: Parameters<typeof ImmigrationWelcomeScreen>[0]["onSuggestionClick"] = (msg) => {
    setShowWelcome(false);
    setMode("chat");
    sendMessage(msg);
  };

  const activePlaceholder =
    isConsultationMode && consultationStep !== "complete"
      ? copy.consultationPlaceholders[consultationStep as "entries" | "arrests" | "policeHelp"]
      : isConsultationMode
        ? copy.consultationFinishedPlaceholder
        : copy.placeholder;

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 bg-black/50 xl:hidden"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Chat panel */}
      <div className="fixed top-0 right-0 z-50 flex h-full w-full flex-col border-l border-[#d8f7ab] bg-white sm:w-[420px] animate-in slide-in-from-right duration-300 shadow-2xl">
        {/* Header */}
        <header className="shrink-0 bg-[#a9f04d] text-slate-950">
          <div className="flex h-16 items-center justify-between px-5">
            <div className="flex items-center gap-2 font-semibold">
              {!showWelcome && (
                <button
                  type="button"
                  onClick={resetToWelcome}
                  className="-ml-1 flex items-center justify-center rounded-full p-1 hover:bg-black/10 transition-colors"
                  aria-label={copy.backLabel}
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>
              )}
              <Scale className="h-5 w-5" />
              <div>
                <p className="text-sm font-bold leading-none">Jaime Barron PC</p>
                <p className="text-xs text-slate-800/80 mt-0.5">{copy.assistantLabel}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <a
                href="tel:8442679300"
                className="flex items-center gap-1 text-xs bg-black/10 hover:bg-black/15 px-3 py-1.5 rounded-full transition-colors"
              >
                <Phone className="h-3 w-3" />
                844.267.9300
              </a>
              <Button
                variant="ghost"
                size="icon"
                onClick={onClose}
                className="text-slate-950 hover:bg-black/10 h-8 w-8"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </header>

        {/* Language selector */}
        <div className="shrink-0 border-b border-[#d8f7ab] bg-[#f4fedf] px-4 py-2">
          <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-widest text-[#6d962c]">{copy.chooseLanguage}</p>
          <div className="flex flex-wrap gap-1.5">
            {LANGUAGES.map((l) => (
              <button
                key={l.code}
                type="button"
                onClick={() => setLang(l.code)}
                className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium transition-colors ${
                  lang === l.code
                    ? "bg-[#a9f04d] text-slate-950"
                    : "bg-white text-slate-600 hover:bg-[#eefbd3] border border-slate-200"
                }`}
              >
                <span>{l.flag}</span>
                <span>{l.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto overscroll-contain px-4 py-4">
          {!isConsultationMode && (
            <div className="mb-4 rounded-2xl border border-[#d8f7ab] bg-[#f7fee7] p-3">
              <div className="flex items-center justify-between gap-3">
                <p className="text-xs leading-relaxed text-slate-600">
                  {copy.consultationPromo}
                </p>
                <Button
                  type="button"
                  onClick={startConsultationFlow}
                  className="shrink-0 rounded-full bg-[#a9f04d] px-4 py-2 text-xs font-semibold text-slate-950 hover:bg-[#97d844] animate-[pulse_2.6s_ease-in-out_infinite]"
                >
                  {copy.consultNow}
                </Button>
              </div>
            </div>
          )}

          {showWelcome && !isConsultationMode ? (
            <ImmigrationWelcomeScreen lang={lang} onSuggestionClick={handleSuggestionClick} />
          ) : isConsultationMode ? (
            <div className="space-y-4">
              {consultationMessages.map((message) => (
                <div key={message.id} className="space-y-2">
                  <div className="space-y-2">
                    <div
                      className={`flex gap-3 ${
                        message.role === "user" ? "flex-row-reverse" : "flex-row"
                      }`}
                    >
                      <div
                        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${
                          message.role === "user" ? "bg-slate-800" : "bg-[#eefbd3]"
                        }`}
                      >
                        {message.role === "user" ? (
                          <User className="h-4 w-4 text-white" />
                        ) : (
                          <Scale className="h-4 w-4 text-[#8fcf38]" />
                        )}
                      </div>
                      <div
                        className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                          message.role === "user"
                            ? "bg-slate-800 text-white"
                            : "bg-slate-100 text-slate-900"
                        }`}
                      >
                        <p className="whitespace-pre-wrap">{message.text}</p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              {consultationStep === "complete" && (
                <div className="pl-11">
                  <div className="flex flex-wrap gap-2">
                    <a
                      href="tel:8442679300"
                      className="inline-flex items-center rounded-md bg-[#a9f04d] px-4 py-2 text-sm font-semibold text-slate-950 transition-colors hover:bg-[#97d844]"
                    >
                      {copy.consultationCallNow}
                    </a>
                    <a
                      href="https://jaimebarron.com/contact/"
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center rounded-md border border-[#a9f04d] px-4 py-2 text-sm font-semibold text-[#6d962c] transition-colors hover:bg-[#f4fedf]"
                    >
                      {copy.consultationCallBack}
                    </a>
                  </div>
                  <p className="mt-2 text-xs text-slate-500">
                    {copy.consultationCallbackNote}
                  </p>
                </div>
              )}

              {isEntryTableActive && (
                <div className="pl-11">
                  <div className="rounded-2xl border border-[#d8f7ab] bg-[#f7fee7] p-4">
                    <div className="mb-3">
                      <p className="text-sm font-semibold text-slate-900">{copy.entriesTableHeading}</p>
                      <p className="mt-1 text-xs leading-relaxed text-slate-600">{copy.entriesTableDescription}</p>
                      {nextIncompleteTripField && (
                        <p className="mt-2 rounded-md bg-white px-2 py-1 text-[11px] font-medium text-[#6d962c]">
                          {getCurrentCollectionLabel(
                            lang,
                            "entries",
                            nextIncompleteTripField.rowIndex,
                            nextIncompleteTripField.field,
                          )}
                        </p>
                      )}
                    </div>
                    <div className="overflow-x-auto">
                      <table className="min-w-full text-left text-xs text-slate-700">
                        <thead>
                          <tr className="border-b border-[#d8f7ab] text-[11px] uppercase tracking-wide text-[#6d962c]">
                            <th className="px-2 py-2 font-semibold">{copy.tripLabel}</th>
                            <th className="px-2 py-2 font-semibold">{copy.entryDateLabel}</th>
                            <th className="px-2 py-2 font-semibold">{copy.exitDateLabel}</th>
                            <th className="px-2 py-2 font-semibold">{copy.entryLocationLabel}</th>
                            <th className="px-2 py-2 font-semibold">{copy.validDocumentsLabel}</th>
                          </tr>
                        </thead>
                        <tbody>
                          {consultationTripRows.map((row, index) => (
                            <tr key={`trip-row-${index}`} className="border-b border-[#e7f8c8] last:border-b-0 align-top">
                              <td className="px-2 py-2 font-medium text-slate-900">{index + 1}</td>
                              <td className="px-2 py-2">
                                <input
                                  type="date"
                                  value={row.entryDate}
                                  onChange={(e) => updateTripRow(index, "entryDate", e.target.value)}
                                  className="w-[132px] rounded-md border border-[#cfe9a0] bg-white px-2 py-1.5 text-xs text-slate-900 outline-none ring-0 focus:border-[#a9f04d]"
                                />
                              </td>
                              <td className="px-2 py-2">
                                <input
                                  type="date"
                                  value={row.exitDate}
                                  onChange={(e) => updateTripRow(index, "exitDate", e.target.value)}
                                  className="w-[132px] rounded-md border border-[#cfe9a0] bg-white px-2 py-1.5 text-xs text-slate-900 outline-none ring-0 focus:border-[#a9f04d]"
                                />
                              </td>
                              <td className="px-2 py-2">
                                <input
                                  type="text"
                                  value={row.entryLocation}
                                  onChange={(e) => updateTripRow(index, "entryLocation", e.target.value)}
                                  className="w-[160px] rounded-md border border-[#cfe9a0] bg-white px-2 py-1.5 text-xs text-slate-900 outline-none ring-0 focus:border-[#a9f04d]"
                                  placeholder={copy.entryLocationLabel}
                                />
                              </td>
                              <td className="px-2 py-2">
                                <select
                                  value={row.validDocuments}
                                  onChange={(e) =>
                                    updateTripRow(
                                      index,
                                      "validDocuments",
                                      e.target.value as ConsultationTripRow["validDocuments"],
                                    )
                                  }
                                  className="w-[150px] rounded-md border border-[#cfe9a0] bg-white px-2 py-1.5 text-xs text-slate-900 outline-none ring-0 focus:border-[#a9f04d]"
                                >
                                  <option value="">{copy.validDocumentsOptions.placeholder}</option>
                                  <option value="yes">{copy.validDocumentsOptions.yes}</option>
                                  <option value="no">{copy.validDocumentsOptions.no}</option>
                                  <option value="unknown">{copy.validDocumentsOptions.unknown}</option>
                                </select>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    <div className="mt-4 flex justify-end">
                      <Button
                        type="button"
                        onClick={submitTripTable}
                        disabled={!isTripTableComplete}
                        className="bg-[#a9f04d] text-slate-950 hover:bg-[#97d844]"
                      >
                        {copy.entriesContinue}
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              {isArrestsTableActive && (
                <div className="pl-11">
                  <div className="rounded-2xl border border-[#d8f7ab] bg-[#f7fee7] p-4">
                    <div className="mb-3">
                      <p className="text-sm font-semibold text-slate-900">{copy.arrestsTableHeading}</p>
                      <p className="mt-1 text-xs leading-relaxed text-slate-600">{copy.arrestsTableDescription}</p>
                      {nextIncompleteArrestField && (
                        <p className="mt-2 rounded-md bg-white px-2 py-1 text-[11px] font-medium text-[#6d962c]">
                          {getCurrentCollectionLabel(
                            lang,
                            "arrests",
                            nextIncompleteArrestField.rowIndex,
                            nextIncompleteArrestField.field,
                          )}
                        </p>
                      )}
                    </div>
                    <div className="overflow-x-auto">
                      <table className="min-w-full text-left text-xs text-slate-700">
                        <thead>
                          <tr className="border-b border-[#d8f7ab] text-[11px] uppercase tracking-wide text-[#6d962c]">
                            <th className="px-2 py-2 font-semibold">{copy.incidentLabel}</th>
                            <th className="px-2 py-2 font-semibold">{copy.arrestDateLabel}</th>
                            <th className="px-2 py-2 font-semibold">{copy.chargeTypeLabel}</th>
                            <th className="px-2 py-2 font-semibold">{copy.arrestLocationLabel}</th>
                            <th className="px-2 py-2 font-semibold">{copy.outcomeLabel}</th>
                          </tr>
                        </thead>
                        <tbody>
                          {consultationArrestRows.map((row, index) => (
                            <tr key={`arrest-row-${index}`} className="border-b border-[#e7f8c8] last:border-b-0 align-top">
                              <td className="px-2 py-2 font-medium text-slate-900">{index + 1}</td>
                              <td className="px-2 py-2">
                                <input
                                  type="date"
                                  value={row.arrestDate}
                                  onChange={(e) => updateArrestRow(index, "arrestDate", e.target.value)}
                                  className="w-[132px] rounded-md border border-[#cfe9a0] bg-white px-2 py-1.5 text-xs text-slate-900 outline-none ring-0 focus:border-[#a9f04d]"
                                />
                              </td>
                              <td className="px-2 py-2">
                                <input
                                  type="text"
                                  value={row.chargeType}
                                  onChange={(e) => updateArrestRow(index, "chargeType", e.target.value)}
                                  className="w-[150px] rounded-md border border-[#cfe9a0] bg-white px-2 py-1.5 text-xs text-slate-900 outline-none ring-0 focus:border-[#a9f04d]"
                                  placeholder={copy.chargeTypeLabel}
                                />
                              </td>
                              <td className="px-2 py-2">
                                <input
                                  type="text"
                                  value={row.arrestLocation}
                                  onChange={(e) => updateArrestRow(index, "arrestLocation", e.target.value)}
                                  className="w-[160px] rounded-md border border-[#cfe9a0] bg-white px-2 py-1.5 text-xs text-slate-900 outline-none ring-0 focus:border-[#a9f04d]"
                                  placeholder={copy.arrestLocationLabel}
                                />
                              </td>
                              <td className="px-2 py-2">
                                <input
                                  type="text"
                                  value={row.outcomeSentence}
                                  onChange={(e) => updateArrestRow(index, "outcomeSentence", e.target.value)}
                                  className="w-[180px] rounded-md border border-[#cfe9a0] bg-white px-2 py-1.5 text-xs text-slate-900 outline-none ring-0 focus:border-[#a9f04d]"
                                  placeholder={copy.outcomeLabel}
                                />
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    <div className="mt-4 flex justify-end">
                      <Button
                        type="button"
                        onClick={submitArrestTable}
                        disabled={!isArrestTableComplete}
                        className="bg-[#a9f04d] text-slate-950 hover:bg-[#97d844]"
                      >
                        {copy.arrestsContinue}
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>
          ) : (
            <div className="space-y-4">
              {messages.map((message) => {
                const content = getMessageText(message);
                const toolParts = getToolParts(message);
                const hasContent = content.length > 0;
                const hasTools = toolParts.length > 0;

                if (!hasContent && !hasTools) return null;

                return (
                  <div key={message.id} className="space-y-2">
                    {/* Tool call indicators */}
                    {hasTools &&
                      toolParts.map((toolPart, i) => {
                        const tp = toolPart as { type: string; toolName?: string; toolCallId?: string };
                        if (tp.type !== "tool-invocation") return null;
                        const label = copy.toolLabels[tp.toolName ?? ""] ?? copy.toolLabels.getFAQAnswer;
                        return (
                          <div
                            key={`${message.id}-tool-${i}`}
                            className="flex items-center gap-2 text-xs text-[#6d962c] bg-[#f4fedf] rounded-lg px-3 py-2"
                          >
                            <Loader2 className="h-3 w-3 animate-spin" />
                            {label}
                          </div>
                        );
                      })}

                    {/* Message bubble */}
                    {hasContent && (
                      <div className="space-y-2">
                        <div
                          className={`flex gap-3 ${
                            message.role === "user" ? "flex-row-reverse" : "flex-row"
                          }`}
                        >
                          <div
                            className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${
                              message.role === "user"
                                ? "bg-slate-800"
                                : "bg-[#eefbd3]"
                            }`}
                          >
                            {message.role === "user" ? (
                              <User className="h-4 w-4 text-white" />
                            ) : (
                              <Scale className="h-4 w-4 text-[#8fcf38]" />
                            )}
                          </div>
                          <div
                            className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                              message.role === "user"
                                ? "bg-slate-800 text-white"
                                : "bg-slate-100 text-slate-900"
                            }`}
                          >
                            <p className="whitespace-pre-wrap">{content}</p>
                          </div>
                        </div>

                        {message.role === "assistant" && shouldShowConsultationCTA(content) && (
                          <div className="pl-11">
                            <p className="mb-2 text-base font-bold text-slate-900 leading-tight">
                              {copy.consultationHeading}
                            </p>
                            <a
                              href="https://jaimebarron.com/contact/"
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center rounded-md bg-[#a9f04d] px-4 py-2 text-sm font-semibold text-slate-950 transition-colors hover:bg-[#97d844]"
                            >
                              {copy.consultationButton}
                            </a>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}

              {/* Loading indicator */}
              {isLoading && messages[messages.length - 1]?.role === "user" && (
                <div className="flex gap-3">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#eefbd3]">
                    <Scale className="h-4 w-4 text-[#8fcf38]" />
                  </div>
                  <div className="bg-slate-100 rounded-2xl px-4 py-2.5">
                    <div className="flex gap-1 items-center h-5">
                      <span className="w-2 h-2 bg-[#a9f04d] rounded-full animate-bounce [animation-delay:0ms]" />
                      <span className="w-2 h-2 bg-[#a9f04d] rounded-full animate-bounce [animation-delay:150ms]" />
                      <span className="w-2 h-2 bg-[#a9f04d] rounded-full animate-bounce [animation-delay:300ms]" />
                    </div>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Input */}
        <div className="shrink-0 border-t border-slate-200 p-4">
          <form onSubmit={handleSubmit} className="flex gap-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={activePlaceholder}
              className="flex-1 text-sm"
              disabled={isInputLocked}
            />
            <Button
              type="button"
              size="icon"
              onClick={toggleVoiceInput}
              disabled={!isVoiceInputSupported || isInputLocked}
              className={`shrink-0 ${
                isListening
                  ? "bg-rose-500 hover:bg-rose-600 text-white"
                  : "bg-slate-200 hover:bg-slate-300 text-slate-700"
              }`}
              aria-label={isListening ? "Stop voice input" : "Start voice input"}
              title={isListening ? "Stop voice input" : "Start voice input"}
            >
              {isListening ? <Square className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
            </Button>
            <Button
              type="submit"
              size="icon"
              disabled={
                !input.trim() ||
                isInputLocked
              }
              className="bg-[#a9f04d] hover:bg-[#97d844] text-slate-950 shrink-0"
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </form>
          <div className="mt-2 flex items-center justify-between gap-2 rounded-md bg-slate-100 px-2.5 py-1.5 text-[11px] text-slate-600">
            <span>{getVoiceStatusLabel(lang, voiceStatus)}</span>
            <button
              type="button"
              onClick={() => setAutoSpeakEnabled((current) => !current)}
              disabled={!isSpeechOutputSupported}
              className={`rounded-full px-2 py-0.5 font-medium transition-colors ${
                autoSpeakEnabled && isSpeechOutputSupported
                  ? "bg-[#a9f04d] text-slate-900"
                  : "bg-slate-200 text-slate-500"
              }`}
            >
              {autoSpeakEnabled ? "Auto-speak: ON" : "Auto-speak: OFF"}
            </button>
          </div>
          <p className="text-xs text-slate-400 mt-2 text-center">
            {copy.disclaimer}
          </p>
        </div>
      </div>
    </>
  );
}
