import type { DataConnection } from "peerjs";

const CHUNK_SIZE = 64 * 1024; // 64 KB

export type FileTransferMeta = {
  type: 'meta';
  filename: string;
  filesize: number;
  filetype: string;
};

export type FileTransferChunk = {
  type: 'chunk';
  data: ArrayBuffer;
  offset: number;
};

export type FileTransferComplete = {
  type: 'complete';
};

export class FileSender {
  private file: File;
  private conn: DataConnection;
  private offset = 0;
  public onProgress?: (progress: number) => void;
  public onComplete?: () => void;

  constructor(file: File, conn: DataConnection) {
    this.file = file;
    this.conn = conn;
  }

  public async start() {
    const meta: FileTransferMeta = {
      type: 'meta',
      filename: this.file.name,
      filesize: this.file.size,
      filetype: this.file.type,
    };
    this.conn.send(meta);
    this.readNextChunk();
  }

  private readNextChunk = () => {
    // Throttle based on WebRTC DataChannel buffer size
    if (this.conn.dataChannel && this.conn.dataChannel.bufferedAmount > 1024 * 1024) {
      setTimeout(this.readNextChunk, 50);
      return;
    }

    const slice = this.file.slice(this.offset, this.offset + CHUNK_SIZE);
    const reader = new FileReader();
    reader.onload = (e) => {
      const buffer = e.target?.result as ArrayBuffer;
      const chunk: FileTransferChunk = {
        type: 'chunk',
        data: buffer,
        offset: this.offset,
      };
      
      this.conn.send(chunk);
      this.offset += buffer.byteLength;

      if (this.onProgress) {
        this.onProgress(this.offset / this.file.size);
      }

      if (this.offset < this.file.size) {
        // Read next immediately if buffer is fine, but use timeout to avoid freezing main thread completely
        setTimeout(this.readNextChunk, 0);
      } else {
        const completeSignal: FileTransferComplete = { type: 'complete' };
        this.conn.send(completeSignal);
        if (this.onComplete) this.onComplete();
      }
    };
    reader.readAsArrayBuffer(slice);
  }
}

export class FileReceiver {
  private buffers: ArrayBuffer[] = [];
  private receivedSize = 0;
  public meta: FileTransferMeta | null = null;
  public onProgress?: (progress: number) => void;
  public onComplete?: (file: Blob, meta: FileTransferMeta) => void;

  public handleData(data: any) {
    if (data.type === 'meta') {
      this.meta = data;
      this.buffers = [];
      this.receivedSize = 0;
    } else if (data.type === 'chunk') {
      this.buffers.push(data.data);
      this.receivedSize += data.data.byteLength;
      if (this.meta && this.onProgress) {
        this.onProgress(this.receivedSize / this.meta.filesize);
      }
    } else if (data.type === 'complete') {
      if (this.meta) {
        const blob = new Blob(this.buffers, { type: this.meta.filetype });
        if (this.onComplete) this.onComplete(blob, this.meta);
      }
    }
  }
}
