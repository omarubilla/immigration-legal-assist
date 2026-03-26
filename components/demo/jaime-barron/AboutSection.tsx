import { Users, Briefcase } from "lucide-react";
import { Button } from "@/components/ui/button";

export function AboutSection() {
  return (
    <section className="py-16 md:py-24 bg-gradient-to-br from-slate-50 to-[#f4fedf]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="bg-white rounded-lg shadow-lg p-12 flex items-center justify-center min-h-96">
            <div className="text-center">
              <Briefcase size={96} className="text-[#8fcf38] mx-auto mb-4 opacity-60" />
              <p className="text-xl font-semibold text-slate-700">
                Where fierce advocacy meets genuine humanity
              </p>
            </div>
          </div>
          <div>
            <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-6">
              Beyond the Suit: Unconventional Lawyers
            </h2>
            <p className="text-lg text-gray-700 mb-6 leading-relaxed">
              We are Jaime Barron, P.C., and our approach to immigration law goes beyond typical
              legal formality. What makes us uniquely effective is deeply personal: our attorneys
              and support staff include immigrants who have navigated the very system you're
              facing, or have family who have.
            </p>
            <p className="text-lg text-gray-700 mb-6 leading-relaxed">
              This lived experience fuels our fierce advocacy, providing an understanding that
              transcends legal statutes. We don't just examine the legal aspects of your case; we
              also empathize with the emotional weight of your journey.
            </p>
            <div className="space-y-3 mb-8">
              <div className="flex items-center gap-3">
                <span className="text-[#8fcf38] font-bold text-xl">✓</span>
                <span className="text-gray-700">Bilingual team (English & Spanish)</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-[#8fcf38] font-bold text-xl">✓</span>
                <span className="text-gray-700">Multilingual support available</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-[#8fcf38] font-bold text-xl">✓</span>
                <span className="text-gray-700">Culturally sensitive approach</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-[#8fcf38] font-bold text-xl">✓</span>
                <span className="text-gray-700">Serving all 50 states + territories</span>
              </div>
            </div>
            <Button className="bg-[#a9f04d] hover:bg-[#97d844] text-slate-950 text-lg py-6">
              Check Out Our Attorneys
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
