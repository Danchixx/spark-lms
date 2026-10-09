import SunEditor from 'suneditor-react';
import 'suneditor/dist/css/suneditor.min.css';
import './RichTextEditor.css';

type RichTextEditorProps = {
  content: string;
  onChange: (html: string) => void;
  placeholder?: string;
};



const SunEditorComponent = (SunEditor as any).default || SunEditor;

const RichTextEditor = ({ content, onChange, placeholder }: RichTextEditorProps) => {

  const handleChange = (html: string) => {
    // 1. If SunEditor mistakenly wrapped the Google Drive link in a <video> tag, convert the whole tag to an <iframe>
    let modifiedHtml = html.replace(
      /<video[^>]*src="https:\/\/drive\.google\.com\/file\/d\/([a-zA-Z0-9_-]+)\/(?:view|edit|preview)[^"]*"[^>]*>[\s\S]*?<\/video>/gi,
      '<iframe src="https://drive.google.com/file/d/$1/preview" allow="autoplay; fullscreen" allowfullscreen="true" frameborder="0" style="width: 100%; height: 400px; border: none; border-radius: 8px;"></iframe>'
    );
    
    // 2. If it's already an <iframe> but still has /view or /edit, change it to /preview
    modifiedHtml = modifiedHtml.replace(
      /<iframe([^>]*src="https:\/\/drive\.google\.com\/file\/d\/[a-zA-Z0-9_-]+)\/(?:view|edit)([^"]*"[^>]*)>/gi,
      '<iframe$1/preview$2>'
    );

    onChange(modifiedHtml);
  };

  return (
    <div className="rich-text-editor-container">
      <SunEditorComponent
        setContents={content}
        onChange={handleChange}
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
            'Arial', 'Comic Sans MS', 'Courier New', 'Impact',
            'Georgia','Tahoma', 'Trebuchet MS', 'Verdana'
          ],
          defaultStyle: "font-family: 'Barlow', sans-serif; font-size: 15px; color: var(--color-text);",
          minHeight: '400px',
        }}
      />
    </div>
  );
};

export default RichTextEditor;
