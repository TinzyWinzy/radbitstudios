
import { Icons } from "@/components/icons";
import Link from "next/link";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <div className="w-full max-w-md">
         <div className="flex justify-center mb-6">
            <Link href="/" className="flex items-center gap-2">
                <Icons.logo className="size-8 shrink-0" />
                <span className="text-2xl font-semibold">Radbit SME Hub</span>
            </Link>
         </div>
        {children}
      </div>
    </div>
  );
}
