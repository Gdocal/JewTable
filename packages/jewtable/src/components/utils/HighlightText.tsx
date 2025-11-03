/**
 * HighlightText Utility Component
 * Phase 11: ERP Integration Features (Phase B)
 *
 * Highlights matching text in search results
 */

import React from 'react';

interface HighlightTextProps {
  text: string;
  query: string;
  className?: string;
  highlightClassName?: string;
}

/**
 * Escape special regex characters
 */
function escapeRegExp(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * HighlightText - Highlights matching text in search results
 */
export function HighlightText({
  text,
  query,
  className = '',
  highlightClassName = 'highlight',
}: HighlightTextProps) {
  if (!query || !text) {
    return <span className={className}>{text}</span>;
  }

  try {
    // Escape special regex characters and create case-insensitive regex
    const escapedQuery = escapeRegExp(query);
    const regex = new RegExp(`(${escapedQuery})`, 'gi');

    // Split text by matches
    const parts = text.split(regex);

    return (
      <span className={className}>
        {parts.map((part, index) => {
          // Check if this part matches the query (case-insensitive)
          const isMatch = regex.test(part);
          // Reset regex lastIndex for next test
          regex.lastIndex = 0;

          if (isMatch) {
            return (
              <mark key={index} className={highlightClassName}>
                {part}
              </mark>
            );
          }

          return <React.Fragment key={index}>{part}</React.Fragment>;
        })}
      </span>
    );
  } catch (error) {
    // If regex fails, return plain text
    return <span className={className}>{text}</span>;
  }
}

/**
 * Default highlight styles (can be overridden with highlightClassName)
 */
export const defaultHighlightStyles = {
  background: '#fff3cd',
  color: '#212529',
  fontWeight: 500,
  padding: '0 2px',
  borderRadius: '2px',
};
