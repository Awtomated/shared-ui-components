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
 * Builds the {onStart, onUpdate, onKeyDown, onExit} lifecycle Tiptap's
 * Suggestion `render()` expects: mounts ListComponent via ReactRenderer into a
 * manually absolutely-positioned div appended to document.body (no tippy.js
 * dependency), repositioned from the trigger's clientRect() on every update.
 * extraProps are merged into every render so a trigger can pin a static mode
 * (e.g. { mode: "grouped" } for @mention) without duplicating this plumbing.
 */
export function mountFloatingList(ListComponent, extraProps = {}) {
  let component = null;
  let popupEl = null;
  let dismissed = false;

  return {
    onStart: (props) => {
      dismissed = false;
      component = new ReactRenderer(ListComponent, {
        props: { ...props, ...extraProps },
        editor: props.editor,
      });
      popupEl = document.createElement("div");
      popupEl.style.position = "absolute";
      popupEl.style.zIndex = String(POPUP_Z_INDEX);
      document.body.appendChild(popupEl);
      popupEl.appendChild(component.element);
      positionPopup(popupEl, props.clientRect);
    },
    onUpdate: (props) => {
      component?.updateProps({ ...props, ...extraProps });
      positionPopup(popupEl, props.clientRect);
      if (!dismissed && popupEl) popupEl.style.display = "";
    },
    onKeyDown: (props) => {
      if (props.event.key === "Escape") {
        dismissed = true;
        if (popupEl) popupEl.style.display = "none";
        props.event.preventDefault();
        props.event.stopPropagation();
        return true;
      }
      const handled = component?.ref?.onKeyDown(props) ?? false;
      if (handled) {
        props.event.preventDefault();
        props.event.stopPropagation();
      }
      return handled;
    },
    onExit: () => {
      popupEl?.remove();
      component?.destroy();
      popupEl = null;
      component = null;
    },
  };
}
