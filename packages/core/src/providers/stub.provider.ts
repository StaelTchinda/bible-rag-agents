import type { GenerateOptions, LLMProvider, ProviderCapabilities, StreamChunk } from "./types";

/**
 * Deterministic, dependency-free LLM for tests and offline development. It does
 * not reason — it returns a fixed transformation of the prompt — so the runtime,
 * prompt assembly, and citation flow can be exercised without a real model.
 */
export class StubLLMProvider implements LLMProvider {
  readonly id = "stub";
  readonly modelId = "stub-echo";
  readonly capabilities: ProviderCapabilities = {
    streaming: true,
    maxContext: 8192,
    multilingual: true,
  };

  private readonly responder: (opts: GenerateOptions) => string;

  constructor(responder?: (opts: GenerateOptions) => string) {
    this.responder = responder ?? defaultResponse;
  }

  init(): Promise<void> {
    return Promise.resolve();
  }

  async *stream(opts: GenerateOptions): AsyncIterable<StreamChunk> {
    const text = this.responder(opts);
    for (const token of text.split(/(\s+)/)) {
      yield { delta: token, done: false };
    }
    yield { delta: "", done: true };
  }
}

function defaultResponse(opts: GenerateOptions): string {
  const lastUser = [...opts.messages].reverse().find((m) => m.role === "user");
  return `Based on the provided scripture, here is a grounded reflection on: "${lastUser?.content ?? ""}".`;
}
