"use client";

import * as React from "react";

const EMOJIS = ["🎓", "💯"];
const COUNT = 30;

const rand = (min: number, max: number) => min + Math.random() * (max - min);

/**
 * EmojiRain — a one-shot on-load flourish for the Back to School offer. Drops
 * 🎓 / 💯 emojis from the top of the page; they fall for ~1s and land stacked
 * on the top edge of the site footer, rest a beat, then fade out. Skipped
 * entirely for prefers-reduced-motion. Renders nothing itself — it manages a
 * throwaway overlay layer appended to <body>.
 */
export function EmojiRain() {
  React.useEffect(() => {
    if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return;

    const footer = document.querySelector("footer");
    if (!footer) return;

    const footerTop = footer.getBoundingClientRect().top + window.scrollY;
    const viewTop = window.scrollY;

    const layer = document.createElement("div");
    layer.setAttribute("aria-hidden", "true");
    layer.style.cssText =
      `position:absolute;left:0;top:0;width:100%;height:${document.documentElement.scrollHeight}px;` +
      "pointer-events:none;overflow:hidden;z-index:60;";
    document.body.appendChild(layer);

    let removed = false;
    const remove = () => {
      if (removed) return;
      removed = true;
      layer.remove();
    };

    let pending = COUNT;
    const finishOne = () => {
      pending -= 1;
      if (pending <= 0) remove();
    };

    for (let i = 0; i < COUNT; i++) {
      const size = rand(22, 40);
      const landTop = footerTop - size - rand(0, 16);
      const driftX = rand(-34, 34);
      const rotStart = rand(-45, 45);
      const rotEnd = rand(-18, 18);
      const delay = rand(0, 600);
      const fallDur = rand(820, 1060);
      // Start just above the top of the current viewport so the rain streaks
      // into view, then falls all the way down to the footer.
      const distance = landTop - (viewTop - rand(40, 220));

      const el = document.createElement("span");
      el.textContent = EMOJIS[Math.floor(Math.random() * EMOJIS.length)];
      el.style.cssText =
        `position:absolute;top:${landTop}px;left:${rand(2, 96)}%;font-size:${size}px;` +
        "line-height:1;user-select:none;opacity:0;will-change:transform,opacity;";
      layer.appendChild(el);

      const fall = el.animate(
        [
          { transform: `translate(${driftX}px, ${-distance}px) rotate(${rotStart}deg)`, opacity: 0 },
          { opacity: 1, offset: 0.12 },
          { transform: "translate(0px, 0px) rotate(" + rotEnd + "deg)", opacity: 1 },
        ],
        { duration: fallDur, delay, easing: "cubic-bezier(0.45, 0, 0.85, 1)", fill: "forwards" },
      );

      fall.onfinish = () => {
        const fade = el.animate([{ opacity: 1 }, { opacity: 0 }], {
          duration: 500,
          delay: 450,
          easing: "ease-in",
          fill: "forwards",
        });
        fade.onfinish = finishOne;
        fade.oncancel = finishOne;
      };
      fall.oncancel = finishOne;
    }

    return remove;
  }, []);

  return null;
}
