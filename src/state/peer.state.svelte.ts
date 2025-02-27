import { actions } from "astro:actions";
import client from "$/lib/pocketbase/client";
import type { Member } from "$/actions/members";
import type { Connection } from "$/actions/connection";
import RemoteStreamState from "$/state/remote.stream.state.svelte";
import type LocalStreamState from "$/state/local.stream.state.svelte";

const cfg = {
  iceServers: [
    {
      urls: [
        "stun:stun.l.google.com:19302",
        "stun:stun.l.google.com:5349",
        "stun:stun.l.google.com:3478",
        "stun:stun.l.google.com:5349",
        "stun:stun.l.google.com:19302",
        "stun:stun.l.google.com:5349",
        "stun:stun.l.google.com:3478",
        "stun:stun.l.google.com:5349",
        "stun:stun.l.google.com:19302",
        "stun:stun.l.google.com:5349",
      ],
    },
  ],
};

export default class PeerConnection {
  protected rtc: RTCPeerConnection;
  protected localStreamState: LocalStreamState;
  protected type: "offered" | "answered" | null = null;
  protected connectionRecord: Connection | undefined = undefined;

  public peer: Member;
  public callId: string;
  public userId: string;
  public remoteState: RemoteStreamState;

  protected _ice: RTCIceCandidate[] = $state([]);
  protected _ready: boolean = $derived(this._ice.length > 0);

  constructor(
    peer: Member,
    callId: string,
    userId: string,
    localStreamState: LocalStreamState
  ) {
    this.peer = peer;
    this.callId = callId;
    this.userId = userId;
    this.rtc = new RTCPeerConnection(cfg);
    this.localStreamState = localStreamState;
    this.remoteState = new RemoteStreamState(this.peer);

    this.localStreamState.stream!.getTracks().forEach((t) => {
      this.rtc.addTrack(t, this.localStreamState.stream!);
    });

    this.rtc.addEventListener("icecandidate", async (c) => {
      if (!c.candidate) return;
      this._ice.push(c.candidate);
      if (!this.connectionRecord) return;
      const existing =
        this.type === "offered"
          ? ((this.connectionRecord.from_ice_candidates as RTCIceCandidate[]) ??
            [])
          : this.type === "answered"
            ? ((this.connectionRecord.to_ice_candidates as RTCIceCandidate[]) ??
              [])
            : [];
      const updated = [...existing, c.candidate];
      if (this.type === "offered") {
        await actions.connections.updateConnection({
          fromIce: updated,
          id: this.connectionRecord.id,
        });
      } else if (this.type === "answered") {
        await actions.connections.updateConnection({
          toIce: updated,
          id: this.connectionRecord.id,
        });
      }
    });

    this.rtc.addEventListener("track", ({ streams }) => {
      if (streams[0]) {
        this.remoteState.connectStream(streams[0]);
      }
    });

    this.rtc.addEventListener("icegatheringstatechange", async () => {
      if (this.rtc.iceGatheringState === "complete") {
        if (this.type === null || !this.connectionRecord) return;
        if (this.type === "offered") {
          await actions.connections.updateConnection({
            id: this.connectionRecord.id,
            fromIce: this._ice,
          });
        } else if (this.type === "answered") {
          await actions.connections.updateConnection({
            id: this.connectionRecord.id,
            toIce: this._ice,
          });
        }
      }
    });

    if (!import.meta.env.SSR)
      client.collection("connections").subscribe("*", async (e) => {
        if (
          e.action === "update" &&
          e.record.call === this.callId &&
          e.record.from === this.peer.id &&
          e.record.to === this.userId
        ) {
          // Remote Initiated Peer Update
          if (e.record.from_ice_candidates) {
            console.log("Adding remote ice candidates");
            const candidates = e.record
              .from_ice_candidates as RTCIceCandidate[];
            await Promise.all(
              candidates.map((c) => this.rtc.addIceCandidate(c))
            );
          }

          if (e.record.offer && !e.record.answer) {
            console.log("Answering remote offer");
            await this.answerOffer(e.record);
          }
        } else if (
          e.action === "update" &&
          e.record.call === this.callId &&
          e.record.to === this.peer.id &&
          e.record.from === this.userId
        ) {
          // Self Initiated Peer Update
          if (e.record.to_ice_candidates) {
            console.log("Adding remote ice candidates");
            const candidates = e.record.to_ice_candidates as RTCIceCandidate[];
            await Promise.all(
              candidates.map((c) => this.rtc.addIceCandidate(c))
            );
          }

          if (e.record.answer) {
            console.log("Setting answer from remote");
            await this.setAnswer(e.record.answer as RTCSessionDescription);
          }
        } else if (
          e.action === "create" &&
          e.record.call === this.callId &&
          e.record.to === this.userId &&
          e.record.from === this.peer.id
        ) {
          if (e.record.from_ice_candidates) {
            console.log("Adding new remote ice candidates");
            const candidates = e.record
              .from_ice_candidates as RTCIceCandidate[];
            await Promise.all(
              candidates.map((c) => this.rtc.addIceCandidate(c))
            );
          }

          if (e.record.offer) {
            console.log("Answering new peer offer");
            await this.answerOffer(e.record);
          }
        }
      });
  }

  get ready() {
    return this._ready;
  }

  public async connect() {
    const request = (
      await actions.connections.find({
        to: this.userId,
        call: this.callId,
        from: this.peer.id,
      })
    ).data;

    if (request) console.log("Existing request found");
    if (!request) console.log("No request found. Creating offer");

    return request ? await this.answerOffer(request) : await this.createOffer();
  }

  protected async createOffer() {
    console.log("Creating offer to", this.peer.id);
    this.type = "offered";

    const offer = await this.rtc
      .createOffer({
        offerToReceiveAudio: true,
        offerToReceiveVideo: true,
      })
      .catch((err) => {
        console.error(err);
        return null;
      });

    if (offer) await this.rtc.setLocalDescription(offer);

    this.connectionRecord = (
      await actions.connections.offerToPeer({
        offer,
        to: this.peer.id,
        from: this.userId,
        call: this.callId,
      })
    ).data;
  }

  protected async answerOffer(connection: Connection) {
    if (!connection.offer) throw new Error("No offer to answer");
    console.log("Answering peer offer");
    this.type = "answered";
    this.connectionRecord = connection;

    await this.rtc.setRemoteDescription(
      connection.offer as RTCSessionDescriptionInit
    );

    if (connection.from_ice_candidates) {
      await Promise.all(
        (connection.from_ice_candidates as RTCIceCandidate[]).map((c) =>
          this.rtc.addIceCandidate(c)
        )
      );
    }

    const answer = await this.rtc.createAnswer();
    await this.rtc.setLocalDescription(answer);

    await actions.connections.updateConnection({
      answer,
      toIce: this._ice,
      id: connection.id,
    });
  }

  protected async setAnswer(a: RTCSessionDescription) {
    await this.rtc.setRemoteDescription(a);
  }

  async disconnect() {
    await actions.connections.disconnect({
      call: this.callId,
      member: this.userId,
    });
  }
}
