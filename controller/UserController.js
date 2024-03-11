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



app.set('view engine', 'hbs');


const GetHomePage = async (req, res) => {
    try {
        const token = req.cookies.token;

        if (!token) {
            return res.render('users/index'); // Render the page without user information
        }

        // Verify the token
        jwt.verify(token, 'your_secret_key', async (err, decoded) => {
            if (err) {
                console.error('Invalid token:', err);
                return res.status(401).render('users/index'); // Render the page without user information
            }

            // Retrieve the user from the database using the decoded user ID
            const user = await User.findById(decoded.id);

            if (!user) {
                console.error('User not found');
                return res.status(404).render('users/index'); // Render the page without user information
            }

            // Render the page with user information and success message
            return res.render('users/index', { user, successMessage: req.query.successMessage });
        });
    } catch (error) {
        console.error('Error fetching user:', error);
        return res.status(500).render('users/index'); // Render the page without user information
    }
};




  

  const GetLoginPage = (req, res) => {
    return res.render('users/login');
  };

  const GetRegisterPage = (req, res) => {
    return res.render('users/register');
  };

  const GetForgotPasswordPage = (req, res) => {
    return res.render('users/forgot-password');
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
    res.redirect('/');
};







const GetShopPage = (req,res)=>{
   return res.render('users/shop')
}



module.exports = {
    GetHomePage,
    GetLoginPage,
    GetRegisterPage,
    GetForgotPasswordPage,
    PostUserRegister,
    OTPVerify,
    Userlogin,
    SendOTP,
    ForgetPasswordButton,
    logoutUser,
    GetShopPage
};
