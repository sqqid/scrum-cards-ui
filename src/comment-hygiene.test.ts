import { readdirSync, readFileSync, statSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import * as ts from "typescript";
import { describe, expect, it } from "vitest";

const srcDir = dirname(fileURLToPath(import.meta.url));

const tsFiles = (dir: string): string[] => {
  const files: string[] = [];
  for (const entry of readdirSync(dir)) {
    const path = join(dir, entry);
    if (statSync(path).isDirectory()) {
      files.push(...tsFiles(path));
    } else if (/\.(ts|tsx)$/.test(entry)) {
      files.push(path);
    }
  }
  return files;
};

const isFunctionalComment = (text: string) => {
  const trimmed = text.trimStart();
  return (
    trimmed.startsWith("// @vitest-environment") || trimmed.startsWith("/// <reference")
  );
};

const commentsIn = (path: string): string[] => {
  const content = readFileSync(path, "utf8");
  const sourceFile = ts.createSourceFile(
    path,
    content,
    ts.ScriptTarget.ES2020,
    true,
    path.endsWith(".tsx") ? ts.ScriptKind.TSX : ts.ScriptKind.TS
  );
  const ranges = new Map<number, ts.CommentRange>();
  const visit = (node: ts.Node) => {
    for (const range of ts.getLeadingCommentRanges(content, node.pos) ?? []) {
      ranges.set(range.pos, range);
    }
    for (const range of ts.getTrailingCommentRanges(content, node.end) ?? []) {
      ranges.set(range.pos, range);
    }
    ts.forEachChild(node, visit);
  };
  visit(sourceFile);
  return [...ranges.values()].map((range) => content.substring(range.pos, range.end));
};

describe("src comment hygiene", () => {
  it("keeps every TypeScript file free of comments except functional directives", () => {
    for (const path of tsFiles(srcDir)) {
      for (const text of commentsIn(path)) {
        expect(isFunctionalComment(text), `${path} keeps a comment: ${JSON.stringify(text)}`).toBe(
          true
        );
      }
    }
  });
});
