const mongoose = require('mongoose');
const uuid = require('uuid');

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
    coupon: {
        type: String,
        required: false
    },
    couponapplied: {
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
        productName: {
            type: String // Assuming product name is a string
        },
        total: {
            type: Number // Assuming total price is a number
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
    address: [{
        country: {
            type: String,
            required: true
        },
        firstName: {
            type: String,
            required: true
        },
        lastName: {
            type: String,
            required: true
        },
        address: {
            type: String,
            required: true
        },
        city: {
            type: String,
            required: true
        },
        state: {
            type: String,
            required: true
        },
        postcode: {
            type: String,
            required: true
        },
        email: {
            type: String,
            required: true
        },
        phone: {
            type: String,
            required: true
        }
    }],
    orders: [{
        items: [{
            productName: { type: String, required: true },
            quantity: { type: Number, required: true }
        }],
        totalAmountUserPaid: { type: Number, required: true },
        date: { type: String},
        time: { type: String },
        orderId: { type: String, default: uuid.v4 },
        status: { type: String, enum: ['Pending','Confirmed', 'Shipped', 'Delivered','Cancelled'], default: 'Pending' },
        paymentmethod: {type:String},
        usercancelledorder:{type:Boolean,default:false}
    }]
   
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
    next();
});


const Userdb = mongoose.model('Users', Schema);

module.exports = Userdb;
