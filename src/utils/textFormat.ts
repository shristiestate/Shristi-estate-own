import React from 'react';

/**
 * Cleans unwanted formatting from pasted text (e.g. from Word, Google Docs, browsers, external sites)
 * while strictly preserving:
 * 1. The exact intended wording
 * 2. Single and intentional multiple spaces
 * 3. Exact line breaks and paragraph structure
 * 4. No synthetic HTML conversion (<p>, <br>, etc.)
 */
export function cleanPastedText(raw: string): string {
  if (!raw) return '';

  let text = raw;

  // If the input contains raw HTML tags (e.g., from rich-text clipboard fallback),
  // convert paragraph breaks and breaks to natural newlines before stripping tags
  if (/<[a-z][\s\S]*>/i.test(text)) {
    text = text
      .replace(/<br\s*\/?>/gi, '\n')
      .replace(/<\/p>/gi, '\n\n')
      .replace(/<\/div>/gi, '\n')
      .replace(/<\/h[1-6]>/gi, '\n\n')
      .replace(/<li[^>]*>/gi, '• ')
      .replace(/<\/li>/gi, '\n')
      .replace(/<[^>]+>/g, '');
  }

  return text
    // Normalize Windows (\r\n) and legacy Mac (\r) line breaks to standard \n
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')
    // Remove invisible zero-width characters and directional controls silently inserted by Word / Docs
    .replace(/[\u200B-\u200D\uFEFF\u200E\u200F]/g, '')
    // Normalize non-breaking spaces (&nbsp; / \u00A0 / \u202F) to regular spaces
    // so word spacing and line wrapping remain natural without collapsing intentional spaces
    .replace(/[\u00A0\u202F]/g, ' ')
    // Normalize form feed and vertical tab
    .replace(/[\v\f]/g, '\n');
}

/**
 * Reusable paste handler for textareas to ensure pasted content from Word, Google Docs,
 * or web pages is cleaned of unwanted hidden formatting while preserving exact spacing and paragraphs.
 */
export function handleOverviewPaste(
  e: React.ClipboardEvent<HTMLTextAreaElement>,
  onChange: (value: string) => void,
  currentValue: string
): void {
  const clipboard = e.clipboardData;
  let rawText = clipboard.getData('text/plain');

  if (!rawText) {
    rawText = clipboard.getData('text/html') || '';
  }

  if (!rawText) return;

  e.preventDefault();

  const cleaned = cleanPastedText(rawText);
  const textarea = e.currentTarget;
  const start = textarea.selectionStart ?? currentValue.length;
  const end = textarea.selectionEnd ?? currentValue.length;

  const newValue = currentValue.substring(0, start) + cleaned + currentValue.substring(end);
  onChange(newValue);

  // Restore cursor position immediately after inserted text
  requestAnimationFrame(() => {
    try {
      textarea.selectionStart = textarea.selectionEnd = start + cleaned.length;
    } catch {
      // Ignore if element is unmounted or unfocused
    }
  });
}
