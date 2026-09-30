// MentionEditor is intentionally NOT re-exported here - it's the only part
// of this package that depends on @tiptap/*, and those are marked optional
// peerDependencies. Barreling it into the main entry would force every
// consumer's bundler to resolve @tiptap/* even if they only want e.g.
// EmptyState or Avatar (this bit main-app + file-management-mf when they
// only needed StandaloneUnavailable). Import it from the "./MentionEditor"
// subpath instead - see package.json's "exports" map.
export * from "./components/FilterBar";
export * from "./components/Avatar";
export * from "./components/EmptyState";
export * from "./components/EmojiPicker";
export * from "./components/SearchInput";
export * from "./components/CommonPopover";
export * from "./components/StandaloneUnavailable";
export * from "./components/ActionMenu";
// DataTable is intentionally NOT re-exported here - it depends on the paid
// @mui/x-data-grid-pro peer dependency, which not every root-entry consumer
// installs (same reasoning as the MentionEditor/RichTextFormattingToolbar
// notes below). Import it from the "./DataTable" subpath instead - see
// package.json's "exports" map.
// Only the toolbar component itself, not the whole ./RichTextFormattingToolbar
// barrel - that barrel also re-exports createRichTextExtensions, which
// imports @tiptap/* packages (see extensions.js). Re-exporting that here
// would force every root-entry consumer (e.g. main-app, which has none of
// those installed) to resolve @tiptap/* at bundle time, same problem the
// MentionEditor note above describes. RichTextFormattingToolbar.js itself
// has no @tiptap/* imports - it only calls methods on whatever `editor`
// object it's given - so it's safe to barrel here.
export { default as RichTextFormattingToolbar } from "./components/RichTextFormattingToolbar/RichTextFormattingToolbar";
export * from "./components/ToolbarIconButton";
export * from "./components/VisibilitySelector";
export * from "./components/FileTypeIcon";
export * from "./components/DriveAttachment";
