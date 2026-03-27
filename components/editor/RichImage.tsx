'use client';

import { Node, mergeAttributes } from '@tiptap/core';
import type { NodeViewRendererProps } from '@tiptap/react';
import { NodeViewWrapper, ReactNodeViewRenderer } from '@tiptap/react';
import { useEffect, useRef, useState } from 'react';

export type RichImageAttrs = {
  src: string;
  alt?: string | null;
  width?: number | null;
  height?: number | null;
  x?: number | null;
  y?: number | null;
  zIndex?: number | null;
  align?: 'left' | 'center' | 'right';
  wrapMode?: 'none' | 'wrap' | 'block';
  caption?: string | null;
  captionSize?: number | null;
};

const DEFAULT_WIDTH = 320;
const DEFAULT_HEIGHT = 220;

export const RichImage = Node.create({
  name: 'richImage',
  group: 'block',
  draggable: true,
  atom: true,
  addAttributes() {
    return {
      src: { default: '' },
      alt: { default: null },
      width: { default: null },
      height: { default: null },
      x: { default: 0 },
      y: { default: 0 },
      zIndex: { default: 1 },
      align: { default: 'center' },
      wrapMode: { default: 'none' },
      caption: { default: null },
      captionSize: { default: 14 },
    };
  },
  parseHTML() {
    return [
      {
        tag: 'figure[data-rich-image]',
      },
    ];
  },
  renderHTML({ HTMLAttributes }) {
    const {
      src,
      alt,
      width,
      height,
      x,
      y,
      zIndex,
      align,
      wrapMode,
      caption,
      captionSize,
    } = HTMLAttributes as RichImageAttrs;

    const computedWidth = width || DEFAULT_WIDTH;
    const computedHeight = height || DEFAULT_HEIGHT;
    const safeX = typeof x === 'number' ? x : 0;
    const safeY = typeof y === 'number' ? y : 0;
    const safeZ = typeof zIndex === 'number' ? zIndex : 1;
    const safeCaptionSize = typeof captionSize === 'number' ? captionSize : 14;

    const baseStyle = `width:${computedWidth}px;height:${computedHeight}px;z-index:${safeZ};`;
    const positionStyle =
      wrapMode === 'none'
        ? `position:absolute;left:${safeX}px;top:${safeY}px;`
        : '';
    const floatStyle =
      wrapMode === 'wrap'
        ? `float:${align || 'left'};margin:0 12px 12px 0;`
        : '';
    const blockStyle =
      wrapMode === 'block'
        ? 'display:block;margin:12px auto;'
        : '';

    const figureStyle = `${baseStyle}${positionStyle}${floatStyle}${blockStyle}`;

    return [
      'figure',
      mergeAttributes(HTMLAttributes, {
        'data-rich-image': 'true',
        'data-wrap': wrapMode,
        'data-align': align,
        class: 'rich-image',
        style: figureStyle,
      }),
      ['img', { src, alt: alt || 'image' }],
      caption
        ? [
            'figcaption',
            {
              style: `font-size:${safeCaptionSize}px;`,
            },
            caption,
          ]
        : [],
    ];
  },
  addNodeView() {
    return ReactNodeViewRenderer(RichImageView);
  },
});

