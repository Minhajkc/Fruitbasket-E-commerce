const express = require('express');


const UserController = require('../controller/UserController');
const Userauth = require('../middlewares/Usersauth')



const router = express.Router();



router.get('/',Userauth.verifyToken1,UserController.GetHomePage);
router.get('/home',Userauth.verifyToken,UserController.GetHomePage)
router.get('/UserLogin',Userauth.checkLoggedIn,UserController.GetLoginPage);
router.get('/UserRegister',Userauth.verifyToken1,UserController.GetRegisterPage);
router.post('/UserRegForm',UserController.PostUserRegister)
router.post('/OtpVerification',UserController.OTPVerify)
router.post('/UserLogin',UserController.Userlogin)
router.get('/ForgotPassword',UserController.GetForgotPasswordPage)
router.post('/sendOTP',UserController.SendOTP)
router.post('/ForgetPasswordButton',UserController.ForgetPasswordButton)
router.get('/logoutuser',Userauth.verifyToken,UserController.logoutUser)
router.get('/Shop',UserController.GetShopPage)
router.get('/Shop/:category',UserController.GetProductsCategory)
router.post('/SearchProducts',UserController.SearchProducts)
router.get('/Cart',UserController.GetCartPage)
router.get('/Wishlist',UserController.GetWishListPage)
router.get('/addToCart/:productId',UserController.AddToCart)
router.get('/addToWishList/:productId',UserController.AddToWishlist)
router.get('/addToCartWishList/:productId',UserController.AddToCartFromWishlist)
router.get('/DeleteWishList/:ProductId',UserController.DeleteWishList)
router.get('/DeleteFromCart/:ProductId',UserController.DeleteFromcart)
router.post('/updateQuantity',UserController.updateQuantity);
router.get('/products-details/:ProductId',UserController.GetProductDetailsPage);
router.get('/Contact',UserController.GetContactPage)
router.get('/About',UserController.GetAboutPage)
router.get('/MyAccount',UserController.MyAccount)
router.get('/Checkout',UserController.GetCheckOutPage)
router.post('/Addressform',UserController.AddressForm)
router.post('/Ordersubmit',UserController.OrderSubmit)


module.exports = router;