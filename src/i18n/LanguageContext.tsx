import { createContext, useContext, useState, ReactNode } from "react";
import { Language, resolve, TranslationShape } from "./translations";

interface LanguageContextValue {
  lang: Language;
  setLang: (l: Language) => void;
  toggle: () => void;
  langtext: TranslationShape;
}

const LanguageContext = createContext<LanguageContextValue | null>(null);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState<Language>("en");
  const toggle = () => setLang((l) => (l === "en" ? "fr" : "en"));
  const value: LanguageContextValue = {
    lang,
    setLang,
    toggle,
    langtext: resolve(lang),
  };
  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage(): LanguageContextValue {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error("useLanguage must be used within a LanguageProvider");
  return ctx;
}
