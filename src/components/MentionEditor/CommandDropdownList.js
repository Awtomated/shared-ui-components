import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useMemo,
  useState,
} from "react";
import { List as VirtualList } from "react-window";
import Box from "@mui/material/Box";
import List from "@mui/material/List";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import ListSubheader from "@mui/material/ListSubheader";
import Paper from "@mui/material/Paper";
import Skeleton from "@mui/material/Skeleton";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { useDropdownKeyboardNav } from "./useDropdownKeyboardNav";

const VIRTUALIZE_THRESHOLD = 100;
const ROW_HEIGHT = 36;
const HEADER_HEIGHT = 26;
const LIST_MAX_HEIGHT = 320;
const SEARCH_DEBOUNCE_MS = 280;

const NO_MENTIONS = () => [];
const NO_MODULES = () => [];
// Registered slot with no data source provided - resolves empty so the picker
// shows a "coming soon" state instead of crashing.
const EMPTY_ENTITY_PROVIDER = { isEmpty: true, load: async () => [] };
const NO_ENTITY_PROVIDER = () => EMPTY_ENTITY_PROVIDER;

function highlightLabel(label, query) {
  if (!query) return label;
  const index = label.toLowerCase().indexOf(query.toLowerCase());
  if (index === -1) return label;
  return (
    <>
      {label.slice(0, index)}
      <Box component="span" sx={{ fontWeight: 700, color: "primary.main" }}>
        {label.slice(index, index + query.length)}
      </Box>
      {label.slice(index + query.length)}
    </>
  );
}

function flattenGroups(groups) {
  const rows = [];
  groups.forEach((group) => {
    rows.push({
      kind: "header",
      key: `header-${group.entityType}`,
      label: group.label,
    });
    group.items.forEach((item) => {
      rows.push({
        kind: "item",
        key: `${group.entityType}-${item.id}`,
        entityType: group.entityType,
        ...item,
      });
    });
  });
  return rows;
}

function flattenModules(modules) {
  return modules.map((module) => ({
    kind: "item",
    key: module.moduleKey,
    moduleKey: module.moduleKey,
    label: module.label,
    Icon: module.icon,
  }));
}

function flattenEntities(entities) {
  return entities.map((entity) => ({
    kind: "item",
    key: entity.id,
    id: entity.id,
    label: entity.label,
  }));
}

function CommandRow({
  flatRows,
  selectedIndex,
  query,
  onSelectRow,
  index,
  style,
  ariaAttributes,
}) {
  const row = flatRows[index];
  if (row.kind === "header") {
    return (
      <ListSubheader
        {...ariaAttributes}
        key={row.key}
        disableSticky
        sx={{
          lineHeight: `${HEADER_HEIGHT}px`,
          fontSize: 11,
          fontWeight: 700,
          textTransform: "uppercase",
          color: "text.secondary",
        }}
        style={style}
      >
        {row.label}
      </ListSubheader>
    );
  }
  return (
    <ListItemButton
      {...ariaAttributes}
      key={row.key}
      style={style}
      selected={index === selectedIndex}
      onMouseDown={(event) => {
        event.preventDefault();
        onSelectRow(index);
      }}
      sx={{ borderRadius: 1, minHeight: ROW_HEIGHT, py: 0.25 }}
    >
      {row.Icon && (
        <ListItemIcon sx={{ minWidth: 32 }}>
          <row.Icon fontSize="small" />
        </ListItemIcon>
      )}
      <ListItemText
        primary={highlightLabel(row.label, query)}
        secondary={row.email}
        slotProps={{ primary: { fontSize: 14 }, secondary: { fontSize: 11 } }}
      />
    </ListItemButton>
  );
}

function LoadingRows() {
  return (
    <Stack spacing={0.5} sx={{ p: 1 }}>
      {[0, 1, 2].map((key) => (
        <Skeleton key={key} variant="rounded" height={ROW_HEIGHT - 8} />
      ))}
    </Stack>
  );
}

/**
 * Single dropdown used by every trigger:
 * - mode "grouped" (@mention): headers + rows, sourced from searchMentions.
 * - mode "module" (first "/"): flat icon rows, sourced from searchModules.
 * - mode "entity" (second "/"): flat rows scoped to a module, sourced from
 *   getEntityProvider - the seam a host app wires its own data into without
 *   touching this component.
 * Mode/moduleKey come from whichever trigger mounted this list: @mention
 * pins mode via a static prop, "/" reports it dynamically through `items`
 * (the descriptor slashCommandExtension's items() resolves per keystroke).
 * searchMentions/searchModules/getEntityProvider arrive the same way, merged
 * in by mountFloatingList's extraProps (see mentionSuggestion.js /
 * slashCommandExtension.js) - each defaults to an empty result set so a host
 * app that only wires up "@" (say) doesn't have to stub out the others.
 */
