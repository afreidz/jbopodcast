import client from "$/lib/prisma";
import { actions } from "astro:actions";
import type { Connection } from "$/actions/connection";

export const MIN_VIDEO_BITRATE = 2000;
export const MAX_VIDEO_BITRATE = 10000;
export const START_VIDEO_BITRATE = 6000;
export const cache = new Set<ConnectionManager>();


const connectionStream = await client.connection.stream();

for await (let event of connectionStream) {
  console.log(event);
}

// supabase
//   .channel("schema-db-changes")
//   .on(
//     "postgres_changes",
//     {
//       event: "*",
//       schema: "public",
//       table: "connection",
//     },
//     async (payload: RealtimePostgresChangesPayload<Connection>) => {
//       if (payload.eventType === "UPDATE") {
//         const connection = cache
//           .values()
//           .find(
//             (c) =>
//               c.callId === payload.new.callId &&
//               payload.new.toId === c.peerId &&
//               payload.new.fromId === c.myId
//           );

//         if (connection && payload.new.answer) {
//           console.log("Peer answered", payload.new.answer);
//           await connection.setAnswer(
//             payload.new.answer as unknown as RTCSessionDescription
//           );
//         }
//       } else if (payload.eventType === "DELETE") {
//         const connection = cache
//           .values()
//           .find(
//             (c) =>
//               c.callId === payload.old.callId &&
//               payload.old.toId === c.peerId &&
//               payload.old.fromId === c.myId
//           );
//         if (connection) {
//           console.log("Peer disconnected. Trying to reconnect.");
//           await connection.createOffer();
//         }
//       } else if (payload.eventType === "INSERT") {
//         const connection = cache
//           .values()
//           .find(
//             (c) =>
//               c.callId === payload.new.callId &&
//               payload.new.fromId === c.peerId &&
//               payload.new.toId === c.myId
//           );
//         if (connection) {
//           console.log("Peer requested a connection");
//           await connection.answerOffer(payload.new);
//         }
//       }
//     }
//   )
//   .subscribe();

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

    this.myStream.getTracks().forEach((t) => {
      this.rtc.addTrack(t, this.myStream);
    });

    this.rtc.addEventListener("icecandidate", (c) => {
      if (c.candidate) this.ice.push(c.candidate);
    });

    this.rtc.addEventListener("track", ({ streams }) => {
      if (streams[0]) {
        console.log("Tracks received", streams[0]);
        this.stream = streams[0];
      }
    });

    cache.add(this);
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

    // if (answer.sdp) {
    //   const items = answer.sdp.split("\r\n");

    //   items.forEach((str, i) => {
    //     if (/^a=fmtp:\\d*/.test(str)) {
    //       items[i] =
    //         str +
    //         `;x-google-max-bitrate=${MAX_VIDEO_BITRATE};x-google-min-bitrate=${MIN_VIDEO_BITRATE};`;
    //     } else if (/^a=mid:(1|video)/.test(str)) {
    //       items[i] += `\r\nb=AS:${MAX_VIDEO_BITRATE}`;
    //     }
    //   });
    //   finalAnswer = new RTCSessionDescription({
    //     type: "answer",
    //     sdp: items.join("\r\n"),
    //   });
    // }

    await this.rtc.setLocalDescription(finalAnswer);
    await actions.connections.updateConnection({
      answer,
      id: connection.id,
    });
  }

  async setAnswer(a: RTCSessionDescription) {
    await this.rtc.setRemoteDescription(a);
  }

  async disconnect() {
    await actions.connections.disconnect({
      call: this.callId,
      member: this.myId,
    });
  }
}
