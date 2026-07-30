import { createFloatingPanel } from "./popupPositioning";
import EntityPickerPanel from "./EntityPickerPanel";

/**
 * Button-triggered counterpart to the "/" module->entity picker, for the
 * Composer's "Insert link" toolbar action. Opens the exact same
 * CommandDropdownList (via EntityPickerPanel) anchored under `anchorEl`
 * instead of a ProseMirror Suggestion's clientRect - there's no typed
 * trigger character here, just a click.
 *
 * searchModules/getEntityProvider are the host's own registries (the same
 * ones wired into MentionCommandEditor's "/" command), so the module/entity
 * lists, search, loading/empty states, and keyboard nav are identical to "/".
 *
 * Resolves { moduleKey, moduleLabel, entityId, entityLabel } once an entity
 * is picked, or null if the user cancels (Escape/outside click).
 *
 * `editor` is required - @tiptap/react's ReactRenderer synchronously reads
 * editor.isInitialized in its constructor - and should be the same live
 * Editor instance the caller will insert the resulting entityLink into.
 */
export function openEntityPickerPopup({ anchorEl, editor, searchModules, getEntityProvider }) {
  return new Promise((resolve) => {
    let settled = false;

    const settle = (value) => {
      if (settled) return;
      settled = true;
      document.removeEventListener("mousedown", onOutsideClick, true);
      panel.destroy();
      resolve(value);
    };

    const panel = createFloatingPanel(
      EntityPickerPanel,
      {
        searchModules,
        getEntityProvider,
        onCommit: settle,
        onDismiss: () => settle(null),
      },
      editor
    );

    const rect = anchorEl.getBoundingClientRect();
    panel.element.style.top = `${rect.bottom + window.scrollY + 4}px`;
    panel.element.style.left = `${rect.left + window.scrollX}px`;

    function onOutsideClick(event) {
      if (!panel.element.contains(event.target) && event.target !== anchorEl) {
        settle(null);
      }
    }

    // Deferred so the same click that opened the popup (still bubbling to
    // document) doesn't immediately register as an "outside" click.
    setTimeout(() => document.addEventListener("mousedown", onOutsideClick, true), 0);
  });
}

export default openEntityPickerPopup;
