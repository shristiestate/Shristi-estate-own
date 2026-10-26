export type PageSeoCategory = 
  | 'Core Pages' 
  | 'Commercial Categories' 
  | 'Locations' 
  | 'Workflows' 
  | 'Informational' 
  | 'Custom';

export interface PageSeoConfig {
  id: string;
  path: string; // e.g. '/', '/office-space', '/locations/sector-62'
  pageName: string; // e.g. 'Home Page', 'Office Space'
  category: PageSeoCategory;
  title: string;
  description: string;
  keywords: string;
  canonicalUrl?: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  noindex?: boolean;
  updatedAt?: string;
  isCustom?: boolean;
}
