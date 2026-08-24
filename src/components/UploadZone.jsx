import { useRef, useState } from "react";
import { FileUp, PenLine } from "lucide-react";
import { ACCEPT_ATTR } from "../utils/fileValidators";

export default function UploadZone({ onFiles, disabled }) {
  const inputRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleFiles = (fileList) => {
    if (!fileList || fileList.length === 0) return;
    onFiles(fileList);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (disabled) return;
    handleFiles(e.dataTransfer.files);
  };

  const handleKeyDown = (e) => {
    if (disabled) return;
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      inputRef.current?.click();
    }
  };

  return (
    <div
      role="button"
      tabIndex={disabled ? -1 : 0}
      aria-disabled={disabled}
      aria-label="Upload a post as PDF or image"
      onKeyDown={handleKeyDown}
      onClick={() => !disabled && inputRef.current?.click()}
      onDragOver={(e) => {
        e.preventDefault();
        if (!disabled) setIsDragging(true);
      }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={handleDrop}
      className={`
        relative rounded-lg border-2 border-dashed p-10 sm:p-16 text-center
        transition-colors duration-150 cursor-pointer select-none
        ${disabled ? "opacity-50 cursor-not-allowed" : ""}
        ${isDragging ? "border-highlighter bg-ink-softer" : "border-sage-dim/60 bg-card hover:border-sage"}
      `}
    >
      <input
        ref={inputRef}
        type="file"
        multiple
        accept={ACCEPT_ATTR}
        className="sr-only"
        disabled={disabled}
        onChange={(e) => {
          handleFiles(e.target.files);
          e.target.value = "";
        }}
      />

      <div className="flex flex-col items-center gap-4">
        <div className="relative">
          <FileUp
            size={36}
            strokeWidth={1.5}
            className={isDragging ? "text-highlighter" : "text-sage"}
          />
          <PenLine
            size={16}
            strokeWidth={2}
            className="absolute -bottom-1 -right-2 text-pen"
          />
        </div>
        <div>
          <p className="font-display text-xl sm:text-2xl text-cream">
            Drop a post on the desk
          </p>
          <p className="font-sans text-sm text-cream-dim mt-1.5">
            PDF, PNG, JPG, or WEBP — up to 20MB. Drop several at once to compare.
          </p>
        </div>
        <span className="font-mono text-xs uppercase tracking-wider text-accent bg-accent-soft px-3 py-1.5 rounded border border-accent/20">
          Browse files
        </span>
      </div>
    </div>
  );
}
