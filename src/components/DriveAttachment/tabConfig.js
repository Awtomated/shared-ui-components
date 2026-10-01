import CloudUploadOutlinedIcon from "@mui/icons-material/CloudUploadOutlined";
import CloudQueueIcon from "@mui/icons-material/CloudQueue";

// Built-in tabs: the only ids DriveAttachment has its own content for.
// `fixedHeight` tabs keep the container at the `height` prop (a scrolling
// grid needs a bounded ancestor); the rest size to their content.
// `contentSx` is applied to the tab's content area.
export const TAB_CONFIG = {
  upload: {
    label: "Upload",
    icon: <CloudUploadOutlinedIcon sx={{ fontSize: 16 }} />,
    fixedHeight: false,
  },
  drive: {
    label: "Drive",
    icon: <CloudQueueIcon sx={{ fontSize: 16 }} />,
    fixedHeight: true,
    contentSx: { px: 2, py: 1.5 },
  },
};

const warn = (message) => {
  if (process.env.NODE_ENV !== "production") {
    // eslint-disable-next-line no-console
    console.warn(`[DriveAttachment] ${message}`);
  }
};

const capitalize = (id) => id.charAt(0).toUpperCase() + id.slice(1);

/**
 * Merges each id in `tabs` with its built-in TAB_CONFIG entry and the
 * caller's `tabConfigInfo[id]` override (caller wins, shallow, per tab).
 * `tabs` alone decides which tabs show and in what order - extra keys in
 * `tabConfigInfo` are ignored. A tab with no built-in content and no
 * `component` has nothing to render, so it's dropped (with a dev warning)
 * rather than crashing; duplicate ids keep the first occurrence.
 */
export function resolveTabs(tabs = [], tabConfigInfo) {
  const seen = new Set();
  return tabs.reduce((resolved, id) => {
    if (seen.has(id)) {
      warn(`duplicate tab "${id}" ignored.`);
      return resolved;
    }
    seen.add(id);

    const builtIn = TAB_CONFIG[id];
    const override = tabConfigInfo?.[id];
    if (!builtIn && !override?.component) {
      warn(`tab "${id}" has no built-in content and no tabConfigInfo.${id}.component - skipped.`);
      return resolved;
    }

    const config = { fixedHeight: false, ...builtIn, ...override, id };
    if (config.label == null) config.label = capitalize(id);
    resolved.push(config);
    return resolved;
  }, []);
}
