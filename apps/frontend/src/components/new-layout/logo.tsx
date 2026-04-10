'use client';

export const Logo = () => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="60"
      height="60"
      viewBox="0 0 60 60"
      fill="none"
      className="mt-[8px] min-w-[60px] min-h-[60px]"
    >
      <defs>
        <linearGradient id="pg" x1="0" y1="0" x2="60" y2="60" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#8B5CF6"/>
          <stop offset="100%" stopColor="#612BD3"/>
        </linearGradient>
      </defs>
      <rect x="4" y="4" width="52" height="52" rx="14" fill="url(#pg)"/>
      <path d="M18 16h12c5.523 0 10 4.477 10 10s-4.477 10-10 10H24v8h-6V16zm6 14h6a4 4 0 000-8h-6v8z" fill="white"/>
      <circle cx="44" cy="44" r="4" fill="#FC69FF"/>
    </svg>
  );
};
