import type {
  GenerateOptions,
  LLMProvider,
  LoadProgress,
  ProviderCapabilities,
  StreamChunk,
} from "@bible-rag/core";
import {
  type ChatCompletionMessageParam,
  CreateMLCEngine,
  type InitProgressReport,
  type MLCEngine,
} from "@mlc-ai/web-llm";

/** Small, multilingual, WebGPU-runnable default. Strong German for the DE corpus. */
export const DEFAULT_WEBLLM_MODEL = "gemma-2-2b-it-q4f16_1-MLC";

/** In-browser generation via WebLLM (WebGPU). */
export class WebLLMProvider implements LLMProvider {
  readonly id = "webllm";
  readonly modelId: string;
  readonly capabilities: ProviderCapabilities = {
    streaming: true,
    maxContext: 4096,
    multilingual: true,
  };
  private engine: MLCEngine | undefined;

  constructor(modelId: string = DEFAULT_WEBLLM_MODEL) {
    this.modelId = modelId;
  }

  async init(onProgress?: (p: LoadProgress) => void): Promise<void> {
    this.engine = await CreateMLCEngine(this.modelId, {
      initProgressCallback: (r: InitProgressReport) => {
        onProgress?.({ loaded: r.progress, total: 1, stage: r.text });
      },
    });
  }

  async *stream(opts: GenerateOptions): AsyncIterable<StreamChunk> {
    if (!this.engine) throw new Error("WebLLMProvider not initialized");
    const completion = await this.engine.chat.completions.create({
      messages: opts.messages as ChatCompletionMessageParam[],
      temperature: opts.temperature,
      max_tokens: opts.maxTokens,
      stream: true,
    });
    for await (const chunk of completion) {
      const delta = chunk.choices[0]?.delta?.content ?? "";
      if (delta) yield { delta, done: false };
    }
    yield { delta: "", done: true };
  }

  async dispose(): Promise<void> {
    await this.engine?.unload();
  }
}

/** True when the browser exposes WebGPU (required for in-browser generation). */
export function hasWebGPU(): boolean {
  return typeof navigator !== "undefined" && "gpu" in navigator;
}
