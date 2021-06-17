'use strict'

const express = require('express');
const userController = require('../controllers/user.controller');
const mdAuth = require('../middlewares/authenticated');
const connectMultiparty = require('connect-multiparty');
const upload = connectMultiparty({ uploadDir: './uploads/users'}) // Variable que guarda el directorio donde se guardan las imágenes.

var api = express.Router();

api.get('/prueba', userController.prueba);
api.post('/saveUser', userController.saveUser);
api.post('/saveUserOnlyAdmin/:id', [mdAuth.ensureAuth, mdAuth.ensureAuthAdmin], userController.saveUserByAdmin);
api.post('/login', userController.login);

api.put('/updateUser/:id', mdAuth.ensureAuth,  userController.updateUser);
api.put('/removeUser/:id', mdAuth.ensureAuth, userController.removeUser);
api.get('/getUsers', [mdAuth.ensureAuth, mdAuth.ensureAuthAdmin], userController.getUsers);

api.post('/searchUser', [mdAuth.ensureAuth, mdAuth.ensureAuthAdmin], userController.searchUser);

api.put('/:id/uploadImage', [mdAuth.ensureAuth, upload], userController.uploadImage);
api.get('/getImage/:fileName', [upload], userController.getImage);

module.exports = api;