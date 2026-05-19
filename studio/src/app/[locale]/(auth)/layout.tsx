import { Icons } from "@/components/icons";
import { GyeNyame } from "@/components/adinkra-symbols";
import { ChevronPattern } from "@/components/chevron-pattern";
import Link from "next/link";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative flex min-h-screen items-center justify-center p-4 overflow-hidden bg-background">
      <div className="absolute inset-0 bg-gradient-to-b from-background/30 via-background/60 to-background" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_hsl(var(--primary)/0.08)_0%,_transparent_60%)]" />
      <div className="absolute inset-0 bg-grid opacity-30" />
      <ChevronPattern variant="background" className="text-primary opacity-[0.015]" />
      <GyeNyame className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80vmin] h-[80vmin] text-accent/[0.025] pointer-events-none" />
      <div className="relative z-10 w-full max-w-md">
        <div className="flex justify-center mb-8">
          <Link href="/" className="flex items-center gap-3 group">
            <Icons.radbit className="size-10 shrink-0 transition-transform duration-300 group-hover:scale-110" />
            <span className="font-headline text-2xl font-bold tracking-wide text-primary">RADBIT</span>
          </Link>
        </div>
        <div className="backdrop-blur-xl bg-card/80 border border-primary/10 rounded-2xl shadow-xl shadow-primary/10">
          {children}
        </div>
      </div>
    </div>
  );
}
