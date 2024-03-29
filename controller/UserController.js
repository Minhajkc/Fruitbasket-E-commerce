const express = require('express')
const app = express()
const path = require('path')
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const exphbs  = require('express-handlebars');
const session = require('express-session');
const bcrypt = require('bcrypt');
const uuid = require('uuid');



app.use(session({
    secret: 'your_secret_key',
    resave: false,
    saveUninitialized: false,
    cookie: {
        maxAge: 60000 
    }
}));






const secretKey = 'yourSecretKey';


const User = require('../models/UserModel');
const Products = require('../models/ProductModel');
const products = require('../models/ProductModel');



app.set('view engine', 'hbs');


const GetHomePage = async (req, res) => {
    try {
        const token = req.cookies.token;
        const filteredProducts = await Products.find().limit(8).exec();


        if (!token) {
            return res.render('users/index',{products: filteredProducts} ); // Render the page without user information
        }

        // Verify the token
        jwt.verify(token, 'your_secret_key', async (err, decoded) => {
            if (err) {
                console.error('Invalid token:', err);
                return res.status(401).render('users/index',{products: filteredProducts}); // Render the page without user information
            }

            // Retrieve the user from the database using the decoded user ID
            const user = await User.findById(decoded.id);

            if (!user) {
                console.error('User not found');
                return res.status(404).render('users/index',{products: filteredProducts}); // Render the page without user information
            }

            // Render the page with user information and success message
            return res.render('users/index', { user, successMessage: req.query.successMessage ,products: filteredProducts });
        });
    } catch (error) {
        console.error('Error fetching user:', error);
        return res.status(500).render('users/index',{products: filteredProducts}); // Render the page without user information
    }
};




  const GetAboutPage = (req,res)=>{
    return res.render('users/about-us');
  }

  const GetContactPage = (req,res)=>{
    return res.render('users/contact-us');
  }
  const MyAccount = async (req,res)=>{
    try {
        const token = req.cookies.token;

        if (!token) {
            return res.render('users/my-account'); // Render the page without user information
        }

        // Verify the token
        jwt.verify(token, 'your_secret_key', async (err, decoded) => {
            if (err) {
                console.error('Invalid token:', err);
                return res.status(401).render('users/my-account'); // Render the page without user information
            }

            // Retrieve the user from the database using the decoded user ID
            const user = await User.findById(decoded.id);

            if (!user) {
                console.error('User not found');
                return res.status(404).render('users/my-account'); // Render the page without user information
            }
            if (user.orders && user.orders.length > 0) {
                // Assign numbers to each order in the orders array
                const ordersWithNumbers = user.orders.map((order, index) => ({
                    ...order,
                    orderNumber: index + 1
                }));
                console.log(ordersWithNumbers);
                return res.render('users/my-account', { user , ordersWithNumbers});
                
            }
        });
    } catch (error) {
        console.error('Error fetching user:', error);
        return res.status(500).render('users/index',{products: filteredProducts}); // Render the page without user information
    }
  }

  const GetLoginPage = (req, res) => {
  
        return res.render('users/login');
  
};


  const GetRegisterPage = (req, res) => {
    return res.render('users/register');
  };

  const GetForgotPasswordPage = (req, res) => {
    return res.render('users/forgot-password');
  };

  const GetProductDetailsPage = async (req, res) => {
    const productId = req.params.ProductId; // Assuming productId is passed in the URL
    const filteredProducts = await Products.find().limit(8).exec();
    try {
        const product = await Products.findById(productId).exec();
        if (!product) {
            return res.status(404).send('Product not found');
        }
        return res.render('users/product-details', { product ,filteredProducts});
    } catch (error) {
        console.error('Error fetching product details:', error);
        return res.status(500).send('Internal Server Error');
    }
};

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'fruitbasketmails@gmail.com', 
        pass: 'kbjo hjpx lduq iumt' 
    }
});

const generateOTP = () => {
    return Math.floor(100000 + Math.random() * 900000);
};

const sendOTPByEmail = (email, otp) => {
    const mailOptions = {
        from: 'fruitbasketmails@gmail.com',
        to: email,
        subject: 'Email Verification OTP',
        text: `Your OTP for email verification is: ${otp}`
    };

    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.error('Error sending email:', error);
        } else {
            console.log('Email sent:', info.response);
        }
    });
};

