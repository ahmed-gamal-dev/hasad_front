// contexts/SimpleTranslationContext.tsx
// WITH RTL SUPPORT!

'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

interface TranslationContextType {
  language: string;
  setLanguage: (lang: string) => void;
  translate: (text: string) => string;
  isReady: boolean;
  clearCache: () => void;
  isRTL: boolean; // NEW: Is current language RTL?
  direction: 'ltr' | 'rtl'; // NEW: Text direction
}

const TranslationContext = createContext<TranslationContextType | undefined>(
  undefined
);

// Global cache for all translations
const globalCache = new Map<string, string>();

// RTL Languages
const RTL_LANGUAGES = [
  'ar', // Arabic
  'he', // Hebrew
  'fa', // Persian/Farsi
  'ur', // Urdu
  'yi', // Yiddish
  'iw', // Hebrew (old code)
];

export function SimpleTranslationProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [language, setLanguageState] = useState<string>('en');
  const [isReady, setIsReady] = useState(false);
  const [, forceUpdate] = useState(0);

  // Check if current language is RTL
  const isRTL = RTL_LANGUAGES.includes(language);
  const direction = isRTL ? 'rtl' : 'ltr';

  // Load saved language and cache on mount
  useEffect(() => {
    // 1. Load saved language preference
    const savedLang = localStorage.getItem('preferred_language');
    if (savedLang) {
      setLanguageState(savedLang);
    }

    // 2. Load cached translations from localStorage
    loadCacheFromStorage();

    // 3. Mark as ready
    setIsReady(true);
  }, []);

  // Update HTML direction when language changes
  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.documentElement.dir = direction;
      document.documentElement.lang = language;
      
      // Also update body for good measure
      document.body.dir = direction;
    }
  }, [language, direction]);

  const setLanguage = (lang: string) => {
    setLanguageState(lang);
    localStorage.setItem('preferred_language', lang);
  };

  const clearCache = () => {
    globalCache.clear();
    const keys = Object.keys(localStorage);
    for (const key of keys) {
      if (key.startsWith('trans_')) {
        localStorage.removeItem(key);
      }
    }
    console.log('✅ Cache cleared');
    forceUpdate((n) => n + 1);
  };

  const translate = (text: string): string => {
    if (language === 'en' || !isReady) {
      return text;
    }

    const cacheKey = `${language}:${text}`;

    if (globalCache.has(cacheKey)) {
      const cached = globalCache.get(cacheKey)!;
      if (typeof cached === 'string') {
        return cached;
      } else {
        globalCache.delete(cacheKey);
        localStorage.removeItem(`trans_${cacheKey}`);
      }
    }

    translateAsync(text, language, cacheKey);
    return text;
  };

  const translateAsync = async (
    text: string,
    targetLang: string,
    cacheKey: string
  ) => {
    try {
      const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=${targetLang}&dt=t&q=${encodeURIComponent(
        text
      )}`;

      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();

      if (data && Array.isArray(data) && data[0] && Array.isArray(data[0])) {
        const translatedParts = data[0]
          .filter((item: any) => Array.isArray(item) && item[0])
          .map((item: any) => item[0]);
        
        const translated = translatedParts.join('');
        
        if (translated && typeof translated === 'string' && !translated.startsWith('{')) {
          globalCache.set(cacheKey, translated);
          saveToLocalStorage(cacheKey, translated);
          forceUpdate((n) => n + 1);
        }
      }
    } catch (error) {
      console.error('Translation failed for:', text, error);
    }
  };

  return (
    <TranslationContext.Provider 
      value={{ 
        language, 
        setLanguage, 
        translate, 
        isReady, 
        clearCache,
        isRTL,
        direction
      }}
    >
      {children}
    </TranslationContext.Provider>
  );
}

function saveToLocalStorage(key: string, value: string) {
  try {
    if (typeof value === 'string' && !value.startsWith('{')) {
      localStorage.setItem(`trans_${key}`, value);
    }
  } catch (error) {
    console.error('Failed to save translation:', error);
  }
}

function loadCacheFromStorage() {
  try {
    const keys = Object.keys(localStorage);
    let loaded = 0;
    let corrupted = 0;

    for (const key of keys) {
      if (key.startsWith('trans_')) {
        const cacheKey = key.replace('trans_', '');
        const value = localStorage.getItem(key);
        
        if (value) {
          if (typeof value === 'string' && !value.startsWith('{') && !value.startsWith('[')) {
            globalCache.set(cacheKey, value);
            loaded++;
          } else {
            localStorage.removeItem(key);
            corrupted++;
          }
        }
      }
    }

    console.log(`✅ Loaded ${loaded} cached translations`);
    if (corrupted > 0) {
      console.log(`🧹 Cleaned ${corrupted} corrupted cache entries`);
    }
  } catch (error) {
    console.error('Failed to load cache:', error);
  }
}

export function useTranslation() {
  const context = useContext(TranslationContext);
  if (!context) {
    throw new Error('useTranslation must be used within TranslationProvider');
  }
  return context;
}

export function usePreloadTranslations(texts: string[]) {
  const { translate, language, isReady } = useTranslation();

  useEffect(() => {
    if (!isReady || language === 'en') return;
    texts.forEach((text) => translate(text));
  }, [language, isReady, texts, translate]);
}