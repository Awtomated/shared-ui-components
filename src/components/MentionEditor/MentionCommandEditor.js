import { forwardRef, useEffect, useImperativeHandle, useMemo } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import Box from "@mui/material/Box";
import FormHelperText from "@mui/material/FormHelperText";
import { createMentionExtension } from "./mentionExtension";
import { ModuleChip } from "./moduleChipExtension";
import { EntityChip } from "./entityChipExtension";
import { createSlashCommandExtension } from "./slashCommandExtension";
import { createRichTextExtensions } from "../RichTextFormattingToolbar/extensions";
import {
  docJSONToStructured,
  EMPTY_DESCRIPTION_VALUE,
} from "./mentionSerializer";

/**
 * Rich text description field with "@" mention (people picker) and "/"
 * command (module -> entity picker) support. Stores structured content
 * ({ content: [...], plainText }) instead of a plain string - see
 * mentionSerializer.js for the shape.
 *
 * This component renders UI and emits `onChange` only - it has no built-in
 * notion of who "@" resolves to or what modules/entities "/" links against.
 * Wire those in via:
 *   - searchMentions(query) => Promise<groups[]> | groups[], each group
 *     { entityType, label, items: [{ id, label, email? }] } - powers "@".
 *   - searchModules(query) => [{ moduleKey, label, icon }] - powers the
 *     first "/" (module picker).
 *   - getEntityProvider(moduleKey) => { isEmpty, load(query) => Promise<[{id,label}]> }
 *     - powers the second "/" (entity picker scoped to the chosen module).
 *   - accentColor - hex/css color for mention & chip text, since Tiptap's
 *     renderHTML runs outside React and can't read a theme hook.
 * Any of these can be omitted if a host app only needs a subset (e.g. just
 * "@" mentions, no "/" commands) - the missing trigger simply renders empty
 * results instead of erroring.
 *
 * A ref exposes `insertText(text)`, inserting plain text at the current
 * cursor position (falling back to the end of the doc if the editor never
 * had focus) - e.g. for an emoji-picker button that lives outside the
 * editor and can't reach Tiptap's own command API otherwise - and
 * `getEditor()`, returning the live Tiptap `Editor` instance for anything
 * that needs the real command API, such as RichTextFormattingToolbar.
 * `onEditorReady(editor)` fires once the instance exists, for callers that
 * need it via state/props instead of imperatively through the ref.
 *
 * Bold/italic/strike/underline/lists/checklist/alignment/font-family are
 * enabled so RichTextFormattingToolbar has matching extensions to drive -
 * see createRichTextExtensions in ../RichTextFormattingToolbar/extensions.js.
 * Headings/blockquote/code-block/horizontal-rule stay off; this editor is
 * only meant for the single-paragraph-style note/comment body, not a full
 * document.
 */
const MentionCommandEditor = forwardRef(function MentionCommandEditor({
  value,
  onChange,
  onBlur,
  onEditorReady,
  error,
  helperText,
  placeholder,
  searchMentions,
  searchModules,
  getEntityProvider,
  accentColor,
  minHeight = "24px",
}, ref) {
  const extensions = useMemo(
    () => [
      StarterKit.configure({
        code: false,
        codeBlock: false,
        blockquote: false,
        heading: false,
        horizontalRule: false,
        dropcursor: false,
        gapcursor: false,
      }),
      Placeholder.configure({ placeholder }),
      ...createRichTextExtensions(),
      createMentionExtension({ searchMentions, accentColor }),
      accentColor ? ModuleChip.configure({ accentColor }) : ModuleChip,
      accentColor ? EntityChip.configure({ accentColor }) : EntityChip,
      createSlashCommandExtension({ searchModules, getEntityProvider }),
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [placeholder, searchMentions, searchModules, getEntityProvider, accentColor]
  );

  const editor = useEditor({
    extensions,
    content: "",
    onUpdate: ({ editor: editorInstance }) => {
      onChange(docJSONToStructured(editorInstance.getJSON()));
    },
    onBlur: () => onBlur?.(),
  });

  // Tiptap is uncontrolled internally, so when the surrounding form resets
  // (modal close/reopen) we have to clear the editor's own state by hand.
  useEffect(() => {
    if (editor && value === EMPTY_DESCRIPTION_VALUE && !editor.isEmpty) {
      editor.commands.clearContent();
    }
  }, [editor, value]);

  useEffect(() => () => editor?.destroy(), [editor]);

  useEffect(() => {
    if (editor) onEditorReady?.(editor);
  }, [editor, onEditorReady]);

  useImperativeHandle(ref, () => ({
    insertText: (text) => {
      if (!editor) return;
      editor.chain().focus().insertContent(text).run();
    },
    getEditor: () => editor,
  }), [editor]);

  return (
    <Box>
      <Box
        sx={{
          fontSize: 15,
          "& .ProseMirror": {
            outline: "none",
            minHeight,
            overflowWrap: "anywhere",
          },
          "& .ProseMirror p": { lineHeight: "28px" },
          "& .ProseMirror ul:not([data-type='taskList'])": { listStyle: "disc", pl: "24px" },
          "& .ProseMirror ol": { listStyle: "decimal", pl: "24px" },
          "& .ProseMirror ul[data-type='taskList']": { listStyle: "none", pl: 0 },
          "& .ProseMirror ul[data-type='taskList'] li": {
            display: "flex",
            alignItems: "flex-start",
            gap: "6px",
          },
          "& .ProseMirror ul[data-type='taskList'] li > label": { mt: "6px", userSelect: "none" },
          "& .ProseMirror ul[data-type='taskList'] li > div": { flex: 1 },
          "& .ProseMirror ul[data-type='taskList'] li[data-checked='true'] > div": {
            color: "text.disabled",
            textDecoration: "line-through",
          },
          "& .ProseMirror p.is-editor-empty": { overflow: "hidden" },
          "& .ProseMirror p.is-editor-empty::before": {
            content: "attr(data-placeholder)",
            color: "text.disabled",
            float: "left",
            height: 0,
            pointerEvents: "none",
          },
        }}
      >
        <EditorContent editor={editor} />
      </Box>
      {error && <FormHelperText error>{helperText}</FormHelperText>}
    </Box>
  );
});

export default MentionCommandEditor;
