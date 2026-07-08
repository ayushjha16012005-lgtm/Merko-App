'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { en } from '../locales/en';
import { hi } from '../locales/hi';
import { useAuthStore } from '../stores/auth-store';
import { apiClient } from '../lib/api-client';

type Language = 'en' | 'hi';

interface LanguageContextType {
  language: Language;
  changeLanguage: (lang: Language) => Promise<void>;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const translations: Record<Language, any> = { en, hi };

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>('en');
  const { user, isAuthenticated, setUser } = useAuthStore();

  // Load initial language
  useEffect(() => {
    // 1. Check logged-in user preference
    if (isAuthenticated && user?.languagePreference) {
      const userPref = user.languagePreference as Language;
      if (translations[userPref]) {
        setLanguage(userPref);
        localStorage.setItem('merko-lang', userPref);
        return;
      }
    }

    // 2. Check localStorage for guest/fallback
    const stored = localStorage.getItem('merko-lang') as Language;
    if (stored && translations[stored]) {
      setLanguage(stored);
    }
  }, [isAuthenticated, user?.languagePreference]);

  // Expose change language method
  const changeLanguage = async (lang: Language) => {
    setLanguage(lang);
    localStorage.setItem('merko-lang', lang);

    if (isAuthenticated && user) {
      try {
        // Persist to user database profile
        await apiClient.put('/profile', { languagePreference: lang });
        // Update user state locally
        setUser({
          ...user,
          languagePreference: lang,
        });
      } catch (err) {
        console.error('Failed to persist language preference to profile', err);
      }
    }
  };

  // Translation helper resolving nested dot notation
  const t = (key: string): string => {
    const keys = key.split('.');
    let current = translations[language];

    for (const k of keys) {
      if (current && typeof current === 'object' && k in current) {
        current = current[k];
      } else {
        // Fallback to English dictionary if not found in Hindi
        let enFallback = translations['en'];
        for (const enK of keys) {
          if (enFallback && typeof enFallback === 'object' && enK in enFallback) {
            enFallback = enFallback[enK];
          } else {
            enFallback = null;
            break;
          }
        }
        return typeof enFallback === 'string' ? enFallback : key;
      }
    }

    return typeof current === 'string' ? current : key;
  };

  return (
    <LanguageContext.Provider value={{ language, changeLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
