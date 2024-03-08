const mongoose = require('mongoose');

const Schema = new mongoose.Schema({
    email: {
        required: true,
        type: String
    },
    password: {
        required: true,
        type: String
    }
})

const Admindb = mongoose.model('admins', Schema);

module.exports = Admindb;