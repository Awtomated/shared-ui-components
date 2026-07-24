import TextField from "@mui/material/TextField";
import InputAdornment from "@mui/material/InputAdornment";
import IconButton from "@mui/material/IconButton";
import SearchIcon from "@mui/icons-material/Search";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";

// Plain controlled search field - icon on the left, a clear button on the
// right once there's a value. No debouncing - callers that need to throttle
// (e.g. calling out to an async search) should debounce onChange themselves.
function SearchInput({ value, onChange, placeholder = "Search", autoFocus = false }) {
  return (
    <TextField
      size="small"
      fullWidth
      autoFocus={autoFocus}
      value={value}
      onChange={(event) => onChange(event.target.value)}
      placeholder={placeholder}
      slotProps={{
        input: {
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon fontSize="small" sx={{ color: "text.secondary" }} />
            </InputAdornment>
          ),
          endAdornment: value ? (
            <InputAdornment position="end">
              <IconButton size="small" edge="end" onClick={() => onChange("")}>
                <CloseRoundedIcon fontSize="small" />
              </IconButton>
            </InputAdornment>
          ) : null,
        },
      }}
      sx={{ "& .MuiOutlinedInput-root": { borderRadius: "8px" } }}
    />
  );
}

export default SearchInput;
