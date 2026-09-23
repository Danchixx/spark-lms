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
  return (
    <div className="rich-text-editor-container">
      <SunEditorComponent
        setContents={content}
        onChange={onChange}
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
          defaultStyle: "font-family: 'Barlow', sans-serif; font-size: 15px; color: #1a1a1a;",
          minHeight: '400px',
        }}
      />
    </div>
  );
};

export default RichTextEditor;
