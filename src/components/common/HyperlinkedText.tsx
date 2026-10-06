import React from 'react';
import { applyHyperlinksToContent, ApplyHyperlinksOptions } from '../../utils/hyperlinks';
import { HyperlinkConfig } from '../../types';

interface HyperlinkedTextProps {
  text?: string | null;
  hyperlinks?: HyperlinkConfig[];
  className?: string;
  inline?: boolean;
  disableGlobal?: boolean;
  as?: 'div' | 'span' | 'p';
}

/**
 * Renders text with automatic SEO hyperlinks applied.
 * Works seamlessly across all pages on the website.
 */
export const HyperlinkedText: React.FC<HyperlinkedTextProps> = ({
  text,
  hyperlinks,
  className = '',
  inline = false,
  disableGlobal = false,
  as: Component = 'div'
}) => {
  if (!text) return null;

  const html = applyHyperlinksToContent(text, hyperlinks, { inline, disableGlobal });

  return (
    <Component
      className={className}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
};

export default HyperlinkedText;
