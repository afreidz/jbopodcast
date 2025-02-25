import { actions } from "astro:actions";
import client from "$/lib/pocketbase/client";
import type { Member } from "$/actions/members";
import type { Connection } from "$/actions/connection";
import RemoteStreamState from "$/state/remote.stream.state.svelte";
import type LocalStreamState from "$/state/local.stream.state.svelte";

export default class PeerConnection {
  protected rtc: RTCPeerConnection;
  protected ice: RTCIceCandidate[] = [];
  public remoteState: RemoteStreamState;
  protected localStreamState: LocalStreamState;

  public peer: Member;
  public callId: string;
  public userId: string;

  constructor(
    peer: Member,
    callId: string,
    userId: string,
    localStreamState: LocalStreamState
  ) {
    this.peer = peer;
    this.callId = callId;
    this.userId = userId;
    this.rtc = new RTCPeerConnection();
    this.localStreamState = localStreamState;
    this.remoteState = new RemoteStreamState(this.peer);

    this.localStreamState.stream!.getTracks().forEach((t) => {
      this.rtc.addTrack(t, this.localStreamState.stream!);
    });

    this.rtc.addEventListener("icecandidate", (c) => {
      if (c.candidate) this.ice.push(c.candidate);
    });

    this.rtc.addEventListener("track", ({ streams }) => {
      if (streams[0]) {
        this.remoteState.connectStream(streams[0]);
      }
    });

    client.collection("connections").subscribe("*", async (e) => {
      if (
        e.action === "update" &&
        e.record.call === this.callId &&
        e.record.from === this.peer.id &&
        e.record.to === this.userId &&
        e.record.offer &&
        !e.record.answer
      ) {
        console.log("Peer made an offer. Answering offer.");
        await this.answerOffer(e.record);
      } else if (
        e.action === "update" &&
        e.record.call === this.callId &&
        e.record.to === this.peer.id &&
        e.record.from === this.userId &&
        e.record.answer
      ) {
        console.log("Peer answered offer. Establishing Connection.");
        await this.setAnswer(e.record.answer as RTCSessionDescription);
      } else if (
        e.action === "create" &&
        e.record.call === this.callId &&
        e.record.to === this.userId &&
        e.record.from === this.peer.id &&
        e.record.offer
      ) {
        console.log("Peer made a new offer. Answering new offer.");
        await this.answerOffer(e.record);
      }
    });
  }

  public async connect() {
    const request = (
      await actions.connections.find({
        to: this.userId,
        call: this.callId,
        from: this.peer.id,
      })
    ).data;

    console.log("Existing from", this.peer.name, "To", this.userId, !!request);

    return request ? await this.answerOffer(request) : await this.createOffer();
  }

  protected async createOffer() {
    const offer = await this.rtc.createOffer({
      offerToReceiveAudio: true,
      offerToReceiveVideo: true,
    });
    await this.rtc.setLocalDescription(offer);

    this.rtc.restartIce();
    await new Promise((r) => {
      this.rtc.addEventListener("icegatheringstatechange", () => {
        if (this.rtc.iceGatheringState === "complete") r(true);
      });
    });

    await actions.connections.offerToPeer({
      offer,
      ice: this.ice,
      to: this.peer.id,
      from: this.userId,
      call: this.callId,
    });
  }

  protected async answerOffer(connection: Connection) {
    if (!connection.offer) throw new Error("No offer to answer");

    await this.rtc.setRemoteDescription(
      connection.offer as RTCSessionDescriptionInit
    );

    const candidates = connection.ice as RTCIceCandidate[];
    await Promise.all(candidates.map((c) => this.rtc.addIceCandidate(c)));

    const answer = await this.rtc.createAnswer();
    await this.rtc.setLocalDescription(answer);

    await actions.connections.updateConnection({
      answer,
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
