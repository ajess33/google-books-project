
// APP DEPENDENCIES
require('dotenv').config();
const express = require('express');
const superagent = require('superagent');
const cors = require('cors');

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


// ROUTES
app.get('/', (req, res) => {
  res.render('pages/index');
});

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
        const image = helper.secureUrl(book.volumeInfo.imageLinks.thumbnail);


        // run objects through constructor
        const novel = new Book(title, author, desc, image);
        return novel;
      });
      res.send(bookList);
    });
};


// BOOK CONSTRUCTOR
Book.all = [];

function Book(title, author, description, image) {
  this.title = title || 'Unknown Book Title';
  this.author = author || 'Unknown Author';
  this.description = description || 'No Description';
  this.image = image || 'No Image Available';
  Book.all.push(this);
}



app.listen(PORT, () => console.log(`App is up on ${PORT}`));
