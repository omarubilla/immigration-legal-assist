import { Button } from "@/components/ui/button";
import { Phone } from "lucide-react";

export function HeroSection() {
  return (
    <div className="relative h-screen bg-gradient-to-br from-[#6f9b2b] to-[#1f2b10] flex items-center justify-center text-white">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute inset-0 bg-black/40"></div>
      </div>
      <div className="relative z-10 text-center max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
          Clear Guidance for Your Immigration Needs
        </h1>
        <p className="text-xl md:text-2xl text-[#eefbd3] mb-8">
          Expert legal representation for family, business, and humanitarian immigration matters
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button
            size="lg"
            className="bg-[#a9f04d] hover:bg-[#97d844] text-slate-950 text-lg py-6"
          >
            Book a Consultation
          </Button>
          <Button
            size="lg"
            variant="outline"
            className="border-white text-black hover:bg-white/10 text-lg py-6 flex items-center gap-2"
          >
            <Phone size={20} />
            Call: 844.267.9300
          </Button>
        </div>
      </div>
    </div>
  );
}
