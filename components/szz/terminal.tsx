import * as React from "react";
import { cn } from "@/lib/utils";

/**
 * SERVERIZZ Terminal — the signature window block. Traffic-light bar, a CLI
 * title, and a stack of typed lines. Carries the soft blue glow.
 */
export type TerminalLineType =
  | "command"
  | "output"
  | "spinner"
  | "success"
  | "comment";

export interface TerminalLine {
  type: TerminalLineType;
  text: string;
}

export interface TerminalProps extends React.HTMLAttributes<HTMLDivElement> {
  title?: string;
  lines?: TerminalLine[];
  cursor?: boolean;
}

function LinePrefix({ type }: { type: TerminalLineType }) {
  if (type === "command") return <span className="p">$</span>;
  if (type === "success") return <span aria-hidden>{"✓"}</span>;
  if (type === "spinner") return <span aria-hidden>{"⠿"}</span>;
  return null;
}

export function Terminal({
  title = "serverizz-cli v4.2.0",
  lines = [],
  cursor = true,
  className,
  ...props
}: TerminalProps) {
  return (
    <div className={cn("szz-term", className)} {...props}>
      <div className="szz-term__bar">
        <div className="szz-term__lights">
          <span style={{ background: "var(--szz-red)" }} />
          <span style={{ background: "var(--szz-yellow)" }} />
          <span style={{ background: "var(--szz-green)" }} />
        </div>
        {title && <span className="szz-term__title">{title}</span>}
      </div>
      <div className="szz-term__rule" />
      <div className="szz-term__lines">
        {lines.map((line, i) => (
          <p key={i} className={`szz-term__line szz-term--${line.type}`}>
            <LinePrefix type={line.type} />
            <span>{line.text}</span>
          </p>
        ))}
        {cursor && (
          <p className="szz-term__line szz-term--success">
            <span className="p">$</span>
            <span className="szz-term__cursor" />
          </p>
        )}
      </div>
    </div>
  );
}
