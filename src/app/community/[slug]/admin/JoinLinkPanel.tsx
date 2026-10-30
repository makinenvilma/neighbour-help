"use client";

import { useRef, useState } from "react";
import { Copy, Download, RefreshCw } from "lucide-react";

/**
 * The join link with its QR code, and the button that replaces the code.
 *
 * A client component only for the two things that need the browser: copying to
 * the clipboard, and asking "are you sure?" before rotating. The QR code itself
 * is drawn on the server and arrives as an image.
 */
export default function JoinLinkPanel({
  url,
  qrDataUrl,
  rotate,
}: {
  url: string;
  qrDataUrl: string;
  rotate: () => Promise<void>;
}) {
  const input = useRef<HTMLInputElement>(null);
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
    } catch {
      // No clipboard outside HTTPS and localhost - e.g. the dev server opened
      // from a phone by its network address. Selecting the text still lets
      // the admin copy it by hand.
      input.current?.select();
    }
  }

  return (
    <div className="flex flex-col gap-6 rounded-lg border border-border bg-card p-6 sm:flex-row">
      {/* eslint-disable-next-line @next/next/no-img-element -- a data URL,
          which next/image would only pass through unoptimised anyway. */}
      <img
        src={qrDataUrl}
        alt="QR code for the join link"
        width={176}
        height={176}
        className="h-44 w-44 shrink-0 self-center rounded-lg border border-border bg-white p-2"
      />

      <div className="min-w-0 flex-1 space-y-4">
        <p className="text-muted-foreground">
          Put the QR code up where members will see it, or send them the
          link. Opening it lets someone ask to join - you still approve
          every request here.
        </p>

        <div className="flex gap-2">
          <input
            ref={input}
            readOnly
            value={url}
            aria-label="Join link"
            onFocus={(event) => event.target.select()}
            className="min-w-0 flex-1 rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground"
          />
          <button
            type="button"
            onClick={copy}
            className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-border px-4 py-2 text-sm font-medium hover:bg-muted"
          >
            <Copy className="h-4 w-4" /> {copied ? "Copied" : "Copy"}
          </button>
        </div>

        <div className="flex flex-wrap gap-2">
          <a
            href={qrDataUrl}
            download="join-qr-code.svg"
            className="inline-flex items-center gap-1.5 rounded-full border border-border px-4 py-2 text-sm font-medium hover:bg-muted"
          >
            <Download className="h-4 w-4" /> Download QR code
          </a>
          <form
            action={rotate}
            onSubmit={(event) => {
              if (
                !confirm(
                  "Make a new join link? The current link and every printed QR code stop working.",
                )
              ) {
                event.preventDefault();
              }
            }}
          >
            <button
              type="submit"
              className="inline-flex items-center gap-1.5 rounded-full border border-border px-4 py-2 text-sm font-medium text-destructive hover:bg-muted"
            >
              <RefreshCw className="h-4 w-4" /> Make a new link
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
