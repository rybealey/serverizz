import { describe, it, expect } from "vitest";
import { renderProse } from "@/lib/wp-prose";

describe("renderProse", () => {
  it("injects heading ids and builds a TOC from h2/h3", () => {
    const { html, toc } = renderProse(
      "<h2>The hidden cost</h2><p>x</p><h3>Sub point</h3><h2>Time math</h2>",
    );
    expect(toc).toEqual([
      { id: "the-hidden-cost", label: "The hidden cost", level: 2 },
      { id: "sub-point", label: "Sub point", level: 3 },
      { id: "time-math", label: "Time math", level: 2 },
    ]);
    expect(html).toContain('id="the-hidden-cost"');
  });

  it("strips script tags and event handlers", () => {
    const { html } = renderProse('<p onclick="evil()">hi</p><script>steal()</script>');
    expect(html).not.toContain("<script");
    expect(html).not.toContain("onclick");
    expect(html).toContain("hi");
  });

  it("keeps safe links and images", () => {
    const { html } = renderProse('<a href="https://x.com">x</a><img src="https://newsroom.serverizz.com/a.jpg" alt="a">');
    expect(html).toContain('href="https://x.com"');
    expect(html).toContain('<img');
  });

  it("returns empty html and empty toc for empty input", () => {
    expect(renderProse("")).toEqual({ html: "", toc: [] });
  });

  it("adds rel=noopener noreferrer and target=_blank to external links", () => {
    const { html } = renderProse('<a href="https://x.com">x</a>');
    expect(html).toContain('rel="noopener noreferrer"');
    expect(html).toContain('target="_blank"');
  });

  it("does not add target=_blank to relative/anchor links", () => {
    const { html } = renderProse('<a href="#cost">c</a>');
    expect(html).not.toContain('target="_blank"');
  });
});
