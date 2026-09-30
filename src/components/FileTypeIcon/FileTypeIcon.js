import Box from "@mui/material/Box";
import { useTheme } from "@mui/material/styles";
import ShortcutIcon from "@mui/icons-material/Shortcut";
import InsertDriveFileOutlinedIcon from "@mui/icons-material/InsertDriveFileOutlined";
import FolderOutlinedIcon from "@mui/icons-material/FolderOutlined";
import FolderSpecialOutlinedIcon from "@mui/icons-material/FolderSpecialOutlined";
import { getFileTypeConfig } from "./fileTypeConfig";

/**
 * Outline-style file/folder icon using theme primary color. Originally
 * file-management-mf's FileDocumentIcon (which now re-exports this).
 *
 * Files  : InsertDriveFileOutlined (document outline) + file-type icon inside, both in primaryColor.
 * Folders: FolderOutlined / FolderSpecialOutlined in primaryColor.
 * Shortcuts: white circle badge with curved arrow at bottom-left.
 */
function FileTypeIcon({
  name,
  type,
  isSystem = false,
  size = 52,
  primaryColor,
  isShortcut = false,
}) {
  const theme = useTheme();
  const { Icon: TypeIcon, isFolder } = getFileTypeConfig(name, type, isSystem);
  const color =
    primaryColor || theme.palette.icon?.main || theme.palette.action.active;

  const badgeDim = Math.round(size * 0.65);
  const badgeIconSz = Math.round(size * 0.4);

  // Centered at the bottom-left quadrant intersection (25% from left, 75% from top)
  const shortcutBadge = isShortcut ? (
    <Box
      sx={{
        position: "absolute",
        top: "75%",
        left: "25%",
        transform: "translate(-50%, -50%)",
        bgcolor: "background.paper",
        borderRadius: "50%",
        width: badgeDim,
        height: badgeDim,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        boxShadow: "0 2px 6px rgba(0,0,0,0.22)",
        zIndex: 1,
      }}
    >
      <ShortcutIcon sx={{ fontSize: badgeIconSz, color }} />
    </Box>
  ) : null;

  // ── Folder ────────────────────────────────────────────────────────────────
  if (isFolder) {
    const FolderIcon = isSystem ? FolderSpecialOutlinedIcon : FolderOutlinedIcon;
    return (
      <Box sx={{ position: "relative", display: "inline-flex", lineHeight: 0 }}>
        <FolderIcon sx={{ fontSize: Math.round(size * 1.3), color }} />
        {shortcutBadge}
      </Box>
    );
  }

  // ── File: outlined document base + type icon inside ───────────────────────
  const docSize = Math.round(size * 1.3);
  const typeIconSz = Math.round(size * 0.52);

  return (
    <Box
      sx={{
        position: "relative",
        display: "inline-flex",
        lineHeight: 0,
        flexShrink: 0,
        width: docSize,
        height: docSize,
      }}
    >
      {/* Outlined document shape */}
      <InsertDriveFileOutlinedIcon sx={{ fontSize: docSize, color }} />

      {/* Type icon centered inside the document body */}
      <Box
        sx={{
          position: "absolute",
          inset: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          pt: `${Math.round(docSize * 0.15)}px`,
          pointerEvents: "none",
        }}
      >
        <TypeIcon sx={{ fontSize: typeIconSz, color, opacity: 0.75 }} />
      </Box>

      {shortcutBadge}
    </Box>
  );
}

export default FileTypeIcon;
