"use client";

import { useEffect, useRef, useState } from "react";
import { GETTERMS_ACCOUNT } from "@/lib/legal";

/**
 * Renders a GetTerms managed legal document inline.
 *
 * We use `mode="direct"`, so GetTerms injects the document HTML straight into
 * the container (rather than displaying it inside a visible iframe), which lets
 * us theme it with the site's own CSS — see `.szz-getterms` in globals.css.
 *
 * Quirk: GetTerms' `embed.js` scans the DOM for `.getterms-document-embed`
 * exactly once, at script-load time — it has no MutationObserver — so it can't
 * see a container that only appears after a client-side navigation. We therefore
 * (re)inject the loader on every mount. The page gives this component a `key` of
 * the slug, so switching legal docs fully remounts the (empty) container before
 * the fresh loader runs and each loader finds exactly one container to fill.
 *
 * Loading: the document is fetched over the network, so we show a skeleton until
 * GetTerms replaces the container's contents. A MutationObserver tells us the
 * moment real content lands; a timeout reveals the (possibly empty) container
 * anyway so a failed fetch can't leave the skeleton up forever.
 */
const EMBED_SRC = "https://gettermscdn.com/dist/js/embed.js";
const EMBED_ENV = "https://gettermscdn.com";
const LOADER_ID = "getterms-embed-js";
const REVEAL_TIMEOUT_MS = 12000;

export function GetTermsDocument({ document: doc }: { document: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const container = ref.current;
    if (!container) return;

    setLoaded(false);
    // Start from a clean container and drop any prior loader so a re-run (soft
    // navigation, Strict Mode) can never stack a second copy of the document.
    container.innerHTML = "";
    window.document.getElementById(LOADER_ID)?.remove();

    // GetTerms first appends a hidden loader iframe, then (on postMessage)
    // replaces the container's innerHTML with the document. Treat any non-iframe
    // element as the real content arriving.
    const observer = new MutationObserver(() => {
      const hasContent = Array.from(container.childNodes).some(
        (node) =>
          node.nodeType === Node.ELEMENT_NODE &&
          !(node as Element).classList.contains("getterms-iframe"),
      );
      if (hasContent) setLoaded(true);
    });
    observer.observe(container, { childList: true });

    const reveal = window.setTimeout(() => setLoaded(true), REVEAL_TIMEOUT_MS);

    const script = window.document.createElement("script");
    script.id = LOADER_ID;
    script.src = EMBED_SRC;
    script.async = true;
    window.document.body.appendChild(script);

    return () => {
      observer.disconnect();
      window.clearTimeout(reveal);
      script.remove();
      container.innerHTML = "";
    };
  }, [doc]);

  return (
    <div>
      {!loaded && <GetTermsSkeleton />}
      <div
        ref={ref}
        className="getterms-document-embed szz-getterms"
        data-getterms={GETTERMS_ACCOUNT}
        data-getterms-document={doc}
        data-getterms-lang="en-us"
        data-getterms-mode="direct"
        data-getterms-env={EMBED_ENV}
      />
    </div>
  );
}

/** Subtle pulsing placeholder shaped like the legal prose it stands in for. */
function GetTermsSkeleton() {
  return (
    <div className="szz-legal-skeleton" aria-hidden="true">
      <div className="szz-skel szz-skel--title" />
      {[0, 1, 2, 3].map((group) => (
        <div key={group} className="szz-skel-group">
          <div className="szz-skel szz-skel--heading" />
          <div className="szz-skel szz-skel--line" />
          <div className="szz-skel szz-skel--line" />
          <div className="szz-skel szz-skel--line szz-skel--short" />
        </div>
      ))}
    </div>
  );
}
