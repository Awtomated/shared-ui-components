import Underline from "@tiptap/extension-underline";
import TextStyle from "@tiptap/extension-text-style";
import FontFamily from "@tiptap/extension-font-family";
import TextAlign from "@tiptap/extension-text-align";
import TaskList from "@tiptap/extension-task-list";
import TaskItem from "@tiptap/extension-task-item";

/**
 * Tiptap extensions backing RichTextFormattingToolbar's commands. StarterKit
 * alone covers bold/italic/strike/lists (as long as a host doesn't disable
 * them in its own .configure()) but has no underline, font-family,
 * text-align, or checklist support, so any editor that wants to render
 * this toolbar needs to merge these into its own extensions array.
 *
 * alignTypes: node types TextAlign applies to - kept host-configurable
 * since not every consumer enables headings/blockquotes alongside
 * paragraphs.
 */
export function createRichTextExtensions({ alignTypes = ["paragraph"] } = {}) {
  return [
    Underline,
    TextStyle,
    FontFamily,
    TextAlign.configure({ types: alignTypes }),
    TaskList,
    TaskItem.configure({ nested: true }),
  ];
}
