import type { ChatMessage } from "../providers/types";
import type { Citation } from "../rag/retriever";
import type { PersonaConfig } from "./persona";

/** Render retrieved citations as a CONTEXT block the model is told to rely on. */
export function formatContext(citations: Citation[]): string {
  if (citations.length === 0) return "";
  return citations
    .map((c) => {
      const parallels = c.parallels?.length
        ? c.parallels.map((p) => `\n    (${p.translation}) ${p.text}`).join("")
        : "";
      return `[${c.ref} · ${c.translation}] ${c.text}${parallels}`;
    })
    .join("\n");
}

export function formatSystemPrompt(personaSystemPrompt: PersonaConfig["systemPrompt"]): string {
  if (typeof personaSystemPrompt === "string") {
    return personaSystemPrompt;
  }
  return `${personaSystemPrompt.role}. ${personaSystemPrompt.task}` 
    + 
  (personaSystemPrompt.outputFormat
    ? `<OUTPUT_FORMAT>
    ${personaSystemPrompt.outputFormat}
    </OUTPUT_FORMAT>` 
    : "")
    +
  (personaSystemPrompt.examples?.length
    ? `
    <EXAMPLES>
    ${personaSystemPrompt.examples.map((e) => `- ${e}`).join("\n")}
    </EXAMPLES>`
    : "")
    +
  (personaSystemPrompt.context 
    ? `<CONTEXT>
    ${personaSystemPrompt.context}
    </CONTEXT>` 
    : ""); 
}

export function formatUserPrompt(userQuery: string, citations: Citation[]): string {
  const context = formatContext(citations);
  return `Please react to the below user query according to your personality and the provided context. If the context is not helpful, you may ignore it.
  <USERQUERY>
  ${userQuery}
  </USERQUERY>
  <CONTEXT>
  ${context}
  </CONTEXT>`;
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
  const systemPrompt = formatSystemPrompt(persona.systemPrompt);
  const userPrompt = formatUserPrompt(userQuery, citations);

  return [{ role: "system", content: systemPrompt }, ...history, { role: "user", content: userPrompt }];
}
