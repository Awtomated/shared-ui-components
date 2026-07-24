import { useEffect, useState } from "react";
import Box from "@mui/material/Box";
import Divider from "@mui/material/Divider";
import UndoIcon from "@mui/icons-material/Undo";
import RedoIcon from "@mui/icons-material/Redo";
import FormatBoldIcon from "@mui/icons-material/FormatBold";
import FormatItalicIcon from "@mui/icons-material/FormatItalic";
import FormatUnderlinedIcon from "@mui/icons-material/FormatUnderlined";
import StrikethroughSIcon from "@mui/icons-material/StrikethroughS";
import FormatAlignLeftIcon from "@mui/icons-material/FormatAlignLeft";
import FormatAlignCenterIcon from "@mui/icons-material/FormatAlignCenter";
import FormatAlignRightIcon from "@mui/icons-material/FormatAlignRight";
import FormatListBulletedIcon from "@mui/icons-material/FormatListBulleted";
import FormatListNumberedIcon from "@mui/icons-material/FormatListNumbered";
import ChecklistIcon from "@mui/icons-material/Checklist";
import ToolbarIconButton from "../ToolbarIconButton/ToolbarIconButton";
import FontFamilySelect from "./FontFamilySelect";

const DEFAULT_OPTIONS = {
  undoRedo: true,
  fontFamily: true,
  bold: true,
  italic: true,
  underline: true,
  strike: true,
  alignment: true,
  bulletList: true,
  orderedList: true,
  checklist: true,
};

const ALIGNMENTS = [
  { value: "left", Icon: FormatAlignLeftIcon, label: "Align left" },
  { value: "center", Icon: FormatAlignCenterIcon, label: "Align center" },
  { value: "right", Icon: FormatAlignRightIcon, label: "Align right" },
];

const GROUP_DIVIDER_SX = { height: "20px", alignSelf: "center", mx: "4px" };

// Mirrors main-app's fuse-configs/themesConfig.js `editorToolbar` token
// (background: #D3D0D8, borderRadius: 8), inlined here so this package has
// no dependency on main-app's internal design-token module - see
// CommonPopover.js / FilterChip.js for the same rationale. If that token's
// value ever changes in themesConfig.js, update it here too.
const TOOLBAR_BACKGROUND = "#D3D0D8";
const TOOLBAR_RADIUS = 8;

/**
 * Formatting toolbar for any Tiptap `editor` instance - generic and
 * independent of whichever module renders it (Notes, Spaces, Email
 * Composer, Comments, ...). Every control is opt-in via `options` so a host
 * only exposes commands its editor actually has extensions for (see
 * createRichTextExtensions in ./extensions.js); a control whose extension
 * isn't installed on `editor` disables itself instead of throwing on click,
 * so flipping an option off in a host that hasn't wired the matching
 * extension yet stays safe.
 *
 * Re-renders on every Tiptap transaction so active-state highlighting
 * (bold/italic/alignment/lists) stays in sync with the current selection -
 * the `editor` object itself is stable and doesn't trigger React re-renders
 * on its own.
 *
 * New tools (text color, highlight, tables, links, ...) are added the same
 * way: a new `options.<tool>` flag plus a guarded control block - existing
 * consumers that don't pass the new flag are unaffected.
 */
function RichTextFormattingToolbar({ editor, options }) {
  const [, forceUpdate] = useState(0);
  const opts = { ...DEFAULT_OPTIONS, ...options };

  useEffect(() => {
    if (!editor) return undefined;
    const rerender = () => forceUpdate((n) => n + 1);
    editor.on("transaction", rerender);
    editor.on("selectionUpdate", rerender);
    return () => {
      editor.off("transaction", rerender);
      editor.off("selectionUpdate", rerender);
    };
  }, [editor]);

  if (!editor) return null;

  const can = editor.can();
  const isActive = (name, attrs) => editor.isActive(name, attrs);
  const run = (fn) => fn(editor.chain().focus()).run();

  return (
    <Box
      sx={{
        display: "inline-flex",
        alignItems: "center",
        gap: "4px",
        padding: "4px 8px",
        width: "fit-content",
        bgcolor: TOOLBAR_BACKGROUND,
        borderRadius: `${TOOLBAR_RADIUS}px`,
      }}
    >
      {opts.undoRedo && (
        <>
          <ToolbarIconButton disabled={!can.undo?.()} onClick={() => run((c) => c.undo())}>
            <UndoIcon />
          </ToolbarIconButton>
          <ToolbarIconButton disabled={!can.redo?.()} onClick={() => run((c) => c.redo())}>
            <RedoIcon />
          </ToolbarIconButton>
          <Divider orientation="vertical" flexItem sx={GROUP_DIVIDER_SX} />
        </>
      )}

      {opts.fontFamily && (
        <>
          <FontFamilySelect editor={editor} fonts={opts.fontFamilies} />
          <Divider orientation="vertical" flexItem sx={GROUP_DIVIDER_SX} />
        </>
      )}

      {opts.bold && (
        <ToolbarIconButton
          active={isActive("bold")}
          disabled={!can.toggleBold?.()}
          onClick={() => run((c) => c.toggleBold())}
        >
          <FormatBoldIcon />
        </ToolbarIconButton>
      )}
      {opts.italic && (
        <ToolbarIconButton
          active={isActive("italic")}
          disabled={!can.toggleItalic?.()}
          onClick={() => run((c) => c.toggleItalic())}
        >
          <FormatItalicIcon />
        </ToolbarIconButton>
      )}
      {opts.underline && (
        <ToolbarIconButton
          active={isActive("underline")}
          disabled={!can.toggleUnderline?.()}
          onClick={() => run((c) => c.toggleUnderline())}
        >
          <FormatUnderlinedIcon />
        </ToolbarIconButton>
      )}
      {opts.strike && (
        <ToolbarIconButton
          active={isActive("strike")}
          disabled={!can.toggleStrike?.()}
          onClick={() => run((c) => c.toggleStrike())}
        >
          <StrikethroughSIcon />
        </ToolbarIconButton>
      )}

      {opts.alignment && (
        <>
          <Divider orientation="vertical" flexItem sx={GROUP_DIVIDER_SX} />
          {ALIGNMENTS.map(({ value, Icon, label }) => (
            <ToolbarIconButton
              key={value}
              active={isActive({ textAlign: value })}
              disabled={!can.setTextAlign?.(value)}
              onClick={() => run((c) => c.setTextAlign(value))}
              aria-label={label}
            >
              <Icon />
            </ToolbarIconButton>
          ))}
        </>
      )}

      {(opts.bulletList || opts.orderedList || opts.checklist) && (
        <Divider orientation="vertical" flexItem sx={GROUP_DIVIDER_SX} />
      )}
      {opts.bulletList && (
        <ToolbarIconButton
          active={isActive("bulletList")}
          disabled={!can.toggleBulletList?.()}
          onClick={() => run((c) => c.toggleBulletList())}
        >
          <FormatListBulletedIcon />
        </ToolbarIconButton>
      )}
      {opts.orderedList && (
        <ToolbarIconButton
          active={isActive("orderedList")}
          disabled={!can.toggleOrderedList?.()}
          onClick={() => run((c) => c.toggleOrderedList())}
        >
          <FormatListNumberedIcon />
        </ToolbarIconButton>
      )}
      {opts.checklist && (
        <ToolbarIconButton
          active={isActive("taskList")}
          disabled={!can.toggleTaskList?.()}
          onClick={() => run((c) => c.toggleTaskList())}
        >
          <ChecklistIcon />
        </ToolbarIconButton>
      )}
    </Box>
  );
}

export default RichTextFormattingToolbar;
