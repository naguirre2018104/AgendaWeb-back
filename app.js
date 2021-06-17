'use strict'

var express = require('express');
var bodyParser = require('body-parser');
var userRoutes = require('./routes/user.route');
var contactRoutes = require('./routes/contact.route');
var cors = require('cors');

var app = express();

app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());

app.use(cors());

app.use('/api', userRoutes);
app.use('/api', contactRoutes);

module.exports = app;