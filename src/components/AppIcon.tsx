import React, { useState } from 'react';

export function AppIcon({ className = "w-8 h-8" }: { className?: string }) {
  const [hasError, setHasError] = useState(false);

  if (hasError) {
    return (
      <svg 
        viewBox="0 0 512 512" 
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
        className={className}
      >
        <rect x="25" y="360" width="105" height="42" rx="16" fill="#f2a154" stroke="#0e0d0d" strokeWidth="14" strokeLinejoin="round" />
        <rect x="25" y="320" width="105" height="42" rx="16" fill="#ffd15c" stroke="#0e0d0d" strokeWidth="14" strokeLinejoin="round" />
        <rect x="25" y="280" width="105" height="42" rx="16" fill="#f2a154" stroke="#0e0d0d" strokeWidth="14" strokeLinejoin="round" />
        <rect x="25" y="240" width="105" height="42" rx="16" fill="#ffd15c" stroke="#0e0d0d" strokeWidth="14" strokeLinejoin="round" />
        <rect x="38" y="200" width="92" height="42" rx="16" fill="#f2a154" stroke="#0e0d0d" strokeWidth="14" strokeLinejoin="round" />
        <rect x="382" y="365" width="105" height="42" rx="16" fill="#f2a154" stroke="#0e0d0d" strokeWidth="14" strokeLinejoin="round" />
        <rect x="382" y="325" width="105" height="42" rx="16" fill="#ffd15c" stroke="#0e0d0d" strokeWidth="14" strokeLinejoin="round" />
        <rect x="382" y="285" width="105" height="42" rx="16" fill="#f2a154" stroke="#0e0d0d" strokeWidth="14" strokeLinejoin="round" />
        <rect x="382" y="245" width="105" height="42" rx="16" fill="#ffd15c" stroke="#0e0d0d" strokeWidth="14" strokeLinejoin="round" />
        <rect x="382" y="205" width="105" height="42" rx="16" fill="#f2a154" stroke="#0e0d0d" strokeWidth="14" strokeLinejoin="round" />
        <rect x="382" y="165" width="105" height="42" rx="16" fill="#ffd15c" stroke="#0e0d0d" strokeWidth="14" strokeLinejoin="round" />
        <rect x="110" y="76" width="292" height="360" rx="18" fill="#eef6ff" stroke="#0e0d0d" strokeWidth="14" strokeLinejoin="round" />
        <line x1="270" y1="135" x2="365" y2="135" stroke="#0e0d0d" strokeWidth="14" strokeLinecap="round" />
        <line x1="240" y1="180" x2="365" y2="180" stroke="#0e0d0d" strokeWidth="14" strokeLinecap="round" />
        <line x1="240" y1="225" x2="365" y2="225" stroke="#0e0d0d" strokeWidth="14" strokeLinecap="round" />
        <line x1="164" y1="115" x2="164" y2="245" stroke="#0e0d0d" strokeWidth="14" strokeLinecap="round" />
        <path d="M 194 150 C 194 130, 140 130, 140 156 C 140 186, 192 178, 192 204 C 192 230, 138 230, 138 210" stroke="#0e0d0d" strokeWidth="14" strokeLinecap="round" strokeLinejoin="round" fill="none" />
        <rect x="146" y="315" width="56" height="74" rx="12" fill="#65c1a4" stroke="#0e0d0d" strokeWidth="14" strokeLinejoin="round" />
        <rect x="228" y="290" width="56" height="99" rx="12" fill="#ffd15c" stroke="#0e0d0d" strokeWidth="14" strokeLinejoin="round" />
        <rect x="310" y="245" width="56" height="144" rx="12" fill="#df5463" stroke="#0e0d0d" strokeWidth="14" strokeLinejoin="round" />
      </svg>
    );
  }

  return (
    <img 
      src="/assets/images/finanzas.png" 
      alt="FinTrack Icon" 
      className={`object-contain ${className}`}
      onError={() => setHasError(true)}
      referrerPolicy="no-referrer"
    />
  );
}
