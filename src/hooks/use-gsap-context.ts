import { useEffect, useLayoutEffect } from "react";
import gsap from "gsap";

// Determine if we should use layout effect based on environment
const useIsomorphicLayoutEffect = typeof window !== "undefined" ? useLayoutEffect : useEffect;

/**
 * A hook that safely manages GSAP animations in React,
 * automatically reverting animations on unmount to prevent memory leaks and React StrictMode double-fire issues.
 * 
 * @param callback The GSAP animation logic
 * @param dependencies Dependencies array to trigger re-run
 */
export function useGsapContext(
  callback: (context: gsap.Context) => void,
  dependencies: React.DependencyList = []
) {
  useIsomorphicLayoutEffect(() => {
    // Create a GSAP context
    const ctx = gsap.context(callback);
    
    // Revert context on cleanup
    return () => {
      ctx.revert();
    };
  }, dependencies);
}
