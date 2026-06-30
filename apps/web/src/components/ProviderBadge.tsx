export function ProviderBadge({ modelId }: { modelId: string }) {
  return (
    <span className="badge" title="Inference runs on your device — nothing leaves your browser">
      🔒 Running locally · {modelId}
    </span>
  );
}
