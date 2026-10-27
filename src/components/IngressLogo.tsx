import React from 'react';

interface IngressLogoProps {
  className?: string;
  alt?: string;
}

export const IngressLogo: React.FC<IngressLogoProps> = ({ 
  className = "h-8 w-auto",
  alt = "INGRESS Corporation Logo" 
}) => {
  return (
    <div 
      className={`inline-flex items-center justify-center select-none shadow-sm rounded-[1px] overflow-hidden bg-white ${className}`}
      role="img"
      aria-label={alt}
      title="INGRESS"
    >
      <svg 
        viewBox="0 0 206 50" 
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full object-contain"
      >
        {/* Solid White Rectangular Background */}
        <rect width="206" height="50" fill="#FFFFFF" />

        {/* Maroon/Burgundy Border matching uploaded image #850536 */}
        <rect 
          x="1.75" 
          y="1.75" 
          width="202.5" 
          height="46.5" 
          fill="none" 
          stroke="#850536" 
          strokeWidth="2.5" 
        />

        {/* 'i' Upper Dot / Quadrilateral (#850536) with upward diagonal cut */}
        <path 
          d="M 14 11 H 22.5 V 15.2 L 14 19.8 Z" 
          fill="#850536" 
        />

        {/* 'i' Lower Stem (Corporate Gray #8e9095) with matching slanted top */}
        <path 
          d="M 14 23 L 22.5 18.4 V 39 H 14 Z" 
          fill="#8e9095" 
        />

        {/* 'N' */}
        <path 
          d="M 27.5 39 V 11 H 34.5 L 44.5 26.5 V 11 H 51.5 V 39 H 44.5 L 34.5 23.5 V 39 Z" 
          fill="#8e9095" 
        />

        {/* 'G' */}
        <path 
          d="M 71 11 C 79 11 82.5 13.8 82.5 17.5 L 77.8 18 C 76.6 16.2 74.5 15.2 71 15.2 C 63.5 15.2 60.5 19.6 60.5 25 C 60.5 30.4 63.5 34.8 71 34.8 C 75 34.8 77.2 33.6 77.2 29.8 V 27.2 H 70.5 V 23.2 H 83 V 33.2 C 80.2 37 76.2 39 71 39 C 59.5 39 53.5 32.8 53.5 25 C 53.5 17.2 59.5 11 71 11 Z" 
          fill="#8e9095" 
        />

        {/* 'R' Vertical Spine */}
        <path 
          d="M 88 11 H 94.8 V 39 H 88 Z" 
          fill="#8e9095" 
        />
        {/* 'R' Upper Loop */}
        <path 
          d="M 94.8 11 H 103 C 108.5 11 111.5 13.5 111.5 18.2 C 111.5 22.8 108.5 25.5 102.5 25.5 H 94.8 V 20.2 H 102 C 104.2 20.2 105.5 19.4 105.5 18.2 C 105.5 17 104.2 16.2 102 16.2 H 94.8 Z" 
          fill="#8e9095" 
        />
        {/* 'R' Diagonal Leg */}
        <path 
          d="M 98 25.5 H 104.8 L 114.5 39 H 107 Z" 
          fill="#8e9095" 
        />

        {/* 'E' */}
        <path 
          d="M 119 11 H 142.5 V 16.5 H 125.8 V 22.2 H 140.5 V 27.2 H 125.8 V 33.5 H 142.5 V 39 H 119 Z" 
          fill="#8e9095" 
        />

        {/* First 'S' - Smooth rounded track with rounded caps as in uploaded image */}
        <path 
          d="M 165 17.2 C 164 14.5 160.8 13.8 157.2 13.8 C 151.8 13.8 148.8 16.2 148.8 19.8 C 148.8 23.5 151.8 25.5 156.8 27 C 161.8 28.5 165.2 30.5 165.2 34.2 C 165.2 38 161.8 39 156.8 39 C 151.8 39 148.6 36.8 147.5 33.2" 
          fill="none" 
          stroke="#8e9095" 
          strokeWidth="5.5" 
          strokeLinecap="round" 
          strokeLinejoin="round"
        />

        {/* Second 'S' */}
        <path 
          d="M 189 17.2 C 188 14.5 184.8 13.8 181.2 13.8 C 175.8 13.8 172.8 16.2 172.8 19.8 C 172.8 23.5 175.8 25.5 180.8 27 C 185.8 28.5 189.2 30.5 189.2 34.2 C 189.2 38 185.8 39 180.8 39 C 175.8 39 172.6 36.8 171.5 33.2" 
          fill="none" 
          stroke="#8e9095" 
          strokeWidth="5.5" 
          strokeLinecap="round" 
          strokeLinejoin="round"
        />
      </svg>
    </div>
  );
};
