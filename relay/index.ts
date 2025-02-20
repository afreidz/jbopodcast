import ffmpeg from "fluent-ffmpeg";
import { PassThrough } from "stream";
import ffmpegPath from "ffmpeg-static";
import { WebSocketServer, WebSocket } from "ws";

ffmpeg.setFfmpegPath(ffmpegPath!);

const PORT = process.env.PUBLIC_LOCAL_RELAY_PORT || 8888;
const server = new WebSocketServer({ port: Number(PORT) });
let client: WebSocket | null = null;

server.on("connection", (ws) => {
  if (!process.env.RTMP_URL) {
    ws.close(4000, "No streaming output destination");
    return;
  }

  if (client) {
    ws.close(4000, "Only one client allowed");
    return;
  }

  client = ws;

  const passThrough = new PassThrough();

  ffmpeg(passThrough)
    .inputFormat("mp4")
    .videoCodec("libx264")
    .audioCodec("libmp3lame")
    .format("flv")
    .on("start", (cmd) => {
      console.log("FFmpeg process started with command:", cmd);
    })
    .on("error", (err, stdout, stderr) => {
      console.error("FFmpeg error:", err);
      console.error("stdout:", stdout);
      console.error("stderr:", stderr);
    })
    .on("end", () => {
      console.log("FFmpeg processing finished");
    })
    .output(process.env.RTMP_URL)
    .run();

  console.log("Client connected");

  ws.on("message", (data, isBinary) => {
    if (isBinary && data instanceof Buffer) {
      passThrough?.write(data);
      console.log(`Received ${data.byteLength} bytes`);
    } else {
      console.warn("Received non-binary data");
    }
  });

  ws.on("close", () => {
    console.log("Client disconnected");
    setTimeout(() => {
      passThrough?.end();
    }, 1000);
    client = null;
  });

  ws.on("error", (err) => {
    console.error("WebSocket error:", err);
  });
});

console.log(`WebSocket server is running on ws://localhost:${PORT}`);
