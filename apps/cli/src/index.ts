/**
 * bible — terminal client for Bible RAG Agents.
 *
 * Standalone (via Ollama) or pointed at the backend. Commands (ask | council |
 * chat | eval) are implemented in Phase 6.
 */
const [command, ...rest] = process.argv.slice(2);

console.log(
  `bible CLI — command: ${command ?? "(none)"}${rest.length ? ` args: ${rest.join(" ")}` : ""}`,
);
console.log("Not yet implemented. See docs/OVERVIEW.md for the roadmap.");
