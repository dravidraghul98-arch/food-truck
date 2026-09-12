import React from 'react';
import logoImg from '../assets/arabian-delights-logo.png';

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
    sm: 'w-9 h-9',
    md: 'w-11 h-11 sm:w-12 sm:h-12',
    lg: 'w-16 h-16 sm:w-20 sm:h-20',
    xl: 'w-24 h-24 sm:w-28 sm:h-28 lg:w-32 lg:h-32',
  };

  const textSizeMap = {
    sm: 'text-xs sm:text-sm',
    md: 'text-sm sm:text-base lg:text-lg',
    lg: 'text-lg sm:text-xl lg:text-2xl',
    xl: 'text-2xl sm:text-3xl lg:text-4xl',
  };

  const taglineSizeMap = {
    sm: 'text-[9px]',
    md: 'text-[10px]',
    lg: 'text-xs',
    xl: 'text-sm',
  };

  return (
    <div className={`flex items-center gap-3 select-none min-w-0 ${className}`} id="arabian-delights-logo-container">
      {/* Official Brand Logo Emblem */}
      <div className="relative group shrink-0">
        <div className="absolute -inset-1 rounded-full bg-gradient-to-r from-amber-500 via-amber-400 to-amber-600 opacity-60 blur-sm group-hover:opacity-100 transition duration-300"></div>
        <img
          src={logoImg}
          alt="Arabian Delights Official Logo"
          className={`${sizeMap[size]} relative rounded-full object-cover border-2 border-amber-400/80 shadow-[0_4px_15px_rgba(245,158,11,0.4)] transition-transform duration-300 group-hover:scale-105`}
        />
      </div>

      {/* Typography Block */}
      {!isCompact && (
        <div className="flex flex-col justify-center min-w-0">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className={`font-['Cinzel'] tracking-wider font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-amber-400 to-amber-600 leading-none ${textSizeMap[size]} drop-shadow-[0_1px_4px_rgba(0,0,0,0.8)]`}>
              ARABIAN
            </span>
            <span className={`font-['Cinzel'] tracking-wider font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-red-400 via-red-500 to-red-600 leading-none ${textSizeMap[size]} drop-shadow-[0_1px_4px_rgba(0,0,0,0.8)]`}>
              DELIGHTS
            </span>
          </div>

          {showTagline && (
            <div className="flex items-center gap-1.5 mt-1 flex-wrap">
              <span className="h-[1px] w-2.5 bg-amber-500/50"></span>
              <span className={`${taglineSizeMap[size]} font-semibold tracking-[0.2em] text-amber-300/90 uppercase`}>
                Authentic Shawarma & Kebabs • Kangayam
              </span>
              <span className="h-[1px] w-2.5 bg-amber-500/50"></span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

