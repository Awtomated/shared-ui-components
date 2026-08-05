import { useEffect, useRef, useState } from "react";
import Box from "@mui/material/Box";
import { DataGridPro } from "@mui/x-data-grid-pro";

/**
 * Framework-agnostic data grid list with internal scroll, used as the single
 * shared table implementation across host app and micro-frontends (Drive,
 * Timesheet, ...). All Drive/Timesheet-specific behavior (row actions, empty
 * state, theming) is injected by the caller via props/columns - this
 * component owns only generic list/grid concerns: sizing, infinite scroll,
 * selection styling, and passthrough of any other DataGridPro prop via `rest`.
 *
 * The grid measures its own top offset on mount and sets a height of
 * (window.innerHeight - top - 16), filling the remaining viewport - or, when
 * rendered inside a MUI Dialog, the DialogContent's bottom edge instead of
 * window.innerHeight - so the grid gets its own scroll container instead of
 * relying on a page-level scrollbar.
 *
 * Infinite scroll uses DataGridPro's onRowsScrollEnd instead of an
 * IntersectionObserver sentinel, since scroll is internal to the grid.
 */
export default function DataTable({
  rows,
  columns,
  loading,
  isFetchingMore,
  hasMore,
  onLoadMore,
  onRowClick,
  onRowDoubleClick,
  getRowClassName,
  selectedRowBackgroundColor = "action.selected",
  sx,
  ...rest
}) {
  const containerRef = useRef(null);
  const onLoadMoreRef = useRef(onLoadMore);
  onLoadMoreRef.current = onLoadMore;
  const [gridHeight, setGridHeight] = useState(400);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return undefined;

    const update = () => {
      const { top } = el.getBoundingClientRect();
      const dialogContent = el.closest(".MuiDialogContent-root");
      const bottomBound = dialogContent
        ? dialogContent.getBoundingClientRect().bottom
        : window.innerHeight;
      setGridHeight(
        Math.max(200, Math.round(bottomBound) - Math.round(top) - 16)
      );
    };

    const raf = requestAnimationFrame(update);
    window.addEventListener("resize", update);

    const ro = new ResizeObserver(update);
    const parent =
      el.closest(".MuiDialogContent-root") ||
      el.closest('[style*="height"]') ||
      el.parentElement;
    if (parent) ro.observe(parent);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", update);
      ro.disconnect();
    };
  }, []);

  const handleRowsScrollEnd = () => {
    if (hasMore && !loading && !isFetchingMore) {
      onLoadMoreRef.current?.();
    }
  };

  return (
    <Box ref={containerRef} sx={{ width: "100%" }}>
      <DataGridPro
        rows={rows}
        columns={columns}
        loading={loading || isFetchingMore}
        hideFooter
        onRowClick={onRowClick}
        onRowDoubleClick={onRowDoubleClick}
        getRowClassName={getRowClassName}
        disableRowSelectionOnClick
        disableColumnFilter
        onRowsScrollEnd={handleRowsScrollEnd}
        sx={{
          height: gridHeight,
          border: "none",
          "& .MuiDataGrid-row": { cursor: "pointer" },
          "& .MuiDataGrid-columnHeader": {
            fontWeight: 600,
            borderRight: "none",
          },
          "& .MuiDataGrid-columnHeaders": {
            borderBottom: "2px solid",
            borderColor: "divider",
          },
          "& .MuiDataGrid-columnSeparator": { display: "none" },
          "& .MuiDataGrid-cell": {
            display: "flex",
            alignItems: "center",
            borderRight: "none",
            outline: "none",
          },
          "& .MuiDataGrid-cell:focus, & .MuiDataGrid-cell:focus-within": {
            outline: "none",
          },
          "& .MuiDataGrid-row.Mui-selected": {
            backgroundColor: "transparent",
            "&:hover": { backgroundColor: "transparent" },
            "& .MuiDataGrid-cell": { backgroundColor: "transparent" },
          },
          "& .MuiDataGrid-row.row-selected": {
            backgroundColor: selectedRowBackgroundColor,
            "&:hover": { backgroundColor: selectedRowBackgroundColor },
            "& .MuiDataGrid-cell": {
              backgroundColor: selectedRowBackgroundColor,
            },
          },
          "& .row-drag-over": {
            backgroundColor: "primary.light",
            "&:hover": { backgroundColor: "primary.light" },
          },
          "& .MuiDataGrid-scrollbar--vertical": { display: "none" },
          "& .MuiDataGrid-virtualScroller": {
            scrollbarWidth: "thin",
            scrollbarColor: "#d1d5db transparent",
            "&::-webkit-scrollbar": { width: 8 },
            "&::-webkit-scrollbar-track": { background: "transparent" },
            "&::-webkit-scrollbar-thumb": {
              background: "#d1d5db",
              borderRadius: 9999,
            },
            "&::-webkit-scrollbar-thumb:hover": { background: "#9ca3af" },
          },
          ...sx,
        }}
        {...rest}
      />
    </Box>
  );
}
