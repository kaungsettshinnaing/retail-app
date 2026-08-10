import { getCustomerSession } from "@/lib/auth";
import { getLanguageCookie } from "@/lib/i18n/actions";
import CheckoutView from "./CheckoutView";

export const dynamic = "force-dynamic";

export default async function CheckoutPage() {
  const customer = await getCustomerSession();
  const lang = customer?.language ?? (await getLanguageCookie());
  return <CheckoutView lang={lang} />;
}
