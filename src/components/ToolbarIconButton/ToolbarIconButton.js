import IconButton from "@mui/material/IconButton";
import { alpha } from "@mui/material/styles";

// Compact, theme-driven icon button shared by every toolbar-style control
// (RichTextFormattingToolbar, VisibilitySelector, ...) so they all read as
// one consistent design system. Colors are never hardcoded - text.secondary/
// action.hover/primary.main - so this tracks main-app's real theme (light
// and dark) automatically. Active state is a light primary-tinted fill (12%
// alpha), not a solid color, to stay subtle.
//
// Sizing (size/iconSize) defaults to 28px/18px, the toolbar's compact
// design-spec standard, but is overridable per call site (e.g. Composer's
// bottom action row uses 24px/18px to match its own surrounding buttons).
// The icon-sizing rule only targets *direct* svg children ("& > svg") so a
// consumer that wraps multiple icons in an inner Box (e.g. an icon plus a
// small dropdown caret) can size each independently instead of having both
// forced to the same size.
function ToolbarIconButton({ active, onClick, disabled, children, size = 28, iconSize = 18, ...rest }) {
  return (
    <IconButton
      disableRipple
      size="small"
      onClick={onClick}
      disabled={disabled}
      sx={(theme) => ({
        width: `${size}px`,
        height: `${size}px`,
        padding: 0,
        borderRadius: "6px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: active ? theme.palette.primary.main : theme.palette.text.secondary,
        bgcolor: active ? alpha(theme.palette.primary.main, 0.12) : "transparent",
        "&:hover": { bgcolor: theme.palette.action.hover },
        "&.Mui-disabled": { color: theme.palette.action.disabled },
        "& > svg": { fontSize: `${iconSize}px` },
      })}
      {...rest}
    >
      {children}
    </IconButton>
  );
}

export default ToolbarIconButton;
