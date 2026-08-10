import { getCustomerSession } from "@/lib/auth";
import { getLanguageCookie } from "@/lib/i18n/actions";
import CartView from "./CartView";

export const dynamic = "force-dynamic";

export default async function CartPage() {
  const customer = await getCustomerSession();
  const lang = customer?.language ?? (await getLanguageCookie());
  return <CartView lang={lang} />;
}
