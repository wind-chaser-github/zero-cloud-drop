import { useState, useEffect } from "react";
import { usePeer } from "../hooks/usePeer";
import { Dropzone } from "./Dropzone";
import { ProgressRing } from "./ProgressRing";
import { FileSender, FileReceiver, type FileTransferMeta } from "../lib/fileTransfer";
import { Copy, CheckCircle2, AlertCircle } from "lucide-react";
import { useGsapContext } from "../hooks/use-gsap-context";
import gsap from "gsap";

type TransferState = "idle" | "sending" | "receiving" | "complete" | "error";

export function TransferManager() {
  const { peerId, connection, error: peerError, connectToPeer, disconnect } = usePeer();
  
  const [targetId, setTargetId] = useState("");
  const [transferState, setTransferState] = useState<TransferState>("idle");
  const [progress, setProgress] = useState(0);
  const [fileMeta, setFileMeta] = useState<FileTransferMeta | null>(null);
  const [receivedFileUrl, setReceivedFileUrl] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  // Setup file receiver when connection is established
  useEffect(() => {
    if (!connection) {
      setTransferState("idle");
      return;
    }
    
    const receiver = new FileReceiver();
    
    receiver.onProgress = (p) => {
      setTransferState("receiving");
      setProgress(p);
    };
    
    receiver.onComplete = (blob, meta) => {
      const url = URL.createObjectURL(blob);
      setReceivedFileUrl(url);
      setFileMeta(meta);
      setTransferState("complete");
      setProgress(1);
    };

    const handleData = (data: any) => {
      receiver.handleData(data);
      if (data.type === 'meta') {
        setFileMeta(data);
      }
    };

    connection.on("data", handleData);

    return () => {
      connection.off("data", handleData);
    };
  }, [connection]);

  const handleFileSelect = (file: File) => {
    if (!connection) return;
    
    setTransferState("sending");
    setProgress(0);
    setFileMeta({
      type: "meta",
      filename: file.name,
      filesize: file.size,
      filetype: file.type
    });

    const sender = new FileSender(file, connection);
    sender.onProgress = (p) => {
      setProgress(p);
    };
    sender.onComplete = () => {
      setTransferState("complete");
      setProgress(1);
    };
    
    sender.start();
  };

  const copyId = () => {
    if (peerId) {
      navigator.clipboard.writeText(peerId);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  useGsapContext(() => {
    gsap.fromTo(".fade-in-up", 
      { y: 20, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.8, ease: "power3.out", stagger: 0.1 }
    );
  }, [transferState, connection]);

  // UI States
  if (!peerId) {
    return (
      <div className="flex flex-col items-center justify-center mt-20 fade-in-up">
        <div className="w-10 h-10 border-2 border-white/20 border-t-white rounded-full animate-spin mb-4" />
        <p className="text-white/60">Initializing secure connection...</p>
      </div>
    );
  }

  if (!connection) {
    return (
      <div className="w-full max-w-xl mx-auto mt-12 px-4 flex flex-col items-center gap-12 fade-in-up">
        {/* Your ID Card */}
        <div className="glass-panel w-full p-8 rounded-3xl flex flex-col items-center gap-4 text-center">
          <p className="text-white/60 text-sm font-medium">Your Connection ID</p>
          <div className="flex items-center gap-4">
            <span className="text-5xl font-bold tracking-widest text-white/90 font-mono">
              {peerId}
            </span>
            <button 
              onClick={copyId}
              className="p-3 rounded-full hover:bg-white/10 transition-colors text-white/50 hover:text-white"
            >
              {copied ? <CheckCircle2 className="w-6 h-6 text-green-400" /> : <Copy className="w-6 h-6" />}
            </button>
          </div>
          <p className="text-white/40 text-xs max-w-xs mt-2">
            Share this ID with the sender or receiver to establish a secure P2P link.
          </p>
        </div>

        {/* Connect to someone else */}
        <div className="w-full flex flex-col items-center gap-4">
          <p className="text-white/60 text-sm font-medium">Or connect to a peer</p>
          <div className="flex w-full max-w-md gap-2">
            <input 
              type="text" 
              placeholder="Enter 6-character ID"
              value={targetId}
              onChange={(e) => setTargetId(e.target.value.toUpperCase())}
              maxLength={6}
              className="flex-1 bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white font-mono text-lg tracking-widest uppercase focus:outline-none focus:border-white/30 transition-colors placeholder:text-white/20"
            />
            <button 
              onClick={() => connectToPeer(targetId)}
              disabled={targetId.length < 6}
              className="bg-white text-black px-8 rounded-2xl font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105 transition-transform"
            >
              Connect
            </button>
          </div>
          {peerError && (
            <div className="flex items-center gap-2 text-red-400 mt-2 fade-in-up">
              <AlertCircle className="w-4 h-4" />
              <span className="text-sm">{peerError}</span>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-2xl mx-auto flex flex-col items-center fade-in-up">
      <div className="mb-8 flex items-center gap-3 px-4 py-2 bg-green-500/10 text-green-400 rounded-full border border-green-500/20 text-sm font-medium">
        <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
        Connected to {connection.peer}
        <button onClick={disconnect} className="ml-4 text-white/40 hover:text-white/80 underline decoration-white/20">
          Disconnect
        </button>
      </div>

      {transferState === "idle" && (
        <Dropzone onFileSelect={handleFileSelect} />
      )}

      {(transferState === "sending" || transferState === "receiving") && (
        <div className="flex flex-col items-center mt-12 gap-8">
          <h3 className="text-2xl font-light text-white/80">
            {transferState === "sending" ? "Sending file..." : "Receiving file..."}
          </h3>
          <ProgressRing progress={progress} />
          {fileMeta && (
            <p className="text-white/50 text-sm">
              {fileMeta.filename} ({(fileMeta.filesize / 1024 / 1024).toFixed(2)} MB)
            </p>
          )}
        </div>
      )}

      {transferState === "complete" && (
        <div className="flex flex-col items-center mt-12 gap-6 glass-panel p-12 rounded-[3rem]">
          <CheckCircle2 className="w-20 h-20 text-green-400" />
          <h3 className="text-3xl font-semibold text-white">Transfer Complete!</h3>
          {fileMeta && (
            <p className="text-white/60">
              {fileMeta.filename} was successfully {receivedFileUrl ? "received" : "sent"}.
            </p>
          )}
          
          <div className="flex gap-4 mt-6">
            {receivedFileUrl && fileMeta && (
              <a 
                href={receivedFileUrl} 
                download={fileMeta.filename}
                className="bg-white text-black px-8 py-4 rounded-full font-semibold hover:scale-105 transition-transform"
              >
                Download File
              </a>
            )}
            <button 
              onClick={() => {
                setTransferState("idle");
                setProgress(0);
                setFileMeta(null);
                setReceivedFileUrl(null);
              }}
              className="bg-white/10 text-white px-8 py-4 rounded-full font-semibold hover:bg-white/20 transition-colors"
            >
              Send Another
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
