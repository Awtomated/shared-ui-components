import List from "@mui/material/List";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemText from "@mui/material/ListItemText";
import Checkbox from "@mui/material/Checkbox";
import Tooltip from "@mui/material/Tooltip";

// Compact single/multi-select option list shown inside a FilterChip's
// popover - a plain menu-style list rather than a search-field Autocomplete.
function FilterDropdown({ options, value, multiple = false, onChange }) {
  const isSelected = (option) =>
    multiple
      ? value.some((selected) => selected.id === option.id)
      : value?.id === option.id;

  const handleClick = (option) => {
    if (!multiple) {
      onChange(option);
      return;
    }
    const next = isSelected(option)
      ? value.filter((selected) => selected.id !== option.id)
      : [...value, option];
    onChange(next);
  };

  return (
    <List dense disablePadding sx={{ maxHeight: 260, overflowY: "auto" }}>
      {options.map((option) => (
        <ListItemButton
          key={option.id}
          selected={isSelected(option)}
          onClick={() => handleClick(option)}
          sx={{ borderRadius: "6px", py: "4px" }}
        >
          {multiple && (
            <Checkbox
              size="small"
              edge="start"
              checked={isSelected(option)}
              tabIndex={-1}
              disableRipple
              sx={{ p: 0, mr: "8px" }}
            />
          )}
          <Tooltip title={option.title} enterDelay={500} enterNextDelay={500}>
            <ListItemText
              primary={option.title}
              primaryTypographyProps={{ noWrap: true, sx: { textOverflow: "ellipsis" } }}
              sx={{ minWidth: 0 }}
            />
          </Tooltip>
        </ListItemButton>
      ))}
    </List>
  );
}

export default FilterDropdown;
