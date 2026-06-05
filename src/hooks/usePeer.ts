import { useState, useEffect, useRef } from "react";
import Peer, { type DataConnection, type PeerOptions } from "peerjs";

// Generate a memorable 6-character ID for easier sharing
const generateShortId = () => Math.random().toString(36).substring(2, 8).toUpperCase();

// Public STUN servers for NAT traversal in unfamiliar networks
const ICE_SERVERS = [
  { urls: "stun:stun.l.google.com:19302" },
  { urls: "stun:stun1.l.google.com:19302" },
  { urls: "stun:stun2.l.google.com:19302" },
];

// Fallback public servers in case default fails
const PUBLIC_SERVERS: PeerOptions[] = [
  { host: "0.peerjs.com", port: 443, secure: true, config: { iceServers: ICE_SERVERS } },
  { host: "0.peerjs.com", port: 443, secure: true, pingInterval: 5000, config: { iceServers: ICE_SERVERS } },
];

export function usePeer() {
  const [peerId, setPeerId] = useState<string | null>(null);
  const [connection, setConnection] = useState<DataConnection | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [serverIndex, setServerIndex] = useState(0);
  
  const peerRef = useRef<Peer | null>(null);
  const customIdRef = useRef(generateShortId());
  const maxRetries = 5;

  useEffect(() => {
    let isMounted = true;
    
    // Only use public servers
    const servers = [...PUBLIC_SERVERS];

    // Stop trying if we hit max retries across all combinations
    if (serverIndex >= maxRetries * servers.length) {
      setError("无法连接到任何信令服务器，请检查网络设置。");
      return;
    }

    const currentServerConfig = servers[serverIndex % servers.length];

    if (peerRef.current) {
      peerRef.current.destroy();
    }

    const peer = new Peer(customIdRef.current, currentServerConfig);
    
    // Timeout mechanism: If not connected within 5 seconds, try next server
    const timeoutId = setTimeout(() => {
      if (!peer.open && isMounted) {
         console.warn(`[Signaling] Server ${currentServerConfig.host || 'default'} timeout. Trying next...`);
         setServerIndex(prev => prev + 1);
      }
    }, 5000);

    peer.on("open", (id) => {
      clearTimeout(timeoutId);
      if (!isMounted) return;
      setPeerId(id);
      setError(null);
      console.log(`[Signaling] Connected to server: ${currentServerConfig.host || 'default'}`);
    });

    peer.on("connection", (conn) => {
      conn.on("open", () => {
        setConnection(conn);
        setError(null);
      });
      conn.on("close", () => setConnection(null));
      conn.on("error", (err) => setError("Connection error: " + err.message));
    });

    peer.on("disconnected", () => {
      if (isMounted && peer.id) {
         console.warn("[Signaling] Disconnected. Attempting reconnect...");
         // Allow PeerJS to try reconnecting to the same server first
         setTimeout(() => {
           if (isMounted && !peer.destroyed) {
             peer.reconnect();
           }
         }, 3000);
      }
    });

    peer.on("error", (err) => {
      clearTimeout(timeoutId);
      console.error("[Signaling] Error:", err.type, err.message);
      
      // If it's a network/server issue, automatically failover to the next server
      if (err.type === 'network' || err.type === 'server-error' || err.type === 'unavailable-id') {
        if (isMounted) {
          setError(`信令服务器连接失败，正在尝试切换重试... (${serverIndex + 1})`);
          setTimeout(() => {
            if (isMounted) setServerIndex(prev => prev + 1);
          }, 1000);
        }
      } else {
        if (isMounted) setError(err.message);
      }
    });

    peerRef.current = peer;

    return () => {
      isMounted = false;
      clearTimeout(timeoutId);
      peer.destroy();
    };
  }, [serverIndex]);

  const connectToPeer = (targetId: string) => {
    if (!peerRef.current) return;
    setError(null);
    const conn = peerRef.current.connect(targetId.toUpperCase(), { reliable: true });
    
    conn.on("open", () => {
      setConnection(conn);
    });
    
    conn.on("close", () => {
      setConnection(null);
    });
    
    conn.on("error", (err) => {
      setError("P2P Connection error: " + err.message);
    });
  };

  const disconnect = () => {
    if (connection) {
      connection.close();
      setConnection(null);
    }
  };

  return { peerId, connection, error, connectToPeer, disconnect };
}