const PostUserRegister = async (req, res) => {
    const { name, phone, email, password } = req.body;
    const checkuser = await User.findOne({email})

    if(checkuser){
    const message = 'User with this email already exists.';
    return res.render('users/register', { message }) 
    }
    if(phone.length<10){
        return res.render('users/register', {
            messagephone: 'Phone must be 10 digit number.',
      });
    }
    if(password.length<6){
        return res.render('users/register', {
            messagep: 'Password must be at least 6 characters long.',
      });
    }
    const otp = generateOTP();
    console.log("signup:" +otp);

    req.session.otp = otp;

    sendOTPByEmail(email, otp);

    res.render('users/EmailOtp', {email,phone,name,password }); 
}

const OTPVerify = async (req, res) => {
    const { email, verificationCode, password, phone, name } = req.body;

    const storedOTP = req.session.otp;
    if (verificationCode == storedOTP) {
        try {
        
            const hashedPassword = await bcrypt.hash(password, 10); 

            const newUser = new User({
                userId: uuid.v4(),
                name,
                phone,
                email,
                password: hashedPassword 
            });

            await newUser.save();

            const token = jwt.sign({ email: email }, secretKey, { expiresIn: '1h' });
            res.cookie('token', token, { httpOnly: true, maxAge: 3600000 }); // Max age: 1 hour
            res.render('users/login');
        } catch (error) {
            console.error('Error saving user:', error);
            res.status(500).json({ success: false, message: 'Error registering user' });
        }
    } else {
        res.render('users/EmailOtp', { message: 'Enter Valid OTP' });
    }
}

const Userlogin = async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await User.findOne({ email });

        if (!user) {
            console.log('User with email does not exist:', email);
            res.status(400);
            return res.render('users/login', { error: 'User with email does not exist' });
        }

        if (user.isBlocked) {
            res.status(400);
            return res.render('users/login', { error: 'You are temporarily blocked!' });
        }

        const passwordMatch = await bcrypt.compare(password, user.password);
        if (passwordMatch) {
            const token = jwt.sign({ id: user._id, email: user.email }, 'your_secret_key', { expiresIn: '1h' });
            res.cookie('token', token, { httpOnly: true, maxAge: 3600000 });
            res.cookie('userId', user._id.toString(), { maxAge: 3600000 }); // Pass user ID in the cookie
            return res.redirect(`/home?successMessage=Login successful`);
        } else {
            res.status(400);
            return res.render('users/login', { errorp: 'Incorrect password!' });
        }
    } catch (error) {
        console.error('Error during login:', error);
        return res.status(500).send('Internal Server Error');
    }
};


const SendOTP = async (req, res) => {
    const { email } = req.body;
    
    try {
        const user = await User.findOne({ email });

        if (!user||user.email !== email) {
            return res.render('users/forgot-password', { error: 'User not found or email mismatch' });
        }
        const otp = generateOTP();
        sendOTPByEmail(email, otp);
        console.log('Generated OTP: ' + otp);

        req.session.otp = otp;
        req.session.email = email;

        res.sendStatus(204);
    } catch (error) {
        console.error('Failed to send OTP:', );
        res.status(500).send('Failed to send OTP');
    }
};



// Endpoint for updating password after OTP verification
const ForgetPasswordButton = async (req, res) => {
    const { Otp, NewPassword, ConfirmPassword } = req.body;
    
    try {
        const storedOTP = req.session.otp; // Retrieve OTP from session
        console.log(storedOTP);
        if (Otp != storedOTP) {
            return res.status(400).render('users/forgot-password', { messageinvalid: 'Please check and correct your OTP' });

        }
        
        // Check if new password matches confirm password
        if (NewPassword !== ConfirmPassword) {
             return res.status(400).json()
        }
        
        const hashedPassword = await bcrypt.hash(NewPassword, 10);  
        const user = await User.findOne({ email: req.session.email });
        user.password = hashedPassword;
        await user.save();
        
        res.render('users/index', { successmessage: 'Password updated please login !' });
    } catch (error) {
        console.error('Error updating password:', error);
        res.status(500).send('Internal server error');
    }
};


