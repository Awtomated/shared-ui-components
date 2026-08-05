import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";

/**
 * Generic anchored "..." row-action menu - a plain MUI Menu rendering a
 * caller-supplied action list. Holds no domain-specific defaults; every
 * consumer (Drive, Timesheet, ...) passes its own `actions`.
 *
 * @param {Object} props
 * @param {HTMLElement|null} props.anchorEl
 * @param {Function} props.onClose
 * @param {Function} props.onAction - called with (actionKey) when an item is clicked
 * @param {Array<{key: string, label: string, icon: import('react').ReactNode, sx?: object}>} props.actions
 */
function ActionMenu({ anchorEl, onClose, onAction, actions = [] }) {
  const handleClick = (key) => {
    onAction?.(key);
    onClose?.();
  };

  return (
    <Menu
      anchorEl={anchorEl}
      open={Boolean(anchorEl)}
      onClose={onClose}
      slotProps={{ paper: { sx: { minWidth: 160 } } }}
    >
      {actions.map(({ key, label, icon, sx }) => (
        <MenuItem key={key} onClick={() => handleClick(key)} sx={sx}>
          <ListItemIcon>{icon}</ListItemIcon>
          <ListItemText>{label}</ListItemText>
        </MenuItem>
      ))}
    </Menu>
  );
}

export default ActionMenu;
