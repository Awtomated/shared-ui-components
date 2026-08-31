// Canonical list of modules selectable via the "/" command - the single
// source of truth every host app's module picker (Time Log, Notes, ...)
// filters/displays, so they never drift out of sync with each other. There is
// no backend "list of modules" endpoint anywhere - this static list *is* the
// module directory. Icons are a presentational, host-side concern (this
// package has no opinion on which icon set a host uses) - hosts merge their
// own icon per moduleKey on top of this list if they want icon rows.
export const MODULE_LINK_TYPES = [
  { moduleKey: "project", label: "Project" },
  { moduleKey: "task", label: "Task" },
  { moduleKey: "deal", label: "Deal" },
  { moduleKey: "finance", label: "Finance" },
  { moduleKey: "contact", label: "Contact" },
  { moduleKey: "company", label: "Company" },
  { moduleKey: "invoice", label: "Invoice" },
  { moduleKey: "estimate", label: "Estimate" },
  { moduleKey: "purchase_order", label: "Purchase Order" },
  { moduleKey: "payout", label: "Payout" },
  { moduleKey: "transaction", label: "Transaction" },
  { moduleKey: "vendor", label: "Vendor" },
  { moduleKey: "ticket", label: "Ticket" },
  { moduleKey: "drive", label: "Drive" },
  { moduleKey: "workflow", label: "Workflow" },
];

export function getModuleLinkType(moduleKey) {
  return MODULE_LINK_TYPES.find((module) => module.moduleKey === moduleKey) || null;
}

/** Synchronous label filter - the module list is static and small, no debounce needed. */
export function searchModuleLinkTypes(query) {
  const q = (query || "").trim().toLowerCase();
  if (!q) return MODULE_LINK_TYPES;
  return MODULE_LINK_TYPES.filter((module) => module.label.toLowerCase().includes(q));
}

export default MODULE_LINK_TYPES;
