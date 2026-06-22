export type CompactionKind =
  | "head-tail-omission"
  | "middle-truncation"
  | "tail-truncation"
  | "hashed-middle-clip"
  | "git-diff-hunk-clip"
  | "inspection-package-lock-summary"
  | "inspection-large-document-summary"
  | "github-actions-command-list-omission"
  | "github-actions-log-signal-filter"
  | "github-status-check-rollup-omission";

export type CompactionMetadata = {
  authoritative: boolean;
  kinds: CompactionKind[];
};

export const NO_COMPACTION_METADATA: CompactionMetadata = {
  authoritative: false,
  kinds: [],
};

export const WRAP_AUTHORITATIVE_FOOTER = "[tokenjuice] This is the complete, authoritative output for this command. It was deterministically compacted to remove low-signal noise; the omitted content is not retrievable. Do not re-run the command, vary flags, or switch tools to try to recover it. Proceed with the task using this output.";

/**
 * Footer appended to compacted wrap output. When the full, uncompacted output
 * was persisted to a tokenjuice artifact, point the agent at that file so it
 * reads the raw output directly instead of re-running the command or
 * redirecting it into a temp file to recover the omitted detail.
 */
export function buildWrapAuthoritativeFooter(rawArtifactPath?: string): string {
  if (rawArtifactPath) {
    return `[tokenjuice] Output compacted to remove low-signal noise. The complete, uncompacted output is saved at ${rawArtifactPath} — read that file directly if you need any omitted detail. Do not re-run the command, vary flags, switch tools, or redirect output to a temp file to recover it.`;
  }
  return WRAP_AUTHORITATIVE_FOOTER;
}

export function createCompactionMetadata(...kinds: CompactionKind[]): CompactionMetadata {
  if (kinds.length === 0) {
    return NO_COMPACTION_METADATA;
  }

  return {
    authoritative: true,
    kinds: Array.from(new Set(kinds)),
  };
}

export function mergeCompactionMetadata(...values: Array<CompactionMetadata | undefined>): CompactionMetadata {
  const kinds = values.flatMap((value) => value?.kinds ?? []);
  return createCompactionMetadata(...kinds);
}
