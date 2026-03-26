import { Newspaper, ArrowRight } from "lucide-react";

export function NewsSection() {
  const newsItems = [
    {
      title: "The Importance of Legal Representation in Immigration Cases",
      date: "Recent",
    },
    {
      title: "Understanding the Different Types of Visas: A Comprehensive Guide",
      date: "Recent",
    },
    {
      title: "Common Mistakes in US Immigration Applications: How to Avoid Them",
      date: "Recent",
    },
    {
      title: "A Step-by-Step Guide to the Green Card Process",
      date: "Recent",
    },
  ];

  return (
    <section className="py-16 md:py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-3 mb-8">
          <Newspaper className="text-[#8fcf38]" size={32} />
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900">
            Breaking News
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {newsItems.map((item, idx) => (
            <a
              key={idx}
              href="#"
              className="group bg-gradient-to-br from-[#f7fee7] to-[#eefbd3] rounded-lg p-6 hover:shadow-lg transition-shadow border border-[#d8f7ab] hover:border-[#a9f04d]"
            >
              <h3 className="font-semibold text-slate-900 mb-4 group-hover:text-[#6d962c] transition-colors line-clamp-3">
                {item.title}
              </h3>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">{item.date}</span>
                <ArrowRight
                  size={18}
                  className="text-[#8fcf38] group-hover:translate-x-2 transition-transform"
                />
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
