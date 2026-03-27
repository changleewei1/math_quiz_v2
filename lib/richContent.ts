import { Extension } from '@tiptap/core';
import StarterKit from '@tiptap/starter-kit';
import { Heading } from '@tiptap/extension-heading';
import { Underline } from '@tiptap/extension-underline';
import { TextStyle } from '@tiptap/extension-text-style';
import { Color } from '@tiptap/extension-color';
import { Highlight } from '@tiptap/extension-highlight';
import { TextAlign } from '@tiptap/extension-text-align';

export type RichTextContent = Record<string, any> | null;

export const FontSize = Extension.create({
  name: 'fontSize',
  addGlobalAttributes() {
    return [
      {
        types: ['textStyle'],
        attributes: {
          fontSize: {
            default: null,
            parseHTML: (element) => element.style.fontSize || null,
            renderHTML: (attributes) => {
              if (!attributes.fontSize) return {};
              return { style: `font-size: ${attributes.fontSize}` };
            },
          },
        },
      },
    ];
  },
});

export const LineHeight = Extension.create({
  name: 'lineHeight',
  addGlobalAttributes() {
    return [
      {
        types: ['paragraph', 'heading', 'listItem'],
        attributes: {
          lineHeight: {
            default: null,
            parseHTML: (element) => element.style.lineHeight || null,
            renderHTML: (attributes) => {
              if (!attributes.lineHeight) return {};
              return { style: `line-height: ${attributes.lineHeight}` };
            },
          },
        },
      },
    ];
  },
});

export const ParagraphSpacing = Extension.create({
  name: 'paragraphSpacing',
  addGlobalAttributes() {
    return [
      {
        types: ['paragraph', 'heading', 'listItem'],
        attributes: {
          paragraphSpacing: {
            default: null,
            parseHTML: (element) => element.getAttribute('data-paragraph-spacing') || null,
            renderHTML: (attributes) => {
              if (!attributes.paragraphSpacing) return {};
              const spacing = attributes.paragraphSpacing;
              return {
                'data-paragraph-spacing': spacing,
                style: `margin-top: ${spacing}px; margin-bottom: ${spacing}px;`,
              };
            },
          },
        },
      },
    ];
  },
});

export const Indent = Extension.create({
  name: 'indent',
  addGlobalAttributes() {
    return [
      {
        types: ['paragraph', 'heading', 'listItem'],
        attributes: {
          indent: {
            default: 0,
            parseHTML: (element) => Number(element.getAttribute('data-indent') || 0),
            renderHTML: (attributes) => {
              if (!attributes.indent) return {};
              return {
                'data-indent': attributes.indent,
                style: `margin-left: ${attributes.indent}em;`,
              };
            },
          },
        },
      },
    ];
  },
});

export const BASE_EXTENSIONS = [
  StarterKit.configure({
    heading: false,
  }),
  Heading.configure({ levels: [1, 2, 3] }),
  Underline,
  TextStyle,
  Color,
  Highlight.configure({ multicolor: true }),
  TextAlign.configure({ types: ['heading', 'paragraph'] }),
  FontSize,
  LineHeight,
  ParagraphSpacing,
  Indent,
];

export function getPlainTextFromContent(content: RichTextContent): string {
  if (!content || typeof content !== 'object') return '';
  const nodes = (content as any).content || [];
  const collect = (node: any): string => {
    if (!node) return '';
    if (node.type === 'text') return node.text || '';
    if (Array.isArray(node.content)) {
      return node.content.map(collect).join('');
    }
    return '';
  };
  return nodes.map(collect).join(' ').replace(/\s+/g, ' ').trim();
}