function RichImageView(props: NodeViewRendererProps) {
  const { node, updateAttributes, selected, editor } = props as any;
  const { src, alt, width, height, x, y, zIndex, align, wrapMode, caption, captionSize } =
    node.attrs as RichImageAttrs;
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [dragging, setDragging] = useState(false);
  const [resizing, setResizing] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [resizeStart, setResizeStart] = useState({ x: 0, y: 0, width: 0, height: 0 });

  useEffect(() => {
    const handlePointerMove = (event: PointerEvent) => {
      if (dragging && wrapMode === 'none') {
        const editorRect = editor.view.dom.getBoundingClientRect();
        const newX = Math.max(0, event.clientX - editorRect.left - dragOffset.x);
        const newY = Math.max(0, event.clientY - editorRect.top - dragOffset.y);
        updateAttributes({ x: Math.round(newX), y: Math.round(newY) });
      }
      if (resizing) {
        const dx = event.clientX - resizeStart.x;
        const dy = event.clientY - resizeStart.y;
        const nextWidth = Math.max(80, resizeStart.width + dx);
        const nextHeight = Math.max(60, resizeStart.height + dy);
        updateAttributes({ width: Math.round(nextWidth), height: Math.round(nextHeight) });
      }
    };

    const handlePointerUp = () => {
      setDragging(false);
      setResizing(false);
    };

    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);
    return () => {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
    };
  }, [dragging, resizeStart, resizing, wrapMode, dragOffset, updateAttributes, editor]);

  const startDrag = (event: React.PointerEvent) => {
    if (wrapMode !== 'none') return;
    if (event.button !== 0) return;
    event.preventDefault();
    event.stopPropagation();
    const target = containerRef.current;
    if (!target) return;
    const rect = target.getBoundingClientRect();
    setDragOffset({ x: event.clientX - rect.left, y: event.clientY - rect.top });
    setDragging(true);
  };

  const startResize = (event: React.PointerEvent) => {
    event.stopPropagation();
    const currentWidth = width || DEFAULT_WIDTH;
    const currentHeight = height || DEFAULT_HEIGHT;
    setResizeStart({
      x: event.clientX,
      y: event.clientY,
      width: currentWidth,
      height: currentHeight,
    });
    setResizing(true);
  };

  const computedWidth = width || DEFAULT_WIDTH;
  const computedHeight = height || DEFAULT_HEIGHT;
  const positionStyle =
    wrapMode === 'none'
      ? {
          position: 'absolute' as const,
          left: x || 0,
          top: y || 0,
          zIndex: zIndex || 1,
        }
      : {};
  const floatStyle =
    wrapMode === 'wrap'
      ? {
          float: align || 'left',
          marginRight: 12,
          marginBottom: 12,
        }
      : {};
  const blockStyle =
    wrapMode === 'block'
      ? {
          display: 'block',
          margin: '12px auto',
        }
      : {};

  return (
    <NodeViewWrapper
      ref={containerRef}
      className={`rich-image ${selected ? 'is-selected' : ''}`}
      data-wrap={wrapMode}
      data-align={align}
      onPointerDown={startDrag}
      contentEditable={false}
      style={{
        width: computedWidth,
        height: computedHeight,
        ...positionStyle,
        ...floatStyle,
        ...blockStyle,
        cursor: wrapMode === 'none' ? 'move' : 'default',
        overflow: 'visible',
      }}
    >
      <img src={src} alt={alt || 'image'} className="rich-image__img" />
      {caption ? (
        <figcaption
          className="rich-image__caption"
          style={{ fontSize: `${captionSize || 14}px` }}
        >
          {caption}
        </figcaption>
      ) : null}
      {selected && (
        <div className="rich-image__panel">
          <div className="rich-image__row">
            <label>
              寬
              <input
                type="number"
                value={computedWidth}
                onChange={(e) => updateAttributes({ width: Number(e.target.value) })}
              />
            </label>
            <label>
              高
              <input
                type="number"
                value={computedHeight}
                onChange={(e) => updateAttributes({ height: Number(e.target.value) })}
              />
            </label>
          </div>
          <div className="rich-image__row">
            <label>
              對齊
              <select
                value={align || 'center'}
                onChange={(e) => updateAttributes({ align: e.target.value })}
              >
                <option value="left">左</option>
                <option value="center">中</option>
                <option value="right">右</option>
              </select>
            </label>
            <label>
              環繞
              <select
                value={wrapMode || 'none'}
                onChange={(e) => updateAttributes({ wrapMode: e.target.value })}
              >
                <option value="none">自由拖曳</option>
                <option value="wrap">文字環繞</option>
                <option value="block">置中獨立段落</option>
              </select>
            </label>
          </div>
          <div className="rich-image__row">
            <label className="rich-image__caption-label">
              說明
              <input
                type="text"
                value={caption || ''}
                onChange={(e) => updateAttributes({ caption: e.target.value })}
              />
            </label>
            <label>
              圖說字級
              <input
                type="number"
                value={captionSize || 14}
                onChange={(e) => updateAttributes({ captionSize: Number(e.target.value) })}
              />
            </label>
          </div>
        </div>
      )}
      {selected && wrapMode === 'none' && (
        <button
          type="button"
          className="rich-image__resize-handle"
          onPointerDown={startResize}
        />
      )}
    </NodeViewWrapper>
  );
}

