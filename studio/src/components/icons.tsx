import type { SVGProps } from "react";

export const Icons = {
  logo: (props: SVGProps<SVGSVGElement>) => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 32 32"
      fill="none"
      {...props}
    >
      <rect x="2" y="2" width="28" height="28" rx="7" fill="currentColor" opacity="0.1" />
      <text
        x="16"
        y="22"
        textAnchor="middle"
        fill="currentColor"
        fontSize="18"
        fontWeight="700"
        fontFamily="system-ui, sans-serif"
      >
        R
      </text>
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
        <linearGradient id="rb-grad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="hsl(40, 95%, 50%)" />
          <stop offset="100%" stopColor="hsl(185, 85%, 40%)" />
        </linearGradient>
      </defs>
      <rect x="1" y="1" width="30" height="30" rx="8" fill="url(#rb-grad)" />
      <text
        x="16"
        y="22"
        textAnchor="middle"
        fill="#fff"
        fontSize="18"
        fontWeight="700"
        fontFamily="system-ui, sans-serif"
      >
        R
      </text>
    </svg>
  ),
};
