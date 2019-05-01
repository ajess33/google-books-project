DROP TABLE IF EXISTS "books";

CREATE TABLE books (
  id SERIAL PRIMARY KEY,
  title VARCHAR,
  author VARCHAR,
  isbn VARCHAR,
  image_url VARCHAR,
  description VARCHAR,
  bookshelf VARCHAR
);