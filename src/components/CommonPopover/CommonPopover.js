import Popover from "@mui/material/Popover";
import Box from "@mui/material/Box";

// Mirrors main-app's @fuse/default-settings globalRadius.popover = 8,
// inlined here so this package has no dependency on main-app's internal
// design-token module - see FilterChip.js for the same rationale.
const POPOVER_RADIUS = 8;

// Generic anchored popover wrapper - a thin, controlled shell around MUI's
// Popover so feature components (EmojiPicker, VisibilitySelector, post/
// comment "more" menus) don't each re-implement anchorOrigin/paper styling.
function CommonPopover({
  anchorEl,
  open,
  onClose,
  children,
  width,
  anchorOrigin = { vertical: "bottom", horizontal: "left" },
  transformOrigin,
}) {
  return (
    <Popover
      open={open}
      anchorEl={anchorEl}
      onClose={onClose}
      anchorOrigin={anchorOrigin}
      transformOrigin={transformOrigin}
      slotProps={{
        paper: { sx: { borderRadius: `${POPOVER_RADIUS}px`, mt: "4px" } },
      }}
    >
      <Box sx={{ p: "12px", width }}>{children}</Box>
    </Popover>
  );
}

export default CommonPopover;
