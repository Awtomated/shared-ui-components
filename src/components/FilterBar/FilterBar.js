import Box from "@mui/material/Box";
import FilterChip from "./FilterChip";
import FilterDropdown from "./FilterDropdown";

const GAP_SM = 8; // mirrors main-app's @fuse globalSpacing.gap.sm - see FilterChip.js

/**
 * Config-driven row of multi-select filter chips.
 *
 * filters: [{ id, label, options: [{ id, title }], width? }]
 * values:  { [filterId]: selectedOption[] }   - array-shaped, even for a
 *          single logical selection (matches how Timesheet already stores
 *          e.g. billable status as a 0/1-length array).
 * onChange(filterId, nextOptionArray)
 *
 * Only covers the array-based "multiSelect" shape - filters with different
 * semantics (a mandatory single choice like Group By, a date range, a
 * select with a synthetic "any/both" option) don't fit this generically yet
 * and should keep being composed by hand and passed through `extra`, same
 * as before this component existed.
 */
function FilterBar({ filters, values, onChange, extra }) {
  return (
    <Box
      sx={{
        display: "flex",
        flexWrap: "wrap",
        alignItems: "center",
        gap: `${GAP_SM}px`,
      }}
    >
      {filters.map((filter) => {
        const value = values[filter.id] || [];
        return (
          <FilterChip
            key={filter.id}
            label={filter.label}
            count={value.length}
            width={filter.width}
            onClear={() => onChange(filter.id, [])}
          >
            <FilterDropdown
              options={filter.options}
              value={value}
              multiple
              onChange={(next) => onChange(filter.id, next)}
            />
          </FilterChip>
        );
      })}
      {extra}
    </Box>
  );
}

export default FilterBar;
