
// Dependencies

require('dotenv').config();
const express = require('express');
const superagent = require('superagent');
const cors = require('cors');
const ejs = require('ejs');

const app = express();
const PORT = process.env.PORT || 3000;

app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: true }));

app.use(express.static('./public'));

app.get('/', (req, res) => {

});

app.listen(PORT, () => console.log(`App is up on ${PORT}`));
