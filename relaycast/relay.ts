import path from "path";
import { URL } from "url";
import https from "https";
import { readFileSync } from "fs";
import EventEmitter from "events";
import ffmpeg from "fluent-ffmpeg";
import LoadConfig from "home-config";
import { PassThrough } from "stream";
import CONFIG_FILE from "./configPath";
import ffmpegPath from "ffmpeg-static";
import { WebSocketServer, WebSocket } from "ws";
if (ffmpegPath) ffmpeg.setFfmpegPath(ffmpegPath);

const config = LoadConfig.load(CONFIG_FILE, {
  SOCKET: {
    PORT: 8888,
    HOST: "localhost",
  },
  STREAM: {
    INPUT_VIDEO_FORMAT: "mp4",
    OUTPUT_VIDEO_CODEC: "libx264",
    OUTPUT_AUDIO_CODEC: "libmp3lame",
    DESTINATIONS: [],
  },
});

config.save();

export default class RelaySocket extends EventEmitter {
  private cert = readFileSync(path.join(__dirname, "cert", "cert.pem"));
  private key = readFileSync(path.join(__dirname, "cert", "key.pem"));
  private stream: PassThrough = new PassThrough();
  private socket: WebSocketServer | null = null;
  private client: WebSocket | null = null;
  private server: https.Server;

  constructor() {
    super();
    this.server = https.createServer({ cert: this.cert, key: this.key });
    this.server.listen(config.SOCKET.PORT, config.SOCKET.HOST, 50);

    this.server.on("listening", () => {
      this.emit("message", {
        event: "server-start",
        message: `HTTPS server started ${config.SOCKET.HOST}:${config.SOCKET.PORT}`,
      });
    });
  }

  start() {
    const config = LoadConfig.load(CONFIG_FILE);

    if (!this.server.listening)
      this.server.listen(config.SOCKET.PORT, config.SOCKET.HOST, 50);

    if (this.socket) this.socket.close();
    this.socket = new WebSocketServer({ server: this.server });

    this.socket.on("listening", () => {
      this.emit("message", {
        event: "socket-start",
        message: `WSS Socket started ${config.SOCKET.HOST}:${config.SOCKET.PORT}`,
      });
    });

    this.socket.on("close", () => {
      this.emit("message", {
        event: "socket-stop",
        message: "Socket stopped",
      });
    });

    this.socket.on("connection", (ws) => {
      if (this.client) return ws.close(4000, "Only one client allowed");
      this.client = ws;

      this.stream.end();
      this.stream = new PassThrough();

      if (!config.STREAM.DESTINATIONS.length) {
        this.emit("message", {
          event: "stream-destination",
          message: "there are no configured destinations for the stream",
        });
      }

      const destinations = Array.isArray(config.STREAM.DESTINATIONS)
        ? (config.STREAM.DESTINATIONS as string[])
        : typeof config.STREAM.DESTINATIONS === "string"
          ? ([config.STREAM.DESTINATIONS] as string[])
          : ([] as string[]);

      const proc = ffmpeg(this.stream)
        .inputFormat(config.STREAM.INPUT_VIDEO_FORMAT)
        .videoCodec(config.STREAM.OUTPUT_VIDEO_CODEC)
        .audioCodec(config.STREAM.OUTPUT_AUDIO_CODEC)
        .format("flv")
        .output(destinations[0]);
      destinations.shift();

      destinations.forEach((rtmp) => {
        try {
          const url = new URL(rtmp);
          if (url.protocol !== "rtmp" || url) return;
          proc.output(rtmp);
        } catch (e) {
          return;
        }
      });

      proc
        .on("start", (cmd) => {
          this.emit("message", {
            event: "stream-start",
            message: `FFmpeg started with: ${cmd}`,
          });
        })
        .on("error", (err, stdout, stderr) => {
          this.emit("message", {
            event: "stream-error",
            message: err,
            stdout,
            stderr,
          });
        })
        .on("end", () => {
          this.emit("message", {
            event: "stream-stop",
            message: "ffmpeg process ended",
          });
        })
        .run();

      this.client.on("message", (data, isBinary) => {
        if (isBinary && data instanceof Buffer) {
          this.stream.write(data);
          this.emit("message", {
            event: "stream-sent-data",
            message: data.byteLength,
          });
        } else {
          this.emit("message", {
            event: "stream-non-binary",
            message: "received non-binary data",
          });
        }
      });

      this.client.on("close", () => {
        setTimeout(() => {
          this.stream.end();
        }, 1000);
        this.client = null;
        this.emit("messge", {
          event: "client-disconnect",
          message: "socket client closed",
        });
      });

      this.client.on("error", (err) => {
        this.emit("message", {
          event: "client-error",
          message: err.message,
          error: err,
        });
      });
    });
  }

  stop() {
    this.socket?.close();
    this.server.close();
  }
}
