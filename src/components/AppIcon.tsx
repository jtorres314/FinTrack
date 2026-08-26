import React from 'react';

export function AppIcon({ className = "w-10 h-10" }: { className?: string }) {
  return (
    <svg 
      viewBox="0 0 512 512" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* COIN STACK LEFT (Behind Paper) */}
      {/* Coin 1 (Bottom) */}
      <rect x="25" y="360" width="105" height="42" rx="16" fill="#f2a154" stroke="#0e0d0d" strokeWidth="14" strokeLinejoin="round" />
      {/* Coin 2 */}
      <rect x="25" y="320" width="105" height="42" rx="16" fill="#ffd15c" stroke="#0e0d0d" strokeWidth="14" strokeLinejoin="round" />
      {/* Coin 3 */}
      <rect x="25" y="280" width="105" height="42" rx="16" fill="#f2a154" stroke="#0e0d0d" strokeWidth="14" strokeLinejoin="round" />
      {/* Coin 4 */}
      <rect x="25" y="240" width="105" height="42" rx="16" fill="#ffd15c" stroke="#0e0d0d" strokeWidth="14" strokeLinejoin="round" />
      {/* Coin 5 (Top Left) */}
      <rect x="38" y="200" width="92" height="42" rx="16" fill="#f2a154" stroke="#0e0d0d" strokeWidth="14" strokeLinejoin="round" />

      {/* COIN STACK RIGHT (Behind Paper) */}
      {/* Coin 1 (Bottom) */}
      <rect x="382" y="365" width="105" height="42" rx="16" fill="#f2a154" stroke="#0e0d0d" strokeWidth="14" strokeLinejoin="round" />
      {/* Coin 2 */}
      <rect x="382" y="325" width="105" height="42" rx="16" fill="#ffd15c" stroke="#0e0d0d" strokeWidth="14" strokeLinejoin="round" />
      {/* Coin 3 */}
      <rect x="382" y="285" width="105" height="42" rx="16" fill="#f2a154" stroke="#0e0d0d" strokeWidth="14" strokeLinejoin="round" />
      {/* Coin 4 */}
      <rect x="382" y="245" width="105" height="42" rx="16" fill="#ffd15c" stroke="#0e0d0d" strokeWidth="14" strokeLinejoin="round" />
      {/* Coin 5 */}
      <rect x="382" y="205" width="105" height="42" rx="16" fill="#f2a154" stroke="#0e0d0d" strokeWidth="14" strokeLinejoin="round" />
      {/* Coin 6 (Top Right) */}
      <rect x="382" y="165" width="105" height="42" rx="16" fill="#ffd15c" stroke="#0e0d0d" strokeWidth="14" strokeLinejoin="round" />

      {/* CENTRAL PAPER */}
      <rect x="110" y="76" width="292" height="360" rx="18" fill="#eef6ff" stroke="#0e0d0d" strokeWidth="14" strokeLinejoin="round" />

      {/* UPPER RIGHT TEXT LINES */}
      <line x1="270" y1="135" x2="365" y2="135" stroke="#0e0d0d" strokeWidth="14" strokeLinecap="round" />
      <line x1="240" y1="180" x2="365" y2="180" stroke="#0e0d0d" strokeWidth="14" strokeLinecap="round" />
      <line x1="240" y1="225" x2="365" y2="225" stroke="#0e0d0d" strokeWidth="14" strokeLinecap="round" />

      {/* UPPER LEFT DOLLAR SIGN */}
      <line x1="164" y1="115" x2="164" y2="245" stroke="#0e0d0d" strokeWidth="14" strokeLinecap="round" />
      <path 
        d="M 194 150 C 194 130, 140 130, 140 156 C 140 186, 192 178, 192 204 C 192 230, 138 230, 138 210" 
        stroke="#0e0d0d" 
        strokeWidth="14" 
        strokeLinecap="round" 
        strokeLinejoin="round"
        fill="none"
      />

      {/* BOTTOM BAR CHARTS */}
      {/* Bar 1 (Green) */}
      <rect x="146" y="315" width="56" height="74" rx="12" fill="#65c1a4" stroke="#0e0d0d" strokeWidth="14" strokeLinejoin="round" />
      {/* Bar 2 (Yellow) */}
      <rect x="228" y="290" width="56" height="99" rx="12" fill="#ffd15c" stroke="#0e0d0d" strokeWidth="14" strokeLinejoin="round" />
      {/* Bar 3 (Red/Pink) */}
      <rect x="310" y="245" width="56" height="144" rx="12" fill="#df5463" stroke="#0e0d0d" strokeWidth="14" strokeLinejoin="round" />
    </svg>
  );
}
