import { Node, mergeAttributes } from "@tiptap/core";
import { Plugin, PluginKey } from "@tiptap/pm/state";

// Brand-neutral fallback - host apps override via EntityLink.configure({ accentColor }).
const DEFAULT_ACCENT = "#1976d2";

/**
 * Inline atom link inserted by the Composer's "Insert link" button (via
 * entityPickerPopup.js). Unlike moduleChip/entityChip - which are a
 * positionally-paired pair tied to the "/" command's own mechanics - this is
 * a single self-contained node: it always carries its own moduleKey/entityId/
 * entityLabel and renders as just the entity name, so it stays correct
 * regardless of surrounding edits.
 *
 * Click-to-navigate is a host seam, not a hardcoded route: notes-mf has no
 * visibility into main-app's route table, so this only calls
 * this.options.onNavigateEntity({ moduleKey, entityId, entityLabel }) -
 * wiring the actual navigation is the host app's job.
 */
export const EntityLink = Node.create({
  name: "entityLink",
  group: "inline",
  inline: true,
  atom: true,
  selectable: false,
  addOptions() {
    return { accentColor: DEFAULT_ACCENT, onNavigateEntity: undefined };
  },
  addAttributes() {
    return {
      moduleKey: {
        default: null,
        parseHTML: (element) => element.getAttribute("data-module-key"),
        renderHTML: (attributes) =>
          attributes.moduleKey ? { "data-module-key": attributes.moduleKey } : {},
      },
      moduleLabel: {
        default: null,
        parseHTML: (element) => element.getAttribute("data-module-label"),
        renderHTML: (attributes) =>
          attributes.moduleLabel
            ? { "data-module-label": attributes.moduleLabel }
            : {},
      },
      entityId: {
        default: null,
        parseHTML: (element) => element.getAttribute("data-entity-id"),
        renderHTML: (attributes) =>
          attributes.entityId ? { "data-entity-id": attributes.entityId } : {},
      },
      entityLabel: {
        default: null,
        parseHTML: (element) => element.getAttribute("data-entity-label"),
        renderHTML: (attributes) =>
          attributes.entityLabel
            ? { "data-entity-label": attributes.entityLabel }
            : {},
      },
    };
  },
  parseHTML() {
    return [{ tag: 'a[data-type="entityLink"]' }];
  },
  // Rendered outside React (Tiptap's renderHTML), so styling is built from
  // this.options rather than a theme hook - see moduleChipExtension.js.
  renderHTML({ HTMLAttributes, node }) {
    const style = [
      "font-weight:500",
      "text-decoration-line:underline",
      `text-decoration-color:${this.options.accentColor}`,
      "text-decoration-thickness:2px",
      "text-underline-offset:3px",
      "cursor:pointer",
    ].join(";");
    return [
      "a",
      mergeAttributes(
        {
          "data-type": "entityLink",
          class: "mention-editor-entity-link",
          href: "#",
          style,
        },
        HTMLAttributes
      ),
      node.attrs.entityLabel,
    ];
  },
  renderText({ node }) {
    return node.attrs.entityLabel;
  },
  // handleClick (not a nodeView) so this stays consistent with
  // moduleChip/entityChip's plain-renderHTML approach - no React involved in
  // rendering the editor's live content.
  addProseMirrorPlugins() {
    const { onNavigateEntity } = this.options;
    return [
      new Plugin({
        key: new PluginKey("entityLinkClick"),
        props: {
          handleClick: (view, pos, event) => {
            const target = event.target.closest?.('[data-type="entityLink"]');
            if (!target || !view.dom.contains(target)) return false;
            event.preventDefault();
            onNavigateEntity?.({
              moduleKey: target.getAttribute("data-module-key"),
              entityId: target.getAttribute("data-entity-id"),
              entityLabel: target.getAttribute("data-entity-label"),
            });
            return true;
          },
        },
      }),
    ];
  },
});

export default EntityLink;
