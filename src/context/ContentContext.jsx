// RameshHerbalist@123
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import websiteContentData from '../../backend/data/websiteContent.json';

const BACKEND_URL = (import.meta.env.VITE_BACKEND_URL || 'https://cancer-herbalist-rhgj.vercel.app').replace(/\/+$/, '');

const ContentContext = createContext();

export const defaultWebsiteContent = websiteContentData;

export function ContentProvider({ children }) {
  const [content, setContent] = useState(defaultWebsiteContent);
  const [loading, setLoading] = useState(true);

  const fetchContent = useCallback(async () => {
    try {
      const res = await fetch(`${BACKEND_URL}/api/website-content`);
      const data = await res.json();
      if (data.success && data.content) {
        // Deep merge with defaultWebsiteContent to ensure no missing keys cause runtime crashes
        setContent(prev => {
          const merged = { ...defaultWebsiteContent, ...data.content };
          // Deep merge child structures
          for (const key of Object.keys(defaultWebsiteContent)) {
            if (defaultWebsiteContent[key] && typeof defaultWebsiteContent[key] === 'object' && !Array.isArray(defaultWebsiteContent[key])) {
              merged[key] = { ...defaultWebsiteContent[key], ...(data.content[key] || {}) };
            }
          }
          return merged;
        });
      }
    } catch (e) {
      console.warn('Failed to load website content from API, using default content.', e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchContent();
  }, [fetchContent]);

  const updateContent = async (newContent, secret) => {
    try {
      const res = await fetch(`${BACKEND_URL}/api/website-content?key=${secret}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newContent),
      });
      const data = await res.json();
      if (data.success && data.content) {
        setContent(data.content);
        return { success: true };
      } else {
        return { success: false, error: data.error || 'Failed to update content.' };
      }
    } catch (e) {
      return { success: false, error: e.message || 'Network error.' };
    }
  };

  return (
    <ContentContext.Provider value={{ content, loading, updateContent, refreshContent: fetchContent, defaultWebsiteContent }}>
      {children}
    </ContentContext.Provider>
  );
}

export const useContent = () => useContext(ContentContext);
