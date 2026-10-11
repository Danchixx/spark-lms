import { useRef, useEffect } from 'react';
import SunEditor from 'suneditor-react';
import 'suneditor/dist/css/suneditor.min.css';
import './RichTextEditor.css';

type RichTextEditorProps = {
  content: string;
  onChange: (html: string) => void;
  placeholder?: string;
};

const SunEditorComponent = (SunEditor as any).default || SunEditor;

/**
 * Normalizes any font-size smaller than 18px (including pt, rem, em, % and keywords)
 * to the default minimum size of 18px.
 */
const enforceMinFontSize18 = (html: string): string => {
  if (!html) return html;

  let result = html;

  // 1. Replace <small> tags with 18px styled span
  result = result
    .replace(/<small\b([^>]*)>/gi, '<span $1 style="font-size: 18px;">')
    .replace(/<\/small>/gi, '</span>');

  // 2. Replace legacy <font size="1|2|3"> with 18px style
  result = result.replace(/<font\b([^>]*?)\bsize=["']([1-3])["']([^>]*?)>/gi, (_match, before, _size, after) => {
    return `<font ${before}style="font-size: 18px;"${after}>`;
  });

  // 3. Normalize inline style font-size declarations to at least 18px
  // Handles double quotes, single quotes, with or without semicolons/!important
  result = result.replace(/font-size\s*:\s*([^;"'>]+)(;?)/gi, (fullMatch, rawVal, semi) => {
    const trimmed = rawVal.trim().toLowerCase().replace(/\s*!important/i, '');

    // Check keywords
    if (['xx-small', 'x-small', 'small', 'smaller', 'medium'].includes(trimmed)) {
      return `font-size: 18px${semi || ''}`;
    }

    // Check numbers with units
    const match = trimmed.match(/^([0-9.]+)\s*(px|pt|rem|em|%)?$/);
    if (match) {
      const num = parseFloat(match[1]);
      const unit = match[2] || 'px';

      let isSmaller = false;
      if (unit === 'px' && num < 18) {
        isSmaller = true;
      } else if (unit === 'pt' && num < 13.5) {
        isSmaller = true;
      } else if ((unit === 'rem' || unit === 'em') && num < 1.125) {
        isSmaller = true;
      } else if (unit === '%' && num < 112.5) {
        isSmaller = true;
      } else if (num > 0 && num < 18) {
        isSmaller = true;
      }

      if (isSmaller) {
        return `font-size: 18px${semi || ''}`;
      }
    }

    return fullMatch;
  });

  return result;
};

/**
 * Traverses DOM tree and upgrades any element whose inline style.fontSize is smaller than 18px.
 */
const sanitizeElementFontSizes = (root: HTMLElement) => {
  const elements = root.querySelectorAll<HTMLElement>('*');
  elements.forEach((el) => {
    if (el.style && el.style.fontSize) {
      const fs = el.style.fontSize.trim().toLowerCase().replace(/\s*!important/i, '');
      const num = parseFloat(fs);
      let isSmaller = false;

      if (['xx-small', 'x-small', 'small', 'smaller', 'medium'].includes(fs)) {
        isSmaller = true;
      } else if (fs.includes('px') && num < 18) {
        isSmaller = true;
      } else if (fs.includes('pt') && num < 13.5) {
        isSmaller = true;
      } else if ((fs.includes('rem') || fs.includes('em')) && num < 1.125) {
        isSmaller = true;
      } else if (fs.includes('%') && num < 112.5) {
        isSmaller = true;
      } else if (num > 0 && num < 18) {
        isSmaller = true;
      }

      if (isSmaller) {
        el.style.fontSize = '18px';
      }
    }

    if (el.tagName === 'SMALL') {
      el.style.fontSize = '18px';
    }

    if (el.tagName === 'FONT' && el.getAttribute('size')) {
      const s = parseInt(el.getAttribute('size') || '3', 10);
      if (s <= 3) {
        el.removeAttribute('size');
        el.style.fontSize = '18px';
      }
    }
  });
};

const RichTextEditor = ({ content, onChange, placeholder }: RichTextEditorProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const editorRef = useRef<any>(null);

  // Monitor DOM directly for any pasted/inserted content
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let isSanitizing = false;
    const runSanitize = () => {
      if (isSanitizing) return;
      const editable = container.querySelector<HTMLElement>('.sun-editor-editable');
      if (!editable) return;
      isSanitizing = true;
      try {
        sanitizeElementFontSizes(editable);
      } finally {
        setTimeout(() => {
          isSanitizing = false;
        }, 50);
      }
    };

    const handlePasteEvent = () => {
      setTimeout(runSanitize, 0);
      setTimeout(runSanitize, 100);
    };

    container.addEventListener('paste', handlePasteEvent, true);
    container.addEventListener('drop', handlePasteEvent, true);

    const observer = new MutationObserver(() => {
      runSanitize();
    });

    observer.observe(container, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['style', 'size']
    });

    return () => {
      container.removeEventListener('paste', handlePasteEvent, true);
      container.removeEventListener('drop', handlePasteEvent, true);
      observer.disconnect();
    };
  }, []);

  const handlePaste = (_e: any, cleanData: string) => {
    return enforceMinFontSize18(cleanData);
  };

  const handleChange = (html: string) => {
    // 1. Enforce minimum font size of 18 on all typed or pasted content
    let modifiedHtml = enforceMinFontSize18(html);

    // 2. If SunEditor mistakenly wrapped the Google Drive link in a <video> tag, convert the whole tag to an <iframe>
    modifiedHtml = modifiedHtml.replace(
      /<video[^>]*src="https:\/\/drive\.google\.com\/file\/d\/([a-zA-Z0-9_-]+)\/(?:view|edit|preview)[^"]*"[^>]*>[\s\S]*?<\/video>/gi,
      '<iframe src="https://drive.google.com/file/d/$1/preview" allow="autoplay; fullscreen" allowfullscreen="true" frameborder="0" style="width: 100%; height: 400px; border: none; border-radius: 8px;"></iframe>'
    );
    
    // 3. If it's already an <iframe> but still has /view or /edit, change it to /preview
    modifiedHtml = modifiedHtml.replace(
      /<iframe([^>]*src="https:\/\/drive\.google\.com\/file\/d\/[a-zA-Z0-9_-]+)\/(?:view|edit)([^"]*"[^>]*)>/gi,
      '<iframe$1/preview$2>'
    );

    onChange(modifiedHtml);
  };

  return (
    <div ref={containerRef} className="rich-text-editor-container">
      <SunEditorComponent
        getSunEditorInstance={(inst: any) => {
          editorRef.current = inst;
          if (inst && inst.core && inst.core.context && inst.core.context.element) {
            const wysiwyg = inst.core.context.element.wysiwyg;
            if (wysiwyg) {
              sanitizeElementFontSizes(wysiwyg);
            }
          }
        }}
        setContents={content}
        onChange={handleChange}
        onPaste={handlePaste as any}
        placeholder={placeholder}
        setOptions={{
          buttonList: [
            ['undo', 'redo'],
            ['font', 'fontSize', 'formatBlock'],
            ['bold', 'underline', 'italic', 'strike', 'subscript', 'superscript', 'removeFormat'],
            ['fontColor', 'hiliteColor'],
            ['align', 'list', 'outdent', 'indent', 'lineHeight'],
            ['table', 'link', 'image', 'video'],
            ['fullScreen', 'codeView']
          ],
          font: [
            'Barlow',
            'Arial', 'Comic Sans MS', 'Courier New', 'Impact',
            'Georgia', 'Tahoma', 'Trebuchet MS', 'Verdana'
          ],
          defaultFont: 'Barlow',
          fontSize: [18, 20, 22, 24, 28, 32, 36, 48, 64, 72],
          fontSizeUnit: 'px',
          defaultStyle: "font-family: 'Barlow', sans-serif; font-size: 18px; color: var(--color-text);",
          minHeight: '400px',
        }}
      />
    </div>
  );
};

export default RichTextEditor;
