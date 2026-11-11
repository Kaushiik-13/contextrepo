export function ContextOpsMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 40 40"
      fill="none"
      className={className}
      aria-hidden="true"
    >
      <path
        d="M24.5 8.2C21.8 6.7 18.2 6.2 14.8 7.4 9.2 9.3 6 14 6 20s3.2 10.7 8.8 12.6c3.4 1.2 7 0.7 9.7-.8"
        stroke="currentColor"
        strokeWidth="2.3"
        strokeLinecap="round"
      />
      <path
        d="M11 20h8m0 0 6-6m-6 6 6 6"
        stroke="currentColor"
        strokeWidth="2.1"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="11" cy="20" r="2.5" fill="#c4b5fd" />
      <circle cx="25" cy="14" r="2.5" fill="#c4b5fd" />
      <circle cx="25" cy="26" r="2.5" fill="#c4b5fd" />
    </svg>
  );
}
