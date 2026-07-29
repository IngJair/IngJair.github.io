import { createContext, useContext } from 'react';

export const SiteContentContext = createContext(null);

export function useSiteContent() {
  const context = useContext(SiteContentContext);

  if (!context) {
    throw new Error('useSiteContent debe usarse dentro de SiteContentProvider.');
  }

  return context;
}
