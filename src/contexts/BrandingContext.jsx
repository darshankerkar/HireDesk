import React, { createContext, useContext, useEffect } from 'react';
import { getBranding } from '../utils/branding';

const BrandingContext = createContext(null);

export function BrandingProvider({ children }) {
  const brand = getBranding();

  useEffect(() => {
    document.title = brand.pageTitle;

    let meta = document.querySelector('meta[name="description"]');
    if (!meta) {
      meta = document.createElement('meta');
      meta.name = 'description';
      document.head.appendChild(meta);
    }
    meta.content = brand.description;

    let favicon = document.querySelector('link[rel="icon"]');
    if (!favicon) {
      favicon = document.createElement('link');
      favicon.rel = 'icon';
      document.head.appendChild(favicon);
    }
    favicon.type = brand.favicon.endsWith('.svg') ? 'image/svg+xml' : 'image/png';
    favicon.href = brand.favicon;
  }, [brand]);

  return (
    <BrandingContext.Provider value={brand}>
      {children}
    </BrandingContext.Provider>
  );
}

export function useBranding() {
  const ctx = useContext(BrandingContext);
  if (!ctx) return getBranding();
  return ctx;
}
