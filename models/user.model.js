'use strict'

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var userSchema = Schema({
    name: String,
    lastname: String,
    username: String,
    password: String,
    email: String,
    image: String,
    phone: Number,
    role: String,
    contacts: [{type: Schema.ObjectId, ref: 'contact'}] //P
});

module.exports = mongoose.model('user', userSchema);