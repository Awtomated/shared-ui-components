import { Component, Suspense, useCallback, useMemo, useState } from "react";
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
import CloudUploadOutlinedIcon from "@mui/icons-material/CloudUploadOutlined";
import CloudQueueIcon from "@mui/icons-material/CloudQueue";
import CloudOffOutlinedIcon from "@mui/icons-material/CloudOffOutlined";
import FileTypeIcon from "../FileTypeIcon/FileTypeIcon";
import { formatFileSize } from "./formatFileSize";

const TAB_CONFIG = {
  upload: { label: "Upload", icon: <CloudUploadOutlinedIcon sx={{ fontSize: 16 }} /> },
  drive: { label: "Drive", icon: <CloudQueueIcon sx={{ fontSize: 16 }} /> },
};

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

function DriveUnavailable({ message, onRetry, onUseUpload }) {
  return (
    <Box
      role="alert"
      data-testid="drive-attachment-drive-error"
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

// Contains any failure from the caller-supplied Drive content (a remote that
// fails to load, a render-time crash inside it) to the Drive tab only, so it
// can never propagate to - and unmount/reload - the surrounding form or
// modal. A class component because error boundaries still require one;
// deliberately self-contained so this package takes no react-error-boundary
// dependency.
class DriveErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error, info) {
    this.props.onError?.(error, info);
  }

  render() {
    if (this.state.error) return this.props.fallback;
    return this.props.children;
  }
}

/**
 * Attachments field: a tab shell for attaching files via local upload or
 * Drive, plus a persistent "Selected files" list. Moved here from
 * file-management-mf's AttachFileTabs (which now wraps this) so any module
 * can reuse the same UI.
 *
 * Headless with respect to both transports:
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
 * resolve against - a plain form field has none. Pass height="100%" only
 * inside something that genuinely provides a bounded height (e.g. a Dialog).
 */
function DriveAttachment({
  tabs = ["upload", "drive"],
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
  // Only evaluated once, at mount. `defaultTab` wins when given (a caller
  // that seeds preselected Drive files in an effect has no records yet on
  // first render); otherwise records already present at mount mean "opened
  // with preselected Drive files", so open on Drive then.
  const [activeTab, setActiveTab] = useState(() => {
    const defaultIndex = defaultTab ? tabs.indexOf(defaultTab) : -1;
    if (defaultIndex !== -1) return defaultIndex;
    const driveIndex = tabs.indexOf("drive");
    return uploadRecords.length > 0 && driveIndex !== -1 ? driveIndex : 0;
  });
  // Bumped on Retry to remount the Drive slot's boundary + Suspense fresh.
  const [driveAttempt, setDriveAttempt] = useState(0);
  const activeTabId = tabs[activeTab];
  // Drive's own scroll chain needs a bounded ancestor height (see `height`
  // above), so it keeps the fixed height. Upload sizes to content, which
  // lets the modal collapse to just the dropzone when nothing is attached.
  const containerHeight = activeTabId === "drive" ? height : undefined;

  const handleDriveRetry = useCallback(() => {
    onDriveRetry?.();
    setDriveAttempt((a) => a + 1);
  }, [onDriveRetry]);

  const uploadIndex = tabs.indexOf("upload");
  const handleUseUpload =
    uploadIndex !== -1 ? () => setActiveTab(uploadIndex) : undefined;

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
          value={activeTab}
          onChange={(_, v) => setActiveTab(v)}
          sx={{
            px: 1,
            "& .MuiTab-root": { minHeight: 44, fontSize: 13, textTransform: "none", gap: 0.5, py: 0 },
            "& .MuiTab-iconWrapper": { mb: "0 !important" },
          }}
        >
          {tabs.map((id) => (
            <Tab
              key={id}
              icon={TAB_CONFIG[id].icon}
              iconPosition="start"
              label={TAB_CONFIG[id].label}
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
          minHeight: activeTabId === "drive" ? 220 : 0,
          ...(activeTabId === "drive" && { px: 2, py: 1.5 }),
        }}
      >
        {activeTabId === "upload" && (
          <UploadTabContent
            onFilesAdded={onFilesAdded}
            acceptExtensions={acceptExtensions}
            dropzoneHint={dropzoneHint}
          />
        )}
        {activeTabId === "drive" && (
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
            <DriveErrorBoundary
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
            </DriveErrorBoundary>
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
