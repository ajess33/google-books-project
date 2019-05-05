
// APP DEPENDENCIES
require('dotenv').config();
const express = require('express');
const superagent = require('superagent');
const methodOverride = require('method-override');
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
app.use(express.static('./public/'));
app.use(methodOverride('_method'));

// POSTGRES SETUP
const client = new Client(process.env.DATABASE_URL);
client.connect();
client.on('err', err => console.log(err));


// ROUTES ===================================================

app.get('/', getBooksFromDB);

app.get('/search', (req, res) => {
  res.render('pages/searchForm');
});

app.post('/save', (req, res) => {
  saveBook(req.body);
  res.redirect('/');
});

app.post('/searches', (req, res) => {
  try {
    const searchQuery = req.body;
    searchBooks(searchQuery, res);
  }
  catch (error) { console.log(error); }
});

app.get('/update/:id', (req, res) => getSelectedBookFromDB(req, res));

app.put('/update/:id', (req, res) => updateBook(req, res));

app.delete('/update/:id', (req, res) => deleteBook(req, res));

// DELETE SAVED BOOK FROM DB ====================================

function deleteBook(req, res) {
  const { id } = req.params;

  const SQL = `DELETE FROM books WHERE id=${id}`;

  client.query(SQL)
    .then(() => {
      res.redirect('/');
    }
    );
}


// GET SINGLE BOOK FROM DB ==========================================

function getSelectedBookFromDB(req, res) {
  const id = req.params.id;
  const SQL = `SELECT * FROM books WHERE id=${id}`;
  client.query(SQL)
    .then(results => {
      console.log('Found your book in DB');

      res.render('pages/singleBook', { book: results.rows[0] });
    });
}

// UPDATE SINGLE BOOK ===============================================

function updateBook(req, res) {
  const { id } = req.params;
  const book = req.body;

  const SQL = `UPDATE books SET title=$1, author=$2, isbn=$3, image_url=$4 WHERE id=$5`;

  book.bookshelf === '' ? 'No bookshelf' : book.bookshelf;
  console.log(book.bookshelf);

  const values = [book.title, book.description, book.image_url, book.bookshelf, id];

  client.query(SQL, values)
    .then(result => {
      console.log('Found your saved book from DB', result);
      // res.send(result);
      res.redirect('/');
      // getBooksFromDB(req, res);
    });
}

// QUERY DB FOR SAVED BOOKS ======================================

function getBooksFromDB(req, res) {
  const SQL = `SELECT * FROM books;`;

  client.query(SQL)
    .then(results => {
      console.log('Got books from DB');
      res.render('pages/index', { results: results.rows });
    });
}

// SAVE BOOK TO DB ==========================================----

const saveBook = function (book) {
  const SQL = `INSERT INTO books (title, author, isbn, image_url, description, bookshelf) VALUES ($1,$2,$3,$4,$5,$6) RETURNING id`;

  const values = [book.title, book.author, book.isbn, book.image_url, book.description, book.bookshelf];
  client.query(SQL, values)
    .then(results => {
      this.id = results.rows[0].id;
    });
};


// SEARCH API =================================================

const searchBooks = (query, res) => {

  const URL = `https://www.googleapis.com/books/v1/volumes?q=${query.title ? `intitle:${query.searchField}` : `inauthor:${query.searchField}`}`;
  return superagent.get(URL)
    .then(data => {

      const bookList = data.body.items.map(book => {
        const title = book.volumeInfo.title;
        const author = book.volumeInfo.authors;
        const desc = helper.trimDesc(book.volumeInfo.description);
        const image_url = book.volumeInfo.imageLinks ? helper.secureUrl(book.volumeInfo.imageLinks.thumbnail) : 'No Image Available';
        let isbn;
        if (book.volumeInfo.industryIdentifiers) {
          isbn = helper.concatIsbn(book.volumeInfo.industryIdentifiers);
        } else { isbn = 'No ISBN'; }
        const bookshelf = 'Nothing Yet';

        const novel = new Book(title, author, desc, image_url, isbn, bookshelf);

        return novel;
      });
      res.render('pages/searchResults', { data: bookList });
    });
};


// BOOK CONSTRUCTOR =============================================

function Book(title, author, description, image, isbn, bookshelf) {
  this.title = title || 'Unknown Book Title';
  this.author = author || 'Unknown Author';
  this.description = description || 'No Description';
  this.image_url = image;
  this.isbn = isbn;
  this.bookshelf = bookshelf;
}

// START SERVER ==================================================

app.listen(PORT, () => console.log(`App is up on ${PORT}`));
