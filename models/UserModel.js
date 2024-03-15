const mongoose = require('mongoose');

const Schema = new mongoose.Schema({
    userId: {
        type: String,
        required: true
    },
    name: {
        type: String,
        required: [true, 'Name is required field']
    },
    phone: {
        type: Number,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    isBlocked: {
        type: Boolean,
        default: false
    },
    joinDate: {
        type: String,
        default: () => {
            const date = new Date();
            return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}:${String(date.getSeconds()).padStart(2, '0')}`;
        }
    },
    bookings: [{
        product: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Products' // Assuming your product model is named 'Product'
        },
        quantity: {
            type: Number,
            default: 1
        },
        total: {
            type: Number,
        }  
    }],
    subtotal:{
        type: Number,  
    },
    grandtotal:{
        type: Number,   
    },
    shippingcost:{
        type: Number,
        default:70
    },
    wishlist: [{
        items: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Products'
        }
    }],
   
});


Schema.pre('save', async function(next) {
    const bookingsPromises = this.bookings.map(async booking => {
        if (!booking.total || booking.isModified('quantity')) {
            const product = await mongoose.model('Products').findById(booking.product);
            if (product) {
                booking.total = product.mrp * booking.quantity;  
            }
        }
        
    });

    await Promise.all(bookingsPromises);
    this.subtotal = this.bookings.reduce((acc, booking) => acc + booking.total, 0);
        this.grandtotal = this.subtotal + this.shippingcost
    
    next();
});


const Userdb = mongoose.model('Users', Schema);

module.exports = Userdb;
