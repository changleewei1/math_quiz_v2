'use client';

import DOMPurify from 'dompurify';
import { generateHTML } from '@tiptap/html';
import { BASE_EXTENSIONS, RichTextContent } from '@/lib/richContent';
import { RichImage } from './RichImage';
import ReactMarkdown from 'react-markdown';
import remarkBreaks from 'remark-breaks';

type RichContentRendererProps = {
  content?: RichTextContent;
  fallbackMarkdown?: string | null;
  className?: string;
};

export default function RichContentRenderer({
  content,
  fallbackMarkdown,
  className = '',
}: RichContentRendererProps) {
  if (!content && !fallbackMarkdown) {
    return null;
  }

  if (!content) {
    return (
      <div className={`rich-content ${className}`}>
        <ReactMarkdown remarkPlugins={[remarkBreaks]}>
          {fallbackMarkdown || ''}
        </ReactMarkdown>
      </div>
    );
  }

  const html = generateHTML(content as any, [...BASE_EXTENSIONS, RichImage]);
  const sanitized = DOMPurify.sanitize(html, {
    ADD_TAGS: ['figure', 'figcaption'],
    ADD_ATTR: [
      'style',
      'data-wrap',
      'data-align',
      'data-rich-image',
      'data-paragraph-spacing',
      'data-indent',
    ],
  });

  return (
    <div
      className={`rich-content ${className}`}
      dangerouslySetInnerHTML={{ __html: sanitized }}
    />
  );
}

