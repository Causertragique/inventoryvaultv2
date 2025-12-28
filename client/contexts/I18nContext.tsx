import { createContext, useContext, useEffect, useState, ReactNode } from "react";
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

const detectSystemLanguage = (): Language => {
  if (typeof navigator === "undefined") {
    return "en";
  }

  const browserLang = navigator.language?.toLowerCase() ?? "en";
  if (browserLang.startsWith("fr")) return "fr";

  return "en";
};

const getSavedLanguage = (): Language | null => {
  if (typeof window === "undefined") {
    return null;
  }
  const saved = window.localStorage.getItem("language");
  return isSupportedClientLanguage(saved) ? (saved as Language) : null;
};

export function I18nProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>(() => {
    return getSavedLanguage() ?? detectSystemLanguage();
  });
  const [useSystemLanguage, setUseSystemLanguage] = useState(() => !Boolean(getSavedLanguage()));

  useEffect(() => {
    if (!useSystemLanguage || typeof window === "undefined") {
      return;
    }

    const updateLanguage = () => {
      setLanguageState(detectSystemLanguage());
    };

    updateLanguage();
    const handleChange = () => updateLanguage();
    window.addEventListener("languagechange", handleChange);

    return () => window.removeEventListener("languagechange", handleChange);
  }, [useSystemLanguage]);

  const setLanguage = (lang: Language) => {
    const nextLanguage = isSupportedClientLanguage(lang) ? lang : "en";
    setLanguageState(nextLanguage);
    setUseSystemLanguage(false);
    if (typeof window !== "undefined") {
      window.localStorage.setItem("language", nextLanguage);
    }
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

