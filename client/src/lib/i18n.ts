import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import { resources } from "../locales/translations";
import { naturalHindiTranslations } from "./hindiCopy";

i18n
  .use(initReactI18next)
  .init({
    resources: {
      ...resources,
      hi: {
        translation: {
          ...resources.hi.translation,
          ...naturalHindiTranslations,
        },
      },
    },
    lng: localStorage.getItem("flowai_language") || "en",
    fallbackLng: "en",
    interpolation: {
      escapeValue: false, // React already safes from XSS
    }
  });

export default i18n;
