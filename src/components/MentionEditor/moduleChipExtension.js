import { Node, mergeAttributes } from "@tiptap/core";
import { Plugin, PluginKey } from "@tiptap/pm/state";
import { Decoration, DecorationSet } from "@tiptap/pm/view";

// Brand-neutral fallback - host apps override via ModuleChip.configure({ accentColor })
// to match their own theme (main-app's Timesheet passes its primary purple).
const DEFAULT_ACCENT = "#1976d2";

// Chips sit flush against whatever follows (no literal space - see below), so
// there's no line-break opportunity between them and a run of chips overflows
// instead of wrapping. A zero-width space is invisible but still a valid break
// point, so appending it to the rendered text fixes wrapping without a visible gap.
const ZERO_WIDTH_SPACE = "​";

/** Inline atom chip inserted by the first "/" command, e.g. "/Project". Holds no entity - just the chosen module. */
export const ModuleChip = Node.create({
  name: "moduleChip",
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
      moduleLabel: {
        default: null,
        parseHTML: (element) => element.getAttribute("data-module-label"),
        renderHTML: (attributes) =>
          attributes.moduleLabel
            ? { "data-module-label": attributes.moduleLabel }
            : {},
      },
    };
  },
  parseHTML() {
    return [{ tag: 'span[data-type="moduleChip"]' }];
  },
  // `selectable: false` means ProseMirror's default Backspace chain
  // (deleteSelection -> joinBackward -> selectNodeBackward) can never turn
  // the cursor sitting right after this chip into a NodeSelection - so
  // without this handler, Backspace right after a moduleChip is a silent
  // no-op. @tiptap/extension-mention hits the same issue for its own
  // selectable:false atom and fixes it exactly this way (see
  // mentionExtension.js) - mirrored here.
  addKeyboardShortcuts() {
    return {
      Backspace: () =>
        this.editor.commands.command(({ tr, state }) => {
          const { selection } = state;
          if (!selection.empty) return false;
          let deleted = false;
          state.doc.nodesBetween(
            selection.anchor - 1,
            selection.anchor,
            (node, pos) => {
              if (node.type.name === this.name) {
                tr.delete(pos, pos + node.nodeSize);
                deleted = true;
                return false;
              }
            }
          );
          return deleted;
        }),
    };
  },
  // Rendered outside React (Tiptap's renderHTML), so styling is built from
  // this.options rather than a theme hook - see MentionCommandEditor.js.
  // Deliberately no trailing space is inserted after this chip (see
  // slashCommandExtension.js): the "/" trigger detects an unresolved module by
  // checking the node immediately before the cursor, which only works if that
  // node stays adjacent.
  // Plain inline text - no chip/pill background or border, just a colored
  // underline sized to the text via text-decoration (not border-bottom, which
  // would need extra box sizing to avoid stretching past the text).
  renderHTML({ HTMLAttributes, node }) {
    const style = [
      "font-weight:500",
      "text-decoration-line:underline",
      `text-decoration-color:${this.options.accentColor}`,
      "text-decoration-thickness:2px",
      "text-underline-offset:3px",
    ].join(";");
    return [
      "span",
      mergeAttributes(
        {
          "data-type": "moduleChip",
          class: "mention-editor-module-chip",
          style,
        },
        HTMLAttributes
      ),
      `/${node.attrs.moduleLabel}${ZERO_WIDTH_SPACE}`,
    ];
  },
  renderText({ node }) {
    return `/${node.attrs.moduleLabel}`;
  },
  // Once a moduleChip ("/Project") is immediately followed by its entityChip
  // ("BMW Manual 2025"), the module label has done its job (scoping the
  // entity picker) and is just noise in the input - hide it visually via a
  // decoration. The node itself stays in the document either way: its
  // moduleKey/moduleLabel are still needed by mentionSerializer.js's
  // extractModuleEntityPairs() to build a module+entity payload. A plain CSS
  // ":has()" selector would do this declaratively, but isn't supported in
  // every browser this ships to, so the visibility is computed here from the
  // actual document structure instead (verified in an old bundled Chromium
  // where ":has()" silently failed).
  addProseMirrorPlugins() {
    return [
      new Plugin({
        key: new PluginKey("moduleChipHideWhenResolved"),
        props: {
          decorations(state) {
            const decorations = [];
            state.doc.descendants((node, pos) => {
              if (node.type.name !== "moduleChip") return;
              const after = state.doc.resolve(pos + node.nodeSize).nodeAfter;
              if (
                after?.type.name === "entityChip" &&
                after.attrs.moduleKey === node.attrs.moduleKey
              ) {
                decorations.push(
                  Decoration.node(pos, pos + node.nodeSize, {
                    style: "display:none",
                  })
                );
              }
            });
            return DecorationSet.create(state.doc, decorations);
          },
        },
      }),
    ];
  },
});

export default ModuleChip;
