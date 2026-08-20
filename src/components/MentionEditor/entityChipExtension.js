import { Node, mergeAttributes } from "@tiptap/core";
import { Plugin, PluginKey } from "@tiptap/pm/state";

const DEFAULT_ACCENT = "#1976d2";

// See moduleChipExtension.js: an invisible break point so runs of adjacent,
// space-less chips wrap onto a new line instead of overflowing the editor.
const ZERO_WIDTH_SPACE = "​";

/**
 * Inline atom chip inserted by the second "/" command, scoped to the
 * moduleChip it follows, e.g. "BMW Manual 2025" after "/Project".
 *
 * Click-to-navigate mirrors entityLinkExtension.js's handleClick pattern -
 * this package has no visibility into a host app's route table, so it only
 * calls this.options.onNavigateEntity({ moduleKey, entityId, entityLabel });
 * wiring the actual navigation is the host app's job.
 */
export const EntityChip = Node.create({
  name: "entityChip",
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
          attributes.moduleKey
            ? { "data-module-key": attributes.moduleKey }
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
    return [{ tag: 'span[data-type="entityChip"]' }];
  },
  // Styled identically to moduleChipExtension.js's plain-text underline so the
  // two read as one continuous "module -> entity" phrase rather than distinct
  // chips. margin-left is purely presentational (rendered HTML only) - it
  // must NOT be a real space character in the document, since
  // mentionSerializer.js's extractModuleEntityPairs() relies on the
  // entityChip node sitting immediately after its moduleChip with nothing in
  // between.
  renderHTML({ HTMLAttributes, node }) {
    const style = [
      "font-weight:500",
      "text-decoration-line:underline",
      `text-decoration-color:${this.options.accentColor}`,
      "text-decoration-thickness:2px",
      "text-underline-offset:3px",
      "margin-left:4px",
      "cursor:pointer",
    ].join(";");
    return [
      "span",
      mergeAttributes(
        {
          "data-type": "entityChip",
          class: "mention-editor-entity-chip",
          style,
        },
        HTMLAttributes
      ),
      `${node.attrs.entityLabel}${ZERO_WIDTH_SPACE}`,
    ];
  },
  renderText({ node }) {
    return node.attrs.entityLabel;
  },
  // handleClick (not a nodeView), matching entityLinkExtension.js - no React
  // involved in rendering the editor's live content.
  addProseMirrorPlugins() {
    const { onNavigateEntity } = this.options;
    return [
      new Plugin({
        key: new PluginKey("entityChipClick"),
        props: {
          handleClick: (view, pos, event) => {
            const target = event.target.closest?.('[data-type="entityChip"]');
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

export default EntityChip;
