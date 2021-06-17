'use strict'

const express = require('express');
const contactController = require('../controllers/contact.controller');
const mdAuth = require('../middlewares/authenticated');

var api = express.Router();



//con middleware
api.put('/setContact/:id', mdAuth.ensureAuth,  contactController.setContact);
api.put('/:idU/updateContact/:idC', mdAuth.ensureAuth, contactController.updateContact);
api.put('/:idU/removeContact/:idC', mdAuth.ensureAuth, contactController.removeContact);

module.exports = api;