import { useRef, useState } from "react";
import { UploadCloud, File as FileIcon } from "lucide-react";
import { cn } from "../lib/utils";
import { useGsapContext } from "../hooks/use-gsap-context";
import gsap from "gsap";

export interface DropzoneProps {
  onFileSelect: (file: File) => void;
  disabled?: boolean;
}

export function Dropzone({ onFileSelect, disabled }: DropzoneProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const iconRef = useRef<SVGSVGElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isHovered, setIsHovered] = useState(false);
  const [localFile, setLocalFile] = useState<File | null>(null);

  // Initial Entrance Animation
  useGsapContext(() => {
    // Reveal text and box
    gsap.fromTo(
      ".dropzone-element",
      { y: 30, opacity: 0 },
      { y: 0, opacity: 1, stagger: 0.1, duration: 1, ease: "power3.out" }
    );
  }, []);

  // Hover animations
  useGsapContext(() => {
    if (isHovered) {
      gsap.to(containerRef.current, {
        scale: 1.02,
        borderColor: "rgba(255, 255, 255, 0.4)",
        backgroundColor: "rgba(255, 255, 255, 0.05)",
        duration: 0.5,
        ease: "elastic.out(1, 0.5)",
      });
      gsap.to(iconRef.current, {
        y: -5,
        scale: 1.1,
        color: "#ffffff",
        duration: 0.4,
        ease: "back.out(1.5)",
      });
    } else {
      gsap.to(containerRef.current, {
        scale: 1,
        borderColor: "rgba(255, 255, 255, 0.08)",
        backgroundColor: "rgba(255, 255, 255, 0.02)",
        duration: 0.4,
        ease: "power2.out",
      });
      gsap.to(iconRef.current, {
        y: 0,
        scale: 1,
        color: "rgba(255,255,255,0.5)",
        duration: 0.4,
        ease: "power2.out",
      });
    }
  }, [isHovered]);

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsHovered(true);
  };

  const onDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsHovered(false);
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (disabled) return;
    setIsHovered(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const selectedFile = e.dataTransfer.files[0];
      setLocalFile(selectedFile);
      onFileSelect(selectedFile);
    }
  };

  const onClick = () => {
    if (disabled) return;
    fileInputRef.current?.click();
  };

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const selectedFile = e.target.files[0];
      setLocalFile(selectedFile);
      onFileSelect(selectedFile);
      // Reset input value to allow selecting the same file again
      e.target.value = '';
    }
  };

  return (
    <div className="w-full max-w-xl mx-auto mt-12 px-4">
      <div className="text-center mb-8 dropzone-element">
        <h2 className="text-3xl font-light tracking-tight mb-2 text-white/90">
          Secure. Peer-to-Peer. Instant.
        </h2>
        <p className="text-sm text-white/40 font-medium">
          Drop any file here. It goes directly to the receiver.
        </p>
      </div>

      <div
        ref={containerRef}
        onClick={onClick}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
        className={cn(
          "dropzone-element relative group flex flex-col items-center justify-center",
          "w-full h-72 rounded-[2rem] border border-dashed border-white/10 bg-white/5",
          "overflow-hidden transition-colors",
          disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer hover:bg-white/10"
        )}
      >
        <input 
          type="file" 
          ref={fileInputRef} 
          onChange={onFileChange} 
          className="hidden" 
        />
        <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
        
        {!localFile ? (
          <>
            <UploadCloud
              ref={iconRef}
              className="w-12 h-12 text-white/50 mb-4 transition-colors group-hover:text-white/80"
              strokeWidth={1.5}
            />
            <span className="text-white/70 font-medium text-sm">
              Click or drag a file to upload
            </span>
          </>
        ) : (
          <div className="flex flex-col items-center">
            <FileIcon className="w-12 h-12 text-white/90 mb-4" strokeWidth={1.5} />
            <span className="text-white font-medium text-lg truncate max-w-[200px]">
              {localFile.name}
            </span>
            <span className="text-white/50 text-xs mt-1">
              {(localFile.size / 1024 / 1024).toFixed(2)} MB
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
