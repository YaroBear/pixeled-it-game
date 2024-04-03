CREATE TABLE session (
    id SERIAL PRIMARY KEY,
    started boolean NOT NULL DEFAULT false,
    ended boolean NOT NULL DEFAULT false,
    time_limit INT NOT NULL,
    end_time TIMESTAMPTZ NULL,
    password VARCHAR(255) NOT NULL
);

CREATE TABLE user_session (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    session_id INT NOT NULL,
    token VARCHAR(255) NOT NULL,
    FOREIGN KEY (session_id) REFERENCES session(id),
    CONSTRAINT unique_name_session_id UNIQUE (name, session_id)
);

CREATE TABLE original_picture (
    id SERIAL PRIMARY KEY,
    path VARCHAR(255) NOT NULL,
    session_id INT NOT NULL,
    FOREIGN KEY (session_id) REFERENCES session(id)
);

CREATE TABLE submission (
    id SERIAL PRIMARY KEY,
    username VARCHAR(255) NOT NULL,
    path VARCHAR(255) NOT NULL,
    session_id INT NOT NULL,
    original_picture_id INT NOT NULL,
    FOREIGN KEY (session_id) REFERENCES session(id),
    FOREIGN KEY (original_picture_id) REFERENCES original_picture(id)
);

CREATE TABLE user_session_picture_assignment (
    id SERIAL PRIMARY KEY,
    user_session_id INT NOT NULL,
    picture_id INT NOT NULL,
    FOREIGN KEY (user_session_id) REFERENCES user_session(id),
    FOREIGN KEY (picture_id) REFERENCES original_picture(id),
    CONSTRAINT unique_user_session_id_picture_id UNIQUE (user_session_id, picture_id)
);