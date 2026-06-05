import { useRef } from "react";
import gsap from "gsap";
import { useGsapContext } from "../hooks/use-gsap-context";

interface ProgressRingProps {
  progress: number; // 0 to 1
  size?: number;
  strokeWidth?: number;
}

export function ProgressRing({ progress, size = 120, strokeWidth = 6 }: ProgressRingProps) {
  const circleRef = useRef<SVGCircleElement>(null);
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;

  useGsapContext(() => {
    if (circleRef.current) {
      gsap.to(circleRef.current, {
        strokeDashoffset: circumference - progress * circumference,
        duration: 0.3,
        ease: "power2.out",
      });
    }
  }, [progress, circumference]);

  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="transform -rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="rgba(255,255,255,0.1)"
          strokeWidth={strokeWidth}
          fill="transparent"
        />
        <circle
          ref={circleRef}
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="white"
          strokeWidth={strokeWidth}
          fill="transparent"
          strokeDasharray={circumference}
          strokeDashoffset={circumference}
          strokeLinecap="round"
          className="transition-shadow drop-shadow-[0_0_8px_rgba(255,255,255,0.8)]"
        />
      </svg>
      <div className="absolute font-medium text-white text-lg tracking-tighter">
        {Math.round(progress * 100)}%
      </div>
    </div>
  );
}
