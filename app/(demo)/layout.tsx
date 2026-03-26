import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Client Demos",
};

// Isolated route group — intentionally no South Bay Bio header/cart/providers
export default function DemoLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-white">
      {children}
    </div>
  );
}
