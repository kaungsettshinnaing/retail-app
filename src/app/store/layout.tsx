import Link from "next/link";
import { getSettings } from "@/lib/settings";
import { getCustomerSession } from "@/lib/auth";
import { CartProvider } from "@/components/store/CartContext";
import StoreNav from "@/components/store/StoreNav";

export const dynamic = "force-dynamic";

export default async function StoreLayout({ children }: { children: React.ReactNode }) {
  const [settings, customer] = await Promise.all([getSettings(), getCustomerSession()]);

  return (
    <CartProvider>
      <div className="min-h-screen bg-gray-50">
        <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
          <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
            <Link href="/store" className="text-lg font-semibold text-brand">
              {settings.storeName}
            </Link>
            <StoreNav customerName={customer?.name ?? null} />
          </div>
        </header>
        <main className="max-w-6xl mx-auto px-4 py-6">{children}</main>
      </div>
    </CartProvider>
  );
}
