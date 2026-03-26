import { Heart, Users, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";

export function CommunitySection() {
  return (
    <section className="py-16 md:py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-6">
              Community Involvement
            </h2>
            <p className="text-lg text-gray-700 mb-6 leading-relaxed">
              At Jaime Barron PC, our mission goes beyond the courtroom. We are deeply committed
              to empowering the communities we serve through practical education, dedicated
              outreach, and direct support.
            </p>
            <p className="text-lg text-gray-700 mb-8 leading-relaxed">
              From hosting free Immigration and Employment Seminars to organizing essential food
              drives and participating in local events, we invest our time and resources to help
              people thrive.
            </p>
            <div className="space-y-4">
              <div className="flex gap-4">
                <Heart className="text-[#8fcf38] flex-shrink-0" size={24} />
                <div>
                  <p className="font-semibold text-slate-900">Free Legal Seminars</p>
                  <p className="text-gray-600">Monthly workshops on immigration topics</p>
                </div>
              </div>
              <div className="flex gap-4">
                <Users className="text-[#8fcf38] flex-shrink-0" size={24} />
                <div>
                  <p className="font-semibold text-slate-900">Community Programs</p>
                  <p className="text-gray-600">Outreach and support initiatives</p>
                </div>
              </div>
              <div className="flex gap-4">
                <Calendar className="text-[#8fcf38] flex-shrink-0" size={24} />
                <div>
                  <p className="font-semibold text-slate-900">Volunteer Opportunities</p>
                  <p className="text-gray-600">Join us in giving back</p>
                </div>
              </div>
            </div>
            <Button className="mt-8 bg-[#a9f04d] hover:bg-[#97d844] text-slate-950 text-lg py-6">
              Get Involved!
            </Button>
          </div>
          <div className="bg-gradient-to-br from-[#f7fee7] to-[#eefbd3] rounded-lg p-12 flex items-center justify-center min-h-96">
            <div className="text-center">
              <Heart size={96} className="text-[#8fcf38] mx-auto mb-4 opacity-60" />
              <p className="text-xl font-semibold text-slate-700">
                Making a difference in the communities we serve
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
