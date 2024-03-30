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

export { createSession, getSession };
