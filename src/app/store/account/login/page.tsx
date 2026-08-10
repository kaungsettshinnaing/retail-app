import { getCustomerSession } from "@/lib/auth";
import { getLanguageCookie } from "@/lib/i18n/actions";
import LoginView from "./LoginView";

export const dynamic = "force-dynamic";

export default async function CustomerLoginPage() {
  const customer = await getCustomerSession();
  const lang = customer?.language ?? (await getLanguageCookie());
  return <LoginView lang={lang} />;
}
