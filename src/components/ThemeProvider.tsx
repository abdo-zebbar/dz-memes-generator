'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { t, type TranslationKey } from '@/lib/translations'

type Theme = 'dark' | 'light' | 'system'
type Language = 'ar' | 'en'

type ThemeProviderProps = {
  children: React.ReactNode
}

type ThemeProviderState = {
  theme: Theme
  setTheme: (theme: Theme) => void
  language: Language
  setLanguage: (language: Language) => void
  t: (key: TranslationKey) => string
}

const initialState: ThemeProviderState = {
  theme: 'light',
  setTheme: () => null,
  language: 'en',
  setLanguage: () => null,
  t: (key: TranslationKey) => key,
}

const ThemeProviderContext = createContext<ThemeProviderState>(initialState)

export function ThemeProvider({
  children,
  defaultTheme = 'light',
  defaultLanguage = 'en',
  storageKey = 'meme-hub-theme',
  languageKey = 'meme-hub-language',
  ...props
}: ThemeProviderProps & {
  defaultTheme?: Theme
  defaultLanguage?: Language
  storageKey?: string
  languageKey?: string
}) {
  const [theme, setTheme] = useState<Theme>(
    () => (typeof window !== 'undefined' && localStorage.getItem(storageKey)) as Theme || defaultTheme
  )

  const [language, setLanguage] = useState<Language>(
    () => (typeof window !== 'undefined' && localStorage.getItem(languageKey)) as Language || defaultLanguage
  )

  useEffect(() => {
    const root = window.document.documentElement

    root.classList.remove('light', 'dark')

    if (theme === 'system') {
      const systemTheme = window.matchMedia('(prefers-color-scheme: dark)')
        .matches
        ? 'dark'
        : 'light'

      root.classList.add(systemTheme)
      return
    }

    root.classList.add(theme)
  }, [theme])

  useEffect(() => {
    const root = window.document.documentElement
    root.setAttribute('lang', language)
    root.setAttribute('dir', language === 'ar' ? 'rtl' : 'ltr')
  }, [language])

  const value = {
    theme,
    setTheme: (theme: Theme) => {
      localStorage.setItem(storageKey, theme)
      setTheme(theme)
    },
    language,
    setLanguage: (language: Language) => {
      localStorage.setItem(languageKey, language)
      setLanguage(language)
    },
    t: (key: TranslationKey) => t(language, key),
  }

  return (
    <ThemeProviderContext.Provider {...props} value={value}>
      {children}
    </ThemeProviderContext.Provider>
  )
}

export const useTheme = () => {
  const context = useContext(ThemeProviderContext)

  if (context === undefined)
    throw new Error('useTheme must be used within a ThemeProvider')

  return context
}