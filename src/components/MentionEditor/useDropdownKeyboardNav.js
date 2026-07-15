import { useEffect, useState } from "react";

/**
 * Shared Up/Down/Enter/Escape (wraparound) keyboard handling over a flat list
 * of selectable row indexes, used by every CommandDropdownList mode
 * (grouped/module/entity) so each doesn't reimplement the same nav logic.
 */
export function useDropdownKeyboardNav(selectableIndexes, commit) {
  const [selectedIndex, setSelectedIndex] = useState(
    selectableIndexes[0] ?? -1
  );

  useEffect(() => {
    setSelectedIndex(selectableIndexes[0] ?? -1);
  }, [selectableIndexes]);

  const selectByOffset = (offset) => {
    if (!selectableIndexes.length) return;
    const currentPos = selectableIndexes.indexOf(selectedIndex);
    const nextPos =
      (currentPos + offset + selectableIndexes.length) %
      selectableIndexes.length;
    setSelectedIndex(selectableIndexes[nextPos]);
  };

  function onKeyDown({ event }) {
    if (event.key === "ArrowDown") {
      selectByOffset(1);
      return true;
    }
    if (event.key === "ArrowUp") {
      selectByOffset(-1);
      return true;
    }
    if (event.key === "Enter" || event.key === "Tab") {
      commit(selectedIndex);
      return true;
    }
    if (event.key === "Escape") {
      return true;
    }
    return false;
  }

  return { selectedIndex, onKeyDown };
}
