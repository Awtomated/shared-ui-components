// Same formatting file-management-mf's fileValidation.formatFileSize uses
// for the attachment rows, so sizes read identically after the move.
export const formatFileSize = (bytes) => {
  const num = Number(bytes);
  if (!bytes || Number.isNaN(num) || num === 0) return "-";
  if (num < 1024) return `${num} B`;
  if (num < 1024 * 1024) return `${(num / 1024).toFixed(1)} KB`;
  if (num < 1024 * 1024 * 1024) return `${(num / (1024 * 1024)).toFixed(1)} MB`;
  return `${(num / (1024 * 1024 * 1024)).toFixed(2)} GB`;
};
