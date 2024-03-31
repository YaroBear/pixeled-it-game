import WebSocket, { WebSocketServer } from "ws";
import { joinSession, getUsersInSession, getSession } from "./db/sessions.js";

const wss = new WebSocketServer({
  port: 8080,
});

wss.on("connection", (ws) => {
  ws.on("message", async (message) => {
    const { type, name, sessionId, password } = JSON.parse(message);

    if (type === "joinSession") {
      const session = await getSession(sessionId);
      if (session.password !== password) {
        return ws.send(
          JSON.stringify({ type: "error", message: "Invalid password" })
        );
      }
      await joinSession(name, sessionId);

      const users = await getUsersInSession(sessionId);

      wss.clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
          client.send(JSON.stringify({ type: "updateUsers", users }));
        }
      });
    }
  });
});

export default wss;
