import WebSocket, { WebSocketServer } from "ws";
import {
  checkValidSessionToken,
  startSession,
  endSession,
  getSession,
  getUserNamesInSession,
  assignUsersRandomPictures,
  getPictureUrlByUserSessionId,
} from "./db/sessions.js";

const wss = new WebSocketServer({
  noServer: true,
});

const sessionClients = new Map();

const startGame = "startGame";
const endGame = "endGame";
const joinSession = "joinSession";
const joinGame = "joinGame";

function onSocketError(err) {
  console.error(err);
}

function emitAllClients(sessionId, message) {
  const clients = sessionClients.get(sessionId) || [];
  clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify(message));
    }
  });
}

function emitSingleClient(ws, message) {
  if (ws.readyState === WebSocket.OPEN) {
    ws.send(JSON.stringify(message));
  }
}

async function startTimer(sessionId, end_time) {
  const endTime = new Date(end_time);
  const currentDateUtc = new Date(new Date().toUTCString());
  const timerDuration = endTime.getTime() - currentDateUtc.getTime();

  setTimeout(async () => {
    emitAllClients(sessionId, { type: endGame, sessionId });
    await endSession(sessionId);
  }, timerDuration);
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
    // const sessionId = request.url.split("/")[2];
    // ws.on("close", async () => {
    //   const clients = sessionClients.get(sessionId);
    //   const index = clients.indexOf(ws);
    //   if (index > -1) {
    //     clients.splice(index, 1);
    //   }
    //   const users = await getUsersInSession(sessionId);
    //   emitAllClients(sessionId, { type: joinSession, sessionId, users });
    // });

    ws.on("message", async (message) => {
      const { type, sessionId, userSessionId } = JSON.parse(message);

      if (type === joinSession) {
        if (!sessionClients.has(sessionId)) {
          sessionClients.set(sessionId, []);
        }
        sessionClients.get(sessionId).push(ws);
        const users = await getUserNamesInSession(sessionId);
        await emitAllClients(sessionId, {
          type: joinSession,
          sessionId,
          users,
        });
      }
      if (type === startGame) {
        await assignUsersRandomPictures(sessionId);
        const endTime = await startSession(sessionId);
        emitAllClients(sessionId, { type: startGame, endTime, sessionId });
        startTimer(sessionId, endTime);
      }
      if (type === joinGame) {
        const session = await getSession(sessionId);
        const assignedPictureUrl = await getPictureUrlByUserSessionId(
          userSessionId
        );
        if (session.started) {
          const endTime = session.end_time;
          emitSingleClient(ws, {
            type: joinGame,
            endTime,
            sessionId,
            pictureUrl: assignedPictureUrl,
          });
        }
      }
    });
  });
}

export { upgradeServer };
