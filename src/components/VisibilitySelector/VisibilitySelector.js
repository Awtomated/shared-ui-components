import { useState } from "react";
import Box from "@mui/material/Box";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import ListItemText from "@mui/material/ListItemText";
import CheckIcon from "@mui/icons-material/Check";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import ToolbarIconButton from "../ToolbarIconButton/ToolbarIconButton";

/**
 * Compact "who can see this" control for a toolbar - generic and
 * independent of whichever module renders it (Notes, Spaces, Comments,
 * Documents, Knowledge Base, ...). The toolbar itself only ever shows an
 * eye icon plus a small dropdown caret; the selected option's label only
 * appears inside the opened menu (next to a checkmark), so this control
 * never grows the toolbar's width the way a labeled button would.
 *
 * `options` is `[{ value, label }]` - deliberately not baked in here, since
 * "who can see this" semantics differ per module (Notes' team/private/
 * public isn't necessarily Documents' or a Knowledge Base's set).
 *
 * size/iconSize forward straight to ToolbarIconButton so this matches
 * whatever toolbar it's dropped into (see that component for defaults).
 */
function VisibilitySelector({
  value,
  onChange,
  options,
  icon: Icon = VisibilityOutlinedIcon,
  size,
  iconSize,
}) {
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);
  const selectedLabel = options.find((option) => option.value === value)?.label;

  const handleSelect = (nextValue) => {
    onChange(nextValue);
    setAnchorEl(null);
  };

  return (
    <>
      <ToolbarIconButton
        active={open}
        size={size}
        iconSize={iconSize}
        onClick={(event) => setAnchorEl(event.currentTarget)}
        aria-label={selectedLabel ? `Visibility: ${selectedLabel}` : "Visibility"}
      >
        <Box sx={{ display: "flex", alignItems: "center" }}>
          <Icon sx={{ fontSize: iconSize || 18 }} />
          <ArrowDropDownIcon sx={{ fontSize: (iconSize || 18) * 0.8, ml: "-4px" }} />
        </Box>
      </ToolbarIconButton>
      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={() => setAnchorEl(null)}
        anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
        slotProps={{
          // borderRadius: 1 -> MUI's sx shorthand multiplies by
          // theme.shape.borderRadius, so this is the theme's own radius
          // token, not a hardcoded pixel value.
          paper: { sx: { borderRadius: 1, minWidth: "180px" } },
        }}
      >
        {options.map((option) => (
          <MenuItem key={option.value} selected={option.value === value} onClick={() => handleSelect(option.value)}>
            <ListItemText primary={option.label} />
            {option.value === value && (
              <CheckIcon fontSize="small" color="primary" sx={{ ml: 2 }} />
            )}
          </MenuItem>
        ))}
      </Menu>
    </>
  );
}

export default VisibilitySelector;
