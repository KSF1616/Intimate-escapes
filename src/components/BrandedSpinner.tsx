import React from 'react';
import { LOGO_URL, APP_NAME } from '@/lib/constants';

interface BrandedSpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  text?: string;
  fullScreen?: boolean;
}

const BrandedSpinner: React.FC<BrandedSpinnerProps> = ({ 
  size = 'md', 
  text,
  fullScreen = false 
}) => {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-16 h-16',
    lg: 'w-24 h-24',
    xl: 'w-32 h-32'
  };

  const spinnerContent = (
    <div className="flex flex-col items-center justify-center gap-4">
      {/* Animated Logo Container */}
      <div className="relative">
        {/* Outer spinning ring */}
        <div className={`${sizeClasses[size]} rounded-full border-4 border-[#D4AF37]/20 border-t-[#D4AF37] animate-spin`} />
        
        {/* Inner logo */}
        <div className={`absolute inset-0 flex items-center justify-center`}>
          <div className={`${size === 'sm' ? 'w-5 h-5' : size === 'md' ? 'w-10 h-10' : size === 'lg' ? 'w-16 h-16' : 'w-20 h-20'} rounded-lg overflow-hidden animate-pulse`}>
            <img 
              src={LOGO_URL} 
              alt={APP_NAME}
              className="w-full h-full object-contain"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.style.display = 'none';
              }}
            />
          </div>
        </div>
      </div>
      
      {/* Loading text */}
      {text && (
        <p className="text-gray-400 text-sm animate-pulse">{text}</p>
      )}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-[#1a0f2e] via-[#2D1B4E] to-[#1a0f2e]">
        {spinnerContent}
      </div>
    );
  }

  return spinnerContent;
};

// Alternative pulsing logo spinner
export const LogoPulseSpinner: React.FC<BrandedSpinnerProps> = ({ 
  size = 'md', 
  text,
  fullScreen = false 
}) => {
  const sizeClasses = {
    sm: 'w-10 h-10',
    md: 'w-20 h-20',
    lg: 'w-32 h-32',
    xl: 'w-40 h-40'
  };

  const spinnerContent = (
    <div className="flex flex-col items-center justify-center gap-4">
      {/* Pulsing rings */}
      <div className="relative">
        <div className={`${sizeClasses[size]} relative`}>
          {/* Outer pulsing rings */}
          <div className="absolute inset-0 rounded-full bg-[#D4AF37]/20 animate-ping" />
          <div className="absolute inset-2 rounded-full bg-[#D4AF37]/30 animate-ping animation-delay-150" />
          
          {/* Logo container */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className={`${size === 'sm' ? 'w-8 h-8' : size === 'md' ? 'w-16 h-16' : size === 'lg' ? 'w-24 h-24' : 'w-32 h-32'} rounded-xl overflow-hidden bg-gradient-to-br from-[#2D1B4E] to-[#1a0f2e] p-2 shadow-lg shadow-[#D4AF37]/20`}>
              <img 
                src={LOGO_URL} 
                alt={APP_NAME}
                className="w-full h-full object-contain"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.style.display = 'none';
                }}
              />
            </div>
          </div>
        </div>
      </div>
      
      {/* Loading text */}
      {text && (
        <p className="text-gray-400 text-sm">{text}</p>
      )}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-[#1a0f2e] via-[#2D1B4E] to-[#1a0f2e]">
        {spinnerContent}
      </div>
    );
  }

  return spinnerContent;
};

// Rotating logo spinner
export const LogoRotateSpinner: React.FC<BrandedSpinnerProps> = ({ 
  size = 'md', 
  text,
  fullScreen = false 
}) => {
  const sizeClasses = {
    sm: 'w-10 h-10',
    md: 'w-16 h-16',
    lg: 'w-24 h-24',
    xl: 'w-32 h-32'
  };

  const spinnerContent = (
    <div className="flex flex-col items-center justify-center gap-4">
      <div className={`${sizeClasses[size]} relative`}>
        {/* Rotating border */}
        <div className="absolute inset-0 rounded-xl border-2 border-transparent border-t-[#D4AF37] border-r-[#D4AF37]/50 animate-spin" />
        
        {/* Logo */}
        <div className="absolute inset-1 rounded-lg overflow-hidden bg-gradient-to-br from-[#2D1B4E] to-[#1a0f2e] flex items-center justify-center">
          <img 
            src={LOGO_URL} 
            alt={APP_NAME}
            className="w-3/4 h-3/4 object-contain"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.style.display = 'none';
            }}
          />
        </div>
      </div>
      
      {/* Loading text */}
      {text && (
        <p className="text-gray-400 text-sm animate-pulse">{text}</p>
      )}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-[#1a0f2e] via-[#2D1B4E] to-[#1a0f2e]">
        {spinnerContent}
      </div>
    );
  }

  return spinnerContent;
};

export default BrandedSpinner;
