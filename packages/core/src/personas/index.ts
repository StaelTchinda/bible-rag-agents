import type { PersonaConfig } from "../agent/persona";
import { berean } from "./berean";
import { comforter } from "./comforter";
import { deceiver } from "./deceiver";
import { historian } from "./historian";
import { jester } from "./jester";
import { moralist } from "./moralist";

/**
 * The persona registry. Order here is the order shown in the UI. The Deceiver is
 * last by design (it ships with guardrails and is meant to be read against The Berean).
 * Adding an agent = import its config and add it to this list.
 */
const ALL: readonly PersonaConfig[] = [berean, historian, moralist, comforter, jester, deceiver];

export const PERSONAS: Record<string, PersonaConfig> = Object.fromEntries(
  ALL.map((p) => [p.id, p]),
);
export const PERSONA_LIST = ALL;

export function getPersona(id: string): PersonaConfig | undefined {
  return PERSONAS[id];
}

export { berean, comforter, deceiver, historian, jester, moralist };
