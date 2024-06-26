import { createSession, getSession, joinSession } from "./db/sessions.js";
import { createPicture, getPicturesBySessionId } from "./db/pictures.js";

import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import cors from "cors";
import upload from "./services/file-storage.js";
import { upgradeServer } from "./ws-server.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

app.use(cors());
app.use(express.json());
app.use("/img", express.static(path.join(__dirname, "img")));

const server = app.listen(3000, () => {
  console.log("Server is running on port 3000");
});

upgradeServer(server);

app.post("/session", async (req, res) => {
  const { password, timeLimit } = req.body;

  const session = await createSession(password, timeLimit);

  res.json(session);
});

app.post("/session/:id/authenticate", async (req, res) => {
  const { id } = req.params;
  const { name, password } = req.body;

  const session = await getSession(id);
  if (session.password !== password) {
    return res.status(401).json({ error: "Invalid password" });
  }

  const randomToken = Math.random().toString(36).slice(2);
  const userSessionId = await joinSession(name, id, randomToken);

  res.json({ token: randomToken, userSessionId: userSessionId });
});

app.post(
  "/session/:id/pictures",
  upload.array("pictures"),
  async (req, res) => {
    const { id } = req.params;
    const { password } = req.body;

    const session = await getSession(id);
    if (session.password !== password) {
      return res.status(401).json({ error: "Invalid password" });
    }

    const files = req.files;

    const pictures = await Promise.all(
      files.map(async (file) => {
        const { path } = file;
        const picture = await createPicture(id, path);
        return picture;
      })
    );

    res.json(pictures);
  }
);

app.get("/session/:id/pictures", async (req, res) => {
  const { id } = req.params;
  const { password } = req.body;

  const session = await getSession(id);
  if (session.password !== password) {
    return res.status(401).json({ error: "Invalid password" });
  }

  const pictures = await getPicturesBySessionId(id);

  res.json(pictures);
});

export default server;
