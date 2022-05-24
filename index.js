const express = require('express');
const helmet = require('helmet');
const pug = require('pug');
const config = require('config');
const winston = require('winston');
const app = express();

app.set('view engine', 'pug');
app.set('views', './views');

require('./startup/logging')();
require('./startup/routes')(app)
require('./startup/db')();
require('./startup/config')();
require('./startup/validation')();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public/images'));
app.use(helmet());

//PORT
const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Listing on port ${port}..`));