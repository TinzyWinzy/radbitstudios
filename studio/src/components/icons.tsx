import type { SVGProps } from "react";

export const Icons = {
  logo: (props: SVGProps<SVGSVGElement>) => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 32 32"
      fill="none"
      {...props}
    >
      <rect x="1" y="1" width="30" height="30" rx="7" fill="currentColor" opacity="0.1" />
      <text
        x="5"
        y="23"
        fill="currentColor"
        fontSize="21"
        fontWeight="800"
        fontFamily="system-ui, -apple-system, sans-serif"
        letterSpacing="-1"
      >
        R
      </text>
      <circle cx="27" cy="6" r="3" fill="currentColor" opacity="0.4" />
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
          <stop offset="0%" stopColor="#1A8A7A" />
          <stop offset="50%" stopColor="#0D6B5E" />
          <stop offset="100%" stopColor="#E8A838" />
        </linearGradient>
      </defs>
      <rect x="1" y="1" width="30" height="30" rx="7" fill="url(#rb-grad)" />
      <text
        x="5"
        y="23"
        fill="#fff"
        fontSize="21"
        fontWeight="800"
        fontFamily="system-ui, -apple-system, sans-serif"
        letterSpacing="-1"
      >
        R
      </text>
      <circle cx="27" cy="6" r="3" fill="#E8A838" />
    </svg>
  ),
};