const CommandDropdownList = forwardRef(
  (
    {
      mode: staticMode,
      query = "",
      items,
      command,
      moduleKey: staticModuleKey,
      moduleLabel: staticModuleLabel,
      searchMentions = NO_MENTIONS,
      searchModules = NO_MODULES,
      getEntityProvider = NO_ENTITY_PROVIDER,
    },
    ref
  ) => {
    const resolvedMode = staticMode || items?.mode || "module";
    const moduleKey = staticModuleKey || items?.moduleKey;
    const moduleLabel = staticModuleLabel || items?.moduleLabel;

    const [rows, setRows] = useState([]);
    const [loading, setLoading] = useState(resolvedMode !== "module");
    const [isEmptyProvider, setIsEmptyProvider] = useState(false);

    useEffect(() => {
      if (resolvedMode === "module") {
        setRows(flattenModules(searchModules(query)));
        setLoading(false);
        return undefined;
      }

      let active = true;
      setLoading(true);
      const timer = setTimeout(async () => {
        if (resolvedMode === "grouped") {
          const groups = await Promise.resolve(searchMentions(query));
          if (active) {
            setRows(flattenGroups(groups));
            setLoading(false);
          }
        } else if (resolvedMode === "entity") {
          const provider = getEntityProvider(moduleKey) || EMPTY_ENTITY_PROVIDER;
          const results = await provider.load(query);
          if (active) {
            setRows(flattenEntities(results));
            setIsEmptyProvider(provider.isEmpty);
            setLoading(false);
          }
        }
      }, SEARCH_DEBOUNCE_MS);

      return () => {
        active = false;
        clearTimeout(timer);
      };
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [resolvedMode, moduleKey, query]);

    const selectableIndexes = useMemo(
      () =>
        rows.reduce(
          (acc, row, index) => (row.kind === "item" ? [...acc, index] : acc),
          []
        ),
      [rows]
    );

    function commitRow(rowIndex) {
      const row = rows[rowIndex];
      if (!row || row.kind !== "item") return;
      if (resolvedMode === "grouped") {
        command({ id: row.id, label: row.label, entityType: row.entityType });
      } else if (resolvedMode === "module") {
        command({
          mode: "module",
          moduleKey: row.moduleKey,
          moduleLabel: row.label,
        });
      } else if (resolvedMode === "entity") {
        command({
          mode: "entity",
          moduleKey,
          moduleLabel,
          entityId: row.id,
          entityLabel: row.label,
        });
      }
    }

    const { selectedIndex, onKeyDown } = useDropdownKeyboardNav(
      selectableIndexes,
      commitRow
    );

    useImperativeHandle(ref, () => ({ onKeyDown }));

    if (loading) {
      return (
        <Paper elevation={4} sx={{ width: 260 }}>
          <LoadingRows />
        </Paper>
      );
    }

    if (!rows.length) {
      return (
        <Paper elevation={4} sx={{ minWidth: 220, p: 1.5 }}>
          <Typography variant="body2" color="text.secondary">
            {resolvedMode === "entity" && isEmptyProvider
              ? `${moduleLabel || "This module"} search coming soon`
              : "No results found"}
          </Typography>
        </Paper>
      );
    }

    const rowProps = {
      flatRows: rows,
      selectedIndex,
      query,
      onSelectRow: commitRow,
    };

    return (
      <Paper
        elevation={4}
        sx={{ width: 260, maxHeight: LIST_MAX_HEIGHT, overflow: "hidden" }}
      >
        {rows.length > VIRTUALIZE_THRESHOLD ? (
          <VirtualList
            style={{ height: LIST_MAX_HEIGHT }}
            rowCount={rows.length}
            rowHeight={(index) =>
              rows[index].kind === "header" ? HEADER_HEIGHT : ROW_HEIGHT
            }
            rowComponent={CommandRow}
            rowProps={rowProps}
          />
        ) : (
          <List
            dense
            sx={{ maxHeight: LIST_MAX_HEIGHT, overflowY: "auto", py: 0.5 }}
          >
            {rows.map((row, index) => (
              <CommandRow
                key={row.key}
                flatRows={rows}
                selectedIndex={selectedIndex}
                query={query}
                onSelectRow={commitRow}
                index={index}
              />
            ))}
          </List>
        )}
      </Paper>
    );
  }
);

CommandDropdownList.displayName = "CommandDropdownList";

export default CommandDropdownList;
