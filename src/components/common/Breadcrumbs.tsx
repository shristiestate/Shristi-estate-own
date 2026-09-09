import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';

export interface BreadcrumbItem {
  label: string;
  path?: string;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
  className?: string;
}

export const Breadcrumbs: React.FC<BreadcrumbsProps> = ({ items, className = '' }) => {
  return (
    <nav 
      aria-label="Breadcrumb" 
      className={`flex items-center text-xs sm:text-sm font-medium text-slate-500 dark:text-slate-400 overflow-x-auto py-2.5 whitespace-nowrap scrollbar-none ${className}`}
    >
      <ol className="flex items-center gap-1.5 sm:gap-2">
        <li className="flex items-center">
          <Link 
            to="/" 
            className="flex items-center gap-1 hover:text-brand-600 dark:hover:text-brand-400 transition-colors"
          >
            <Home className="w-3.5 h-3.5" />
            <span className="hidden xs:inline">Home</span>
          </Link>
        </li>

        {items.map((item, index) => {
          const isLast = index === items.length - 1;

          return (
            <li key={index} className="flex items-center gap-1.5 sm:gap-2">
              <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              {item.path && !isLast ? (
                <Link
                  to={item.path}
                  className="hover:text-brand-600 dark:hover:text-brand-400 transition-colors"
                >
                  {item.label}
                </Link>
              ) : (
                <span className="text-slate-900 dark:text-slate-100 font-semibold truncate max-w-[200px] sm:max-w-xs">
                  {item.label}
                </span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
};
