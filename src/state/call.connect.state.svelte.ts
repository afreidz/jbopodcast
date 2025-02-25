import { actions } from "astro:actions";
import client from "$/lib/pocketbase/client";
import type { Call, Scene } from "$/actions/calls";
import PeerConnection from "$/state/peer.state.svelte";
import type LocalStreamState from "$/state/local.stream.state.svelte";
import { getCurrentUser, type CurrentUser } from "$/lib/pocketbase/client";

export default class CallState {
  public call: Call;
  public localStreamState: LocalStreamState;

  protected user: CurrentUser;

  protected _connections: PeerConnection[] = $state([]);
  protected _switchingScenes: boolean = $state(false);
  protected _activeScene: Scene | null = $state(null);
  protected _videoId: string | null = $state(null);
  protected _call: Call | null = $state(null);
  protected _loading: boolean = $state(true);
  protected _ready: boolean = $state(false);
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

      await pc.connect();
      this.addConnection(pc);
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

  get ready() {
    return this._ready;
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

  addConnection(c: PeerConnection) {
    const updated = this._connections.filter((e) => e.peer.id !== c.peer.id);
    this._connections = [...updated, c];
  }

  async setActiveScene(s: Scene) {
    this._switchingScenes = true;
    await new Promise((r) => setTimeout(r, 400)),
      await actions.calls.setActiveScene({ call: this.call.id, scene: s.id });
    this._switchingScenes = false;
  }

  async disconnect() {
    await actions.connections.disconnect({
      call: this.call.id,
      member: this.user.id,
    });
  }
}
