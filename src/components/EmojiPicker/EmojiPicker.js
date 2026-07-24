import { useMemo, useState } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import ButtonBase from "@mui/material/ButtonBase";
import CommonPopover from "../CommonPopover/CommonPopover";
import SearchInput from "../SearchInput/SearchInput";
import { EMOJI_CATEGORIES } from "./emojiData";

// Controlled emoji picker (anchorEl/open/onClose owned by the caller, same
// pattern as CommonPopover) so it can be triggered from more than one place
// (composer toolbar, a reaction "+" button) without each owning a copy of
// the popover-open state.
function EmojiPicker({ anchorEl, open, onClose, onSelect }) {
  const [query, setQuery] = useState("");

  const categories = useMemo(() => {
    const term = query.trim().toLowerCase();
    if (!term) return EMOJI_CATEGORIES;
    return EMOJI_CATEGORIES.map((group) => ({
      ...group,
      emojis: group.emojis.filter((emoji) => emoji.name.includes(term)),
    })).filter((group) => group.emojis.length > 0);
  }, [query]);

  const handleSelect = (char) => {
    onSelect(char);
    onClose();
  };

  return (
    <CommonPopover anchorEl={anchorEl} open={open} onClose={onClose} width={280}>
      <SearchInput value={query} onChange={setQuery} placeholder="Search emoji" autoFocus />
      <Box sx={{ mt: 1.5, maxHeight: 240, overflowY: "auto" }}>
        {categories.map((group) => (
          <Box key={group.category} sx={{ mb: 1.5 }}>
            <Typography
              variant="caption"
              sx={{ color: "text.secondary", fontWeight: 600, textTransform: "uppercase" }}
            >
              {group.category}
            </Typography>
            <Box sx={{ display: "flex", flexWrap: "wrap", gap: "4px", mt: 0.5 }}>
              {group.emojis.map((emoji) => (
                <ButtonBase
                  key={emoji.char}
                  onClick={() => handleSelect(emoji.char)}
                  sx={{
                    width: 32,
                    height: 32,
                    borderRadius: "6px",
                    fontSize: 18,
                    "&:hover": { bgcolor: "action.hover" },
                  }}
                >
                  {emoji.char}
                </ButtonBase>
              ))}
            </Box>
          </Box>
        ))}
        {categories.length === 0 && (
          <Typography variant="body2" sx={{ color: "text.secondary", textAlign: "center", py: 2 }}>
            No emoji found
          </Typography>
        )}
      </Box>
    </CommonPopover>
  );
}

export default EmojiPicker;
