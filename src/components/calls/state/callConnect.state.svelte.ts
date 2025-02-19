import { toast } from "svelte-sonner";
import { actions } from "astro:actions";
import client from "$/lib/pocketbase/client";
import PeerConnection from "./peer.state.svelte";
import type { Call, Scene } from "$/actions/calls";
import type { CurrentUser } from "$/lib/pocketbase/client";

export default class CallState {
  protected _localStream: MediaStream | null = $state(null);
  protected _connections: PeerConnection[] = $state([]);
  protected _switchingScenes: boolean = $state(false);
  protected _activeScene: Scene | null = $state(null);
  protected _call: Call | null = $state(null);
  protected _loading: boolean = $state(true);
  protected currentUser: CurrentUser;

  constructor(m: CurrentUser) {
    this.currentUser = m;
  }

  get remoteStreams() {
    return this._connections.map((c) => ({
      id: c.peerId,
      stream: c.remoteStream,
    }));
  }

  get activeScene() {
    return this._activeScene;
  }

  get scenes() {
    return this._call?.expand?.scenes || [];
  }

  get hosting() {
    return this._call?.host === this.currentUser.id;
  }

  get switchingScenes() {
    return this._switchingScenes;
  }

  async setActiveScene(s: Scene) {
    if (!this._call) return toast.error("Unable to set scene with no call");
    this._switchingScenes = true;
    await new Promise((r) => setTimeout(r, 400)),
    await actions.calls.setActiveScene({ call: this._call.id, scene: s.id });
    this._switchingScenes = false;
  }

  get callMembers() {
    if (!this._call) return [];

    const members = [];
    if (this._call.expand?.host) members.push(this._call.expand.host);
    if (this._call.expand?.guests) members.push(...this._call.expand.guests);

    return members;
  }

  protected async refreshFromCallId(callId: string, stream: MediaStream) {
    this._loading = true;
    this._localStream = stream;

    const { data, error } = await actions.calls.getById(callId);

    if (error) {
      console.error(error.message);
      return toast.error("Unable to set call. Check console for more.");
    }
    this._loading = false;
    this._call = data;

    if (
      this._call.host !== this.currentUser.id &&
      !this._call.guests.includes(this.currentUser.id)
    ) {
      return toast.error("Unable to join call.  Not a host or guest");
    }

    const peers = [this._call.host, ...this._call.guests].filter(
      (m) => m !== this.currentUser.id
    );

    this._activeScene = this._call.expand?.scenes.at(-1) ?? null;

    peers.forEach(async (peer) => {
      const connection = new PeerConnection(
        peer,
        this._call!.id,
        this.currentUser.id,
        stream
      );
      await connection.connect();
      this._connections.push(connection);
    });

    client.collection("calls").subscribe<Call>(
      this._call.id,
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

    const scene = this._call.expand?.activeScene || this.scenes.at(-1);
    if (scene) this._activeScene = scene;
  }

  async init(callId: string, stream: MediaStream) {
    await this.refreshFromCallId(callId, stream);
  }

  async disconnect() {
    if (!this._call || !this.currentUser.id) return;
    await actions.connections.disconnect({
      call: this._call.id,
      member: this.currentUser.id,
    });
  }
}
