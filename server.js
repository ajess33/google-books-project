
// Dependencies

require('dotenv').config();
const express = require('express');
const superagent = require('superagent');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;
const API_KEY = process.env.API_KEY;

app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: true }));
app.use(express.static('./public/styles'));

app.use(express.static('./public'));


//! MIXED CONTENT

// Routes
app.get('/', (req, res) => {
  res.render('pages/index');
});

app.get('/searches/show', (req, res) => {

});

app.post('/searches', (req, res) => {
  try {
    const searchQuery = req.body;
    res.send(searchBook(searchQuery));
  }
  catch (error) {
    console.log(error);
  }
});


Book.all = [];
// Book constructor
function Book(title, author, description) {
  this.title = title || 'Unknown Book Title';
  this.author = author || 'Unknown Author';
  this.description = description || 'No Description';
  Book.all.push(this);
}

const searchBook = (query) => {

  const URL = `https://www.googleapis.com/books/v1/volumes?q=${query.title ? `intitle:${query.searchField}` : `inauthor:${query.searchField}`}`;
  console.log(query.title);
  console.log(query.searchField);
  return superagent.get(URL)
    .then(data => {
      const bookList = data.body.items.map(book => {
        const title = book.volumeInfo.title;
        const author = book.volumeInfo.authors;
        const desc = book.volumeInfo.description;

        const novel = new Book(title, author, desc);
        return novel;
      });
      console.log(bookList);
      return bookList;
    });
};

app.listen(PORT, () => console.log(`App is up on ${PORT}`));
