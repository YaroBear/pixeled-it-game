import WebSocket, { WebSocketServer } from "ws";
import { getUsersInSession, checkValidSessionToken } from "./db/sessions.js";

const wss = new WebSocketServer({
  noServer: true,
});

const sessionClients = new Map();

function onSocketError(err) {
  console.error(err);
}

async function authenticate(request, callback) {
  // /session/:id/join/:token
  const sessionId = request.url.split("/")[2];
  const token = request.url.split("/")[4];

  const isValid = await checkValidSessionToken(sessionId, token);

  if (isValid) {
    callback(null);
  } else {
    callback(new Error("Invalid session/token"));
  }
}

function upgradeServer(server) {
  server.on("upgrade", function upgrade(request, socket, head) {
    socket.on("error", onSocketError);
    authenticate(request, function next(err) {
      if (err) {
        socket.write("HTTP/1.1 401 Unauthorized\r\n\r\n");
        socket.destroy();
        return;
      }

      socket.removeListener("error", onSocketError);

      wss.handleUpgrade(request, socket, head, function done(ws) {
        wss.emit("connection", ws, request);
      });
    });
  });

  wss.on("connection", (ws, request) => {
    ws.on("message", async (message) => {
      const { type, sessionId } = JSON.parse(message);

      if (type === "joinSession") {
        if (!sessionClients.has(sessionId)) {
          sessionClients.set(sessionId, []);
        }
        sessionClients.get(sessionId).push(ws);
      }
      if (type === "updateUsers") {
        const users = await getUsersInSession(sessionId);
        ws.send(JSON.stringify({ type: "updateUsers", users }));
      }
    });
  });
}

async function updateUsers(sessionId) {
  const users = await getUsersInSession(sessionId);
  const clients = sessionClients.get(sessionId) || [];
  clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify({ type: "updateUsers", users }));
    }
  });
}

export { upgradeServer, updateUsers, wss };