const logoutUser = (req, res) => {
    // Clear the token cookie by setting an empty value and an expiry date in the past
    res.cookie('token', '', { expires: new Date(0) });
    // Redirect to the homepage with a query parameter indicating successful logout
    res.clearCookie('userId');
    res.redirect('/');
};




const GetShopPage = async (req, res) => {
    try {
        const filteredProducts = await Products.find().exec();
        return res.render('users/shop', { products: filteredProducts });
    } catch (err) {
        console.error('Error fetching products:', err);
        res.status(500).send('Internal Server Error');
    }
};


const GetProductsCategory = async (req, res) => {
    try {
        const category = req.params.category.toLowerCase(); // Extract the category parameter and convert to lowercase

        let filteredProducts;

        if (category === 'bestquality' || category === 'featured' || category === 'newproducts') {
            // Limit to 5 products for specific categories
            filteredProducts = await Products.find().limit(5).exec();
        } else if (category === 'allproducts' || category === 'sortbypopularity') {
            // Show all products for 'allproducts' category, or sort by popularity
            filteredProducts = await Products.find().exec();
        } else if (category === 'alphabeticallyaz') {
            // Sort alphabetically by product name in ascending order
            filteredProducts = await Products.find().sort({ name: 1 }).exec();
        } else if (category === 'sortbylowtohigh') {
            // Sort by price (MRP) in ascending order
            filteredProducts = await Products.find().sort({ mrp: 1 }).exec();
        } else if (category === 'sortbyhightolow') {
            // Sort by price (MRP) in descending order
            filteredProducts = await Products.find().sort({ mrp: -1 }).exec();
        } else {
            // Filter by category
            filteredProducts = await Products.find({ category: category }).exec();
        }

        res.render('users/shop', { category: category, products: filteredProducts, });
    } catch (err) {
        // Handle errors
        console.error('Error fetching products:', err);
        res.status(500).send('Internal Server Error');
    }
};

const SearchProducts = async (req, res) => {
    const query = req.body.valuename // Get the search query from the request URL query parameters

    try {
        // Perform the search in your Products collection based on the query
        const filteredProducts = await Products.find({ name: { $regex: new RegExp(query, 'i') } }).exec();

        // Render the shop page with the search results
        res.render('users/shop', { category: 'Search Results', products: filteredProducts });
    } catch (err) {
        // Handle errors
        console.error('Error searching for products:', err);
        res.status(500).send('Internal Server Error');
    }
}




const GetCartPage = async (req, res) => {
    try {
        const userId = req.cookies.userId;

        if (!userId) {
            return res.redirect('/UserLogin');
        }

        const user = await User.findById(userId).populate('bookings.product');

        if (!user) {
            return res.redirect('/UserLogin');
        }

        let subtotal = 0;
        user.bookings.forEach(booking => {
            subtotal += booking.quantity * booking.product.mrp;
        });

        user.subtotal = subtotal;

        user.grandtotal = user.subtotal + user.shippingcost;

        await user.save();

        res.render('users/cart', { bookings: user.bookings, subtotal: user.subtotal, grandtotal: user.grandtotal });
    } catch (error) {
        console.error('Error fetching cart products:', error);
        res.status(500).send('Internal Server Error');
    }
}








const GetWishListPage = async (req, res) => {
    try {
        const userId = req.cookies.userId;

        // Fetch user details from the database
        const user = await User.findById(userId).populate('wishlist.items');
        if (!user) {
            return res.redirect('/UserLogin');
        }

        res.render('users/wishlist', { wishlistItems: user.wishlist });
    } catch (error) {
        console.error('Error fetching wishlist items:', error);
        res.status(500).send('Internal Server Error');
    }
};






const AddToCart = async (req, res) => {
    const productId = req.params.productId;
    const userId = req.cookies.userId;

    try {

        const product = await products.findById(productId);
        if (!product) {
            return res.status(404).send('Product not found');
        }
        
        const updatedUser = await User.findOneAndUpdate(
            { _id: userId, 'bookings.product': { $ne: productId } }, // Check if the product is not already in the cart
            { 
                $addToSet: { 
                    bookings: { 
                        product: productId, 
                        cart: true, 
                        productName: product.name, // Add product name to the cart
                        total:0 
                    } 
                } 
            }, 
            { new: true }
        );

        if (updatedUser) {
            res.redirect('/Shop?success=addedToCart');
        } else {
            res.redirect(`/Shop?failed=ItemIsAlreadyInCart&productId=${productId}`);
        }
    } catch (error) {
        // Handle errors
        console.error('Error adding product to cart:', error);
        res.status(500).send('Internal Server Error');
    }
};




