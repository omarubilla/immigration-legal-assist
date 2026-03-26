import { ChevronDown, Phone } from "lucide-react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

export function FAQSection() {
  const faqs = [
    {
      question: "How can I schedule a consultation?",
      answer:
        "You can schedule a consultation by calling our office at 844.267.9300, visiting our website to book online, or requesting a video call via Zoom. We accommodate in-person and virtual consultations.",
    },
    {
      question: "Do you have weekend or evening hours?",
      answer:
        "We offer extended hours to serve our clients' needs. Contact us for specific availability in your location.",
    },
    {
      question: "Do you offer payment plans?",
      answer:
        "Yes, we understand that legal services are an investment. We work with clients to arrange payment plans that fit their budget.",
    },
    {
      question:
        "Can you assist with cases outside Texas?",
      answer:
        "Absolutely. We have offices in multiple states and can assist clients nationwide and internationally. Many of our clients work with us virtually.",
    },
  ];

  return (
    <section className="py-16 md:py-24 bg-gradient-to-br from-[#f7fee7] to-[#eefbd3]">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4">
            We Are Here to Help
          </h2>
          <p className="text-xl text-gray-700">
            Answers to your most common questions
          </p>
        </div>

        <div className="space-y-4 mb-12">
          {faqs.map((faq, idx) => (
            <Collapsible key={idx} defaultOpen={idx === 0}>
              <div className="bg-white rounded-lg shadow-md">
                <CollapsibleTrigger className="w-full p-6 flex items-center justify-between hover:bg-[#f4fedf] transition-colors">
                  <h3 className="font-semibold text-lg text-slate-900 text-left">
                    {faq.question}
                  </h3>
                  <ChevronDown size={24} className="text-[#8fcf38] flex-shrink-0" />
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <div className="px-6 pb-6 border-t border-gray-200">
                    <p className="text-gray-700 leading-relaxed">{faq.answer}</p>
                  </div>
                </CollapsibleContent>
              </div>
            </Collapsible>
          ))}
        </div>

        <div className="bg-white rounded-lg shadow-lg p-8 text-center">
          <Phone className="text-[#8fcf38] mx-auto mb-4" size={40} />
          <h3 className="text-2xl font-bold text-slate-900 mb-4">
            Ready to Get Started?
          </h3>
          <p className="text-lg text-gray-700 mb-6">
            Call our team today for a free consultation
          </p>
          <a
            href="tel:844.267.9300"
            className="inline-block bg-[#a9f04d] hover:bg-[#97d844] text-slate-950 font-bold py-3 px-8 rounded-lg transition-colors text-lg"
          >
            844.267.9300
          </a>
        </div>
      </div>
    </section>
  );
}
