const express = require('express')
const mongoose = require('mongoose');
const app = express()
const bodyParser = require('body-parser');
const PORT = 3000;
const cookieParser = require('cookie-parser');
const session = require('express-session');
const path = require('path')
require('dotenv').config();









app.use(express.static(path.join(__dirname, 'public')));

mongoose.connect('mongodb+srv://minhajvvo:bbEM7fP7djbkLhO0@cluster0.ishwawa.mongodb.net/FruitBasket', {
   
}).then(() => {
    console.log('Connected to MongoDB');
}).catch(error => {
    console.error('Error connecting to MongoDB:', error);
});



app.set('view engine', 'hbs');

app.use(bodyParser.json());



// Middleware to parse URL-encoded bodies
app.use(express.urlencoded({ extended: true }));


const UserRoutes = require('./router/RouteUser');
const AdminRoutes = require('./router/RouteAdmin');


// Middleware to parse JSON bodies
app.use(express.json());

app.use(cookieParser());

app.use(session({
    secret: 'your_secret_key',
    resave: false,
    saveUninitialized: false 
}));





app.use('/',UserRoutes)
app.use('/admin',AdminRoutes)



app.listen(PORT,console.log(`Server is Running on http://localhost:${PORT}`))