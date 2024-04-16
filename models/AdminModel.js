const mongoose = require('mongoose');

const Schema = new mongoose.Schema({
    email: {
       
        type: String
    },
    password: {
   
        type: String
    },
    coupons: [
        {
            couponQuantity: Number,
            format: String,
            code: String,
            expiryDate: String,
            discountType: String,
            discountValue: Number
        }
    ]
});

const Admindb = mongoose.model('admins', Schema);

module.exports = Admindb;
