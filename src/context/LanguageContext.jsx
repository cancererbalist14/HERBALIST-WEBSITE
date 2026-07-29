import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

export const SUPPORTED_LANGUAGES = [
  { code: 'en',    name: 'English',   native: 'English'  },
  { code: 'hi',    name: 'Hindi',     native: '\u0939\u093f\u0902\u0926\u0940'    },
  { code: 'kn',    name: 'Kannada',   native: '\u0c95\u0ca8\u0ccd\u0ca8\u0ca1'    },
  { code: 'mr',    name: 'Marathi',   native: '\u092e\u0930\u093e\u0920\u0940'    },
  { code: 'ta',    name: 'Tamil',     native: '\u0ba4\u0bae\u0bbf\u0bb4\u0bcd'    },
  { code: 'te',    name: 'Telugu',    native: '\u0c24\u0c46\u0c32\u0c41\u0c17\u0c41'   },
  { code: 'bn',    name: 'Bengali',   native: '\u09ac\u09be\u0982\u09b2\u09be'    },
  { code: 'gu',    name: 'Gujarati',  native: '\u0a97\u0ac1\u0a9c\u0ab0\u0abe\u0aa4\u0ac0'  },
  { code: 'ml',    name: 'Malayalam', native: '\u0d2e\u0d32\u0d2f\u0d3e\u0d33\u0d02'   },
  { code: 'pa',    name: 'Punjabi',   native: '\u0a2a\u0a70\u0a1c\u0a3e\u0a2c\u0a40'   },
  { code: 'or',    name: 'Odia',      native: '\u0b13\u0b21\u0b3c\u0b3f\u0b06'    },
  { code: 'ur',    name: 'Urdu',      native: '\u0627\u0631\u062f\u0648'     },
  { code: 'as',    name: 'Assamese',  native: '\u0985\u09b8\u09ae\u09c0\u09af\u09bc\u09be'  },
  { code: 'ar',    name: 'Arabic',    native: '\u0627\u0644\u0639\u0631\u0628\u064a\u0629'  },
  { code: 'zh-CN', name: 'Chinese',   native: '\u4e2d\u6587'      },
  { code: 'fr',    name: 'French',    native: 'Fran\u00e7ais' },
  { code: 'de',    name: 'German',    native: 'Deutsch'  },
  { code: 'es',    name: 'Spanish',   native: 'Espa\u00f1ol'  },
];

const LanguageContext = createContext(null);

function loadGoogleTranslate(cb) {
  if (window.google && window.google.translate) { cb(); return; }
  window.googleTranslateElementInit = cb;
  if (!document.getElementById('gt-script')) {
    const s = document.createElement('script');
    s.id = 'gt-script';
    s.src = '//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit';
    s.async = true;
    document.body.appendChild(s);
  }
}

function initWidget() {
  if (!window.google || !window.google.translate) return;
  if (!document.getElementById('google_translate_element')) return;
  try {
    new window.google.translate.TranslateElement(
      {
        pageLanguage: 'en',
        includedLanguages: SUPPORTED_LANGUAGES.map((l) => l.code).join(','),
        autoDisplay: false,
      },
      'google_translate_element'
    );
  } catch (_) { /* ignore */ }
}

function applyGoogleTranslate(langCode) {
  if (langCode === 'en') {
    document.cookie = 'googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
    document.cookie =
      'googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=' +
      window.location.hostname;
    window.location.reload();
    return;
  }
  const val = '/en/' + langCode;
  document.cookie = 'googtrans=' + val + '; path=/';
  document.cookie = 'googtrans=' + val + '; path=/; domain=' + window.location.hostname;
  const sel = document.querySelector('.goog-te-combo');
  if (sel) {
    sel.value = langCode;
    sel.dispatchEvent(new Event('change'));
  } else {
    window.location.reload();
  }
}

export function LanguageProvider({ children }) {
  const [currentLang, setCurrentLang] = useState(
    () => localStorage.getItem('ch_lang') || 'en'
  );

  useEffect(() => {
    // Inject hidden GT widget container
    let el = document.getElementById('google_translate_element');
    if (!el) {
      el = document.createElement('div');
      el.id = 'google_translate_element';
      el.style.cssText =
        'position:absolute;width:1px;height:1px;overflow:hidden;opacity:0;pointer-events:none;';
      document.body.appendChild(el);
    }

    // Load Google Translate script
    loadGoogleTranslate(() => {
      initWidget();
      const saved = localStorage.getItem('ch_lang');
      if (saved && saved !== 'en') {
        setTimeout(() => applyGoogleTranslate(saved), 900);
      }
    });

    // Hide Google's toolbar banner
    if (!document.getElementById('gt-hide-banner')) {
      const st = document.createElement('style');
      st.id = 'gt-hide-banner';
      st.textContent =
        '.goog-te-banner-frame,#goog-gt-tt,.goog-te-balloon-frame{display:none!important}' +
        'body{top:0!important}.skiptranslate{display:none!important}';
      document.head.appendChild(st);
    }
  }, []);

  const setLanguage = useCallback((code) => {
    setCurrentLang(code);
    localStorage.setItem('ch_lang', code);
    applyGoogleTranslate(code);
  }, []);

  return (
    <LanguageContext.Provider value={{ currentLang, setLanguage, languages: SUPPORTED_LANGUAGES }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error('useLanguage must be inside <LanguageProvider>');
  return ctx;
}
