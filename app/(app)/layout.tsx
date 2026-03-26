import { CartStoreProvider } from "@/lib/store/cart-store-provider";
import { ChatStoreProvider } from "@/lib/store/chat-store-provider";
import { ClerkProvider } from "@clerk/nextjs";
import { CurrencyProvider } from "@/lib/context/CurrencyContext";
import { SanityLive } from "@/sanity/lib/live";
import { Toaster } from "@/components/ui/sonner";
import { Header } from "@/components/app/Header";
import { CartSheet } from "@/components/app/CartSheet";
import { ChatSheet } from "@/components/app/ChatSheet";
import { AppShell } from "@/components/app/AppShell";
import { sanityFetch } from "@/sanity/lib/live";
import { hasSanityEnv } from "@/sanity/env";
import { ALL_CATEGORIES_QUERY } from "@/lib/sanity/queries/categories";
import type { ALL_CATEGORIES_QUERYResult } from "@/sanity.types";

async function AppLayout({ children }: { children: React.ReactNode }) {
  let categories: ALL_CATEGORIES_QUERYResult = [];

  if (hasSanityEnv) {
    try {
      const result = await sanityFetch({
        query: ALL_CATEGORIES_QUERY,
      });
      categories = result.data;
    } catch {
      categories = [];
    }
  }

  return (
    <ClerkProvider>
      <CurrencyProvider>
        <CartStoreProvider>
          <ChatStoreProvider>
            <AppShell>
              <Header categories={categories} />
              <main>{children}</main>
            </AppShell>
            <CartSheet />
            <ChatSheet />
            <Toaster position="bottom-center" />
            {hasSanityEnv ? <SanityLive /> : null}
          </ChatStoreProvider>
        </CartStoreProvider>
      </CurrencyProvider>
    </ClerkProvider>
  );
}

export default AppLayout;
