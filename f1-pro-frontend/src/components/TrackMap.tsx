import React, { useEffect, useRef, useState } from 'react';

interface TrackMapProps {
  path: string; // SVG path data for the circuit
  progress: number; // 0 to 1 (percentage of lap)
  color: string;
}

export const TrackMap = ({ path, progress, color }: TrackMapProps) => {
  const pathRef = useRef<SVGPathElement>(null);
  const [dotPos, setDotPos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    if (pathRef.current) {
      const totalLength = pathRef.current.getTotalLength();
      const point = pathRef.current.getPointAtLength(totalLength * progress);
      setDotPos({ x: point.x, y: point.y });
    }
  }, [progress, path]);

  return (
    <div className="relative w-full h-full flex items-center justify-center p-4">
      <svg viewBox="0 0 500 500" className="w-full h-full max-h-[300px]">
        {/* Track Outline */}
        <path
          ref={pathRef}
          d={path}
          fill="none"
          stroke="rgba(255,255,255,0.1)"
          strokeWidth="12"
          strokeLinecap="round"
        />
        {/* The Racing Line (Subtle Glow) */}
        <path
          d={path}
          fill="none"
          stroke={color}
          strokeWidth="2"
          className="opacity-40"
        />
        {/* The Live Dot */}
        <circle
          cx={dotPos.x}
          cy={dotPos.y}
          r="8"
          fill={color}
          className="shadow-2xl transition-all duration-75"
          style={{ filter: `drop-shadow(0 0 10px ${color})` }}
        />
        {/* Pulse Effect */}
        <circle
          cx={dotPos.x}
          cy={dotPos.y}
          r="15"
          fill={color}
          className="animate-ping opacity-20"
        />
      </svg>
    </div>
  );
};