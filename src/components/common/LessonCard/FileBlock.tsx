import { useEffect, useRef, useState } from "react";
import {
  UploadCloud, FileText, FileSpreadsheet, Presentation, File as FileIcon,
  Download, Eye, EyeOff, RefreshCw, Trash2, Loader2, Lock,
} from "lucide-react";
import * as courseService from "../../../services/courseCreatorService";
import type { LessonFileMeta } from "../../../services/courseCreatorService";

// ─── Block shape (stored inside lesson.content JSON) ─────────
export type FileBlockData = {
  id: string;
  type: "file";
  file: LessonFileMeta | null;
  caption?: string;
  allowDownload: boolean;
};

export const createEmptyFileBlock = (): FileBlockData => ({
  id: Date.now().toString(),
  type: "file",
  file: null,
  caption: "",
  allowDownload: true,
});

// ─── Helpers ────────────────────────────────────────────────
const ACCENT = "#FF6B00";

const getExt = (name = "") => (name.split(".").pop() || "").toLowerCase();

const formatSize = (bytes = 0) => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

const fileKind = (name = "") => {
  const ext = getExt(name);
  if (ext === "pdf") return { label: "PDF", color: "#E5484D", Icon: FileText };
  if (ext === "doc" || ext === "docx") return { label: "Word", color: "#2B6CEE", Icon: FileText };
  if (ext === "xls" || ext === "xlsx") return { label: "Excel", color: "#1F9D55", Icon: FileSpreadsheet };
  if (ext === "ppt" || ext === "pptx") return { label: "PowerPoint", color: "#D9622B", Icon: Presentation };
  return { label: ext.toUpperCase() || "File", color: "#64748b", Icon: FileIcon };
};

const isOfficeFile = (name = "") => ["doc", "docx", "xls", "xlsx", "ppt", "pptx"].includes(getExt(name));

