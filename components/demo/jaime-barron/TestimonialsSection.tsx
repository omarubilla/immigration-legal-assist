import { Star } from "lucide-react";

export function TestimonialsSection() {
  const testimonials = [
    {
      name: "Evette Mason",
      text: "I wanted to reach out and say that I really appreciate all of the help that Lucrecia provided us with during our interaction.",
      rating: 5,
    },
    {
      name: "Desaray Huerta",
      text: "We are so incredibly grateful for the support we received from Dalia and our attorney Omar. From the very beginning, they were both so kind and attentive.",
      rating: 5,
    },
    {
      name: "Michael Vega",
      text: "Cicely provided outstanding service and guidance. She was attentive, professional, and went above and beyond in helping me with the information needed.",
      rating: 5,
    },
  ];

  return (
    <section className="py-16 md:py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4">
            What Our Clients are Saying
          </h2>
          <p className="text-xl text-gray-700">
            Real testimonials from families we've helped
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, idx) => (
            <div
              key={idx}
              className="bg-gradient-to-br from-[#f7fee7] to-[#eefbd3] rounded-lg p-8 shadow-md hover:shadow-lg transition-shadow"
            >
              <div className="flex items-center gap-1 mb-4">
                {Array.from({ length: testimonial.rating }).map((_, i) => (
                  <Star
                    key={i}
                    size={20}
                    className="fill-yellow-400 text-yellow-400"
                  />
                ))}
              </div>
              <p className="text-gray-700 mb-6 leading-relaxed">
                "{testimonial.text}"
              </p>
              <p className="font-semibold text-slate-900">— {testimonial.name}</p>
            </div>
          ))}
        </div>

        <div className="mt-12 text-center">
          <p className="text-lg text-gray-700 mb-4">
            <span className="font-bold">★★★★★ 5 Star Reviews on Google</span>
          </p>
          <p className="text-gray-600">
            See more testimonials from our satisfied clients
          </p>
        </div>
      </div>
    </section>
  );
}
