import { useState } from "react";
import Chip from "@mui/material/Chip";
import Popover from "@mui/material/Popover";
import Box from "@mui/material/Box";
import Tooltip from "@mui/material/Tooltip";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";

// Pixel values below mirror main-app's @fuse/default-settings
// (globalRadius.chip = 16, globalRadius.popover = 8), inlined here so this
// package has no dependency on main-app's internal design-token module -
// other consumers (micro-frontends) won't necessarily have @fuse/* at all.
const CHIP_RADIUS = 16;
const POPOVER_RADIUS = 8;

// Shared look for every compact chip in a FilterBar.
export const filterChipSx = {
  borderRadius: `${CHIP_RADIUS}px`,
  height: 30,
  fontSize: 13,
  color: "text.secondary",
  borderColor: "divider",
  bgcolor: "background.paper",
  "& .MuiChip-label": { px: "10px" },
};

function FilterChip({
  label,
  count = 0,
  displayLabel,
  width = 260,
  children,
  onClear,
}) {
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);

  const openPopover = (event) => setAnchorEl(event.currentTarget);
  const closePopover = () => setAnchorEl(null);

  const chipLabel = displayLabel ?? (count > 0 ? `${label} (${count})` : label);
  const showClear = count > 0 && typeof onClear === "function";

  const handleClear = (event) => {
    event.stopPropagation();
    onClear();
  };

  const handleClearKeyDown = (event) => {
    if (event.key === "Enter" || event.key === " ") {
      event.stopPropagation();
      event.preventDefault();
      onClear();
    }
  };

  return (
    <>
      <Chip
        label={
          showClear ? (
            <Box sx={{ display: "flex", alignItems: "center", gap: "2px" }}>
              <Box component="span">{chipLabel}</Box>
              <Tooltip title="Clear filter">
                <Box
                  component="span"
                  role="button"
                  tabIndex={0}
                  aria-label="Clear filter"
                  onClick={handleClear}
                  onKeyDown={handleClearKeyDown}
                  sx={{
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    width: 18,
                    height: 18,
                    borderRadius: "50%",
                    color: "text.secondary",
                    cursor: "pointer",
                    "&:hover": {
                      bgcolor: "action.hover",
                      color: "text.primary",
                    },
                  }}
                >
                  <CloseRoundedIcon sx={{ fontSize: 13 }} />
                </Box>
              </Tooltip>
            </Box>
          ) : (
            chipLabel
          )
        }
        onClick={openPopover}
        onDelete={openPopover}
        deleteIcon={<KeyboardArrowDownIcon fontSize="small" />}
        variant="outlined"
        size="small"
        sx={filterChipSx}
      />
      <Popover
        open={open}
        anchorEl={anchorEl}
        onClose={closePopover}
        anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
        slotProps={{
          paper: {
            sx: { borderRadius: `${POPOVER_RADIUS}px`, mt: "4px" },
          },
        }}
      >
        <Box sx={{ p: "12px", width }}>{children}</Box>
      </Popover>
    </>
  );
}

export default FilterChip;