const AddToWishlist = async (req, res) => {
    try {
       

        const productId = req.params.productId;
        const userId = req.cookies.userId;

        // Check if the user is authenticated
        if (!userId) {
            return res.redirect('/UserLogin');
        }

        // Update the user's document to add the product ID to the wishlist array
          const updatedUser = await User.findOneAndUpdate(
            { _id: userId,'wishlist.items': { $ne: productId } }, // Check if the product is not already in the cart
            { $addToSet: { wishlist: { items: productId, wishlist: true } } }, // Update the 'cart' field to true
            { new: true }
        );

        if (updatedUser) {
            return res.redirect('/Shop?success=addedToWishlist');
        } else {
            return res.redirect(`/Shop?failed=ItemIsAlreadyInWishList&productId=${productId}`);
        }
    } catch (error) {
        console.error('Error adding product to wishlist:', error);
        res.status(500).send('Internal Server Error');
    }
};


const AddToCartFromWishlist = async (req, res) => {
    const productId = req.params.productId;
    const userId = req.cookies.userId;

    try {
        // Fetch the product details
        const product = await products.findById(productId);
        if (!product) {
            return res.status(404).send('Product not found');
        }

        // Add the item to the cart
        const updatedUserCart = await User.findOneAndUpdate(
            { _id: userId, 'bookings.product': { $ne: productId } },
            { $addToSet: { bookings: { product: productId, cart: true, productName: product.name, total: product.mrp } } },
            { new: true }
        );

        if (!updatedUserCart) {
            return res.redirect('/UserLogin');
        }

        // Remove the item from the wishlist
        const updatedUserWishlist = await User.findOneAndUpdate(
            { _id: userId, 'wishlist.items': productId },
            { $pull: { wishlist: { items: productId } } },
            { new: true }
        );

        if (!updatedUserWishlist) {
            return res.redirect('/UserLogin');
        }

        // Redirect to the shop page with a success message
        res.redirect('/Shop?success=addedToCart');
    } catch (error) {
        // Handle errors
        console.error('Error adding product to cart:', error);
        res.status(500).send('Internal Server Error');
    }
};


const DeleteWishList = async (req, res) => {
    const productId = req.params.ProductId;

    try {
        const updatedUserWishlist = await User.findOneAndUpdate(
            { 'wishlist.items': productId },
            { $pull: { wishlist: { items: productId } } },
            { new: true }
        );
     
        if (!updatedUserWishlist) {
            return res.status(404).send('Product not found in wishlist');
        }

        // Redirect to the wishlist page after deletion
        res.redirect('/Wishlist?success');
    } catch (error) {
        console.error('Error deleting product:', error);
        res.status(500).send('Internal Server Error');
    }
}

const DeleteFromcart = async (req,res)=>{
    const productId = req.params.ProductId;

    try {
        const updatedUserWishlist = await User.findOneAndUpdate(
            { 'bookings.product': productId },
            { $pull: { bookings: { product: productId } } },
            { new: true }
        );
     
        if (!updatedUserWishlist) {
            return res.status(404).send('Product not found in wishlist');
        }

        // Redirect to the wishlist page after deletion
        res.redirect('/Cart?success');
    } catch (error) {
        console.error('Error deleting product:', error);
        res.status(500).send('Internal Server Error');
    }
}




