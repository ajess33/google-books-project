
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

app.get('/books/:id', (req, res) => {
  const query = req.params.id;
  // console.log(query);
  displayBook(query, res);
});

app.post('/save', (req, res) => {
  console.log(req.body);
  saveBook(req.body);
  res.redirect('/');
});

app.post('/searches', (req, res) => {
  try {
    const searchQuery = req.body;
    searchBooks(searchQuery, res);
  }
  catch (error) {
    console.log(error);
  }
});

// Get saved books from SQL DB
function getBooksFromDB(req, res) {

  const handler = {
    cacheHit: function (results) {
      console.log('Found stuff in DB!');
      res.render('pages/index', { results: results.rows });
    },
  };
  Book.lookup(handler);
}

Book.lookup = function (handler) {
  const SQL = `SELECT * FROM books;`;

  client.query(SQL)
    .then(result => {

      console.log('RESULT: ' + result);
      handler.cacheHit(result);
    });
};

const saveBook = function (book) {
  const SQL = `INSERT INTO books (title, author, isbn, image_url, description, bookshelf) VALUES ($1,$2,$3,$4,$5,$6) RETURNING id`;

  const values = [book.title, book.image, book.author, book.isbn, book.desc, book.bookshelf];
  client.query(SQL, values)
    .then(results => {
      this.id = results.rows[0].id;
    });
};

const displayBook = (query, res) => {
  const URL = `https://www.googleapis.com/books/v1/volumes?q=${query}&maxResults=1`;

  return superagent.get(URL)
    .then(data => {
      const title = data.body.items.volumeInfo.title;
      const author = data.body.items.volumeInfo.authors;
      const desc = helper.trimDesc(data.body.items.volumeInfo.description);
      const image = data.body.items.volumeInfo.imageLinks ? helper.secureUrl(data.body.items.volumeInfo.imageLinks.thumbnail) : 'No Image Available';
      let isbn;
      if (data.body.items.volumeInfo.industryIdentifiers) {
        isbn = helper.concatIsbn(data.body.items.volumeInfo.industryIdentifiers);
      } else { isbn = 'No ISBN'; }
      const bookshelf = 'Nothing Yet';

      const book = new Book(title, author, desc, image, isbn, bookshelf);

      res.render('pages/books/show');
    });
};

// SEARCH API FOR BOOKS
const searchBooks = (query, res) => {

  const URL = `https://www.googleapis.com/books/v1/volumes?q=${query.title ? query.searchField : `inauthor:${query.searchField}`}`;
  return superagent.get(URL)
    .then(data => {
      // loop through returned objects
      const bookList = data.body.items.map(book => {
        const title = book.volumeInfo.title;
        const author = book.volumeInfo.authors;
        const desc = helper.trimDesc(book.volumeInfo.description);
        const image = book.volumeInfo.imageLinks ? helper.secureUrl(book.volumeInfo.imageLinks.thumbnail) : 'No Image Available';
        let isbn;
        if (book.volumeInfo.industryIdentifiers) {
          isbn = helper.concatIsbn(book.volumeInfo.industryIdentifiers);
        } else { isbn = 'No ISBN'; }
        const bookshelf = 'Nothing Yet';

        // run objects through constructor
        const novel = new Book(title, author, desc, image, isbn, bookshelf);

        // save when someone clicks the save button
        // novel.save();

        return novel;
      });
      res.render('pages/searchResults', { data: bookList });
    });
};


// BOOK CONSTRUCTOR
Book.all = [];


function Book(title, author, description, image, isbn, bookshelf) {
  console.log(app.locals.count);
  this.title = title || 'Unknown Book Title';
  this.author = author || 'Unknown Author';
  this.description = description || 'No Description';
  this.image = image;
  this.isbn = isbn;
  this.bookshelf = bookshelf;
  Book.all.push(this);
}

app.listen(PORT, () => console.log(`App is up on ${PORT}`));
