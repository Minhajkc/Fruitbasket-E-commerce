const express = require('express');


const UserController = require('../controller/UserController');
const Userauth = require('../middlewares/Usersauth')



const router = express.Router();



router.get('/',Userauth.verifyToken1,UserController.GetHomePage);
router.get('/home',Userauth.verifyToken,UserController.GetHomePage)
router.get('/UserLogin',Userauth.verifyToken1,UserController.GetLoginPage);
router.get('/UserRegister',Userauth.verifyToken1,UserController.GetRegisterPage);
router.post('/UserRegForm',UserController.PostUserRegister)
router.post('/OtpVerification',UserController.OTPVerify)
router.post('/UserLogin',UserController.Userlogin)
router.get('/ForgotPassword',UserController.GetForgotPasswordPage)
router.post('/sendOTP',UserController.SendOTP)
router.post('/ForgetPasswordButton',UserController.ForgetPasswordButton)
router.get('/logoutuser',Userauth.verifyToken,UserController.logoutUser)
router.get('/Shop',UserController.GetShopPage)


module.exports = router;