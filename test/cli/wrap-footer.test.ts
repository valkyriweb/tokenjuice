import { describe, expect, it } from "vitest";

import { WRAP_AUTHORITATIVE_FOOTER } from "../../src/core/compaction-metadata.js";
import { decorateWrapInlineText } from "../../src/cli/main.js";

import type { CompactResult } from "../../src/types.js";

function lossyResult(overrides: Partial<CompactResult> = {}): CompactResult {
  return {
    inlineText: "summary",
    compaction: {
      authoritative: true,
      kinds: ["head-tail-omission"],
    },
    stats: {
      rawChars: 4_000,
      reducedChars: 40,
      ratio: 0.01,
    },
    classification: {
      family: "generic",
      confidence: 0.9,
      matchedReducer: "generic/fallback",
    },
    ...overrides,
  };
}

describe("decorateWrapInlineText", () => {
  it("keeps the not-retrievable footer when no raw artifact was stored", () => {
    expect(decorateWrapInlineText(lossyResult(), false)).toContain(WRAP_AUTHORITATIVE_FOOTER);
  });

  it("points the footer at the stored raw artifact when one exists", () => {
    const decorated = decorateWrapInlineText(
      lossyResult({
        rawRef: {
          id: "tj_0123456789ab",
          storage: "file",
          path: "/home/luke/.tokenjuice/artifacts/tj_0123456789ab.txt",
          metadataPath: "/home/luke/.tokenjuice/artifacts/tj_0123456789ab.json",
        },
      }),
      false,
    );
    expect(decorated).toContain("/home/luke/.tokenjuice/artifacts/tj_0123456789ab.txt");
    expect(decorated).not.toContain("not retrievable");
  });

  it("suppresses the footer for lossless rewrites", () => {
    expect(
      decorateWrapInlineText(
        lossyResult({ compaction: { authoritative: false, kinds: ["no-omit-domain-passthrough"] } }),
        false,
      ),
    ).toBe("summary");
  });
});
