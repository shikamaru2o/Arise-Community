import React from "react";
import { useI18n } from "./i18n";

export default function LanguageSelector() {
  const { language, setLanguage, t } = useI18n();
  return (
    <>
      <style>{`.arise-language { display: flex; align-items: center; gap: 6px; color: #A79FBF; font-size: 12px; white-space: nowrap; } .arise-language button { border: 0; padding: 2px; background: transparent; color: #A79FBF; font: inherit; cursor: pointer; } .arise-language button.active, .arise-language button:hover { color: #E3A857; }`}</style>
      <div className="arise-language" aria-label={t("nav.language")}>
        <button className={language === "en" ? "active" : ""} type="button" onClick={() => setLanguage("en")}>EN</button>
        <span>|</span>
        <button className={language === "hi" ? "active" : ""} type="button" onClick={() => setLanguage("hi")}>हिंदी</button>
      </div>
    </>
  );
}