const updateQuantity = async (req, res) => {
    try {
        // Extract productId and newQuantity from the request body
        const { productId, newQuantity } = req.body;
        const userId = req.cookies.userId; // Assuming you have the user's ID in the request

        // Find the user document by ID
        const user = await User.findById(userId);

        // Find the booking with the matching productId in the bookings array
        const booking = user.bookings.find(booking => booking.product.toString() === productId);

        // If booking is found, update the quantity
        if (booking) {
            booking.quantity = newQuantity;
        } else {
            return res.status(404).json({ message: 'Booking not found' });
        }
        
        // Save the updated user document
        await user.save();
    
        
        
        // Response after redirect may not be necessary as the redirect will take the user to a new page.
         res.status(200).json({ message: 'Quantity updated successfully',newQuantity });
    } catch (error) {
        // Handle errors
        console.error('Error updating quantity:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};




const GetCheckOutPage = async (req, res) => {
    try {
        const userId = req.cookies.userId;
        if (!userId) {
            return res.redirect('/UserLogin');
        }

        // Find the user by ID
        const user = await User.findById(userId);
        
        if (!user) {
            return res.status(404).send('User not found');
        }

        // Check if the address array is not empty
        if (user.address.length > 0) {
            // If address is not empty, render the checkout page with the address
            return res.render('users/checkout', {user, address: user.address });
        } else {
            // If address is empty, render the checkout page without the address
            return res.render('users/checkout');
        }
    } catch (error) {
        // Handle errors
        console.error('Error fetching user or rendering checkout page:', error);
        res.status(500).send('Internal Server Error');
    }
};




const AddressForm = async (req, res) => {
    const userId = req.cookies.userId;

    try {
        // Fetch the user by ID
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).send('User not found');
        }

        const { firstname, lastname, mainaddress, country, city, state, post, email, phone } = req.body;

        // Validate form data (e.g., check if required fields are provided)

        // Push the new address object into the address array
        user.address.push({
            firstName: firstname,
            lastName: lastname,
            address: mainaddress,
            country: country,
            city: city,
            state: state,
            postcode: post,
            email: email,
            phone: phone
        });

        // Save the updated user object
        await user.save();

        // Redirect or respond with a success message
        res.redirect('/Checkout')
        
    } catch (error) {
        // Handle errors
        console.error('Error adding address:', error);
        res.status(500).send('Internal Server Error');
    }
};



const OrderSubmit = async (req, res) => {
    const { paymentmethod } = req.body;

    try {
        if (paymentmethod === 'cod') {
            const userId = req.cookies.userId;
            if (!userId) {
                return res.redirect('/UserLogin');
            }

            const user = await User.findById(userId);
            if (!user) {
                return res.status(404).send('User not found');
            }

            const grandtotal = user.grandtotal;

            const currentDate = new Date();
            const currentTime = currentDate.toLocaleTimeString();

            // Fetch product details from user's bookings
            const orders = [{
                items: user.bookings.map(item => ({
                    productName: item.productName,
                    quantity: item.quantity
                   
                })),
                totalAmountUserPaid: grandtotal,
                date: currentDate,
                time: currentTime,
                orderId: uuid.v4(),
                status:'Pending'
            }];

            // Update the orders array in the User collection
            const updatedUser = await User.findByIdAndUpdate(
                userId,
                { $push: { orders: { $each: orders } } }, // Add new orders to the existing orders array
                { new: true }
            );

            if (!updatedUser) {
                return res.status(404).send('User not found');
            }

            // Clear the user's bookings after placing the order
            updatedUser.bookings = [];
            await updatedUser.save();

            return res.redirect('/home?success=orderedplacedsuccessfully');
        } else {
            // Handle other payment methods
            return res.redirect('/PaymentGateway');
        }
    } catch (error) {
        // Handle errors
        console.error('Error processing order:', error);
        res.status(500).send('Internal Server Error');
    }
};








module.exports = {
    GetHomePage,
    GetLoginPage,
    GetRegisterPage,
    GetAboutPage,
    GetContactPage,
    MyAccount,
    GetForgotPasswordPage,
    PostUserRegister,
    OTPVerify,
    Userlogin,
    SendOTP,
    ForgetPasswordButton,
    logoutUser,
    GetShopPage,
    GetProductsCategory,
    SearchProducts,
    GetCartPage,
    GetWishListPage,
    AddToCart,
    AddToWishlist,
    AddToCartFromWishlist,
    DeleteWishList,
    DeleteFromcart,
    updateQuantity,
    GetProductDetailsPage,
    GetCheckOutPage,
    AddressForm,
    OrderSubmit
   
   
};
