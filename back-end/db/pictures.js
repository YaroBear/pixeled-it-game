import sql from "./db.js";

async function createPicture(sessionId, path) {
  const picture = await sql`
        insert into original_picture (session_id, path)
        values (${sessionId}, ${path})
        returning id
    `;
  return picture[0].id;
}

async function getPicturesBySessionId(sessionId) {
  const pictures = await sql`
        select * from original_picture
        where session_id = ${sessionId}
    `;
  return pictures;
}

export { createPicture, getPicturesBySessionId };
