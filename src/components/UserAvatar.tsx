import React from 'react';

export function UserAvatar({ className = "w-10 h-10" }: { className?: string }) {
  return (
    <svg 
      viewBox="0 0 200 200" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <defs>
        {/* Soft elegant background gradient matching a studio portrait */}
        <radialGradient id="avatarBgGrad" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#f3f4f6" />
          <stop offset="100%" stopColor="#e5e7eb" />
        </radialGradient>
        
        {/* Rich, warm 3D-shaded skin tones matching the user's photo exactly */}
        <radialGradient id="skinGrad" cx="50%" cy="35%" r="65%">
          <stop offset="0%" stopColor="#aa7c62" />
          <stop offset="70%" stopColor="#8d5f47" />
          <stop offset="100%" stopColor="#693f28" />
        </radialGradient>

        {/* Shadow under the nose and chin */}
        <filter id="softShadow" x="-10%" y="-10%" width="120%" height="120%">
          <feDropShadow dx="0" dy="2.5" stdDeviation="2" floodColor="#000000" floodOpacity="0.3"/>
        </filter>
        
        {/* Filter for glasses depth */}
        <filter id="glassesDepth" x="-15%" y="-15%" width="130%" height="130%">
          <feDropShadow dx="0" dy="4" stdDeviation="3" floodColor="#000000" floodOpacity="0.4"/>
        </filter>

        {/* Soft beard gradient for 3D realism */}
        <linearGradient id="beardGrad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#221916" />
          <stop offset="45%" stopColor="#1a1210" />
          <stop offset="100%" stopColor="#0d0807" />
        </linearGradient>

        {/* Glasses Lens Shimmer */}
        <linearGradient id="lensShimmer" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.15" />
          <stop offset="35%" stopColor="#ffffff" stopOpacity="0.03" />
          <stop offset="40%" stopColor="#ffffff" stopOpacity="0.0" />
          <stop offset="100%" stopColor="#ffffff" stopOpacity="0.0" />
        </linearGradient>
      </defs>

      {/* Circle Background */}
      <circle cx="100" cy="100" r="96" fill="url(#avatarBgGrad)" stroke="#f3f4f6" strokeWidth="2" />

      {/* Neck (Rich skin shadow) */}
      <path d="M83 125 L117 125 L117 155 C 117 155, 100 162, 83 155 Z" fill="#58321e" />

      {/* Black Crewneck Shirt (Exactly like the photo) */}
      <path d="M40 168 C 40 144, 160 144, 160 168 L 166 200 L 34 200 Z" fill="#141313" />
      {/* Crewneck neck collar detail */}
      <path d="M80 152 C 80 152, 100 166, 120 152" stroke="#252424" strokeWidth="5" strokeLinecap="round" />

      {/* Bald Head / Face Shape (Perfect 3D radial skin gradient) */}
      <path d="M56 94 C 56 36, 144 36, 144 94 C 144 142, 56 142, 56 94 Z" fill="url(#skinGrad)" />

      {/* Ears (Polished and shaded) */}
      {/* Left Ear */}
      <path d="M57 95 C 47 95, 47 115, 57 115" fill="#8d5f47" stroke="#693f28" strokeWidth="1.5" />
      <path d="M56 100 C 51 100, 51 110, 56 110" fill="#58321e" />
      {/* Right Ear */}
      <path d="M143 95 C 153 95, 153 115, 143 115" fill="#8d5f47" stroke="#693f28" strokeWidth="1.5" />
      <path d="M144 100 C 149 100, 149 110, 144 110" fill="#58321e" />

      {/* Nose (Soft round nose like the photo) */}
      <path d="M94 104 Q 100 112, 106 104" stroke="#58321e" strokeWidth="3.5" strokeLinecap="round" fill="none" />

      {/* Big Expressive 3D Eyes (Very close together, large, exactly like the image!) */}
      {/* Eye Left */}
      <ellipse cx="76" cy="95" rx="17" ry="15" fill="#ffffff" />
      <ellipse cx="76" cy="95" rx="12" ry="11" fill="#4a2f20" /> {/* Dark brown iris */}
      <circle cx="76" cy="95" r="7.5" fill="#141313" /> {/* Pupil */}
      {/* Shimmer / Catchlights */}
      <circle cx="71.5" cy="90.5" r="3.5" fill="#ffffff" />
      <circle cx="80.5" cy="99.5" r="1.5" fill="#ffffff" />

      {/* Eye Right */}
      <ellipse cx="124" cy="95" rx="17" ry="15" fill="#ffffff" />
      <ellipse cx="124" cy="95" rx="12" ry="11" fill="#4a2f20" /> {/* Dark brown iris */}
      <circle cx="124" cy="95" r="7.5" fill="#141313" /> {/* Pupil */}
      {/* Shimmer / Catchlights */}
      <circle cx="119.5" cy="90.5" r="3.5" fill="#ffffff" />
      <circle cx="128.5" cy="99.5" r="1.5" fill="#ffffff" />

      {/* Eyebrows */}
      <path d="M59 79 C 67 73, 83 75, 87 81" stroke="#1c1412" strokeWidth="5" strokeLinecap="round" fill="none" />
      <path d="M141 79 C 133 73, 117 75, 113 81" stroke="#1c1412" strokeWidth="5" strokeLinecap="round" fill="none" />

      {/* Beard & Mustache (3D gradient, neat trimmed layout matching photo) */}
      {/* Main Beard contouring jaw */}
      <path d="M55 96 C 55 138, 145 138, 145 96 C 145 116, 137 143, 100 146 C 63 143, 55 116, 55 96 Z" fill="url(#beardGrad)" />
      {/* Mustache */}
      <path d="M80 114 C 91 108, 109 108, 120 114 C 112 117, 88 117, 80 114 Z" fill="#0d0807" />
      {/* Soul patch under lip */}
      <path d="M92 114 C 92 114, 100 120, 108 114 L 105 128 C 105 128, 100 131, 95 128 Z" fill="#0d0807" />

      {/* Mouth (Friendly subtle smile behind beard) */}
      <path d="M92 120 Q 100 125, 108 120" stroke="#000000" strokeWidth="2.5" strokeLinecap="round" fill="none" />

      {/* Black Glasses (Thick dark frames) */}
      {/* Glasses Left Frame */}
      <rect x="54" y="79" width="41" height="32" rx="10" stroke="#1c1412" strokeWidth="5.5" fill="url(#lensShimmer)" filter="url(#softShadow)" />
      {/* Glasses Right Frame */}
      <rect x="105" y="79" width="41" height="32" rx="10" stroke="#1c1412" strokeWidth="5.5" fill="url(#lensShimmer)" filter="url(#softShadow)" />
      {/* Bridge */}
      <path d="M95 91 L 105 91" stroke="#1c1412" strokeWidth="7" strokeLinecap="round" />
      {/* Left Temple/Arm */}
      <path d="M54 91 L 44 91" stroke="#1c1412" strokeWidth="5" strokeLinecap="round" />
      {/* Right Temple/Arm */}
      <path d="M146 91 L 156 91" stroke="#1c1412" strokeWidth="5" strokeLinecap="round" />

      {/* Metallic Rivet Dots on Glasses Frame Corners (Extra touch of realism!) */}
      {/* Left Outer Corner Rivet */}
      <circle cx="59" cy="84" r="1.5" fill="#e2e8f0" />
      {/* Right Outer Corner Rivet */}
      <circle cx="141" cy="84" r="1.5" fill="#e2e8f0" />
    </svg>
  );
}
