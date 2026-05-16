import type { SVGProps } from "react";

type AdinkraType = "gye-nyame" | "sankofa" | "dwennimmen";

interface AdinkraSymbolProps extends SVGProps<SVGSVGElement> {
  symbol: AdinkraType;
}

const paths: Record<AdinkraType, string> = {
  "gye-nyame":
    "M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm0-14a6 6 0 100 12 6 6 0 000-12zm0 10a4 4 0 110-8 4 4 0 010 8z",
  sankofa:
    "M4 12C4 7.58 7.58 4 12 4s8 3.58 8 8-3.58 8-8 8S4 16.42 4 12zm2 0c0 3.31 2.69 6 6 6s6-2.69 6-6-2.69-6-6-6-6 2.69-6 6zm4-3v6l4-3-4-3z",
  dwennimmen:
    "M4 4h4v8c0 2.21 1.79 4 4 4s4-1.79 4-4V4h4v8c0 4.42-3.58 8-8 8s-8-3.58-8-8V4zm6 0h4v4h-4V4z",
};

export function AdinkraSymbol({ symbol, className, ...props }: AdinkraSymbolProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      {...props}
    >
      <path d={paths[symbol]} />
    </svg>
  );
}

export function GyeNyame(props: SVGProps<SVGSVGElement>) {
  return <AdinkraSymbol symbol="gye-nyame" {...props} />;
}

export function Sankofa(props: SVGProps<SVGSVGElement>) {
  return <AdinkraSymbol symbol="sankofa" {...props} />;
}

export function Dwennimmen(props: SVGProps<SVGSVGElement>) {
  return <AdinkraSymbol symbol="dwennimmen" {...props} />;
}
