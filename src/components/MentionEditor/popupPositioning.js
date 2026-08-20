import { ReactRenderer } from "@tiptap/react";

// Sits above a typical MUI Dialog (1300) so the popup isn't clipped behind a modal host.
export const POPUP_Z_INDEX = 1400;

// Minimum gap kept between the popup and the viewport edge when clamping.
const VIEWPORT_MARGIN = 8;

// clientRectFn gives the caret's position, not the popup's own size, so a
// caret near the right/bottom edge (e.g. a wide note editor, or the picker
// opened low on the page) would otherwise place the popup partly or fully
// off-screen. popupEl is already appended to the DOM by the time this runs
// (see createFloatingPanel below), so its real rendered size - which varies
// by state, e.g. the 260px row list vs the narrower empty/error message - is
// available via offsetWidth/offsetHeight for clamping.
function positionPopup(popupEl, clientRectFn) {
  if (!popupEl || !clientRectFn) return;
  const rect = clientRectFn();
  if (!rect) return;

  const popupWidth = popupEl.offsetWidth;
  const popupHeight = popupEl.offsetHeight;

  let left = rect.left;
  const maxLeft = window.innerWidth - popupWidth - VIEWPORT_MARGIN;
  if (left > maxLeft) left = Math.max(VIEWPORT_MARGIN, maxLeft);

  // Flip above the caret when there isn't room below, unless that would run
  // it off the top of the viewport too - then just clamp to stay on-screen.
  let top = rect.bottom + 4;
  if (top + popupHeight > window.innerHeight - VIEWPORT_MARGIN) {
    const above = rect.top - popupHeight - 4;
    top = above >= VIEWPORT_MARGIN ? above : Math.max(VIEWPORT_MARGIN, window.innerHeight - popupHeight - VIEWPORT_MARGIN);
  }

  popupEl.style.top = `${top + window.scrollY}px`;
  popupEl.style.left = `${left + window.scrollX}px`;
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

  // The popup's rendered size can change well after mount, independent of
  // tiptap's own onStart/onUpdate calls - e.g. CommandDropdownList commits
  // its first render with an empty `rows` state (before its data-fetching
  // effect runs), then grows into the real row list or shrinks into an
  // empty/error message once that effect resolves. Without watching for
  // that, positionPopup's clamp math only ever sees whatever size the popup
  // happened to be the one time tiptap called reposition(), leaving a popup
  // that grew afterward stuck at a position clamped for its old, smaller
  // size. clientRectFn itself doesn't change between these internal
  // re-renders, so the last one handed to reposition() is still valid to
  // reuse here.
  let latestClientRectFn = null;
  const resizeObserver = new ResizeObserver(() => {
    if (latestClientRectFn) positionPopup(popupEl, latestClientRectFn);
  });
  resizeObserver.observe(popupEl);

  return {
    element: popupEl,
    get ref() {
      return component.ref;
    },
    reposition: (clientRectFn) => {
      latestClientRectFn = clientRectFn;
      positionPopup(popupEl, clientRectFn);
    },
    setHidden: (hidden) => {
      popupEl.style.display = hidden ? "none" : "";
    },
    updateProps: (props) => component.updateProps(props),
    destroy: () => {
      resizeObserver.disconnect();
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
