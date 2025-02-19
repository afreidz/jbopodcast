import client from '$/lib/pocketbase';
import { actions } from "astro:actions";
import type { Connection } from "$/actions/connection";

export const MIN_VIDEO_BITRATE = 2000;
export const MAX_VIDEO_BITRATE = 10000;
export const START_VIDEO_BITRATE = 6000;

export default class PeerConnection {
  protected ice: RTCIceCandidate[] = [];
  protected localStream: MediaStream;
  protected rtc: RTCPeerConnection;

  public remoteStream: MediaStream | null = $state(null);
  public callId: string;
  public peerId: string;
  public userId: string;

  constructor(
    peerId: string,
    callId: string,
    userId: string,
    stream: MediaStream
  ) {
    this.rtc = new RTCPeerConnection();
    this.localStream = stream;
    this.peerId = peerId;
    this.callId = callId;
    this.userId = userId;

    this.localStream.getTracks().forEach((t) => {
      this.rtc.addTrack(t, this.localStream);
    });

    this.rtc.addEventListener("icecandidate", (c) => {
      if (c.candidate) this.ice.push(c.candidate);
    });

    this.rtc.addEventListener("track", ({ streams }) => {
      if (streams[0]) {
        console.log("Stream received", streams[0]);
        this.remoteStream = streams[0];
      }
    });
  }

  public async connect() {
    const request = (await actions.connections.find({
      to: this.userId,
      from: this.peerId,
      call: this.callId,
    })).data;

    if (request) {
      client.collection("connections").subscribe(request.id, () => {

      })
      await this.answerOffer(request);
    }

    return await this.createOffer();

  }

  protected async createOffer() {
    const offer = await this.rtc.createOffer({
      offerToReceiveAudio: true,
      offerToReceiveVideo: true,
    });
    await this.rtc.setLocalDescription(offer);

    await new Promise((r) => {
      this.rtc.addEventListener("icegatheringstatechange", () => {
        if (this.rtc.iceGatheringState === "complete") r(true);
      });
    });

    const response = await actions.connections.offerToPeer({
      offer,
      ice: this.ice,
      to: this.peerId,
      from: this.userId,
      call: this.callId,
    });

    if (response.data) {
      client.collection("connections").subscribe(response.data.id, async ({ record, action }) => {
        console.log(action)
        if (record.answer) await this.setAnswer(record.answer as RTCSessionDescription)
      })
    }

  }

  protected async answerOffer(connection: Connection) {
    if (!connection.offer) throw new Error("No offer to answer");

    await this.rtc.setRemoteDescription(
      connection.offer as RTCSessionDescriptionInit
    );

    const candidates = connection.ice as RTCIceCandidate[];
    await Promise.all(candidates.map((c) => this.rtc.addIceCandidate(c)));

    const answer = await this.rtc.createAnswer();
    let finalAnswer = answer;

    await this.rtc.setLocalDescription(finalAnswer);
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
