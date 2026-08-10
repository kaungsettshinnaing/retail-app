export type Language = "EN" | "MY";

export const LANGUAGES: Language[] = ["EN", "MY"];
export const DEFAULT_LANGUAGE: Language = "EN";

export const LANGUAGE_LABEL: Record<Language, string> = {
  EN: "English",
  MY: "မြန်မာ",
};

// Anonymous storefront visitors (no CustomerSession yet) keep their language
// choice in this cookie instead of a JWT claim.
export const LANGUAGE_COOKIE = "rs_lang";

export function isLanguage(value: unknown): value is Language {
  return value === "EN" || value === "MY";
}

export function pick<T>(dict: Record<Language, T>, lang: Language): T {
  return dict[lang] ?? dict.EN;
}
