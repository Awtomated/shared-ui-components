import { Extension } from "@tiptap/core";
import Suggestion from "@tiptap/suggestion";
import { PluginKey } from "@tiptap/pm/state";
import CommandDropdownList from "./CommandDropdownList";
import { mountFloatingList } from "./popupPositioning";

export const SLASH_PLUGIN_KEY = new PluginKey("slashCommand");

// A single "/" can mean two different things depending on what's immediately
// before the cursor: if it's an unresolved moduleChip, "/" opens the entity
// picker scoped to that module; otherwise it opens the module picker. Reading
// the plugin's own state here (rather than the `range` argument, which
// items() doesn't receive) works because ProseMirror has already applied the
// transaction - and therefore updated this plugin's state - by the time
// items() runs (verified against @tiptap/suggestion's view().update()).
function resolveMode(editor) {
  const state = SLASH_PLUGIN_KEY.getState(editor.state);
  const range = state?.range;
  if (!range) return { mode: "module" };
  const { nodeBefore } = editor.state.doc.resolve(range.from);
  if (nodeBefore?.type.name === "moduleChip") {
    return {
      mode: "entity",
      moduleKey: nodeBefore.attrs.moduleKey,
      moduleLabel: nodeBefore.attrs.moduleLabel,
    };
  }
  return { mode: "module" };
}

/**
 * One "/" trigger, one Suggestion plugin. It cannot extend Mention (Mention's
 * default command() can only insert its own node type), so this is a bare
 * Extension whose addProseMirrorPlugins() builds the Suggestion by hand and
 * inserts either a moduleChip or an entityChip depending on resolveMode().
 * Deliberately does not append a trailing space node after insertion (unlike
 * Mention's default command()) - that space would sit between the moduleChip
 * and a following "/", breaking the nodeBefore adjacency check above.
 *
 * searchModules(query) => [{ moduleKey, label, icon }] drives the first "/"
 * (module picker); getEntityProvider(moduleKey) => { isEmpty, load(query) }
 * drives the second "/" (entity picker scoped to the chosen module). Both are
 * the host app's own registries (e.g. Timesheet's moduleData.js /
 * entities/entityProviders.js) - without them, "/" always renders empty.
 */
export function createSlashCommandExtension({
  searchModules,
  getEntityProvider,
} = {}) {
  return Extension.create({
    name: "slashCommand",
    addOptions() {
      return {
        suggestion: {
          char: "/",
          pluginKey: SLASH_PLUGIN_KEY,
          items: ({ editor, query }) => ({ ...resolveMode(editor), query }),
          command: ({ editor, range, props }) => {
            if (props.mode === "entity") {
              editor
                .chain()
                .focus()
                .insertContentAt(range, {
                  type: "entityChip",
                  attrs: {
                    moduleKey: props.moduleKey,
                    entityId: props.entityId,
                    entityLabel: props.entityLabel,
                  },
                })
                .run();
            } else {
              editor
                .chain()
                .focus()
                .insertContentAt(range, {
                  type: "moduleChip",
                  attrs: {
                    moduleKey: props.moduleKey,
                    moduleLabel: props.moduleLabel,
                  },
                })
                .run();
            }
          },
          render: () =>
            mountFloatingList(CommandDropdownList, {
              searchModules,
              getEntityProvider,
            }),
        },
      };
    },
    addProseMirrorPlugins() {
      return [Suggestion({ editor: this.editor, ...this.options.suggestion })];
    },
  });
}

export default createSlashCommandExtension;
