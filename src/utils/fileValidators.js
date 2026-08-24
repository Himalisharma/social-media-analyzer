// Validation for uploaded files. Every rejection carries a specific,
// user-facing reason — never a generic "invalid file".

export const MAX_FILE_BYTES = 20 * 1024 * 1024; // 20MB

export const ACCEPTED_TYPES = {
  "application/pdf": "PDF",
  "image/png": "PNG",
  "image/jpeg": "JPEG",
  "image/webp": "WEBP",
};

export const ACCEPT_ATTR = ".pdf,.png,.jpg,.jpeg,.webp,application/pdf,image/png,image/jpeg,image/webp";

function formatBytes(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function extensionOf(name) {
  const parts = name.split(".");
  return parts.length > 1 ? parts.pop().toLowerCase() : "";
}

const EXT_TO_TYPE = {
  pdf: "application/pdf",
  png: "image/png",
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  webp: "image/webp",
};

/**
 * Validate a single File object before it enters the processing pipeline.
 * Returns { ok: true, type } or { ok: false, reason }.
 */
export function validateFile(file) {
  if (!file) {
    return { ok: false, reason: "No file was received. Choose a file and try again." };
  }

  if (file.size === 0) {
    return {
      ok: false,
      reason: `"${file.name}" is empty (0 bytes). Choose a file that actually contains content.`,
    };
  }

  if (file.size > MAX_FILE_BYTES) {
    return {
      ok: false,
      reason: `"${file.name}" is ${formatBytes(file.size)} — over the 20 MB limit. Compress it or upload a smaller file.`,
    };
  }

  let type = file.type;
  if (!type || !ACCEPTED_TYPES[type]) {
    const ext = extensionOf(file.name);
    type = EXT_TO_TYPE[ext];
  }

  if (!type || !ACCEPTED_TYPES[type]) {
    const ext = extensionOf(file.name) || "unknown";
    return {
      ok: false,
      reason: `"${file.name}" is a .${ext} file. Margin reads PDF, PNG, JPG, and WEBP — convert or re-export it as one of those.`,
    };
  }

  return { ok: true, type };
}

export function validateFiles(fileList) {
  const files = Array.from(fileList);
  return files.map((file) => ({ file, result: validateFile(file) }));
}
