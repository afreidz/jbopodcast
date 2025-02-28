import WebSocket, { WebSocketServer } from "ws";

type ClientMap = Map<string, WebSocket>;
type MessageData = {
  type: "register" | "offer" | "answer" | "candidate";
  id?: string;
  target?: string;
  payload?: any;
  token?: string;
};

const wss = new WebSocketServer(
  { port: Number(process.env.SIGNALING_PORT || 3000) },
  () => {
    const address = wss.address() as WebSocket.AddressInfo;
    console.log(`Listening at ${address.address}:${address.port}`);
  }
);
const clients: ClientMap = new Map();
const VALID_API_TOKEN = process.env.SIGNALING_KEY;

wss.on("connection", (ws: WebSocket) => {
  ws.on("message", (message: string) => {
    try {
      const data: MessageData = JSON.parse(message);

      if (!data.token || !VALID_API_TOKEN || data.token !== VALID_API_TOKEN) {
        ws.send(
          JSON.stringify({ type: "error", message: "Invalid API token" })
        );
        return;
      }

      switch (data.type) {
        case "register":
          if (data.id) {
            clients.set(data.id, ws);
            ws.send(JSON.stringify({ type: "registered", id: data.id }));
          }
          break;
        case "offer":
        case "answer":
        case "candidate":
          if (data.target) {
            const recipient = clients.get(data.target);
            if (recipient) {
              recipient.send(
                JSON.stringify({
                  type: data.type,
                  sender: data.id,
                  target: data.target,
                  payload: data.payload,
                })
              );
            }
          }
          break;
        default:
          console.log("Unknown message type:", data.type);
      }
    } catch (error) {
      console.error("Error processing message:", error);
    }
  });

  ws.on("close", () => {
    for (let [id, client] of clients.entries()) {
      if (client === ws) {
        clients.delete(id);
        break;
      }
    }
  });
});
