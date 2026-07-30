import { ReactRenderer } from "@tiptap/react";

// Sits above a typical MUI Dialog (1300) so the popup isn't clipped behind a modal host.
export const POPUP_Z_INDEX = 1400;

function positionPopup(popupEl, clientRectFn) {
  if (!popupEl || !clientRectFn) return;
  const rect = clientRectFn();
  if (!rect) return;
  popupEl.style.top = `${rect.bottom + window.scrollY + 4}px`;
  popupEl.style.left = `${rect.left + window.scrollX}px`;
}

/**
 * Mounts ListComponent via ReactRenderer into a manually absolutely-
 * positioned div appended to document.body (no tippy.js dependency). Shared
 * by mountFloatingList (Suggestion-driven @/"/" triggers) and
 * entityPickerPopup.js's button-driven Insert Link picker - both need the
 * same mount/reposition/teardown plumbing, just fed by different lifecycles
 * (a ProseMirror Suggestion vs. a plain click handler).
 */
export function createFloatingPanel(ListComponent, initialProps, editor) {
  const component = new ReactRenderer(ListComponent, {
    props: initialProps,
    editor,
  });
  const popupEl = document.createElement("div");
  popupEl.style.position = "absolute";
  popupEl.style.zIndex = String(POPUP_Z_INDEX);
  document.body.appendChild(popupEl);
  popupEl.appendChild(component.element);

  return {
    element: popupEl,
    get ref() {
      return component.ref;
    },
    reposition: (clientRectFn) => positionPopup(popupEl, clientRectFn),
    setHidden: (hidden) => {
      popupEl.style.display = hidden ? "none" : "";
    },
    updateProps: (props) => component.updateProps(props),
    destroy: () => {
      popupEl.remove();
      component.destroy();
    },
  };
}

/**
 * Builds the {onStart, onUpdate, onKeyDown, onExit} lifecycle Tiptap's
 * Suggestion `render()` expects, on top of createFloatingPanel above.
 * extraProps are merged into every render so a trigger can pin a static mode
 * (e.g. { mode: "grouped" } for @mention) without duplicating this plumbing.
 */
export function mountFloatingList(ListComponent, extraProps = {}) {
  let panel = null;
  let dismissed = false;

  return {
    onStart: (props) => {
      dismissed = false;
      panel = createFloatingPanel(
        ListComponent,
        { ...props, ...extraProps },
        props.editor
      );
      panel.reposition(props.clientRect);
    },
    onUpdate: (props) => {
      panel?.updateProps({ ...props, ...extraProps });
      panel?.reposition(props.clientRect);
      if (!dismissed) panel?.setHidden(false);
    },
    onKeyDown: (props) => {
      if (props.event.key === "Escape") {
        dismissed = true;
        panel?.setHidden(true);
        props.event.preventDefault();
        props.event.stopPropagation();
        return true;
      }
      const handled = panel?.ref?.onKeyDown(props) ?? false;
      if (handled) {
        props.event.preventDefault();
        props.event.stopPropagation();
      }
      return handled;
    },
    onExit: () => {
      panel?.destroy();
      panel = null;
    },
  };
}
