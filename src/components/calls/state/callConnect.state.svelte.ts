import { toast } from "svelte-sonner";
import { actions } from "astro:actions";
import PeerConnection from "./peer.state.svelte";
import type { Call, Scene } from "$/actions/calls";
import type { CurrentUser } from "$/actions/members";

export default class CallState {
  protected _localStream: MediaStream | null = $state(null);
  protected _connections: PeerConnection[] = $state([]);
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

  set activeScene(s: Scene | null) {
    this._activeScene = s;
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
