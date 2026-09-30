import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";
import ArticleIcon from "@mui/icons-material/Article";
import TableChartIcon from "@mui/icons-material/TableChart";
import SlideshowIcon from "@mui/icons-material/Slideshow";
import ImageIcon from "@mui/icons-material/Image";
import MovieIcon from "@mui/icons-material/Movie";
import MusicNoteIcon from "@mui/icons-material/MusicNote";
import ArchiveIcon from "@mui/icons-material/Archive";
import FolderOpenIcon from "@mui/icons-material/FolderOpen";
import FolderSpecialOutlinedIcon from "@mui/icons-material/FolderSpecialOutlined";
import InsertDriveFileIcon from "@mui/icons-material/InsertDriveFile";

// Originally file-management-mf's utils/fileTypeConfig.js - centralized here
// alongside FileTypeIcon so DriveAttachment (and drive-mf's own grid/list
// views, which now re-export this) resolve file-type icons from one table.
const EXT_MAP = {
  // Documents
  pdf: { Icon: PictureAsPdfIcon },
  doc: { Icon: ArticleIcon },
  docx: { Icon: ArticleIcon },
  txt: { Icon: ArticleIcon },
  rtf: { Icon: ArticleIcon },
  // Spreadsheets
  xls: { Icon: TableChartIcon },
  xlsx: { Icon: TableChartIcon },
  csv: { Icon: TableChartIcon },
  // Presentations
  ppt: { Icon: SlideshowIcon },
  pptx: { Icon: SlideshowIcon },
  // Images
  png: { Icon: ImageIcon },
  jpg: { Icon: ImageIcon },
  jpeg: { Icon: ImageIcon },
  gif: { Icon: ImageIcon },
  webp: { Icon: ImageIcon },
  svg: { Icon: ImageIcon },
  bmp: { Icon: ImageIcon },
  // Video
  mp4: { Icon: MovieIcon },
  mov: { Icon: MovieIcon },
  avi: { Icon: MovieIcon },
  mkv: { Icon: MovieIcon },
  wmv: { Icon: MovieIcon },
  // Audio
  mp3: { Icon: MusicNoteIcon },
  wav: { Icon: MusicNoteIcon },
  flac: { Icon: MusicNoteIcon },
  aac: { Icon: MusicNoteIcon },
  // Archives
  zip: { Icon: ArchiveIcon },
  rar: { Icon: ArchiveIcon },
  "7z": { Icon: ArchiveIcon },
  tar: { Icon: ArchiveIcon },
  gz: { Icon: ArchiveIcon },
};

/**
 * Returns { Icon, color, isFolder } for a given file item.
 * color is null for folders — the caller should substitute their theme primaryMain.
 */
export function getFileTypeConfig(name, type, isSystem = false) {
  if (type === "folder") {
    return {
      Icon: isSystem ? FolderSpecialOutlinedIcon : FolderOpenIcon,
      color: null,
      isFolder: true,
    };
  }
  const ext = name?.split(".").pop()?.toLowerCase() ?? "";
  const match = EXT_MAP[ext];
  return {
    Icon: match?.Icon ?? InsertDriveFileIcon,
    isFolder: false,
  };
}
