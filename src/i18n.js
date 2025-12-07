import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";

// Import all language files
import en from "./locales/en/translation.json";
import de from "./locales/de/translation.json";
import es from "./locales/es/translation.json";
import fr from "./locales/fr/translation.json";
import da from "./locales/da/translation.json";
import zh from "./locales/zh/translation.json";
import zhTW from "./locales/zh-TW/translation.json";
import ar from "./locales/ar/translation.json";
import hi from "./locales/hi/translation.json";
import ja from "./locales/ja/translation.json";
import ko from "./locales/ko/translation.json";
import nl from "./locales/nl/translation.json";
import pl from "./locales/pl/translation.json";
import sv from "./locales/sv/translation.json";
import it from "./locales/it/translation.json";
import ptBR from "./locales/pt-BR/translation.json";
import ru from "./locales/ru/translation.json";
import tr from "./locales/tr/translation.json";
import uk from "./locales/uk/translation.json";
import no from "./locales/no/translation.json";
import fi from "./locales/fi/translation.json";
import el from "./locales/el/translation.json";
import cs from "./locales/cs/translation.json";
import ro from "./locales/ro/translation.json";
import hu from "./locales/hu/translation.json";
import th from "./locales/th/translation.json";
import vi from "./locales/vi/translation.json";
import id from "./locales/id/translation.json";
import fil from "./locales/fil/translation.json";
import sr from "./locales/sr/translation.json";

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: en },
      de: { translation: de },
      es: { translation: es },
      fr: { translation: fr },
      da: { translation: da },
      zh: { translation: zh },
      "zh-TW": { translation: zhTW },
      ar: { translation: ar },
      hi: { translation: hi },
      ja: { translation: ja },
      ko: { translation: ko },
      nl: { translation: nl },
      pl: { translation: pl },
      sv: { translation: sv },
      it: { translation: it },
      "pt-BR": { translation: ptBR },
      ru: { translation: ru },
      tr: { translation: tr },
      uk: { translation: uk },
      no: { translation: no },
      fi: { translation: fi },
      el: { translation: el },
      cs: { translation: cs },
      ro: { translation: ro },
      hu: { translation: hu },
      th: { translation: th },
      vi: { translation: vi },
      id: { translation: id },
      fil: { translation: fil },
      sr: { translation: sr }
    },

    // AUTO-DETECT LANGUAGE
    detection: {
      order: ["localStorage", "navigator", "htmlTag", "path", "subdomain"],
      caches: ["localStorage"]
    },

    // ALLOW ONLY LANGUAGES YOU SUPPORT
    supportedLngs: [
      "en", "de", "es", "fr", "da", "zh", "zh-TW", "ar", "hi", "ja", "ko",
      "nl", "pl", "sv", "it", "pt-BR", "ru", "tr", "uk", "no", "fi", "el",
      "cs", "ro", "hu", "th", "vi", "id", "fil", "sr"
    ],

    fallbackLng: "en",
    debug: false,

    interpolation: {
      escapeValue: false
    }
  });

export default i18n;
