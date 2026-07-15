import { Node, mergeAttributes } from "@tiptap/core";

const DEFAULT_ACCENT = "#1976d2";

// See moduleChipExtension.js: an invisible break point so runs of adjacent,
// space-less chips wrap onto a new line instead of overflowing the editor.
const ZERO_WIDTH_SPACE = "​";

/** Inline atom chip inserted by the second "/" command, scoped to the moduleChip it follows, e.g. "BMW Manual 2025" after "/Project". */
export const EntityChip = Node.create({
  name: "entityChip",
  group: "inline",
  inline: true,
  atom: true,
  selectable: false,
  addOptions() {
    return { accentColor: DEFAULT_ACCENT };
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
});

export default EntityChip;
