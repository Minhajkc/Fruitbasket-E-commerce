const express = require('express');
const router = express.Router();
const AdminControllerz = require('../controller/Controlleradmin');
const adminAuth = require('../middlewares/admin');
const { upload } = require('../config/multer');



router.get('/',adminAuth.isAuthenticated,adminAuth.authenticateloginpage,AdminControllerz.GetAdminLogin);
router.post('/adminloginpage',AdminControllerz.AdminloginHandler)
router.get('/adminloginpage' ,adminAuth.authenticate,AdminControllerz.AdminIndexPage)
router.get('/adminhomepage' ,adminAuth.authenticate,AdminControllerz.AdminhomePage)
router.post('/statuscheck',AdminControllerz.statuschecking)
router.post('/add-product', upload.single('productImage'), AdminControllerz.addproduct)
router.post('/product-disable',AdminControllerz.DisableProduct)
router.post('/get-edit',AdminControllerz.GetEditPage)
router.post('/productedit',upload.single('productImage'),AdminControllerz.EditProduct)
router.get('/logoutadmin',AdminControllerz.logoutadmin)
router.get('/Userslistpageadmin',adminAuth.authenticate,AdminControllerz.AdminUserListPage)
router.get('/Productslistpageadmin',adminAuth.authenticate,AdminControllerz.ProductListPage)
router.get('/Productorders',adminAuth.authenticate,AdminControllerz.ProductsOrderPage)
router.post('/orderstatus',AdminControllerz.orderstatus)
router.get('/Productorderstable',adminAuth.authenticate,AdminControllerz.ProductsOrderTablePage)
router.post('/getOrderDetails',AdminControllerz.getOrderDetails)
router.get('/user-data',adminAuth.authenticate,AdminControllerz.UserData)
router.get('/Coupons',adminAuth.authenticate,AdminControllerz.addCoupons)
router.post('/addCoupon',AdminControllerz.addCoupon)
router.get('/deleteCoupon',adminAuth.authenticate,AdminControllerz.deleteCoupon)
router.get('/sales-data',adminAuth.authenticate,AdminControllerz.barChart)
router.get('/top-selling-products',adminAuth.authenticate,AdminControllerz.topSellingProduct)
router.get('/status-data',adminAuth.authenticate,AdminControllerz.statusData)
router.post('/salesReportForm',AdminControllerz.salesReportForm)

module.exports = router;
