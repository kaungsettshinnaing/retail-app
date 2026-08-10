import { getCustomerSession } from "@/lib/auth";
import { getLanguageCookie } from "@/lib/i18n/actions";
import RegisterView from "./RegisterView";

export const dynamic = "force-dynamic";

export default async function CustomerRegisterPage() {
  const customer = await getCustomerSession();
  const lang = customer?.language ?? (await getLanguageCookie());
  return <RegisterView lang={lang} />;
}
