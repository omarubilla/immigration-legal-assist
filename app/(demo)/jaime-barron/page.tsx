import type { Metadata } from "next";
import { Phone } from "lucide-react";
import { HeroSection } from "@/components/demo/jaime-barron/HeroSection";
import { UnderstandingSection } from "@/components/demo/jaime-barron/UnderstandingSection";
import { ExperienceSection } from "@/components/demo/jaime-barron/ExperienceSection";
import { TestimonialsSection } from "@/components/demo/jaime-barron/TestimonialsSection";
import { FAQSection } from "@/components/demo/jaime-barron/FAQSection";
import { CommunitySection } from "@/components/demo/jaime-barron/CommunitySection";
import { AboutSection } from "@/components/demo/jaime-barron/AboutSection";
import { NewsSection } from "@/components/demo/jaime-barron/NewsSection";
import { AskAIButton } from "@/components/demo/jaime-barron/chat/AskAIButton";

export const metadata: Metadata = {
  title: "Law Offices of Jaime Barron, PC - Immigration Law",
  description:
    "Expert immigration law services. Personalized guidance for your visa, green card, and immigration needs.",
};

export default function JaimeBarronPage() {
  return (
    <main className="w-full">
      <HeroSection />
      <UnderstandingSection />
      <ExperienceSection />
      <NewsSection />
      <TestimonialsSection />
      <AboutSection />
      <FAQSection />
      <CommunitySection />
      <footer className="bg-slate-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
            <div>
              <h4 className="font-bold mb-4">INFO</h4>
              <p className="text-sm text-gray-300 mb-2">
                Principal Office
              </p>
              <p className="text-sm text-gray-300">
                Dallas, Texas 75247
              </p>
              <p className="text-sm text-gray-300 mt-2">
                <strong>National Phone:</strong> 844.267.9300
              </p>
            </div>
            <div>
              <h4 className="font-bold mb-4">HELP</h4>
              <ul className="space-y-2 text-sm text-gray-300">
                <li><a href="#" className="hover:text-white">FAQ</a></li>
                <li><a href="#" className="hover:text-white">Contact</a></li>
                <li><a href="#" className="hover:text-white">Locations</a></li>
                <li><a href="#" className="hover:text-white">Video Library</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4">SERVICES</h4>
              <ul className="space-y-2 text-sm text-gray-300">
                <li><a href="#" className="hover:text-white">Family Immigration</a></li>
                <li><a href="#" className="hover:text-white">Business Immigration</a></li>
                <li><a href="#" className="hover:text-white">Deportation Defense</a></li>
                <li><a href="#" className="hover:text-white">Humanitarian Programs</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4">FOLLOW US</h4>
              <ul className="space-y-2 text-sm text-gray-300">
                <li><a href="#" className="hover:text-white">Facebook</a></li>
                <li><a href="#" className="hover:text-white">Instagram</a></li>
                <li><a href="#" className="hover:text-white">LinkedIn</a></li>
                <li><a href="#" className="hover:text-white">TikTok</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-700 pt-8 text-center text-sm text-gray-400">
            <p>&copy; 2025 Law Offices of Jaime Barron, PC. All rights reserved.</p>
          </div>
        </div>
      </footer>
      <AskAIButton />
    </main>
  );
}
