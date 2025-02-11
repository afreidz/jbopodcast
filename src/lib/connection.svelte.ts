import supabase from "$/lib/supabase";
import { actions } from "astro:actions";
import type { Database } from "$/lib/types/supabase";
import type { RealtimePostgresChangesPayload } from "@supabase/supabase-js";

export const IDEAL_BITRATE = 96000;
export const MIN_BITRATE = 41000;

type Connection = Database["public"]["Tables"]["connection"]["Row"];

export default class ConnectionManager {
  public stream: MediaStream | null = $state(null);
  protected ice: RTCIceCandidate[] = [];
  protected rtc: RTCPeerConnection;
  protected myStream: MediaStream;
  public callId: string;
  public peerId: string;
  public myId: string;

  constructor(
    peerId: string,
    callId: string,
    myId: string,
    myStream: MediaStream
  ) {
    this.rtc = new RTCPeerConnection();
    this.myStream = myStream;
    this.peerId = peerId;
    this.callId = callId;
    this.myId = myId;

    this.myStream
      .getTracks()
      .forEach((t) => this.rtc.addTrack(t, this.myStream));

    this.rtc.addEventListener("icecandidate", (c) => {
      if (c.candidate) this.ice.push(c.candidate);
    });

    this.rtc.addEventListener("track", ({ streams, track }) => {
      if (streams[0]) {
        console.log("Tracks received", streams[0]);
        this.stream = streams[0];
      }
    });

    supabase
      .channel("schema-db-changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "connection",
        },
        (payload: RealtimePostgresChangesPayload<Connection>) => {
          if (
            payload.eventType === "UPDATE" &&
            payload.new.callId === this.callId &&
            payload.new.toId === this.peerId &&
            payload.new.fromId === this.myId &&
            payload.new.answer
          ) {
            console.log("Peer answered", payload.new.answer);
            this.rtc.setRemoteDescription(
              payload.new.answer as unknown as RTCSessionDescription
            );
          } else if (
            payload.eventType === "DELETE" &&
            payload.old.callId === this.callId &&
            payload.old.toId === this.peerId &&
            payload.old.fromId === this.myId
          ) {
            console.log("Peer disconnected. Trying to reconnect.");
            this.createOffer();
          } else if (
            payload.eventType === "INSERT" &&
            payload.new.callId === this.callId &&
            payload.new.fromId === this.peerId &&
            payload.new.toId === this.myId &&
            payload.new.offer
          ) {
            console.log("Peer requested a connection");
            this.answerOffer(payload.new);
          }
        }
      )
      .subscribe();
  }

  async createOffer() {
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

    return await actions.connections.offerToPeer({
      offer,
      ice: this.ice,
      from: this.myId,
      to: this.peerId,
      call: this.callId,
    });
  }

  async answerOffer(connection: Connection) {
    if (!connection.offer) throw new Error("No offer to answer");

    await this.rtc.setRemoteDescription(
      connection.offer as unknown as RTCSessionDescriptionInit
    );

    const candidates = connection.ice as unknown as RTCIceCandidate[];
    await Promise.all(candidates.map((c) => this.rtc.addIceCandidate(c)));

    const answer = await this.rtc.createAnswer();
    let finalAnswer = answer;

    if (answer.sdp) {
      const items = answer.sdp.split("\r\n");

      items.forEach((str, i) => {
        if (/^a=fmtp:\\d*/.test(str)) {
          items[i] =
            str +
            `;x-google-max-bitrate=${IDEAL_BITRATE};x-google-min-bitrate=${MIN_BITRATE}`;
        }
      });
      finalAnswer = new RTCSessionDescription({
        type: "answer",
        sdp: items.join("\r\n"),
      });
    }

    await this.rtc.setLocalDescription(finalAnswer);
    await actions.connections.updateConnection({
      answer,
      id: connection.id,
    });
  }

  async disconnect() {
    await actions.connections.disconnect({
      call: this.callId,
      member: this.myId,
    });
  }
}
