const express = require('express')
const mongoose = require('mongoose');
const app = express()
const bodyParser = require('body-parser');
const PORT = 3000;
const cookieParser = require('cookie-parser');
const session = require('express-session');
const path = require('path')


app.use(express.static(path.join(__dirname, 'public')));

mongoose.connect('mongodb://localhost:27017/FruitBasket', {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => {
    console.log('Connected to MongoDB');
}).catch(error => {
    console.error('Error connecting to MongoDB:', error);
});



app.set('view engine', 'hbs');
app.use(express.urlencoded({ extended: true }));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());



// Middleware to parse URL-encoded bodies
app.use(express.urlencoded({ extended: true }));


const UserRoute = require('./router/UserRoute');
const AdminRoute = require('./router/AdminRoute');


// Middleware to parse JSON bodies
app.use(express.json());

app.use(cookieParser());

app.use(session({
    secret: 'your_secret_key',
    resave: false,
    saveUninitialized: false,
    cookie: {
        maxAge: 6000000// Expiration time for the session cookie in milliseconds (e.g., 1 hour)
    }
}));






app.use('/',UserRoute)
app.use('/admin',AdminRoute)



app.listen(PORT,console.log(`Server is Running on http://localhost:${PORT}`))