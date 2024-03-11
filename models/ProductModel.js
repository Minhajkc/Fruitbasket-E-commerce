const mongoose = require('mongoose')

const Schema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    category: {
        type: String
    },subCategory: {
        type: String
    },
    brand: {
        type: String
    },
    manufacture: {
        type: String
    },
    mrp: {
        type: Number,
        required: true
    },
    sellingPrice: {
        type: Number,
        required: true
    },
    weight: {
        type: Number,
        required: true
    },
    productImage: {
        type: String, 
        required: true 
    },
    stock: {
        type: Number
    },
    description: {
        type: String
    },
    advancedDescription: {
        type: String
    },
    originOfProduct: {
        type: String
    },
    isDisabled: {
        type: Boolean,
        default: false
    } 
})

const products = mongoose.model('Products', Schema);

module.exports = products;