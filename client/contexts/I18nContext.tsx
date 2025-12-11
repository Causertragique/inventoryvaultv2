import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { Language, getTranslations, Translations } from "@/lib/i18n";

interface i18nContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: Translations;
}

const i18nContext = createContext<i18nContextType | undefined>(undefined);

export function I18nProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>(() => {
    // Load from localStorage first
    const saved = localStorage.getItem("language") as Language | null;
    if (saved && ["en", "fr", "es", "de"].includes(saved)) {
      return saved;
    }
    
    // Detect browser language
    const browserLang = navigator.language.toLowerCase();
    if (browserLang.startsWith("fr")) return "fr";
    if (browserLang.startsWith("es")) return "es";
    if (browserLang.startsWith("de")) return "de";
    
    // Default to English
    return "en";
  });

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem("language", lang);
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

