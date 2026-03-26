import { MapPin, Award } from "lucide-react";

export function ExperienceSection() {
  const locations = [
    { city: "Dallas-Fort Worth", state: "Texas" },
    { city: "San Antonio", state: "Texas" },
    { city: "Washington", state: "D.C." },
    { city: "Baltimore", state: "Maryland" },
    { city: "Seattle", state: "Washington" },
    { city: "California", state: "Multiple Offices" },
  ];

  return (
    <section className="py-16 md:py-24 bg-gradient-to-br from-slate-50 to-[#f4fedf]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-6">
            We Combine Our Experience to Serve You Better
          </h2>
          <p className="text-xl text-gray-700 max-w-3xl mx-auto">
            Our integrated network of experienced attorneys provides seamless service
            across multiple states and territories
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {locations.map((location, idx) => (
            <div
              key={idx}
              className="bg-white rounded-lg shadow-md p-8 flex items-center gap-4 hover:shadow-lg transition-shadow"
            >
              <MapPin className="text-[#8fcf38] flex-shrink-0" size={32} />
              <div>
                <p className="font-semibold text-lg text-slate-900">
                  {location.city}
                </p>
                <p className="text-gray-600">{location.state}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="bg-white rounded-lg shadow-lg p-12 text-center">
          <Award className="text-[#8fcf38] mx-auto mb-4" size={48} />
          <h3 className="text-2xl font-bold text-slate-900 mb-4">
            20+ Years of Combined Experience
          </h3>
          <p className="text-lg text-gray-700 max-w-2xl mx-auto">
            Since the turn of the millennium, we've guided thousands of individuals and
            families through every aspect of immigration law—from visa applications to
            deportation defense to humanitarian relief.
          </p>
        </div>
      </div>
    </section>
  );
}
