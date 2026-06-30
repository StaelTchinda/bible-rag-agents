import type { ChatMessage } from "../providers/types";
import type { Citation } from "../rag/retriever";
import type { PersonaConfig } from "./persona";

/** Render retrieved citations as a CONTEXT block the model is told to rely on. */
export function formatContext(citations: Citation[]): string {
  if (citations.length === 0) return "(no verses were retrieved)";
  return citations
    .map((c) => {
      const parallels = c.parallels?.length
        ? c.parallels.map((p) => `\n    (${p.translation}) ${p.text}`).join("")
        : "";
      return `[${c.ref} · ${c.translation}] ${c.text}${parallels}`;
    })
    .join("\n");
}

/**
 * Build the message list: persona voice + a CONTEXT block of retrieved verses
 * with an explicit "use ONLY these" instruction (the main anti-fabrication guard),
 * then prior turns and the new question.
 */
export function assembleMessages(
  persona: PersonaConfig,
  userQuery: string,
  citations: Citation[],
  history: ChatMessage[] = [],
): ChatMessage[] {
  const instruction =
    "CONTEXT — these are the only verses you may cite. Quote them exactly by reference and " +
    "never invent references. If they are insufficient, say so and reason from general " +
    "scriptural principle without fabricating citations.";
  const system = `${persona.systemPrompt}\n\n${instruction}\n\n${formatContext(citations)}`;

  return [{ role: "system", content: system }, ...history, { role: "user", content: userQuery }];
}
