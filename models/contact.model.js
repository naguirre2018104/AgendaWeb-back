'use strict'

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var contactSchema = Schema({
    name: String,
    lastname: String,
    phone: Number
})

module.exports = mongoose.model('contact', contactSchema);