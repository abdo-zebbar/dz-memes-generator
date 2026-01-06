import React, { createContext, useContext, useState, useEffect } from 'react';

type Theme = 'light' | 'dark';
type Language = 'ar' | 'en';

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

// Translation object
const translations = {
  ar: {
    'app.title': 'Arab Memes by DZ',
    'app.description': 'أنشئ الميمز باستخدام النص العربي أو الإنجليزي',
    'upload.image': 'رفع الصورة',
    'add.text': 'إضافة نص',
    'text.content': 'محتوى النص',
    'font.size': 'حجم الخط',
    'text.color': 'لون النص',
    'border.color': 'لون الحدود',
    'border.width': 'عرض الحدود',
    'font.family': 'نوع الخط',
    'resize.image': 'تغيير حجم الصورة',
    'width': 'العرض',
    'height': 'الارتفاع',
    'download.meme': 'تحميل الميم',
    'select.text.first': 'اختر نص لتعديله',
    'delete.text': 'حذف النص',
    'apply': 'تطبيق',
    'reset': 'إعادة تعيين',
  },
  en: {
    'app.title': 'Arab Memes by DZ',
    'app.description': 'Create memes with Arabic or English text',
    'upload.image': 'Upload Image',
    'add.text': 'Add Text',
    'text.content': 'Text Content',
    'font.size': 'Font Size',
    'text.color': 'Text Color',
    'border.color': 'Border Color',
    'border.width': 'Border Width',
    'font.family': 'Font Family',
    'resize.image': 'Resize Image',
    'width': 'Width',
    'height': 'Height',
    'download.meme': 'Download Meme',
    'select.text.first': 'Select text to edit',
    'delete.text': 'Delete Text',
    'apply': 'Apply',
    'reset': 'Reset',
  }
};

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setTheme] = useState<Theme>(() => {
    const saved = localStorage.getItem('theme');
    return (saved as Theme) || 'light';
  });

  const [language, setLanguage] = useState<Language>(() => {
    const saved = localStorage.getItem('language');
    return (saved as Language) || 'en';
  });

  useEffect(() => {
    localStorage.setItem('theme', theme);
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  useEffect(() => {
    localStorage.setItem('language', language);
    document.documentElement.setAttribute('data-lang', language);
    // Set document direction for RTL support
    document.documentElement.setAttribute('dir', language === 'ar' ? 'rtl' : 'ltr');
  }, [language]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  const t = (key: string): string => {
    return translations[language]?.[key as keyof typeof translations[typeof language]] || key;
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, language, setLanguage, t }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
};
