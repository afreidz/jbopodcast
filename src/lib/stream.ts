import { PUBLIC_LOCAL_RELAY } from "astro:env/client";

export async function stream(
  stage: HTMLElement,
  streams: (MediaStream | null)[]
) {
  const ws = new WebSocket(PUBLIC_LOCAL_RELAY);
  ws.addEventListener("error", (e) => console.error(e));

  const socketReady = Promise.withResolvers();
  ws.addEventListener("open", socketReady.resolve);
  setTimeout(socketReady.reject, 10000);

  await socketReady.promise;

  const screen = await navigator.mediaDevices.getDisplayMedia({
    preferCurrentTab: true,
    audio: false,
  } as any);

  const ac = new AudioContext();
  const dest = ac.createMediaStreamDestination();

  streams.forEach((stream) => {
    if (!stream) return;
    const audioStream = new MediaStream([...stream.getAudioTracks()]);
    const node = ac.createMediaStreamSource(audioStream);
    node.connect(dest);
  });

  const stream = new MediaStream([
    ...screen.getVideoTracks(),
    ...dest.stream.getAudioTracks(),
  ]);

  // @ts-ignore
  const cropTarget = await CropTarget.fromElement(stage);

  const [video] = stream.getVideoTracks();
  (video as any).cropTo(cropTarget);

  const recorder = new MediaRecorder(stream, {
    mimeType: "video/mp4",
    audioBitsPerSecond: 128000,
    videoBitsPerSecond: 6000000,
  });

  recorder.addEventListener("dataavailable", async (e) => {
    ws.send(await e.data.arrayBuffer());
  });

  recorder.addEventListener("stop", () => {
    ws.close();
    screen.getTracks().forEach((t) => t.stop());
  });

  recorder.start(1000);
  return () => recorder.stop();
}
