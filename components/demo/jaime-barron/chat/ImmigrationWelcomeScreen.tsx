"use client";

import { Scale, Search, MapPin, HelpCircle } from "lucide-react";

type LangCode = "en" | "es" | "pt" | "fr";

interface ImmigrationWelcomeScreenProps {
  lang: LangCode;
  onSuggestionClick: (message: { text: string }) => void;
}

const welcomeContent: Record<
  LangCode,
  {
    title: string;
    description: string;
    serviceLabel: string;
    firmLabel: string;
    serviceSuggestions: string[];
    firmSuggestions: string[];
    disclaimer: string;
  }
> = {
  en: {
    title: "Immigration Law Assistant",
    description:
      "Ask me anything about U.S. immigration law, visa options, or our legal services. I'm here to help.",
    serviceLabel: "Immigration questions",
    firmLabel: "About Jaime Barron PC",
    serviceSuggestions: [
      "How do I get a green card?",
      "What is the H-1B visa process?",
      "Can I apply for asylum?",
      "What's the path to citizenship?",
    ],
    firmSuggestions: [
      "Where are your offices?",
      "How do I book a consultation?",
      "Do you handle DACA renewals?",
      "What languages do you speak?",
    ],
    disclaimer:
      "Responses are general information, not legal advice. For your specific situation, book a consultation.",
  },
  es: {
    title: "Asistente de Inmigracion",
    description:
      "Preguntame sobre inmigracion en Estados Unidos, opciones de visa o nuestros servicios legales. Estoy aqui para ayudar.",
    serviceLabel: "Preguntas de inmigracion",
    firmLabel: "Sobre Jaime Barron PC",
    serviceSuggestions: [
      "Como obtengo una green card?",
      "Cual es el proceso de la visa H-1B?",
      "Puedo solicitar asilo?",
      "Cual es el camino hacia la ciudadania?",
    ],
    firmSuggestions: [
      "Donde estan sus oficinas?",
      "Como agendo una consulta?",
      "Manejan renovaciones de DACA?",
      "Que idiomas hablan?",
    ],
    disclaimer:
      "Las respuestas son informacion general, no asesoria legal. Para su caso especifico, agende una consulta.",
  },
  pt: {
    title: "Assistente de Imigracao",
    description:
      "Pergunte sobre imigracao nos Estados Unidos, opcoes de visto ou nossos servicos juridicos. Estou aqui para ajudar.",
    serviceLabel: "Perguntas sobre imigracao",
    firmLabel: "Sobre Jaime Barron PC",
    serviceSuggestions: [
      "Como consigo um green card?",
      "Como funciona o processo do visto H-1B?",
      "Posso solicitar asilo?",
      "Qual e o caminho para a cidadania?",
    ],
    firmSuggestions: [
      "Onde ficam os escritorios?",
      "Como agendo uma consulta?",
      "Vocês trabalham com renovacao de DACA?",
      "Quais idiomas vocês falam?",
    ],
    disclaimer:
      "As respostas sao informacoes gerais, nao orientacao juridica. Para o seu caso especifico, agende uma consulta.",
  },
  fr: {
    title: "Assistant en droit de l'immigration",
    description:
      "Posez-moi vos questions sur l'immigration aux Etats-Unis, les options de visa ou nos services juridiques. Je suis la pour vous aider.",
    serviceLabel: "Questions d'immigration",
    firmLabel: "A propos de Jaime Barron PC",
    serviceSuggestions: [
      "Comment obtenir une green card ?",
      "Quel est le processus du visa H-1B ?",
      "Puis-je demander l'asile ?",
      "Quel est le parcours vers la citoyennete ?",
    ],
    firmSuggestions: [
      "Ou sont vos bureaux ?",
      "Comment reserver une consultation ?",
      "Traitez-vous les renouvellements DACA ?",
      "Quelles langues parlez-vous ?",
    ],
    disclaimer:
      "Les reponses fournissent des informations generales, pas un conseil juridique. Pour votre situation precise, reservez une consultation.",
  },
};

export function ImmigrationWelcomeScreen({
  lang,
  onSuggestionClick,
}: ImmigrationWelcomeScreenProps) {
  const content = welcomeContent[lang];

  return (
    <div className="flex h-full flex-col items-center justify-center text-center px-4 py-8">
      <div className="rounded-full bg-[#eefbd3] p-4">
        <Scale className="h-8 w-8 text-[#8fcf38]" />
      </div>
      <h3 className="mt-4 text-lg font-semibold text-slate-900">
        {content.title}
      </h3>
      <p className="mt-2 text-sm text-slate-500 max-w-xs">
        {content.description}
      </p>

      <div className="mt-6 w-full max-w-sm">
        <div className="flex items-center gap-2 text-xs font-medium text-slate-500 mb-2">
          <Search className="h-3 w-3" />
          {content.serviceLabel}
        </div>
        <div className="flex flex-wrap justify-center gap-2">
          {content.serviceSuggestions.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => onSuggestionClick({ text: s })}
              className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-sm text-slate-700 transition-colors hover:bg-[#f4fedf] hover:border-[#a9f04d]"
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-4 w-full max-w-sm">
        <div className="flex items-center gap-2 text-xs font-medium text-slate-500 mb-2">
          <MapPin className="h-3 w-3" />
          {content.firmLabel}
        </div>
        <div className="flex flex-wrap justify-center gap-2">
          {content.firmSuggestions.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => onSuggestionClick({ text: s })}
              className="rounded-full border border-[#d8f7ab] bg-[#f4fedf] px-3 py-1.5 text-sm text-[#6d962c] transition-colors hover:bg-[#eefbd3]"
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      <p className="mt-6 text-xs text-slate-400 max-w-xs">
        {content.disclaimer}
      </p>
    </div>
  );
}
