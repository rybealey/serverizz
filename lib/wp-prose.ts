import { unified } from "unified";
import rehypeParse from "rehype-parse";
import rehypeSlug from "rehype-slug";
import rehypeSanitize, { defaultSchema } from "rehype-sanitize";
import rehypeStringify from "rehype-stringify";
import { visit } from "unist-util-visit";
import type { Element } from "hast";
import { toString as hastToString } from "hast-util-to-string";

export interface TocItem {
  id: string;
  label: string;
  level: 2 | 3;
}

/** Sanitize schema = rehype defaults + ids/classes on everything, plus image dims. */
const schema = {
  ...defaultSchema,
  clobberPrefix: "",
  attributes: {
    ...defaultSchema.attributes,
    // className is the HAST property name for the HTML `class` attribute (rehype-sanitize operates on HAST property names)
    "*": [...(defaultSchema.attributes?.["*"] ?? []), "id", "className"],
    img: [...(defaultSchema.attributes?.img ?? []), "src", "alt", "width", "height", "loading"],
    a: [...(defaultSchema.attributes?.a ?? []), "href", "title", "target", "rel"],
  },
};

/**
 * Turn WordPress post HTML into sanitized, branded-ready HTML plus a table of
 * contents. Heading ids are injected (rehype-slug) before sanitizing, and the
 * TOC is collected from h2/h3 in document order.
 */
export function renderProse(html: string): { html: string; toc: TocItem[] } {
  if (!html.trim()) return { html: "", toc: [] };
  const toc: TocItem[] = [];
  const file = unified()
    .use(rehypeParse, { fragment: true })
    .use(rehypeSlug)
    .use(() => (tree) => {
      visit(tree, "element", (node: Element) => {
        // Inject noopener/noreferrer on external links before sanitization
        if (node.tagName === "a") {
          const href = node.properties?.href;
          if (typeof href === "string" && /^https?:\/\//i.test(href)) {
            node.properties = node.properties ?? {};
            node.properties.target = "_blank";
            node.properties.rel = ["noopener", "noreferrer"];
          }
        }
        if (node.tagName === "h2" || node.tagName === "h3") {
          const id = node.properties?.id;
          if (id) {
            toc.push({
              id: String(id),
              label: hastToString(node),
              level: node.tagName === "h2" ? 2 : 3,
            });
          }
        }
      });
    })
    .use(rehypeSanitize, schema)
    .use(rehypeStringify)
    .processSync(html);
  return { html: String(file), toc };
}
