import { useEffect, useMemo } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import Box from "@mui/material/Box";
import FormHelperText from "@mui/material/FormHelperText";
import { createMentionExtension } from "./mentionExtension";
import { ModuleChip } from "./moduleChipExtension";
import { EntityChip } from "./entityChipExtension";
import { createSlashCommandExtension } from "./slashCommandExtension";
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
 */
function MentionCommandEditor({
  value,
  onChange,
  onBlur,
  error,
  helperText,
  placeholder,
  searchMentions,
  searchModules,
  getEntityProvider,
  accentColor,
}) {
  const extensions = useMemo(
    () => [
      StarterKit.configure({
        bold: false,
        italic: false,
        strike: false,
        code: false,
        codeBlock: false,
        blockquote: false,
        bulletList: false,
        orderedList: false,
        listItem: false,
        heading: false,
        horizontalRule: false,
        dropcursor: false,
        gapcursor: false,
      }),
      Placeholder.configure({ placeholder }),
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

  return (
    <Box>
      <Box
        sx={{
          fontSize: 15,
          "& .ProseMirror": {
            outline: "none",
            minHeight: "24px",
            overflowWrap: "anywhere",
          },
          "& .ProseMirror p": { lineHeight: "28px" },
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
}

export default MentionCommandEditor;
