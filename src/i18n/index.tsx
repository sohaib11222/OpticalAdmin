import operations from '../../../contracts/operations/locale';
/* eslint-disable react-refresh/only-export-components -- Shared i18n module exports its provider, hook and helpers. */
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import common from "./locales/common";
import auth from "./locales/auth";
import platform from "./locales/platform";
import customers from "./locales/customers";
import catalog from "./locales/catalog";
import orders from "./locales/orders";
import documents from "./locales/documents";
import agenda from "./locales/agenda";
import vista from "./locales/vista";

import { SERVER_ERROR_MESSAGES, SERVER_MESSAGES } from "./server-messages";
import {
  DEFAULT_LANGUAGE,
  LANGUAGES,
  LANGUAGE_STORAGE_KEY,
  type Language,
  type LanguageOption,
  type LocaleModule,
} from "./types";

const MODULES: LocaleModule[] = [
  operations,
  common,
  auth,
  platform,
  customers,
  catalog,
  orders,
  documents,
  agenda,
  vista,
];

const DICTIONARIES: Record<Language, Record<string, string>> = MODULES.reduce(
  (acc, module) => {
    (Object.keys(acc) as Language[]).forEach((language) => {
      Object.assign(acc[language], module[language]);
    });
    return acc;
  },
  { en: {}, it: {} } as Record<Language, Record<string, string>>,
);

/**
 * Duplicated keys across locale modules mean two files claim the same entry, so
 * the merge order silently decides which translation wins. Surfacing it at
 * module load keeps that mistake visible instead of shipping a flaky string.
 */
if (import.meta.env.DEV) {
  MODULES.forEach((module) => {
    (Object.keys(DICTIONARIES) as Language[]).forEach((language) => {
      const dupes = Object.keys(module[language]).filter(
        (key) =>
          DICTIONARIES[language][key] !== undefined &&
          DICTIONARIES[language][key] !== module[language][key],
      );
      if (dupes.length)
        console.warn(`[i18n] ${language} keys declared more than once:`, dupes);
    });
  });
}

export type TranslateVars = Record<string, string | number>;
export type TranslateFn = (key: string, vars?: TranslateVars) => string;
export type TranslateOrFn = (
  key: string,
  fallback: string,
  vars?: TranslateVars,
) => string;

interface TranslationState {
  language: Language;
  languages: LanguageOption[];
  setLanguage: (language: Language) => void;
  toggleLanguage: () => void;
  t: TranslateFn;
  /** Like `t`, but keeps the supplied fallback when the key is unknown. */
  tOr: TranslateOrFn;
  /** Humanizes a raw API value such as `partially_paid`. */
  humanize: (value: string) => string;
  /** Maps a raw API/Laravel message to the active language when known. */
  translateError: (message: string | null | undefined) => string;
  /**
   * Renders a value that was captured in state or a props bag. Accepts either
   * a dictionary key or a raw server message, so the text follows a language
   * switch even when it was stored while the page was already mounted.
   */
  translateMessage: (value: string | null | undefined) => string;
  formatDate: (value: string | number | Date, zone?: string) => string;
  formatDateTime: (value: string | number | Date, zone?: string) => string;
  formatNumber: (value: number, digits?: number) => string;
}

const Context = createContext<TranslationState | null>(null);

function readStoredLanguage(): Language {
  if (typeof window === "undefined") return DEFAULT_LANGUAGE;
  try {
    const stored = window.localStorage.getItem(LANGUAGE_STORAGE_KEY);
    return stored === "en" || stored === "it" ? stored : DEFAULT_LANGUAGE;
  } catch {
    // Storage can be unavailable (private mode, blocked cookies, sandboxed
    // frame, exceeded quota). Fall back to the default instead of crashing.
    return DEFAULT_LANGUAGE;
  }
}

/**
 * Persistence is best-effort. React state is the source of truth, so a failure
 * here must never interrupt the language switch.
 */
function persistLanguage(language: Language) {
  try {
    window.localStorage.setItem(LANGUAGE_STORAGE_KEY, language);
    return true;
  } catch {
    return false;
  }
}

function interpolate(template: string, vars?: TranslateVars) {
  if (!vars) return template;
  return template.replace(/\{(\w+)\}/g, (match, name: string) =>
    name in vars ? String(vars[name]) : match,
  );
}

/** Turns `partially_paid` into `partially paid` for use as a last resort. */
export function humanize(value: string) {
  return value.replace(/[_-]+/g, " ").trim();
}

/**
 * Returns the dictionary key that represents a raw server message, or an empty
 * string when the message is not in the map.
 *
 * The text -> key direction is language independent, so callers can perform it
 * once when the error is caught and store the key instead of the English text.
 * Storing the key is what lets the message follow a later language switch.
 */
export function serverMessageKey(message: string | null | undefined): string {
  if (!message) return "";
  return SERVER_MESSAGES[message.trim()] ?? "";
}

/** Namespace `errorMessage()` uses for API validation field names. */
export const FIELD_KEY_PREFIX = "fields.";

