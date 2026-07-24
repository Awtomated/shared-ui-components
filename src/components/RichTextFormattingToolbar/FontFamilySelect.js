import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";

export const DEFAULT_FONT_FAMILIES = [
  { label: "Sans Serif", value: "" },
  { label: "Serif", value: "Georgia, 'Times New Roman', serif" },
  { label: "Monospace", value: "'Courier New', monospace" },
  { label: "Cursive", value: "cursive" },
];

// An empty value unsets the fontFamily mark entirely, rather than setting
// the literal CSS keyword "inherit" - Tiptap's FontFamily extension has a
// dedicated unsetFontFamily() command for that.
function FontFamilySelect({ editor, fonts = DEFAULT_FONT_FAMILIES, disabled }) {
  const value = editor.getAttributes("textStyle").fontFamily || "";

  const handleChange = (event) => {
    const next = event.target.value;
    if (!next) editor.chain().focus().unsetFontFamily().run();
    else editor.chain().focus().setFontFamily(next).run();
  };

  return (
    <Select
      value={value}
      onChange={handleChange}
      disabled={disabled}
      variant="standard"
      size="small"
      sx={(theme) => ({
        fontSize: "13px",
        color: theme.palette.text.secondary,
        height: "28px",
        "&:before": { display: "none" },
        "&:after": { display: "none" },
        "& .MuiSelect-select": {
          display: "flex",
          alignItems: "center",
          py: 0,
          pr: "18px !important",
        },
        "& .MuiSelect-icon": { fontSize: "18px", right: 0 },
      })}
    >
      {fonts.map((font) => (
        <MenuItem key={font.label} value={font.value} sx={{ fontFamily: font.value || "inherit", fontSize: "13px" }}>
          {font.label}
        </MenuItem>
      ))}
    </Select>
  );
}

export default FontFamilySelect;
