import { useCallback, useEffect, useRef, useState } from "react";
import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import TextField from "@mui/material/TextField";
import CommandDropdownList from "./CommandDropdownList";

/**
 * Wraps CommandDropdownList with its own module->entity step state, for
 * entityPickerPopup.js's button-triggered Insert Link flow. Unlike the
 * "@"/"/" triggers, there's no ProseMirror-typed query to source `query`
 * from (nothing is being typed into the document); the module step lists
 * every module immediately (short, fixed list - no search needed), while
 * the entity step keeps a small search TextField since a module's entity
 * list can be long/paginated. CommandDropdownList itself (debounce,
 * loading/empty states, row rendering, keyboard nav) is untouched and
 * fully reused, same as the "/" command uses it.
 */
function EntityPickerPanel({ searchModules, getEntityProvider, onCommit, onDismiss }) {
  const [mode, setMode] = useState("module");
  const [moduleKey, setModuleKey] = useState(null);
  const [moduleLabel, setModuleLabel] = useState(null);
  const [query, setQuery] = useState("");
  const listRef = useRef(null);
  const boxRef = useRef(null);

  const handleCommand = useCallback(
    (payload) => {
      if (payload.mode === "module") {
        setMode("entity");
        setModuleKey(payload.moduleKey);
        setModuleLabel(payload.moduleLabel);
        setQuery("");
      } else if (payload.mode === "entity") {
        onCommit({
          moduleKey: payload.moduleKey,
          moduleLabel: payload.moduleLabel,
          entityId: payload.entityId,
          entityCode: payload.entityCode,
          entityLabel: payload.entityLabel,
        });
      }
    },
    [onCommit]
  );

  const handleKeyDown = (event) => {
    if (event.key === "Escape") {
      event.preventDefault();
      onDismiss();
      return;
    }
    const handled = listRef.current?.onKeyDown({ event }) ?? false;
    if (handled) event.preventDefault();
  };

  // No search TextField in "module" mode, so this Box takes over keyboard
  // focus/nav (Escape, arrows) that would otherwise live on the TextField.
  useEffect(() => {
    if (mode === "module") boxRef.current?.focus();
  }, [mode]);

  return (
    <Box
      ref={boxRef}
      tabIndex={mode === "module" ? -1 : undefined}
      onKeyDown={mode === "module" ? handleKeyDown : undefined}
      sx={{ width: 260, outline: "none" }}
    >
      {mode === "entity" && (
        <Paper elevation={4} sx={{ width: 260, mb: 0.5 }}>
          <TextField
            autoFocus
            fullWidth
            size="small"
            variant="standard"
            placeholder={`Search ${moduleLabel || ""}...`}
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            onKeyDown={handleKeyDown}
            slotProps={{ input: { disableUnderline: true } }}
            sx={{ px: 1.5, py: 0.75 }}
          />
        </Paper>
      )}
      <CommandDropdownList
        ref={listRef}
        mode={mode}
        query={query}
        moduleKey={moduleKey}
        moduleLabel={moduleLabel}
        searchModules={searchModules}
        getEntityProvider={getEntityProvider}
        command={handleCommand}
      />
    </Box>
  );
}

export default EntityPickerPanel;
