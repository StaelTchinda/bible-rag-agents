import type { RetrievalParams } from "../rag/retriever";

export interface PersonaGuardrail {
  /** Non-dismissible label injected before the answer (e.g. the Deceiver's warning). */
  alwaysLabel?: string;
  /** Restrict the agent to a domain, e.g. "theological-argument-only". */
  boundedDomain?: string;
  /** Refuse operational-harm framings. */
  blockOperationalHarm?: boolean;
  /** Persona id auto-attached as a rebuttal in Council mode. */
  pairWith?: string;
}

export interface PersonaOutput {
  requireCitations: boolean;
  minCitations?: number;
  sections?: string[];
}

/**
 * A persona is pure data over the shared runtime: a voice (system prompt), a
 * retrieval strategy, generation settings, and optional guardrails. Adding an
 * agent is a new config object — no runtime changes.
 */
export interface PersonaConfig {
  id: string;
  displayName: string;
  description: string;
  systemPrompt: string;
  retrieval: RetrievalParams;
  generation: { temperature: number; maxTokens: number };
  output: PersonaOutput;
  guardrail?: PersonaGuardrail;
}
