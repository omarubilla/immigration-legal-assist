import { Button } from "@/components/ui/button";
import { Heart, Users } from "lucide-react";

export function UnderstandingSection() {
  return (
    <section className="py-16 md:py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-6">
              We Understand
            </h2>
            <p className="text-lg text-gray-700 mb-6 leading-relaxed">
              We recognize the stress and confusion that immigration matters can bring. We're
              committed to understanding your situation and offering empathetic support and
              solutions.
            </p>
            <p className="text-lg text-gray-700 mb-8 leading-relaxed">
              Immigration law is complex, but your concerns are simple: you want clarity, you
              want results, and you want to know that someone genuinely cares about your case.
              That's exactly what we provide.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button
                size="lg"
                className="bg-[#a9f04d] hover:bg-[#97d844] text-slate-950 text-lg py-6 flex items-center gap-2"
              >
                <Heart size={20} />
                Take the First Step
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-[#8fcf38] text-[#6d962c] hover:bg-[#f4fedf] text-lg py-6"
              >
                Learn More
              </Button>
            </div>
          </div>
          <div className="bg-gradient-to-br from-[#f7fee7] to-[#eefbd3] rounded-lg p-12 flex items-center justify-center min-h-96">
            <div className="text-center">
              <Users size={120} className="text-[#8fcf38] mx-auto mb-4 opacity-60" />
              <p className="text-xl font-semibold text-slate-700">
                Serving thousands of families across the nation
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
