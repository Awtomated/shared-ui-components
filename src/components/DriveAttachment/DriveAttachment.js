import { Suspense, useCallback, useMemo, useState } from "react";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
import IconButton from "@mui/material/IconButton";
import LinearProgress from "@mui/material/LinearProgress";
import Tab from "@mui/material/Tab";
import Tabs from "@mui/material/Tabs";
import Tooltip from "@mui/material/Tooltip";
import Typography from "@mui/material/Typography";
import { useTheme } from "@mui/material/styles";
import RefreshIcon from "@mui/icons-material/Refresh";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CloseIcon from "@mui/icons-material/Close";
import DescriptionOutlinedIcon from "@mui/icons-material/DescriptionOutlined";
import CloudOffOutlinedIcon from "@mui/icons-material/CloudOffOutlined";
import FileTypeIcon from "../FileTypeIcon/FileTypeIcon";
import { formatFileSize } from "./formatFileSize";
import { resolveTabs } from "./tabConfig";
import TabBoundary from "./TabBoundary";

const DEFAULT_TAB_ERROR_MESSAGE = "This tab is unavailable right now.";

// Thin, unobtrusive scrollbar for the containers this component owns
// directly (Upload's own overflow box, the selected-files list) - kept as a
// shared constant so both stay visually consistent.
const THIN_SCROLLBAR_SX = {
  scrollbarWidth: "thin",
  "&::-webkit-scrollbar": { width: 6, height: 6 },
  "&::-webkit-scrollbar-thumb": { backgroundColor: "action.disabled", borderRadius: 3 },
  "&::-webkit-scrollbar-track": { backgroundColor: "transparent" },
};

// Same treatment, applied descendant-wise - for wrapping content (like the
// Drive grid) whose own internal scroll container isn't this component's to
// style directly.
const NESTED_THIN_SCROLLBAR_SX = {
  "& *": { scrollbarWidth: "thin" },
  "& *::-webkit-scrollbar": { width: 6, height: 6 },
  "& *::-webkit-scrollbar-thumb": { backgroundColor: "action.disabled", borderRadius: 3 },
  "& *::-webkit-scrollbar-track": { backgroundColor: "transparent" },
};

// Single-line name that only shows a tooltip when it's actually truncated -
// matches the host's Text (showTooltip, wrap={false}) this replaced, without
// depending on a host-supplied component.
function TruncatedName({ text }) {
  const [isTruncated, setIsTruncated] = useState(false);
  return (
    <Tooltip title={isTruncated ? text : ""} placement="top">
      <Typography
        variant="subtitle2"
        noWrap
        onMouseEnter={(e) =>
          setIsTruncated(e.currentTarget.scrollWidth > e.currentTarget.clientWidth)
        }
        sx={{ maxWidth: "100%", display: "block" }}
      >
        {text}
      </Typography>
    </Tooltip>
  );
}

