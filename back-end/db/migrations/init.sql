CREATE TABLE session (
    id SERIAL PRIMARY KEY,
    password VARCHAR(255) NOT NULL
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