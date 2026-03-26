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
  onresult: ((event: { results: ArrayLike<ArrayLike<{ transcript: string }>> }) => void) | null;
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

function extractEntryCount(text: string, lang: LangCode): number | null {
  const numberMatch = text.match(/\b(\d{1,2})\b/);
  if (numberMatch) {
    return Number(numberMatch[1]);
  }

  const normalized = text.toLowerCase();
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
  const [lang, setLang] = useState<LangCode>("en");
  const [showWelcome, setShowWelcome] = useState(true);
  const [mode, setMode] = useState<ChatMode>("chat");
  const [consultationStep, setConsultationStep] = useState<ConsultationStep>("idle");
  const [consultationMessages, setConsultationMessages] = useState<ConsultationMessage[]>([]);
  const [consultationEntryCount, setConsultationEntryCount] = useState<number | null>(null);
  const [consultationTripRows, setConsultationTripRows] = useState<ConsultationTripRow[]>([]);
  const [consultationArrestCount, setConsultationArrestCount] = useState<number | null>(null);
  const [consultationArrestRows, setConsultationArrestRows] = useState<ConsultationArrestRow[]>([]);
  const [isListening, setIsListening] = useState(false);
  const [isVoiceInputSupported, setIsVoiceInputSupported] = useState(false);
  const [isSpeechOutputSupported, setIsSpeechOutputSupported] = useState(false);
  const [autoSpeakEnabled, setAutoSpeakEnabled] = useState(true);
  const [voiceStatus, setVoiceStatus] = useState<VoiceStatusCode>("idle");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const consultationIdRef = useRef(0);
  const recognitionRef = useRef<BrowserSpeechRecognition | null>(null);
  const lastSpokenAssistantIdRef = useRef<string | null>(null);
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
    isEntryTableActive ||
    isArrestsTableActive ||
    (isConsultationMode && consultationStep === "complete");

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
    setIsSpeechOutputSupported("speechSynthesis" in window);
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

  useEffect(() => {
    if (!isOpen || mode !== "chat" || isLoading || !autoSpeakEnabled || typeof window === "undefined") return;

    const lastAssistant = [...messages].reverse().find((message) => message.role === "assistant");
    if (!lastAssistant) return;
    if (lastSpokenAssistantIdRef.current === lastAssistant.id) return;

    const text = getMessageText(lastAssistant).trim();
    if (!text) return;

    lastSpokenAssistantIdRef.current = lastAssistant.id;

    if (!("speechSynthesis" in window)) return;

    const utterance = new SpeechSynthesisUtterance(text);
    const speechLang = SPEECH_LANG_BY_UI_LANG[lang];
    utterance.lang = speechLang;

    const voices = window.speechSynthesis.getVoices();
    const matchedVoice = voices.find((voice) => voice.lang.toLowerCase().startsWith(speechLang.slice(0, 2).toLowerCase()));
    if (matchedVoice) {
      utterance.voice = matchedVoice;
    }

    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utterance);
  }, [isOpen, mode, messages, isLoading, lang, autoSpeakEnabled]);

  useEffect(() => {
    return () => {
      recognitionRef.current?.stop();
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const nextConsultationId = () => `consult-${consultationIdRef.current++}`;

  const pushConsultationMessages = (...items: Array<Omit<ConsultationMessage, "id">>) => {
    setConsultationMessages((current) => [
      ...current,
      ...items.map((item) => ({ id: nextConsultationId(), ...item })),
    ]);
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
    setConsultationMessages([
      {
        id: nextConsultationId(),
        role: "assistant",
        text: `${copy.consultationIntro}\n\n${copy.entriesQuestion}`,
      },
    ]);
    setInput("");
  };

  const completeConsultationStep = (value: string) => {
    pushConsultationMessages({ role: "user", text: value });

    if (consultationStep === "entries") {
      const nextEntryCount = extractEntryCount(value, lang);

      if (nextEntryCount === null) {
        pushConsultationMessages({ role: "assistant", text: copy.entriesNeedCount });
        return;
      }

      setConsultationEntryCount(nextEntryCount);
      setConsultationTripRows(createEmptyTripRows(nextEntryCount));
      pushConsultationMessages({
        role: "assistant",
        text: copy.entriesTableIntro.replace("{count}", String(nextEntryCount)),
      });
      return;
    }

    if (consultationStep === "arrests") {
      const nextArrestCount = extractEntryCount(value, lang);

      if (nextArrestCount === null) {
        pushConsultationMessages({ role: "assistant", text: copy.arrestsNeedCount });
        return;
      }

      if (nextArrestCount === 0) {
        setConsultationArrestCount(0);
        setConsultationArrestRows([]);
        pushConsultationMessages({ role: "assistant", text: copy.policeHelpQuestion });
        setConsultationStep("policeHelp");
        return;
      }

      setConsultationArrestCount(nextArrestCount);
      setConsultationArrestRows(createEmptyArrestRows(nextArrestCount));
      pushConsultationMessages({
        role: "assistant",
        text: copy.arrestsTableIntro.replace("{count}", String(nextArrestCount)),
      });
      return;
    }

    if (consultationStep === "policeHelp") {
      const followUp = YES_PATTERNS[lang].test(value)
        ? `${copy.uvNote}\n\n${copy.consultationThanks}`
        : copy.consultationThanks;
      pushConsultationMessages({ role: "assistant", text: followUp });
      setConsultationStep("complete");
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

    const documentsLabels = copy.validDocumentsOptions;
    const summary = consultationTripRows
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

    const summary = consultationArrestRows
      .map(
        (row, index) =>
          `${copy.incidentLabel} ${index + 1}: ${copy.arrestDateLabel} ${row.arrestDate}, ${copy.chargeTypeLabel} ${row.chargeType}, ${copy.arrestLocationLabel} ${row.arrestLocation}, ${copy.outcomeLabel} ${row.outcomeSentence}`,
      )
      .join("\n");

    pushConsultationMessages({ role: "user", text: summary });
    pushConsultationMessages({ role: "assistant", text: copy.policeHelpQuestion });
    setConsultationStep("policeHelp");
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
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;
    recognition.continuous = false;

    recognition.onresult = (event) => {
      setVoiceStatus("processing");
      const transcript = Array.from(event.results)
        .map((result) => result[0]?.transcript ?? "")
        .join(" ")
        .trim();

      if (!transcript) {
        setVoiceStatus("idle");
        return;
      }
      setInput(transcript);
      submitText(transcript);
      setInput("");
      setVoiceStatus("idle");
    };

    recognition.onerror = (event) => {
      setVoiceStatus(event.error === "not-allowed" ? "permission-denied" : "error");
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
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
    isEntryTableActive
      ? copy.entriesTableLockedPlaceholder
      : isArrestsTableActive
        ? copy.arrestsTableLockedPlaceholder
      : isConsultationMode && consultationStep !== "complete"
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
