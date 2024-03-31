import sql from "./db.js";

async function createSession(password) {
  const session = await sql`
                insert into session (password)
                values (${password})
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

async function joinSession(name, sessionId) {
  await sql`
        insert into user_session (name, session_id)
        select ${name}, ${sessionId}
        where not exists (
            select 1 from user_session
            where name = ${name} and session_id = ${sessionId}
        )
    `;
}

async function getUsersInSession(sessionId) {
  const users = await sql`
        select name from user_session
        where session_id = ${sessionId}
    `;
  return users;
}

export { createSession, getSession, joinSession, getUsersInSession };
