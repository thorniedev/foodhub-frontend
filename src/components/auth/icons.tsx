import React from "react";

export function EyeIcon({ className = "" }: { className?: string }) {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <path
        d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7-11-7-11-7Z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.6" />
    </svg>
  );
}

export function EyeOffIcon({ className = "" }: { className?: string }) {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <path
        d="M3 3l18 18M10.6 10.7a3 3 0 0 0 4.24 4.24M6.7 6.6C3.9 8.3 2 11 2 11s4 6 10 6c1.6 0 3-.36 4.24-.94M9.9 4.24C10.58 4.08 11.28 4 12 4c6 0 10 7 10 7-.5.86-1.2 1.86-2.13 2.83"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function ArrowRightIcon({ className = "" }: { className?: string }) {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <path
        d="M5 12h14M13 6l6 6-6 6"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function GoogleIcon({ className = "" }: { className?: string }) {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 48 48"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <path
        fill="#FFC107"
        d="M43.6 20.5H42V20.5H24v7h11.3C33.7 31.9 29.3 35 24 35c-6.1 0-11-4.9-11-11s4.9-11 11-11c2.8 0 5.3 1 7.3 2.8l5.2-5.2C33.2 7.1 28.8 5 24 5 13.5 5 5 13.5 5 24s8.5 19 19 19 19-8.5 19-19c0-1.2-.1-2.4-.4-3.5Z"
      />
      <path
        fill="#FF3D00"
        d="m6.3 14.7 5.7 4.2C13.6 15.5 18.4 12 24 12c2.8 0 5.3 1 7.3 2.8l5.2-5.2C33.2 7.1 28.8 5 24 5c-7.4 0-13.8 4.2-17.7 9.7Z"
      />
      <path
        fill="#4CAF50"
        d="M24 43c5.2 0 9.9-2 13.4-5.3l-6.2-5.2C29.1 34.1 26.7 35 24 35c-5.3 0-9.7-3.1-11.3-7.5l-6.2 4.8C10.1 38.9 16.5 43 24 43Z"
      />
      <path
        fill="#1976D2"
        d="M43.6 20.5H42V20.5H24v7h11.3c-.8 2.2-2.2 4.1-4.1 5.5l6.2 5.2C41.1 34.8 44 30.1 44 24c0-1.2-.1-2.4-.4-3.5Z"
      />
    </svg>
  );
}

export function GitHubIcon({ className = "" }: { className?: string }) {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
      />
    </svg>
  );
}

export function FacebookIcon({ className = "" }: { className?: string }) {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <circle cx="12" cy="12" r="12" fill="#1877F2" />
      <path
        d="M15.5 12.3h-2.1V19h-2.8v-6.7H9v-2.3h1.6V8.8c0-1.6.9-2.9 3.2-2.9h2v2.3h-1.4c-.6 0-.8.3-.8.8v1.3h2.2l-.3 2.3Z"
        fill="#fff"
      />
    </svg>
  );
}

export function SunIcon({ className = "" }: { className?: string }) {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <circle cx="12" cy="12" r="5" />
      <line x1="12" y1="1" x2="12" y2="3" />
      <line x1="12" y1="21" x2="12" y2="23" />
      <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
      <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
      <line x1="1" y1="12" x2="3" y2="12" />
      <line x1="21" y1="12" x2="23" y2="12" />
      <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
      <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
    </svg>
  );
}

export function MoonIcon({ className = "" }: { className?: string }) {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
    </svg>
  );
}

export function BoltIcon({ className = "" }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 20 30"
      fill="none"
      stroke="currentColor"
      strokeWidth="3"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M15 2 L6 2 L12 13 L4 13 L14 28" />
    </svg>
  );
}

export function FoodLineArt({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 320 340"
      fill="none"
      stroke="currentColor"
      strokeWidth="3.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      {/* crossed fork & spoon behind the bowl */}
      <g transform="translate(160 172)">
        <g transform="rotate(30)">
          <path d="M0 130 L0 -60" />
          <path d="M-11 -60 L-13 -110" />
          <path d="M0 -62 L0 -114" />
          <path d="M11 -60 L13 -110" />
          <path d="M-13 -60 Q0 -46 13 -60" />
        </g>
        <g transform="rotate(-30)">
          <path d="M0 130 L0 -58" />
          <ellipse cx="0" cy="-92" rx="22" ry="34" />
        </g>
      </g>
      {/* bowl */}
      <ellipse cx="160" cy="205" rx="104" ry="24" />
      <path d="M58 208 Q66 300 160 304 Q254 300 262 208" />
      {/* salad greens poking above the rim */}
      <path d="M120 198 Q104 156 140 150 Q150 178 132 198 Z" />
      <path d="M162 196 Q150 146 182 140 Q194 172 176 198 Z" />
      <path d="M198 200 Q216 160 226 186 Q216 208 198 202 Z" />
      <circle cx="150" cy="184" r="11" />
      <circle cx="196" cy="194" r="9" />
    </svg>
  );
}

export function LeafWatermarkTopRight({ className = "" }: { className?: string }) {
  return (
    <svg
      width="240"
      height="240"
      viewBox="0 0 200 200"
      fill="none"
      className={className}
    >
      <path
        d="M100 10 C 160 20, 190 70, 180 130 C 170 190, 110 200, 70 170 C 30 140, 40 80, 100 10 Z"
        fill="#4b5563"
      />
      <path
        d="M100 10 Q 110 90 70 170"
        stroke="#374151"
        strokeWidth="3"
        fill="none"
      />
    </svg>
  );
}

export function LeafWatermarkBottomRight({ className = "" }: { className?: string }) {
  return (
    <svg
      width="280"
      height="280"
      viewBox="0 0 200 200"
      fill="none"
      className={className}
    >
      <path
        d="M160 160 C 100 200, 30 180, 20 110 C 10 40, 70 10, 130 40 C 190 70, 200 130, 160 160 Z"
        fill="#6b7280"
      />
      <path
        d="M160 160 Q 100 100 130 40"
        stroke="#4b5563"
        strokeWidth="4"
        fill="none"
      />
    </svg>
  );
}

export function AlertCircleIcon({ className = "" }: { className?: string }) {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.8" />
      <path d="M12 8v4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <circle cx="12" cy="16" r="1" fill="currentColor" />
    </svg>
  );
}

export function CheckCircleIcon({ className = "" }: { className?: string }) {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.8" />
      <path
        d="m8 12.5 2.5 2.5L16 9.5"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
