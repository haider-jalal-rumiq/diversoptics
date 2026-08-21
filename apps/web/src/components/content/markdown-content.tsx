import type { Route } from "next";
import Link from "next/link";

import {
  parseMarkdown,
  type BlockToken,
  type InlineToken,
} from "@/features/catalog/domain/markdown";

function Inline({ tokens }: { tokens: readonly InlineToken[] }) {
  return (
    <>
      {tokens.map((token, index) => {
        switch (token.kind) {
          case "strong":
            return <strong key={index}>{token.value}</strong>;
          case "emphasis":
            return <em key={index}>{token.value}</em>;
          case "link":
            // Site-relative targets use Link so navigation stays client-side;
            // external ones are plain anchors.
            return token.href.startsWith("/") ? (
              <Link
                className="underline"
                href={token.href as Route}
                key={index}
              >
                {token.value}
              </Link>
            ) : (
              <a
                className="underline"
                href={token.href}
                key={index}
                rel="noopener noreferrer"
                target="_blank"
              >
                {token.value}
              </a>
            );
          default:
            return <span key={index}>{token.value}</span>;
        }
      })}
    </>
  );
}

function Block({ token }: { token: BlockToken }) {
  switch (token.kind) {
    case "heading":
      // Blocks start at h2 because the page already owns its h1.
      return token.level === 2 ? (
        <h2 className="mt-8 font-display text-3xl leading-tight">
          <Inline tokens={token.inline} />
        </h2>
      ) : (
        <h3 className="mt-6 text-xl font-semibold">
          <Inline tokens={token.inline} />
        </h3>
      );
    case "list":
      return token.ordered ? (
        <ol className="mt-4 list-decimal space-y-2 pl-6 text-base leading-7">
          {token.items.map((item, index) => (
            <li key={index}>
              <Inline tokens={item} />
            </li>
          ))}
        </ol>
      ) : (
        <ul className="mt-4 list-disc space-y-2 pl-6 text-base leading-7">
          {token.items.map((item, index) => (
            <li key={index}>
              <Inline tokens={item} />
            </li>
          ))}
        </ul>
      );
    default:
      return (
        <p className="mt-4 max-w-prose text-base leading-7">
          <Inline tokens={token.inline} />
        </p>
      );
  }
}

/**
 * Renders CMS Markdown as React elements. Nothing is ever passed through
 * `dangerouslySetInnerHTML`, so editor content cannot inject markup.
 */
export function MarkdownContent({ source }: { source: string }) {
  const blocks = parseMarkdown(source);

  return (
    <div>
      {blocks.map((token, index) => (
        <Block key={index} token={token} />
      ))}
    </div>
  );
}