const FileBadge = ({ name }: { name: string }) => {
  const { color, Icon, label } = fileKind(name);
  return (
    <div style={{
      width: 48, height: 48, borderRadius: 12, flexShrink: 0,
      background: `${color}1A`, color, display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center", gap: 1,
    }}>
      <Icon size={20} />
      <span style={{ fontSize: 8, fontWeight: 800, letterSpacing: 0.5 }}>{label.toUpperCase().slice(0, 4)}</span>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────
// Creator-side editor
// ─────────────────────────────────────────────────────────────
type EditorProps = {
  block: FileBlockData;
  onChange: (block: FileBlockData) => void;
  companyId: number | string;
  courseId: number | string;
  lessonId: number | string;
};

export function FileBlockEditor({ block, onChange, companyId, courseId, lessonId }: EditorProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFile = async (file?: File | null) => {
    if (!file) return;
    setError(null);
    setUploading(true);
    try {
      const meta = await courseService.uploadLessonFile(file, companyId, courseId, lessonId);
      // Clean up the file being replaced (best-effort)
      if (block.file?.path) courseService.deleteLessonFile(block.file.path).catch(() => {});
      onChange({ ...block, file: meta });
    } catch (err: any) {
      setError(err?.message || "Upload failed.");
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  const handleRemove = () => {
    if (block.file?.path) courseService.deleteLessonFile(block.file.path).catch(() => {});
    onChange({ ...block, file: null });
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <input
        ref={inputRef}
        type="file"
        accept={courseService.LESSON_FILE_ACCEPT}
        style={{ display: "none" }}
        onChange={(e) => handleFile(e.target.files?.[0])}
      />

      {!block.file ? (
        /* ── Drop zone ── */
        <div
          role="button"
          tabIndex={0}
          onClick={() => !uploading && inputRef.current?.click()}
          onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") inputRef.current?.click(); }}
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={(e) => { e.preventDefault(); setDragOver(false); handleFile(e.dataTransfer.files?.[0]); }}
          style={{
            border: `2px dashed ${dragOver ? ACCENT : "var(--color-border)"}`,
            background: dragOver ? "rgba(255,107,0,0.06)" : "var(--color-bg)",
            borderRadius: 12, padding: "32px 20px", textAlign: "center",
            cursor: uploading ? "wait" : "pointer", transition: "all .2s ease",
            display: "flex", flexDirection: "column", alignItems: "center", gap: 10,
          }}
        >
          {uploading ? (
            <Loader2 size={30} color={ACCENT} className="animate-spin" />
          ) : (
            <div style={{
              width: 52, height: 52, borderRadius: "50%", background: "rgba(255,107,0,0.12)",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <UploadCloud size={26} color={ACCENT} />
            </div>
          )}
          <div style={{ fontWeight: 700, fontSize: 14, color: "var(--color-text-header)" }}>
            {uploading ? "Uploading…" : <>Drag & drop a file, or <span style={{ color: ACCENT }}>browse</span></>}
          </div>
          <div style={{ fontSize: 12, color: "var(--color-text-muted)" }}>
            PDF, Word, Excel, PowerPoint · up to 25 MB
          </div>
        </div>
      ) : (
        /* ── Uploaded file card ── */
        <div style={{
          display: "flex", alignItems: "center", gap: 14, padding: 14,
          border: "1px solid var(--color-border)", borderRadius: 12, background: "var(--color-bg)",
        }}>
          <FileBadge name={block.file.name} />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{
              fontWeight: 700, fontSize: 14, color: "var(--color-text-header)",
              whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
            }}>
              {block.file.name}
            </div>
            <div style={{ fontSize: 12, color: "var(--color-text-muted)", marginTop: 2 }}>
              {fileKind(block.file.name).label} · {formatSize(block.file.size)}
            </div>
          </div>
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={uploading}
            title="Replace file"
            style={iconBtn}
          >
            {uploading ? <Loader2 size={15} className="animate-spin" /> : <RefreshCw size={15} />}
          </button>
          <button type="button" onClick={handleRemove} title="Remove file" style={{ ...iconBtn, color: "#ef4444" }}>
            <Trash2 size={15} />
          </button>
        </div>
      )}

      {error && <div style={{ fontSize: 12, color: "#ef4444", fontWeight: 600 }}>{error}</div>}

      {/* Caption */}
      <input
        className="editor-question-input"
        value={block.caption || ""}
        onChange={(e) => onChange({ ...block, caption: e.target.value })}
        placeholder="Optional caption or instructions for learners…"
      />

      {/* Download permission toggle */}
      <label style={{
        display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12,
        padding: "12px 14px", borderRadius: 10, border: "1px solid var(--color-border)",
        background: "var(--color-bg)", cursor: "pointer",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          {block.allowDownload ? <Download size={16} color={ACCENT} /> : <Lock size={16} color="var(--color-text-muted)" />}
          <div>
            <div style={{ fontSize: 13, fontWeight: 700, color: "var(--color-text-header)" }}>
              Allow learners to download
            </div>
            <div style={{ fontSize: 11.5, color: "var(--color-text-muted)" }}>
              {block.allowDownload
                ? "Learners can view and download this file."
                : "Learners can only view this file inside the lesson."}
            </div>
          </div>
        </div>
        <span
          role="switch"
          aria-checked={block.allowDownload}
          onClick={(e) => { e.preventDefault(); onChange({ ...block, allowDownload: !block.allowDownload }); }}
          style={{
            width: 40, height: 22, borderRadius: 999, flexShrink: 0, position: "relative",
            background: block.allowDownload ? ACCENT : "var(--color-border)", transition: "background .2s",
          }}
        >
          <span style={{
            position: "absolute", top: 3, left: block.allowDownload ? 21 : 3,
            width: 16, height: 16, borderRadius: "50%", background: "#fff",
            boxShadow: "0 1px 3px rgba(0,0,0,.25)", transition: "left .2s",
          }} />
        </span>
      </label>
    </div>
  );
}

const iconBtn: React.CSSProperties = {
  width: 34, height: 34, borderRadius: 8, border: "1px solid var(--color-border)",
  background: "var(--color-surface)", color: "var(--color-text)", cursor: "pointer",
  display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
};

// ─────────────────────────────────────────────────────────────
// Learner-side viewer
// ─────────────────────────────────────────────────────────────
export function FileBlockViewer({ block }: { block: FileBlockData }) {
  const [showPreview, setShowPreview] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [loadingPreview, setLoadingPreview] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const file = block.file;

  useEffect(() => {
    if (!showPreview || previewUrl || !file) return;
    setLoadingPreview(true);
    courseService.getLessonFileUrl(file.path)
      .then(setPreviewUrl)
      .catch((e) => setError(e?.message || "Could not load preview."))
      .finally(() => setLoadingPreview(false));
  }, [showPreview, previewUrl, file]);

  if (!file) return null;

  const handleDownload = async () => {
    if (!block.allowDownload) return;
    setDownloading(true);
    setError(null);
    try {
      const url = await courseService.getLessonFileUrl(file.path, file.name);
      const a = document.createElement("a");
      a.href = url;
      a.download = file.name;
      document.body.appendChild(a);
      a.click();
      a.remove();
    } catch (e: any) {
      setError(e?.message || "Download failed.");
    } finally {
      setDownloading(false);
    }
  };

  const ext = getExt(file.name);
  const frameSrc = previewUrl
    ? isOfficeFile(file.name)
      ? `https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(previewUrl)}`
      : ext === "pdf"
        ? `${previewUrl}#toolbar=${block.allowDownload ? 1 : 0}&navpanes=0`
        : previewUrl
    : null;

  return (
    <div style={{
      border: "1px solid var(--color-border)", borderRadius: 12,
      background: "var(--color-surface)", overflow: "hidden",
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 14, padding: 16, flexWrap: "wrap" }}>
        <FileBadge name={file.name} />
        <div style={{ flex: 1, minWidth: 160 }}>
          <div style={{
            fontWeight: 700, fontSize: 15, color: "var(--color-text-header)",
            whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
          }}>
            {file.name}
          </div>
          <div style={{ fontSize: 12, color: "var(--color-text-muted)", marginTop: 2, display: "flex", alignItems: "center", gap: 6 }}>
            {fileKind(file.name).label} · {formatSize(file.size)}
            {!block.allowDownload && (
              <span style={{ display: "inline-flex", alignItems: "center", gap: 4, marginLeft: 4 }}>
                <Lock size={11} /> View only
              </span>
            )}
          </div>
        </div>

        <div style={{ display: "flex", gap: 8 }}>
          <button type="button" onClick={() => setShowPreview((v) => !v)} style={pillBtn(false)}>
            {showPreview ? <EyeOff size={15} /> : <Eye size={15} />}
            {showPreview ? "Hide" : "Preview"}
          </button>
          {block.allowDownload && (
            <button type="button" onClick={handleDownload} disabled={downloading} style={pillBtn(true)}>
              {downloading ? <Loader2 size={15} className="animate-spin" /> : <Download size={15} />}
              Download
            </button>
          )}
        </div>
      </div>

      {block.caption && (
        <div style={{ padding: "0 16px 14px", fontSize: 13.5, color: "var(--color-text)", lineHeight: 1.5 }}>
          {block.caption}
        </div>
      )}

      {error && <div style={{ padding: "0 16px 14px", fontSize: 12, color: "#ef4444", fontWeight: 600 }}>{error}</div>}

      {showPreview && (
        <div
          style={{ borderTop: "1px solid var(--color-border)", background: "var(--color-bg)", height: 560, position: "relative" }}
          onContextMenu={block.allowDownload ? undefined : (e) => e.preventDefault()}
        >
          {loadingPreview || !frameSrc ? (
            <div style={{ height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Loader2 size={28} color={ACCENT} className="animate-spin" />
            </div>
          ) : (
            <iframe
              src={frameSrc}
              title={file.name}
              style={{ width: "100%", height: "100%", border: "none" }}
            />
          )}
        </div>
      )}
    </div>
  );
}

const pillBtn = (primary: boolean): React.CSSProperties => ({
  display: "inline-flex", alignItems: "center", gap: 6,
  padding: "8px 16px", borderRadius: 999, fontSize: 13, fontWeight: 700, cursor: "pointer",
  border: primary ? "none" : "1px solid var(--color-border)",
  background: primary ? ACCENT : "var(--color-surface)",
  color: primary ? "#fff" : "var(--color-text)",
  fontFamily: "inherit",
});
