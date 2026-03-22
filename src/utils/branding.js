/**
 * Domain-based branding configuration.
 * Detects hostname and returns the correct brand identity.
 */

const brands = {
  hiredesk: {
    appName: 'HireDesk',
    appNameParts: { first: 'Hire', highlight: 'Desk' },
    tagline: 'AI-powered recruitment automation software.',
    description: 'HireDesk is a subscription-based recruitment automation software.',
    pageTitle: 'HireDesk - AI Recruitment Platform',
    logo: '/logo.png',
    favicon: '/logo.png',
    supportEmail: 'recridy@gmail.com',
    contactEmail: 'recridy@gmail.com',
    copyright: `(c) ${new Date().getFullYear()} HireDesk. All rights reserved.`,
    disclaimer: 'HireDesk is an AI-powered recruitment automation software. We do not provide direct job placement services.',
  },
  recrify: {
    appName: 'Recrify',
    appNameParts: { first: 'Recr', highlight: 'ify' },
    tagline: 'AI-powered recruitment software.',
    description: 'Recrify is a subscription-based recruitment software.',
    pageTitle: 'Recrify - AI Hiring Intelligence Platform',
    logo: '/recrify-favicon.svg',
    favicon: '/recrify-favicon.svg',
    supportEmail: 'recridy@gmail.com',
    contactEmail: 'recridy@gmail.com',
    copyright: `(c) ${new Date().getFullYear()} Recrify. All rights reserved.`,
    disclaimer: 'Recrify is an AI-powered recruitment software. We do not provide direct job placement services.',
  },
};

export function getBranding() {
  if (typeof window === 'undefined') return brands.hiredesk;

  const hostname = window.location.hostname;

  if (hostname.includes('recrify')) {
    return brands.recrify;
  }

  return brands.hiredesk;
}

export default getBranding;
