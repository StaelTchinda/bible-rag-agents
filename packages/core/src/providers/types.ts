export type Role = "system" | "user" | "assistant";

export interface ChatMessage {
  role: Role;
  content: string;
}

export interface StreamChunk {
  /** Incremental text since the previous chunk. */
  delta: string;
  done: boolean;
}

export interface GenerateOptions {
  messages: ChatMessage[];
  temperature?: number;
  maxTokens?: number;
  stop?: string[];
  signal?: AbortSignal;
}

export interface ProviderCapabilities {
  streaming: boolean;
  maxContext: number;
  multilingual: boolean;
}

export interface LoadProgress {
  loaded: number;
  total: number;
  stage: string;
}

/** A streaming text generator. The single generation entrypoint for every backend. */
export interface LLMProvider {
  readonly id: string;
  readonly modelId: string;
  readonly capabilities: ProviderCapabilities;
  /** Lazily load weights / open a connection. */
  init(onProgress?: (p: LoadProgress) => void): Promise<void>;
  stream(opts: GenerateOptions): AsyncIterable<StreamChunk>;
  dispose?(): Promise<void>;
}

export type EmbeddingKind = "query" | "document";

/** Produces L2-normalized embeddings. Query/document prefixing is handled internally. */
export interface EmbeddingProvider {
  readonly id: string;
  readonly modelId: string;
  readonly dimensions: number;
  init(onProgress?: (p: { loaded: number; total: number }) => void): Promise<void>;
  embed(texts: string[], kind: EmbeddingKind): Promise<Float32Array[]>;
}
