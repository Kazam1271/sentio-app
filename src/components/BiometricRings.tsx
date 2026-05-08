import React from 'react';

interface RingProps {
  percentage: number;
  label: string;
  colorClass: string;
}

export const BiometricRing: React.FC<RingProps> = ({ percentage, label, colorClass }) => {
  const radius = 40;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div className="flex flex-col items-center justify-center p-4">
      <div className="relative w-24 h-24 flex items-center justify-center">
        {/* Background ring */}
        <svg className="w-full h-full transform -rotate-90 absolute top-0 left-0">
          <circle
            cx="48"
            cy="48"
            r={radius}
            stroke="currentColor"
            strokeWidth="4"
            fill="transparent"
            className="text-gray-800"
          />
          {/* Progress ring */}
          <circle
            cx="48"
            cy="48"
            r={radius}
            stroke="currentColor"
            strokeWidth="4"
            fill="transparent"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            className={`transition-all duration-1000 ease-out ${colorClass}`}
            style={{
              filter: 'drop-shadow(0 0 4px currentColor)'
            }}
          />
        </svg>
        <span className={`text-2xl font-bold z-10 ${colorClass}`}>{percentage}%</span>
      </div>
      <div className="mt-3 text-center">
        <div className="text-sm font-medium text-gray-300">{label}</div>
        <div className="text-xs text-gray-500">{percentage.toFixed(1)} / 100</div>
      </div>
    </div>
  );
};
