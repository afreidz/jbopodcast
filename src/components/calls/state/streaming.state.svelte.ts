import { toast } from "svelte-sonner";
import { actions } from "astro:actions";
import { PUBLIC_LOCAL_RELAY } from "astro:env/client";

export default class StreamingState {
  protected streams: MediaStream[] = [];
  protected stage: HTMLElement | null = null;
  private recorder: MediaRecorder | null = null;

  protected _live: boolean = $state(false);
  protected _ready: boolean = $state(false);
  protected _loading: boolean = $state(false);
  protected _videoId: string | null = $state(null);

  async init(streams: MediaStream[], stage: HTMLElement) {
    this._ready = true;
    this.stage = stage;
    this.streams = streams;
  }

  get videoId() {
    return this._videoId;
  }

  get ready() {
    return this._ready;
  }

  get live() {
    return this._live;
  }

  get loading() {
    return this._loading;
  }

  async startStream() {
    this._loading = true;

    const ws = new WebSocket(PUBLIC_LOCAL_RELAY);
    ws.addEventListener("error", (e) => console.error(e));

    const socketReady = Promise.withResolvers();
    ws.addEventListener("open", socketReady.resolve);
    ws.addEventListener("error", socketReady.reject);
    setTimeout(socketReady.reject, 10000);

    const ready = await socketReady.promise.catch(() => {
      toast.error(
        "Unable to connect to streaming relay socket. Do you have RelayCast installed and running?"
      );
      this.stopStream();
      return null;
    });

    if (!ready) return (this._loading = false);

    const screen = await navigator.mediaDevices.getDisplayMedia({
      preferCurrentTab: true,
      audio: false,
    } as any);

    const ac = new AudioContext();
    const dest = ac.createMediaStreamDestination();

    this.streams.forEach((stream) => {
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
    const cropTarget = await CropTarget.fromElement(this.stage).catch(
      (_: Error) => null
    );
    const [video] = stream.getVideoTracks();

    // @ts-ignore
    if (cropTarget) video.cropTo(cropTarget);

    this.recorder = new MediaRecorder(stream, {
      mimeType: "video/mp4; codecs=avc3",
      audioBitsPerSecond: 128000,
      videoBitsPerSecond: 6000000,
    });

    this.recorder.addEventListener("dataavailable", async (e) => {
      ws.send(await e.data.arrayBuffer());
    });

    this.recorder.addEventListener("stop", () => {
      ws.close();
      screen.getTracks().forEach((t) => t.stop());
    });

    this.recorder.addEventListener("error", () => {
      toast.error("Unable to send data to streaming relay");
      return this.stopStream();
    });

    this.recorder.start(1000);
    this._loading = false;
    this._live = true;
  }

  async stopStream() {
    this.recorder?.stop();
    this._live = false;
    this._loading = false;
  }

  async refreshYoutube() {
    this._loading = true;
    this._videoId = null;
    const resp = await actions.stream.getStreamId();
    this._videoId = resp.data ?? null;
    this._loading = false;
  }
}
