import { cn } from "@/lib/utils";
import type { Disposition } from "@/services";

const initials = (name: string) =>
  name
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("");

export function CharacterAvatar({
  name,
  portraitUrl,
  disposition = "neutral",
  size = 48,
  className,
}: {
  name: string;
  portraitUrl?: string;
  disposition?: Disposition;
  size?: number;
  className?: string;
}) {
  const ring =
    disposition === "hostile"
      ? "ring-destructive/50"
      : disposition === "ally"
        ? "ring-accent/50"
        : "ring-border";

  if (portraitUrl) {
    return (
      <img
        src={portraitUrl}
        alt={`Portrait of ${name}`}
        width={size}
        height={size}
        loading="lazy"
        style={{ width: size, height: size }}
        className={cn("shrink-0 rounded-md object-cover ring-1", ring, className)}
      />
    );
  }

  return (
    <div
      style={{ width: size, height: size }}
      className={cn(
        "grid shrink-0 place-items-center rounded-md bg-accent/10 font-display text-sm font-semibold text-accent ring-1",
        ring,
        className,
      )}
    >
      {initials(name)}
    </div>
  );
}
