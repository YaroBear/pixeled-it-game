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
  await sql`
        insert into user_session (name, session_id, token)
        values (${name}, ${sessionId}, ${token})
        on conflict on constraint unique_name_session_id
        do update set token = ${token}
    `;
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

async function getUsersInSession(sessionId) {
  const users = await sql`
        select name from user_session
        where session_id = ${sessionId}
    `;
  return users;
}

export {
  createSession,
  getSession,
  joinSession,
  getUsersInSession,
  checkValidSessionToken,
  startSession,
  endSession,
};
