import { useEffect, useMemo, useState } from "react";
import { encode } from "uqr";
import { digestVerifyUrl } from "@/lib/fulfillment";

export function DigestQr({ digest }: { digest: string }) {
  const [origin, setOrigin] = useState("");

  useEffect(() => {
    setOrigin(window.location.origin);
  }, []);

  const href = origin ? digestVerifyUrl(origin, digest) : null;
  const matrix = useMemo(() => {
    if (!href) return null;
    return encode(href, { ecc: "Q", border: 2 });
  }, [href]);

  if (!href || !matrix) return null;

  const { data, size } = matrix;

  return (
    <figure className="relative mt-5 flex items-end gap-4 border-t border-border pt-5">
      <svg
        viewBox={`0 0 ${size} ${size}`}
        width="112"
        height="112"
        className="shrink-0 bg-white"
        role="img"
        aria-label="QR code to verify this digest"
      >
        {data.map((row, y) =>
          row.map((on, x) =>
            on ? (
              <rect
                key={`${x}-${y}`}
                x={x}
                y={y}
                width={1}
                height={1}
                fill="#1a1714"
              />
            ) : null,
          ),
        )}
      </svg>
      <figcaption className="text-2xs text-fg-subtle">
        Camera opens Verify with this digest. Not a person. Not the portable
        file.
      </figcaption>
    </figure>
  );
}
