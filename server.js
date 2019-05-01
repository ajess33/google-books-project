
// APP DEPENDENCIES
require('dotenv').config();
const express = require('express');
const superagent = require('superagent');
const cors = require('cors');
const { Client } = require('pg');

const app = express();
const PORT = process.env.PORT || 3000;

// FILE DEPENDENCIES
const helper = require('./helpers');

// EJS SETUP
app.set('view engine', 'ejs');
app.use(cors());
app.use(express.urlencoded({ extended: true }));
// STYLESHEETS
app.use(express.static('./public/styles'));
// EJS FILES
app.use(express.static('./public'));

// POSTGRES SETUP
const client = new Client(process.env.DATABASE_URL);
client.connect();
client.on('err', err => console.log(err));


// ROUTES
app.get('/', getBooksFromDB);

app.get('/search', (req, res) => {
  res.render('pages/searchForm');
});

app.post('/searches', (req, res) => {
  try {
    const searchQuery = req.body;
    searchBook(searchQuery, res);
  }
  catch (error) {
    console.log(error);
  }
});

function getBooksFromDB(req, res) {

  const handler = {
    query: req.query,

    cacheHit: function (results) {
      res.render('pages/index', { results: results.rows });
    },

    cacheMiss: function () {
      searchBook(req.body, res).catch(error => {
        console.log(error);
      });
    }
  };
  Book.lookup(handler);
}

Book.lookup = function (handler) {
  const SQL = `SELECT * FROM books WHERE id=$1`;
  client.query(SQL, [handler.query.id])
    .then(result => {
      if (result.rowCount > 0) {
        console.log('RESULT: ' + result);
        handler.cacheHit(result);
      } else {
        console.log('Got data from API');
        handler.cacheMiss();
      }
    });
};

Book.prototype.save = function () {
  const SQL = `INSERT INTO books (title, author, isbn, image_url, description, bookshelf) VALUES ($1,$2,$3,$4,$5,$6) RETURNING id`;

  const values = Object.values(this);
  client.query(SQL, values)
    .then(results => {
      this.id = results.rows[0].id;
    });
};

// SEARCH API FOR BOOKS
const searchBook = (query, res) => {

  const URL = `https://www.googleapis.com/books/v1/volumes?q=${query.title ? query.searchField : `inauthor:${query.searchField}`}`;
  return superagent.get(URL)
    .then(data => {
      // loop through returned objects
      const bookList = data.body.items.map(book => {
        const title = book.volumeInfo.title;
        const author = book.volumeInfo.authors;
        const desc = book.volumeInfo.description;
        const image = book.volumeInfo.imageLinks ? helper.secureUrl(book.volumeInfo.imageLinks.thumbnail) : 'No Image Available';
        let isbn;
        if (book.volumeInfo.industryIdentifiers) {
          isbn = helper.concatIsbn(book.volumeInfo.industryIdentifiers);
        } else {
          isbn = 'No ISBN';
        }
        const bookshelf = 'Nothing Yet';

        // run objects through constructor
        const novel = new Book(title, author, desc, image, isbn, bookshelf);
        novel.save();

        return novel;
      });
      res.render('pages/searchForm', { data: bookList });
    });
};


// BOOK CONSTRUCTOR
Book.all = [];

function Book(title, author, description, image, isbn, bookshelf) {
  this.title = title || 'Unknown Book Title';
  this.author = author || 'Unknown Author';
  this.description = description || 'No Description';
  this.image = image;
  this.isbn = isbn;
  this.bookshelf = bookshelf;
  Book.all.push(this);
}

app.listen(PORT, () => console.log(`App is up on ${PORT}`));