export function TranslationProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>(readStoredLanguage);

  useEffect(() => {
    persistLanguage(language);
    document.documentElement.lang = language;
  }, [language]);

  // The document title is intentionally not touched here: `PageTitle` owns it
  // through Helmet, and a provider-level assignment would run after Helmet's
  // own effect and overwrite the page-specific title on every language change.

  const setLanguage = useCallback((next: Language) => {
    // Persist synchronously with the user's action, not only in the effect
    // below. If the tree is torn down right after (HMR, reload, crash) the
    // choice is already saved and survives, instead of reverting to default.
    persistLanguage(next);
    setLanguageState(next);
  }, []);

  const toggleLanguage = useCallback(() => {
    setLanguageState((current) => {
      const next = current === "it" ? "en" : "it";
      persistLanguage(next);
      return next;
    });
  }, []);

  const t = useCallback<TranslateFn>(
    (key, vars) => {
      const localized = DICTIONARIES[language][key];
      const fallback = DICTIONARIES.en[key];
      const template = localized ?? fallback ?? key;
      return interpolate(template, vars);
    },
    [language],
  );

  const tOr = useCallback<TranslateOrFn>(
    (key, fallback, vars) => {
      const template = DICTIONARIES[language][key] ?? DICTIONARIES.en[key] ?? fallback;
      return interpolate(template, vars);
    },
    [language],
  );

  const translateError = useCallback(
    (message: string | null | undefined) => {
      if (!message) return "";
      const trimmed = message.trim();
      const mapped = SERVER_MESSAGES[trimmed];
      if (mapped) {
        const entry = SERVER_ERROR_MESSAGES[mapped];
        return entry ? entry[language] : trimmed;
      }
      // The value may already be a localized rendering, for instance because it
      // was resolved before a language switch. Return the active language's
      // wording so the message keeps following the toggle.
      const source = (Object.keys(SERVER_ERROR_MESSAGES) as string[]).find(
        (key) =>
          SERVER_ERROR_MESSAGES[key].en === trimmed ||
          SERVER_ERROR_MESSAGES[key].it === trimmed,
      );
      return source ? SERVER_ERROR_MESSAGES[source][language] : message;
    },
    [language],
  );

  const translateMessage = useCallback(
    (value: string | null | undefined) => {
      if (!value) return "";
      // A single key, the common case for client-side messages.
      if (DICTIONARIES[language][value] || DICTIONARIES.en[value]) return t(value);
      // A key already reduced from a server message by `serverMessageKey`.
      const serverEntry = SERVER_ERROR_MESSAGES[value];
      if (serverEntry) return serverEntry[language];

      /**
       * Resolves one token of a composed message.
       *
       * A token may be a key, a key followed by punctuation (as produced when
       * `errorMessage()` joins `fields.email:` to its message), or free text
       * that no map knows about.
       */
      const resolveToken = (token: string): string => {
        const bare = token.replace(/[:;,.â€¦]+$/, "");
        const tail = token.slice(bare.length);

        const direct = DICTIONARIES[language][token] ?? DICTIONARIES.en[token];
        if (direct) return direct;
        // A key already reduced from a server message by `serverMessageKey()`.
        const serverKey = SERVER_ERROR_MESSAGES[token];
        if (serverKey) return serverKey[language];

        if (bare !== token) {
          const withoutTail = DICTIONARIES[language][bare] ?? DICTIONARIES.en[bare];
          if (withoutTail) return withoutTail + tail;
          if (SERVER_ERROR_MESSAGES[bare]) return SERVER_ERROR_MESSAGES[bare][language] + tail;
        }

        const mapped = serverMessageKey(token);
        if (mapped) return SERVER_ERROR_MESSAGES[mapped]?.[language] ?? token;

        // `fields.*` tokens name an API field. An unlisted one is still shown,
        // humanized, instead of leaking the internal key to the user.
        if (bare.startsWith(FIELD_KEY_PREFIX))
          return humanize(bare.slice(FIELD_KEY_PREFIX.length)) + tail;

        return token;
      };

      const tokens = value.split(/\s+/).filter(Boolean);
      if (tokens.length > 1) {
        const joined = tokens.map(resolveToken).join(" ");
        if (joined !== value) return joined;
      }

      return translateError(value);
    },
    [language, t, translateError],
  );

  const intl = useMemo(
    () => LANGUAGES.find((l) => l.code === language)!.intl,
    [language],
  );

  const formatDate = useCallback(
    (value: string | number | Date, zone?: string) =>
      new Date(value).toLocaleDateString(intl, {
        timeZone: zone || undefined,
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      }),
    [intl],
  );

  const formatDateTime = useCallback(
    (value: string | number | Date, zone?: string) =>
      new Date(value).toLocaleString(intl, {
        timeZone: zone || undefined,
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }),
    [intl],
  );

  const formatNumber = useCallback(
    (value: number, digits = 0) =>
      new Intl.NumberFormat(intl, {
        minimumFractionDigits: digits,
        maximumFractionDigits: digits,
      }).format(value),
    [intl],
  );

  const value = useMemo<TranslationState>(
    () => ({
      language,
      languages: LANGUAGES,
      setLanguage,
      toggleLanguage,
      t,
      tOr,
      translateError,
      translateMessage,
      humanize,
      formatDate,
      formatDateTime,
      formatNumber,
    }),
    [
      language,
      setLanguage,
      toggleLanguage,
      t,
      tOr,
      translateError,
      translateMessage,
      formatDate,
      formatDateTime,
      formatNumber,
    ],
  );

  return <Context.Provider value={value}>{children}</Context.Provider>;
}

export function useTranslation(): TranslationState {
  const value = useContext(Context);
  if (!value)
    throw new Error("useTranslation must be used within a TranslationProvider");
  return value;
}

/** Convenience hook for components that only need the lookup function. */
export function useT(): TranslateFn {
  return useTranslation().t;
}

export { LANGUAGES, DEFAULT_LANGUAGE, LANGUAGE_STORAGE_KEY } from "./types";
export type { Language } from "./types";
