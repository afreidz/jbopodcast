import { toast } from "svelte-sonner";
import { actions } from "astro:actions";
import client from "$/lib/pocketbase/client";
import type { Call, Scene } from "$/actions/calls";
import { PUBLIC_LOCAL_RELAY } from "astro:env/client";
import PeerConnection from "$/state/peer.state.svelte";
import type LocalStreamState from "$/state/local.stream.state.svelte";
import { getCurrentUser, type CurrentUser } from "$/lib/pocketbase/client";

export default class CallState {
  public call: Call;
  public localStreamState: LocalStreamState;

  protected user: CurrentUser;
  protected stage: HTMLElement | null = null;
  protected recorder: MediaRecorder | null = null;

  protected _connections: PeerConnection[] = $state([]);
  protected _switchingScenes: boolean = $state(false);
  protected _activeScene: Scene | null = $state(null);
  protected _videoId: string | null = $state(null);
  protected _call: Call | null = $state(null);
  protected _loading: boolean = $state(false);
  protected _live: boolean = $state(false);

  constructor(call: Call, localStreamState: LocalStreamState) {
    this.user = getCurrentUser();

    this.call = call;
    this.localStreamState = localStreamState;

    const otherMembers = [
      this.call.expand!.host,
      ...this.call.expand!.guests,
    ].filter((m) => m.id !== this.user.id);

    otherMembers.forEach(async (guest) => {
      const pc = new PeerConnection(
        guest,
        this.call.id,
        this.user.id,
        this.localStreamState
      );

      this.addConnection(pc);
      await pc.connect();
    });

    client.collection("calls").subscribe<Call>(
      this.call.id,
      ({ record }) => {
        if (
          record.activeScene !== this._activeScene?.id &&
          record.expand?.activeScene
        ) {
          this._activeScene = record.expand.activeScene;
        }
      },
      {
        expand:
          "activeScene,activeScene.A,activeScene.B,activeScene.C,activeScene.D",
      }
    );

    const scene = this.call.expand?.activeScene || this.scenes.at(-1);
    if (scene) this._activeScene = scene;
  }

  get live() {
    return this._live;
  }

  get loading() {
    return this._loading;
  }

  get activeScene() {
    return this._activeScene;
  }

  get scenes() {
    return this.call?.expand?.scenes || [];
  }

  get connections() {
    return this._connections;
  }

  get switchingScenes() {
    return this._switchingScenes;
  }

  get videoId() {
    return this._videoId;
  }

  addConnection(c: PeerConnection) {
    console.log("Connection added");
    const updated = this._connections.filter((e) => e.peer.id !== c.peer.id);
    this._connections = [...updated, c];
  }

  async setActiveScene(s: Scene) {
    this._switchingScenes = true;
    await new Promise((r) => setTimeout(r, 400)),
      await actions.calls.setActiveScene({ call: this.call.id, scene: s.id });
    this._switchingScenes = false;
  }

  async startStream(stage: HTMLElement) {
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

    this.connections.forEach((connection) => {
      if (!connection.remoteState.stream) return;
      const stream = connection.remoteState.stream;
      const audioStream = new MediaStream([...stream.getAudioTracks()]);
      const node = ac.createMediaStreamSource(audioStream);
      node.connect(dest);
    });

    if (!screen || !this.localStreamState.stream) {
      this._loading = false;
      toast.error("Screen or local audio was not available to stream");
      return;
    }

    const stream = new MediaStream([
      ...screen.getVideoTracks(),
      ...this.localStreamState.stream?.getAudioTracks(),
      ...dest.stream.getAudioTracks(),
    ]);

    try {
      // @ts-ignore
      const cropTarget = await CropTarget.fromElement(stage).catch(
        (_: Error) => null
      );
      const [video] = stream.getVideoTracks();

      // @ts-ignore
      if (cropTarget) video.cropTo(cropTarget);
    } catch (err) {
      console.error(err);
      this._loading = false;
      return toast.error("Unable to crop video. See console for more details.");
    }

    this.recorder = new MediaRecorder(stream, {
      mimeType: "video/mp4; codecs=avc3",
      audioBitsPerSecond: 128000,
      videoBitsPerSecond: 6000000,
    });

    this.recorder.addEventListener("dataavailable", async (e) => {
      const buffer = await e.data.arrayBuffer();
      if (ws.OPEN) {
        try {
          ws.send(buffer);
        } catch (_) {}
      }
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
    console.log("end!");
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

  async disconnect() {
    await actions.connections.disconnect({
      call: this.call.id,
      member: this.user.id,
    });
  }
}