// One upload record rendered as a compact horizontal row (icon, name+size,
// status/remove) rather than a square card, so the selected-files strip
// stays short and leaves the browsing area (dropzone / Drive grid) most of
// the available height.
function UploadFileRow({ record, onRemove, onRetry }) {
  const theme = useTheme();
  const cardPalette = theme.palette.card;
  const isError = record.status === "error" || record.status === "failed";

  return (
    <Box
      data-testid="drive-attachment-selected-row"
      sx={{
        display: "flex",
        alignItems: "center",
        gap: 1.25,
        height: 56,
        flexShrink: 0,
        px: 1.5,
        border: "1px solid",
        borderColor: isError ? "error.main" : cardPalette?.selectedBorder || "primary.light",
        borderRadius: "10px",
        bgcolor: isError ? "background.paper" : cardPalette?.selectedBg || "action.selected",
        overflow: "hidden",
      }}
    >
      <Box sx={{ display: "flex", alignItems: "center", flexShrink: 0 }}>
        <FileTypeIcon name={record.name} type="file" size={22} />
      </Box>

      <Box sx={{ flex: 1, minWidth: 0 }}>
        <TruncatedName text={record.name} />
        <Typography variant="caption" color={isError ? "error.main" : "text.secondary"}>
          {isError ? record.error || "Upload failed" : formatFileSize(record.size)}
        </Typography>
        {record.status === "uploading" && (
          <LinearProgress
            variant="determinate"
            value={record.progress || 0}
            sx={{ mt: 0.5, height: 3, borderRadius: 1 }}
          />
        )}
      </Box>

      <Box sx={{ display: "flex", alignItems: "center", flexShrink: 0, gap: 0.25 }}>
        {(record.status === "success" || record.status === "complete") && (
          <CheckCircleIcon fontSize="small" color="primary" />
        )}
        {isError && onRetry && (
          <IconButton
            size="small"
            aria-label="Retry upload"
            onClick={() => onRetry(record.uid)}
            sx={{ p: 0.25 }}
          >
            <RefreshIcon sx={{ fontSize: 18 }} />
          </IconButton>
        )}
        <IconButton
          size="small"
          aria-label="Remove file"
          onClick={() => onRemove(record.uid)}
          sx={{ p: 0.25 }}
        >
          <CloseIcon sx={{ fontSize: 18 }} />
        </IconButton>
      </Box>
    </Box>
  );
}

// Dropzone only - the selected/uploaded-file rows render persistently at
// the DriveAttachment level instead (below whichever tab is active), since
// that state belongs to the Attachments field as a whole, not to this one
// tab's own content.
function UploadTabContent({ onFilesAdded, acceptExtensions, dropzoneHint }) {
  const [isDragOver, setIsDragOver] = useState(false);
  const acceptAttr = acceptExtensions?.length
    ? acceptExtensions.map((e) => `.${e}`).join(",")
    : undefined;

  return (
    <Box sx={{ p: 2, height: "100%", overflow: "auto", ...THIN_SCROLLBAR_SX }}>
      <Box
        component="label"
        data-testid="drive-attachment-dropzone"
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragOver(true);
        }}
        onDragLeave={() => setIsDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setIsDragOver(false);
          onFilesAdded?.(e.dataTransfer.files);
        }}
        sx={{
          border: "2px dashed",
          borderColor: isDragOver ? "primary.main" : "grey.300",
          borderRadius: 2,
          p: 4,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 1,
          cursor: "pointer",
          bgcolor: isDragOver ? "primary.50" : "background.default",
          transition: "all 0.15s",
        }}
      >
        <DescriptionOutlinedIcon sx={{ fontSize: 40, color: "primary.main" }} />
        <Box sx={{ textAlign: "center" }}>
          <Typography variant="body2" fontWeight={600}>
            Select or drag files from your computer
          </Typography>
          {dropzoneHint && (
            <Typography variant="caption" sx={{ color: "text.secondary" }}>
              {dropzoneHint}
            </Typography>
          )}
        </Box>
        <input
          type="file"
          multiple
          accept={acceptAttr}
          data-testid="drive-attachment-file-input"
          style={{ display: "none" }}
          onChange={(e) => {
            onFilesAdded?.(e.target.files);
            e.target.value = "";
          }}
        />
      </Box>
    </Box>
  );
}

// Persistent list of every currently-attached file (local uploads and
// Drive-sourced ones alike) - rendered below whichever tab is active, so it
// survives switching Upload <-> Drive, and stays visible/removable even
// while the Drive tab itself is in its error state.
//
// Capped to ~2 rows (SELECTED_LIST_MAX_HEIGHT) with its own vertical scroll
// so a long selection can never eat into the browsing area (dropzone / Drive
// grid) above it.
const SELECTED_LIST_MAX_HEIGHT = 128;

