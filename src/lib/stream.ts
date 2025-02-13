export default async function startScreenCaptureAndStream(
  crop: DOMRect,
  audio?: MediaStreamTrack
) {
  const mimeType = getSupportedMimeType();
  if (!mimeType) {
    throw new Error("No supported video MIME types found");
  }

  console.log(mimeType);

  const stream = await navigator.mediaDevices.getDisplayMedia({
    preferCurrentTab: true,
    video: { frameRate: 30 },
    audio: { echoCancellation: true },
  } as any);

  const socket = new WebSocket("ws://localhost:8080");
  await new Promise((r) => {
    socket.addEventListener("open", r);
  });

  if (stream && audio) stream.addTrack(audio);

  const recorder = new MediaRecorder(stream, {
    mimeType,
    videoBitsPerSecond: 2500000, // 2.5 Mbps
    audioBitsPerSecond: 128000, // 128 kbps
  });
  recorder.ondataavailable = async (chunk) => {
    const data = await chunk.data.arrayBuffer();
    socket.send(
      JSON.stringify({ data: Array.from(new Uint8Array(data)), crop })
    );
  };
  recorder.start(1000);

  await new Promise((r) => setTimeout(r, 10000));
  recorder.stop();
  return;
}

function getSupportedMimeType() {
  const types = [
    "video/mp4;codecs=h264,aac",
    "video/webm;codecs=h264,opus",
    "video/webm;codecs=vp8,opus",
  ];

  return types.find((type) => MediaRecorder.isTypeSupported(type));
}
