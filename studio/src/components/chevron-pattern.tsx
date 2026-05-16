import { cn } from "@/lib/utils";

interface ChevronPatternProps {
  className?: string;
  variant?: "divider" | "background" | "border";
  direction?: "up" | "down";
}

export function ChevronPattern({
  className,
  variant = "divider",
  direction = "down",
}: ChevronPatternProps) {
  if (variant === "divider") {
    return (
      <div
        className={cn(
          "relative h-16 w-full overflow-hidden",
          direction === "up" && "rotate-180",
          className
        )}
        aria-hidden="true"
      >
        <svg
          viewBox="0 0 1440 64"
          className="absolute inset-0 h-full w-full"
          preserveAspectRatio="none"
          fill="hsl(var(--primary) / 0.08)"
        >
          <path d="M0 64 L720 0 L1440 64 Z" />
        </svg>
      </div>
    );
  }

  if (variant === "border") {
    return (
      <div className={cn("flex gap-1", className)} aria-hidden="true">
        {Array.from({ length: 6 }).map((_, i) => (
          <svg
            key={i}
            viewBox="0 0 20 20"
            className="h-4 w-4 text-primary/30"
            fill="currentColor"
          >
            <polygon points="10,0 20,10 10,20 0,10" />
          </svg>
        ))}
      </div>
    );
  }

  return (
    <div className={cn("absolute inset-0 overflow-hidden opacity-[0.03]", className)} aria-hidden="true">
      <svg
        viewBox="0 0 100 100"
        className="h-full w-full"
        preserveAspectRatio="none"
        fill="currentColor"
      >
        <defs>
          <pattern id="chevron-bg" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
            <polygon points="10,0 20,10 10,20 0,10" />
          </pattern>
        </defs>
        <rect width="100" height="100" fill="url(#chevron-bg)" />
      </svg>
    </div>
  );
}