function SelectedFilesList({ uploadRecords, onRemoveRecord, onRetryRecord }) {
  if (uploadRecords.length === 0) return null;

  return (
    <Box sx={{ borderTop: 1, borderColor: "divider", px: 2, py: 1.25, flexShrink: 0 }}>
      <Typography
        variant="subtitle2"
        color="text.secondary"
        sx={{ mb: 0.75, display: "block" }}
      >
        {`Selected files (${uploadRecords.length})`}
      </Typography>
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          gap: 0.75,
          maxHeight: SELECTED_LIST_MAX_HEIGHT,
          overflowY: "auto",
          pr: 0.5,
          ...THIN_SCROLLBAR_SX,
        }}
      >
        {uploadRecords.map((record) => (
          <UploadFileRow
            key={record.uid}
            record={record}
            onRemove={onRemoveRecord}
            onRetry={onRetryRecord}
          />
        ))}
      </Box>
    </Box>
  );
}

function DriveLoading() {
  return (
    <Box
      data-testid="drive-attachment-drive-loading"
      sx={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center" }}
    >
      <CircularProgress size={24} />
    </Box>
  );
}

function DriveUnavailable({
  message,
  onRetry,
  onUseUpload,
  testId = "drive-attachment-drive-error",
}) {
  return (
    <Box
      role="alert"
      data-testid={testId}
      sx={{
        flex: 1,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 1,
        textAlign: "center",
        px: 2,
      }}
    >
      <CloudOffOutlinedIcon sx={{ fontSize: 40, color: "text.secondary", opacity: 0.6 }} />
      <Typography variant="body2" fontWeight={600}>
        {message}
      </Typography>
      <Typography variant="caption" color="text.secondary">
        You can still attach files from your computer.
      </Typography>
      <Box sx={{ display: "flex", gap: 1, mt: 1 }}>
        {onUseUpload && (
          <Button size="small" variant="text" onClick={onUseUpload}>
            Use Upload
          </Button>
        )}
        <Button size="small" variant="outlined" onClick={onRetry}>
          Retry
        </Button>
      </Box>
    </Box>
  );
}

/**
 * Attachments field: a tab shell for attaching files via local upload,
 * Drive, or any caller-supplied tab, plus a persistent "Selected files"
 * list. Moved here from file-management-mf's AttachFileTabs (which now wraps
 * this) so any module can reuse the same UI.
 *
 * Tabs:
 * - `tabs` is a list of tab ids - it alone decides which tabs show and in
 *   what order, e.g. ["upload", "project", "drive", "compose"].
 * - `tabConfigInfo` optionally overrides the built-in TAB_CONFIG per id,
 *   shallowly (caller wins): `{ [id]: { label, icon, component, props,
 *   disabled, fixedHeight, contentSx, errorMessage, onRetry, onError } }`.
 *   Keys not listed in `tabs` are ignored.
 * - If a tab has a `component`, it replaces that tab's content (including
 *   the built-in "upload"/"drive" content). Otherwise the built-in content
 *   renders. An id with neither ("project" with no component) is skipped.
 * - `component` receives the shared tab context below, then `props` on top:
 *   { uploadRecords, onFilesAdded, onRemoveRecord, onRetryRecord,
 *     acceptExtensions, dropzoneHint, driveMultiSelect, onDriveFilesSelected,
 *     driveSelectedIds, activeTab, setActiveTab }.
 *   Pass a stable component (module-level or memoized) - an inline one
 *   remounts, and loses its state, on every parent render.
 * - Each `component` is wrapped in its own Suspense + error boundary (same
 *   treatment as Drive below): a failure shows an inline unavailable state in
 *   that tab only; Retry remounts it and calls its `onRetry`.
 *
 * Headless with respect to both built-in transports:
 * - Upload: renders `uploadRecords` the caller supplies and reports raw
 *   file picks/drops via `onFilesAdded` - never uploads anything itself.
 * - Drive: the Drive browser is caller-supplied via
 *   `renderDrive({ multiSelect, onFilesSelected, selectedIds })`, so this
 *   package never depends on drive-mf or any API. `selectedIds` are the
 *   `driveNodeId`s of every `source: "drive"` record, kept live so removing
 *   a Drive file from the list unchecks it in the grid too.
 *
 * The Drive slot is wrapped in its own Suspense + error boundary: a lazy
 * (e.g. Module Federation) Drive component shows a spinner inside the Drive
 * tab while loading, and a failure shows an inline "Drive unavailable" state
 * there - the Upload tab, the selected-files list and the parent form are
 * unaffected. Retry remounts the slot and calls `onDriveRetry`, which a
 * caller using React.lazy should use to create a fresh lazy component
 * (React caches a rejected lazy forever). Loading/empty states of the Drive
 * listing itself belong to the supplied Drive content.
 *
 * `height` defaults to a fixed pixel value (not '100%') because an inline
 * Drive grid's own scroll container typically needs a bounded ancestor to
 * resolve against - a plain form field has none. It applies only while a
 * `fixedHeight` tab (Drive by default) is active. Pass height="100%" only
 * inside something that genuinely provides a bounded height (e.g. a Dialog).
 */
function DriveAttachment({
  tabs = ["upload", "drive"],
  tabConfigInfo,
  defaultTab,
  bordered = true,
  height = 460,
  uploadRecords = [],
  onFilesAdded,
  onRemoveRecord,
  onRetryRecord,
  acceptExtensions,
  dropzoneHint,
  driveMultiSelect = true,
  onDriveFilesSelected,
  renderDrive,
  onDriveRetry,
  onDriveError,
  driveErrorMessage = "Drive is unavailable right now.",
}) {
  // The caller's uploadRecords are the single source of truth for which
  // Drive files are selected - recomputed every render so both a grid-driven
  // select and a list-driven remove flow back into the grid's checkmarks.
  const driveSelectedIds = useMemo(
    () =>
      uploadRecords
        .filter((r) => r.source === "drive")
        .map((r) => r.driveNodeId),
    [uploadRecords]
  );
  const resolvedTabs = useMemo(
    () => resolveTabs(tabs, tabConfigInfo),
    [tabs, tabConfigInfo]
  );
  const tabIds = resolvedTabs.map((t) => t.id);
  // Only evaluated once, at mount. `defaultTab` wins when given (a caller
  // that seeds preselected Drive files in an effect has no records yet on
  // first render); otherwise records already present at mount mean "opened
  // with preselected Drive files", so open on Drive then.
  const [activeId, setActiveId] = useState(() => {
    if (defaultTab && tabIds.includes(defaultTab)) return defaultTab;
    if (uploadRecords.length > 0 && tabIds.includes("drive")) return "drive";
    return tabIds[0];
  });
  // Tracked by id, not index, so a caller adding/removing tabs never leaves
  // it pointing at the wrong tab. If the active tab is removed, settle on
  // the first one (so it doesn't jump back if that tab is re-added later).
  const activeTab = resolvedTabs.find((t) => t.id === activeId) ?? resolvedTabs[0];
  if (activeTab && activeTab.id !== activeId) setActiveId(activeTab.id);
  const activeTabId = activeTab?.id;
  const fixedHeight = Boolean(activeTab?.fixedHeight);

  // Bumped on Retry to remount a tab's boundary + Suspense fresh.
  const [driveAttempt, setDriveAttempt] = useState(0);
  const [tabAttempts, setTabAttempts] = useState({});
  // Drive's own scroll chain needs a bounded ancestor height (see `height`
  // above), so it keeps the fixed height. Upload sizes to content, which
  // lets the modal collapse to just the dropzone when nothing is attached.
  const containerHeight = fixedHeight ? height : undefined;

  const handleDriveRetry = useCallback(() => {
    onDriveRetry?.();
    setDriveAttempt((a) => a + 1);
  }, [onDriveRetry]);

  const handleTabRetry = useCallback(
    (tab) => {
      const onRetry = tab.onRetry ?? (tab.id === "drive" ? onDriveRetry : undefined);
      onRetry?.();
      setTabAttempts((a) => ({ ...a, [tab.id]: (a[tab.id] || 0) + 1 }));
    },
    [onDriveRetry]
  );

  const handleUseUpload = tabIds.includes("upload")
    ? () => setActiveId("upload")
    : undefined;

  // Everything a caller-supplied tab component needs to act like a
  // built-in tab (add/remove records, keep its own selection in sync).
  const tabContext = {
    uploadRecords,
    onFilesAdded,
    onRemoveRecord,
    onRetryRecord,
    acceptExtensions,
    dropzoneHint,
    driveMultiSelect,
    onDriveFilesSelected,
    driveSelectedIds,
    activeTab: activeTabId,
    setActiveTab: setActiveId,
  };

  const renderComponentTab = (tab) => {
    const TabComponent = tab.component;
    const isDrive = tab.id === "drive";
    return (
      <Box
        key={tab.id}
        sx={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          minHeight: 0,
          ...(fixedHeight && { overflow: "hidden", ...NESTED_THIN_SCROLLBAR_SX }),
        }}
      >
        <TabBoundary
          key={tabAttempts[tab.id] || 0}
          onError={tab.onError ?? (isDrive ? onDriveError : undefined)}
          fallback={
            <DriveUnavailable
              message={
                tab.errorMessage ?? (isDrive ? driveErrorMessage : DEFAULT_TAB_ERROR_MESSAGE)
              }
              onRetry={() => handleTabRetry(tab)}
              onUseUpload={tab.id !== "upload" ? handleUseUpload : undefined}
              testId={`drive-attachment-tab-error-${tab.id}`}
            />
          }
        >
          <Suspense fallback={<DriveLoading />}>
            <TabComponent {...tabContext} {...tab.props} />
          </Suspense>
        </TabBoundary>
      </Box>
    );
  };

  return (
    <Box
      data-testid="drive-attachment"
      sx={{
        display: "flex",
        flexDirection: "column",
        height: containerHeight,
        minHeight: 0,
        ...(bordered && {
          border: "1px solid",
          borderColor: "divider",
          borderRadius: "12px",
          boxShadow: 1,
          bgcolor: "background.paper",
          overflow: "hidden",
        }),
      }}
    >
      <Box sx={{ borderBottom: 1, borderColor: "divider", flexShrink: 0 }}>
        <Tabs
          value={activeTabId ?? false}
          onChange={(_, v) => setActiveId(v)}
          sx={{
            px: 1,
            "& .MuiTab-root": { minHeight: 44, fontSize: 13, textTransform: "none", gap: 0.5, py: 0 },
            "& .MuiTab-iconWrapper": { mb: "0 !important" },
          }}
        >
          {resolvedTabs.map((tab) => (
            <Tab
              key={tab.id}
              value={tab.id}
              icon={tab.icon}
              iconPosition="start"
              label={tab.label}
              disabled={tab.disabled}
            />
          ))}
        </Tabs>
      </Box>

      <Box
        sx={{
          flex: "1 1 auto",
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
          minHeight: fixedHeight ? 220 : 0,
          ...activeTab?.contentSx,
        }}
      >
        {activeTab?.component && renderComponentTab(activeTab)}
        {!activeTab?.component && activeTabId === "upload" && (
          <UploadTabContent
            onFilesAdded={onFilesAdded}
            acceptExtensions={acceptExtensions}
            dropzoneHint={dropzoneHint}
          />
        )}
        {!activeTab?.component && activeTabId === "drive" && (
          <Box
            sx={{
              flex: 1,
              overflow: "hidden",
              display: "flex",
              flexDirection: "column",
              minHeight: 0,
              ...NESTED_THIN_SCROLLBAR_SX,
            }}
          >
            <TabBoundary
              key={driveAttempt}
              onError={onDriveError}
              fallback={
                <DriveUnavailable
                  message={driveErrorMessage}
                  onRetry={handleDriveRetry}
                  onUseUpload={handleUseUpload}
                />
              }
            >
              <Suspense fallback={<DriveLoading />}>
                {renderDrive?.({
                  multiSelect: driveMultiSelect,
                  onFilesSelected: onDriveFilesSelected,
                  selectedIds: driveSelectedIds,
                })}
              </Suspense>
            </TabBoundary>
          </Box>
        )}
      </Box>

      <SelectedFilesList
        uploadRecords={uploadRecords}
        onRemoveRecord={onRemoveRecord}
        onRetryRecord={onRetryRecord}
      />
    </Box>
  );
}

export default DriveAttachment;
