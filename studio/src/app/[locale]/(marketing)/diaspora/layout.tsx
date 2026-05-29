import Link from "next/link";
import { Globe } from "lucide-react";

export default function DiasporaLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <nav className="border-b border-border/50 bg-background/95 sticky top-16 z-40 backdrop-blur">
        <div className="container flex items-center gap-6 h-12 text-sm font-medium overflow-x-auto">
          <Link href="/diaspora" className="flex items-center gap-2 text-primary shrink-0">
            <Globe className="h-4 w-4" />
            Diaspora Hub
          </Link>
          <Link href="/diaspora/invest" className="text-muted-foreground hover:text-foreground transition-colors shrink-0">
            Invest in Zim
          </Link>
          <Link href="/diaspora/start-business" className="text-muted-foreground hover:text-foreground transition-colors shrink-0">
            Start a Business
          </Link>
        </div>
      </nav>
      {children}
    </>
  );
}
