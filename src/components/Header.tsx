import { Sparkles } from "lucide-react";
import { useGsapContext } from "../hooks/use-gsap-context";
import gsap from "gsap";

export function Header() {
  useGsapContext(() => {
    gsap.fromTo(
      "header",
      { y: -20, opacity: 0 },
      { y: 0, opacity: 1, duration: 1, ease: "power3.out" }
    );
  }, []);

  return (
    <header className="w-full flex items-center justify-between px-8 py-6">
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center">
          <Sparkles className="w-4 h-4 text-black" />
        </div>
        <span className="font-semibold tracking-tight text-white/90 text-lg">
          Zero Drop
        </span>
      </div>
      <div className="flex items-center gap-6">
        <a 
          href="https://github.com/wind-chaser-github/zero-cloud-drop#readme" 
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm font-medium text-white/50 hover:text-white transition-colors"
        >
          How it works
        </a>
        <a 
          href="https://github.com/wind-chaser-github/zero-cloud-drop" 
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm font-medium text-white/50 hover:text-white transition-colors"
        >
          GitHub
        </a>
      </div>
    </header>
  );
}
