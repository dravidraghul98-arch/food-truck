import React from 'react';

interface BrandLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showTagline?: boolean;
  isCompact?: boolean;
}

export const BrandLogo: React.FC<BrandLogoProps> = ({
  className = '',
  size = 'md',
  showTagline = true,
  isCompact = false,
}) => {
  const sizeMap = {
    sm: 'h-9',
    md: 'h-12',
    lg: 'h-16',
    xl: 'h-24',
  };

  return (
    <div className={`flex items-center gap-3 select-none ${className}`} id="arabian-delights-logo-container">
      {/* SVG Emblem with Arabic Arch, Shawarma Torch, Food Truck & Gold Accents */}
      <svg
        className={`${sizeMap[size]} w-auto shrink-0 aspect-[1/1] drop-shadow-[0_2px_10px_rgba(245,158,11,0.35)]`}
        viewBox="0 0 200 200"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-label="Arabian Delights Logo"
      >
        <defs>
          <linearGradient id="goldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FFF176" />
            <stop offset="30%" stopColor="#F59E0B" />
            <stop offset="70%" stopColor="#D97706" />
            <stop offset="100%" stopColor="#92400E" />
          </linearGradient>
          <linearGradient id="redGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#DC2626" />
            <stop offset="50%" stopColor="#991B1B" />
            <stop offset="100%" stopColor="#450A0A" />
          </linearGradient>
          <linearGradient id="darkBgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#1C1917" />
            <stop offset="100%" stopColor="#0C0A09" />
          </linearGradient>
          <filter id="goldGlow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* Outer Circular Ring with Gold Arabesque Border */}
        <circle cx="100" cy="100" r="94" fill="url(#darkBgGrad)" stroke="url(#goldGrad)" strokeWidth="3.5" />
        <circle cx="100" cy="100" r="88" fill="url(#redGrad)" opacity="0.4" stroke="url(#goldGrad)" strokeWidth="1" strokeDasharray="4 2" />

        {/* Arabic Dome / Arch Silhouette */}
        <path
          d="M60 145 V105 C60 78 80 62 100 48 C120 62 140 78 140 105 V145 H60 Z"
          fill="#1C1917"
          stroke="url(#goldGrad)"
          strokeWidth="1.5"
        />

        {/* Crescent Moon and Star */}
        <path
          d="M100 52 C95 44 95 38 100 30 C90 32 84 40 86 50 C88 60 98 66 108 62 C101 60 97 56 100 52 Z"
          fill="url(#goldGrad)"
          filter="url(#goldGlow)"
        />
        <polygon points="106,38 108,43 113,44 109,47 110,52 106,49 102,52 103,47 99,44 104,43" fill="#FFF176" />

        {/* Shawarma Vertical Spit / Food Flame Emblem */}
        <path
          d="M96 72 C96 70 104 70 104 72 L106 105 C106 112 94 112 94 105 Z"
          fill="url(#goldGrad)"
        />
        {/* Sliced layers of juicy meat */}
        <line x1="93" y1="80" x2="107" y2="80" stroke="#78350F" strokeWidth="1.5" strokeLinecap="round" />
        <line x1="91" y1="88" x2="109" y2="88" stroke="#78350F" strokeWidth="1.5" strokeLinecap="round" />
        <line x1="92" y1="96" x2="108" y2="96" stroke="#78350F" strokeWidth="1.5" strokeLinecap="round" />

        {/* Food Truck Stylized Silhouette in Base */}
        <g transform="translate(48, 114)">
          {/* Truck Body */}
          <path
            d="M5 24 L5 4 C5 2 6 0 8 0 L72 0 C74 0 76 2 78 4 L88 12 C90 14 92 16 92 20 L92 24 Z"
            fill="url(#goldGrad)"
          />
          <rect x="7" y="2" width="90" height="22" rx="3" fill="#991B1B" />
          {/* Serving Window */}
          <rect x="18" y="5" width="38" height="12" rx="1.5" fill="#FEF08A" opacity="0.9" />
          <line x1="37" y1="5" x2="37" y2="17" stroke="#78350F" strokeWidth="1" />
          {/* Cabin Windshield */}
          <path d="M66 5 L82 5 C84 5 86 7 88 10 L88 14 L66 14 Z" fill="#38BDF8" opacity="0.8" />
          {/* Truck Wheels */}
          <circle cx="28" cy="24" r="7" fill="#0C0A09" stroke="url(#goldGrad)" strokeWidth="1.5" />
          <circle cx="28" cy="24" r="3" fill="#F59E0B" />
          <circle cx="76" cy="24" r="7" fill="#0C0A09" stroke="url(#goldGrad)" strokeWidth="1.5" />
          <circle cx="76" cy="24" r="3" fill="#F59E0B" />
          {/* Headlight beam */}
          <polygon points="92,16 102,13 102,23 92,20" fill="#FEF08A" opacity="0.4" />
        </g>

        {/* Bottom Banner Ribbon with Gold Rim */}
        <path
          d="M25 158 Q100 178 175 158 L182 174 Q100 196 18 174 Z"
          fill="#1C1917"
          stroke="url(#goldGrad)"
          strokeWidth="1.5"
        />
        {/* Banner Text - KANGAYAM */}
        <text
          x="100"
          y="178"
          fill="#FEF08A"
          fontSize="10"
          fontFamily="'Cinzel', serif"
          fontWeight="bold"
          textAnchor="middle"
          letterSpacing="4"
        >
          KANGAYAM
        </text>

        {/* Decorative Golden Stars */}
        <polygon points="40,90 42,94 47,94 43,97 45,101 40,98 35,101 37,97 33,94 38,94" fill="#F59E0B" />
        <polygon points="160,90 162,94 167,94 163,97 165,101 160,98 155,101 157,97 153,94 158,94" fill="#F59E0B" />
      </svg>

      {/* Typography Block */}
      {!isCompact && (
        <div className="flex flex-col justify-center">
          <div className="flex items-center gap-1.5">
            <span className="font-['Cinzel'] tracking-wider font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-amber-400 to-amber-600 leading-none text-lg sm:text-xl lg:text-2xl drop-shadow-[0_1px_4px_rgba(0,0,0,0.8)]">
              ARABIAN
            </span>
            <span className="font-['Cinzel'] tracking-wider font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-red-400 via-red-500 to-red-600 leading-none text-lg sm:text-xl lg:text-2xl drop-shadow-[0_1px_4px_rgba(0,0,0,0.8)]">
              DELIGHTS
            </span>
          </div>

          {showTagline && (
            <div className="flex items-center gap-2 mt-1">
              <span className="h-[1px] w-3 bg-amber-500/50"></span>
              <span className="text-[10px] sm:text-xs font-semibold tracking-[0.25em] text-amber-300/90 uppercase">
                Food Truck • Kangayam
              </span>
              <span className="h-[1px] w-3 bg-amber-500/50"></span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
