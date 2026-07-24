import MuiAvatar from "@mui/material/Avatar";

// A small deterministic palette so the same name always resolves to the
// same color across renders/sessions without needing a server-assigned one.
const PALETTE = [
  "#1565C0", "#2E7D32", "#C62828", "#6A1B9A",
  "#EF6C00", "#00838F", "#AD1457", "#4527A0",
];

const SIZE_PX = { sm: 24, md: 32, lg: 40 };

function hashString(value) {
  let hash = 0;
  for (let i = 0; i < value.length; i += 1) {
    hash = (hash << 5) - hash + value.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

function initialsFromName(name = "") {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
}

function colorFromName(name = "") {
  return PALETTE[hashString(name) % PALETTE.length];
}

// Wraps MUI's Avatar with an initials-from-name fallback and a color
// deterministically derived from the name, so callers never need to pass an
// explicit bgcolor just to get consistent per-user colors.
function Avatar({ name, src, size = "md", sx, ...rest }) {
  const px = SIZE_PX[size] || SIZE_PX.md;
  return (
    <MuiAvatar
      src={src}
      sx={{
        width: px,
        height: px,
        fontSize: px * 0.4,
        bgcolor: src ? undefined : colorFromName(name),
        ...sx,
      }}
      {...rest}
    >
      {!src && initialsFromName(name)}
    </MuiAvatar>
  );
}

export default Avatar;
export { initialsFromName, colorFromName };
