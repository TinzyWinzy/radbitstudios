import type { SVGProps } from "react";

export const Icons = {
  logo: (props: SVGProps<SVGSVGElement>) => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 32 32"
      fill="none"
      {...props}
    >
      <g stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="16" cy="16" r="14" fill="none" />
        <path d="M16 8 C16 8, 10 4, 8 8 C6 12, 10 14, 16 14" fill="none" />
        <path d="M16 8 C16 8, 22 4, 24 8 C26 12, 22 14, 16 14" fill="none" />
        <path d="M10 20 C10 24, 13 28, 16 28 C19 28, 22 24, 22 20" fill="none" />
        <line x1="10" y1="22" x2="22" y2="22" />
        <line x1="12" y1="26" x2="20" y2="26" />
      </g>
    </svg>
  ),
  radbit: (props: SVGProps<SVGSVGElement>) => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 32 32"
      fill="none"
      {...props}
    >
      <defs>
        <linearGradient id="logo-grad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="hsl(40, 95%, 50%)" />
          <stop offset="50%" stopColor="hsl(40, 90%, 55%)" />
          <stop offset="100%" stopColor="hsl(185, 80%, 40%)" />
        </linearGradient>
      </defs>
      <g stroke="url(#logo-grad)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="16" cy="16" r="14" fill="hsl(40, 20%, 97%)" className="dark:fill-[hsl(30,15%,8%)]" />
        <path d="M16 8 C16 8, 9 3, 7 8 C5 13, 10 15, 16 14" fill="none" />
        <path d="M16 8 C16 8, 23 3, 25 8 C27 13, 22 15, 16 14" fill="none" />
        <path d="M10 20 C10 25, 13 28, 16 28 C19 28, 22 25, 22 20" fill="none" />
        <path d="M9 22 L23 22" />
        <path d="M11 26 L21 26" />
        <circle cx="12" cy="12" r="1" fill="url(#logo-grad)" stroke="none" />
        <circle cx="20" cy="12" r="1" fill="url(#logo-grad)" stroke="none" />
      </g>
    </svg>
  ),
};
