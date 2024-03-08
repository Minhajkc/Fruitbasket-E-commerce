const express = require('express');


const UserController = require('../controller/UserController');



const router = express.Router();



router.get('/', UserController.GetHomePage);
router.get('/UserLogin', UserController.GetLoginPage);
router.get('/UserRegister', UserController.GetRegisterPage);
router.post('/UserRegForm',UserController.PostUserRegister)
router.post('/OtpVerification',UserController.OTPVerify)
router.post('/UserLogin',UserController.Userlogin)
router.get('/ForgotPassword',UserController.GetForgotPasswordPage)
router.post('/sendOTP',UserController.SendOTP)
router.post('/ForgetPasswordButton',UserController.ForgetPasswordButton)


module.exports = router;