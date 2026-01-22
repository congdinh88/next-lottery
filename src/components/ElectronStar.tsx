import React from "react";

const ElectronStar = () => (
  <div className="absolute inset-0 w-full h-full pointer-events-none">
    <svg
      className="w-full h-full overflow-visible"
      viewBox="0 0 220 220"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id="tailGradient" x1="0%" y1="100%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0" />
          <stop offset="100%" stopColor="#ffffff" stopOpacity="1" />
        </linearGradient>
        <filter id="blurFilter">
          <feGaussianBlur in="SourceGraphic" stdDeviation="1" />
        </filter>
      </defs>
      <path
        d="M 20 110 A 110 110 0 0 1 110 0"
        fill="none"
        stroke="url(#tailGradient)"
        strokeWidth="10"
        strokeLinecap="round"
        filter="url(#blurFilter)"
        style={{ opacity: 0.9 }}
      />
    </svg>
    <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10">
      <div className="w-3 h-2 bg-white rounded-full shadow-[0_0_10px_#ffffff,0_0_20px_#fca5a5] border border-white"></div>
    </div>
  </div>
);

export default ElectronStar;