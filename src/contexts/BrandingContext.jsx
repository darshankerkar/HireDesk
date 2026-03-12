import React, { createContext, useContext, useEffect } from 'react';
import { getBranding } from '../utils/branding';

const BrandingContext = createContext(null);

export function BrandingProvider({ children }) {
  const brand = getBranding();

  // Update document title and meta tags based on domain
  useEffect(() => {
    document.title = brand.pageTitle;

    // Update meta description
    let meta = document.querySelector('meta[name="description"]');
    if (!meta) {
      meta = document.createElement('meta');
      meta.name = 'description';
      document.head.appendChild(meta);
    }
    meta.content = brand.description;
  }, [brand]);

  return (
    <BrandingContext.Provider value={brand}>
      {children}
    </BrandingContext.Provider>
  );
}

export function useBranding() {
  const ctx = useContext(BrandingContext);
  if (!ctx) return getBranding(); // fallback
  return ctx;
}
