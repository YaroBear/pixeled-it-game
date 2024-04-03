import sql from "./db.js";

async function createSession(password, timeLimit) {
  const session = await sql`
                insert into session (password, time_limit)
                values (${password}, ${timeLimit})
                returning id
        `;
  return session[0].id;
}

async function getSession(id) {
  const session = await sql`
            select * from session
            where id = ${id}
        `;
  return session[0];
}

async function joinSession(name, sessionId, token) {
  const userSession = await sql`
        insert into user_session (name, session_id, token)
        values (${name}, ${sessionId}, ${token})
        on conflict on constraint unique_name_session_id
        do update set token = ${token}
        returning id
    `;
  return userSession[0].id;
}

async function startSession(sessionId) {
  const session = await getSession(sessionId);

  if (!session.started) {
    const timeLimitMinutes = session.time_limit;

    const updatedSession = await sql`
          update session
          set started = true, end_time = now() + ${timeLimitMinutes} * interval '1 minute'
          where id = ${sessionId}
          returning end_time
      `;
    return updatedSession[0].end_time;
  }
  return session.end_time;
}

async function endSession(sessionId) {
  await sql`
        update session
        set ended = true
        where id = ${sessionId}
    `;
}

async function checkValidSessionToken(sessionId, token) {
  const exists = await sql`
        select 1 from user_session
        where session_id = ${sessionId} and token = ${token}
    `;
  return exists.length > 0;
}

async function getUserNamesInSession(sessionId) {
  const users = await sql`
        select name from user_session
        where session_id = ${sessionId}
    `;
  return users;
}

async function getUsersInSession(sessionId) {
  const users = await sql`
        select * from user_session
        where session_id = ${sessionId}
    `;
  return users;
}

async function getPicturesBySessionId(sessionId) {
  const pictures = await sql`
        select * from original_picture
        where session_id = ${sessionId}
    `;
  return pictures;
}

async function assignUsersRandomPictures(sessionId) {
  const users = await getUsersInSession(sessionId);
  const pictures = await getPicturesBySessionId(sessionId);

  const numUsers = users.length;
  const numPictures = pictures.length;
  const picturesPerUser = Math.floor(numPictures / numUsers);

  users.forEach(async (user, index) => {
    const startIndex = index * picturesPerUser;
    const endIndex = startIndex + picturesPerUser;
    const assignedPictures = pictures.slice(startIndex, endIndex);

    assignedPictures.forEach(async (picture) => {
      await sql`
        insert into user_session_picture_assignment (user_session_id, picture_id)
        values (${user.id}, ${picture.id})
      `;
    });
  });
}

async function getPictureUrlByUserSessionId(userSessionId) {
  const picture = await sql`
      select op.path
      from user_session us
      join user_session_picture_assignment uspa
          on uspa.user_session_id = us.id
      join original_picture op
          on op.id = uspa.picture_id
      where us.id = ${userSessionId}
    `;
  return picture[0].path;
}

export {
  createSession,
  getSession,
  joinSession,
  getUserNamesInSession,
  checkValidSessionToken,
  startSession,
  endSession,
  assignUsersRandomPictures,
  getPictureUrlByUserSessionId,
};
