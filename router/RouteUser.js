const express = require('express');
const router = express.Router();
const UserController = require('../controller/ControllerUser');
const Userauth = require('../middlewares/Usersauth')







router.get('/',Userauth.verifyToken1,UserController.GetHomePage);
router.get('/home',Userauth.verifyToken,UserController.GetHomePage)
router.get('/UserLogin',Userauth.checkLoggedIn,UserController.GetLoginPage);
router.get('/UserLoginPage',Userauth.checkLoggedIn,UserController.GetUserLoginPage);
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
router.post('/Sort',UserController.Sort)
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
router.post('/AddAddressform',UserController.AddAddress)
router.post('/Ordersubmit',UserController.OrderSubmit)
router.get('/getOrderDetails',UserController.OrderDetailsOfusers)
router.get('/DeleteOrderuser',UserController.DeleteOrderUser)
router.post('/razorpayWebhook',UserController.RazorPayCallBack)
router.get('/razorpayWebhook',UserController.razorpayWebhookget)
router.post('/createRazorpayOrder',UserController.createRazorpayOrders)
router.post('/applyCoupon',UserController.ApplyCoupon)
router.get('/getAddressDetails',UserController.Addressedit)
router.post('/saveEditedAddress',UserController.SaveEditedAddress)
router.delete('/deleteAddress',UserController.DeleteAddress)
router.post('/contactform1',UserController.ContactForm)
router.post('/removeFromCart',UserController.removeFromCart)
router.post('/addToCartFromHomepage',UserController.addTocartfromhomepage)
router.post('/addToWishlistfromhome',UserController.addToWishlistfromhome)
router.get('/DeleteFromMainCart/:ProductId',UserController.DeleteFromMaincart)
router.get('/DeleteFromMainWishList/:ProductId',UserController.DeleteMainWishList)
router.get('/addToCartFromProductDetails/:product_id',UserController.addToCartFromProductDetails)
router.get('/AddToWishlistfromproductdetails/:product_id',UserController.AddToWishlistfromproductdetails)





module.exports = router;