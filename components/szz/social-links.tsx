import * as React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faFacebookF,
  faInstagram,
  faXTwitter,
  faYoutube,
  faLinkedinIn,
} from "@fortawesome/free-brands-svg-icons";
import type { IconDefinition } from "@fortawesome/fontawesome-svg-core";

// SERVERIZZ social profiles, rendered as Font Awesome brand glyphs.
const SOCIALS: { icon: IconDefinition; label: string; href: string }[] = [
  { icon: faFacebookF, label: "Facebook", href: "https://www.facebook.com/serverizz" },
  { icon: faInstagram, label: "Instagram", href: "https://www.instagram.com/serverizz_/" },
  { icon: faXTwitter, label: "X", href: "https://x.com/serverizz" },
  { icon: faYoutube, label: "YouTube", href: "https://www.youtube.com/@serverizz" },
  { icon: faLinkedinIn, label: "LinkedIn", href: "https://www.linkedin.com/company/szzweb/" },
];

export function SocialLinks() {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 18,
      }}
    >
      {SOCIALS.map((s) => (
        <a
          key={s.label}
          href={s.href}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`SERVERIZZ on ${s.label}`}
          title={s.label}
          className="szz-social-link"
        >
          <FontAwesomeIcon icon={s.icon} style={{ fontSize: 18 }} />
        </a>
      ))}
    </div>
  );
}
