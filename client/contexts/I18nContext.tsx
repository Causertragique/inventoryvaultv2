import { createContext, useContext, useState, ReactNode } from "react";
import { Language, getTranslations, Translations } from "@/lib/i18n";

interface i18nContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: Translations;
}

const i18nContext = createContext<i18nContextType | undefined>(undefined);

const supportedClientLanguages = ["en", "fr"] as const;
type ClientLanguage = (typeof supportedClientLanguages)[number];

const isSupportedClientLanguage = (lang: string | null | undefined): lang is ClientLanguage => {
  if (!lang) return false;
  return supportedClientLanguages.includes(lang as ClientLanguage);
};

export function I18nProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>(() => {
    const saved = localStorage.getItem("language");
    if (isSupportedClientLanguage(saved)) {
      return saved as Language;
    }

    const browserLang = navigator.language.toLowerCase();
    if (browserLang.startsWith("fr")) return "fr";

    return "en";
  });

  const setLanguage = (lang: Language) => {
    const nextLanguage = isSupportedClientLanguage(lang) ? lang : "en";
    setLanguageState(nextLanguage);
    localStorage.setItem("language", nextLanguage);
  };

  const t = getTranslations(language);

  return (
    <i18nContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </i18nContext.Provider>
  );
}

export function usei18n() {
  const context = useContext(i18nContext);
  if (context === undefined) {
    throw new Error("usei18n must be used within an i18nProvider");
  }
  return context;
}

