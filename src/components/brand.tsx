import { Link } from "@tanstack/react-router";
import logoSigil from "@/assets/logo-sigil.png";
import { cn } from "@/lib/utils";

export function BrandMark({
  className,
  size = 40,
}: {
  className?: string;
  size?: number;
}) {
  return (
    <img
      src={logoSigil}
      alt="StoryWeaver sigil"
      width={size}
      height={size}
      className={cn("object-contain", className)}
    />
  );
}

export function Brand({ className, to = "/" }: { className?: string; to?: string }) {
  return (
    <Link to={to} className={cn("flex items-center gap-3", className)}>
      <BrandMark size={42} />
      <span className="leading-none">
        <span className="block font-display text-lg font-bold tracking-tight text-primary">
          STORY
        </span>
        <span className="block font-display text-xs tracking-[0.34em] text-accent">
          WEAVER
        </span>
      </span>
    </Link>
  );
}
