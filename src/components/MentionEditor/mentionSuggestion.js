import CommandDropdownList from "./CommandDropdownList";
import { mountFloatingList } from "./popupPositioning";

/**
 * Builds the Tiptap suggestion config for "@" mentions. Debouncing and
 * loading state live inside CommandDropdownList itself (mode "grouped") -
 * items() just passes the query through so the component can fetch.
 *
 * searchMentions(query) => groups[] (each { entityType, label, items }) is
 * the host app's own data source (e.g. Timesheet's mentionData.js) - this
 * package has no built-in notion of users/vendors/whatever "@" resolves to.
 */
export function createMentionSuggestion({ searchMentions } = {}) {
  return {
    items: ({ query }) => ({ query }),
    render: () =>
      mountFloatingList(CommandDropdownList, {
        mode: "grouped",
        searchMentions,
      }),
  };
}
