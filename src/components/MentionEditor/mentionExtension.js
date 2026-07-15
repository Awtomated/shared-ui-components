import Mention from "@tiptap/extension-mention";
import { createMentionSuggestion } from "./mentionSuggestion";

const DEFAULT_ACCENT = "#1976d2";

// Tiptap's renderHTML runs outside React, so the text style has to be a
// plain string built up front rather than read from a theme hook.
// Plain inline text - no chip/pill background, border, or underline; only the
// color and weight distinguish a mention from surrounding text.
function mentionTextStyle(accentColor) {
  return [`color:${accentColor}`, "font-weight:600"].join(";");
}

/**
 * Fresh Mention extension instance carrying an entityType attribute alongside
 * id/label, wired up with the host app's own "@" search.
 *
 * searchMentions(query) => groups[] is required for "@" to return any
 * results - without it the dropdown always renders empty.
 */
export function createMentionExtension({
  searchMentions,
  accentColor = DEFAULT_ACCENT,
} = {}) {
  return Mention.extend({
    name: "mention",
    addAttributes() {
      return {
        ...this.parent(),
        entityType: {
          default: null,
          parseHTML: (element) => element.getAttribute("data-entity-type"),
          renderHTML: (attributes) =>
            attributes.entityType
              ? { "data-entity-type": attributes.entityType }
              : {},
        },
      };
    },
  }).configure({
    HTMLAttributes: {
      class: "mention-editor-mention-chip",
      style: mentionTextStyle(accentColor),
    },
    renderText: ({ node }) => `@${node.attrs.label}`,
    // Backspace removes the whole chip instead of leaving a bare "@" behind,
    // matching the clean atom-delete behavior of moduleChip/entityChip.
    deleteTriggerWithBackspace: true,
    suggestion: createMentionSuggestion({ searchMentions }),
  });
}
