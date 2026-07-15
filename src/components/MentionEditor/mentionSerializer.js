export const EMPTY_DESCRIPTION_VALUE = { content: [], plainText: "" };

/** Returns just the mention nodes out of a structured description's content array. */
export function extractMentions(content) {
  return (content || []).filter((node) => node.type === "mention");
}

/**
 * Pairs each moduleChip with the entityChip immediately following it (same
 * moduleKey) - the shape "/Project" + "BMW Manual 2025" resolves to. A
 * moduleChip with no entityChip right after it (module chosen, entity not
 * picked yet) has nothing to pair with and is simply omitted.
 */
export function extractModuleEntityPairs(content) {
  const nodes = content || [];
  const pairs = [];
  nodes.forEach((node, index) => {
    if (node.type !== "moduleChip") return;
    const next = nodes[index + 1];
    if (next?.type === "entityChip" && next.moduleKey === node.moduleKey) {
      pairs.push({
        moduleKey: node.moduleKey,
        moduleLabel: node.moduleLabel,
        entityId: next.entityId,
        entityLabel: next.entityLabel,
      });
    }
  });
  return pairs;
}

function mentionPlainText(attrs) {
  return `@${attrs.label}`;
}

function moduleChipPlainText(attrs) {
  return `/${attrs.moduleLabel}`;
}

function entityChipPlainText(attrs) {
  return attrs.entityLabel;
}

/**
 * Converts a Tiptap document JSON (paragraphs of text/mention/moduleChip/
 * entityChip nodes) into the structured content array + plain text pair used
 * for storage/API payloads. Paragraph breaks are represented as a single
 * "\n" text segment.
 */
export function docJSONToStructured(docJSON) {
  const content = [];
  const paragraphs = docJSON?.content || [];

  paragraphs.forEach((paragraph, paragraphIndex) => {
    if (paragraphIndex > 0) {
      content.push({ type: "text", value: "\n" });
    }
    (paragraph.content || []).forEach((node) => {
      if (node.type === "text") {
        content.push({ type: "text", value: node.text });
      } else if (node.type === "mention") {
        content.push({
          type: "mention",
          entityType: node.attrs.entityType,
          id: node.attrs.id,
          label: node.attrs.label,
        });
      } else if (node.type === "moduleChip") {
        content.push({
          type: "moduleChip",
          moduleKey: node.attrs.moduleKey,
          moduleLabel: node.attrs.moduleLabel,
        });
      } else if (node.type === "entityChip") {
        content.push({
          type: "entityChip",
          moduleKey: node.attrs.moduleKey,
          entityId: node.attrs.entityId,
          entityLabel: node.attrs.entityLabel,
        });
      }
    });
  });

  // Merge adjacent text segments so identical documents always serialize the same way.
  const merged = content.reduce((acc, node) => {
    const previous = acc[acc.length - 1];
    if (node.type === "text" && previous?.type === "text") {
      previous.value += node.value;
    } else {
      acc.push({ ...node });
    }
    return acc;
  }, []);

  const plainText = merged
    .map((node, index) => {
      if (node.type === "mention") return mentionPlainText(node);
      if (node.type === "moduleChip") return moduleChipPlainText(node);
      if (node.type === "entityChip") {
        // Space-separate a moduleChip/entityChip pair in plain text even
        // though the live document has no literal space character between them.
        const previous = merged[index - 1];
        return `${
          previous?.type === "moduleChip" ? " " : ""
        }${entityChipPlainText(node)}`;
      }
      return node.value;
    })
    .join("");

  return { content: merged, plainText };
}
