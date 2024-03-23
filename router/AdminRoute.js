const express = require('express');
const AdminControllerz = require('../controller/adminController');
const adminAuth = require('../middlewares/admin');
const { upload } = require('../config/multer');
const router = express.Router();


router.get('/',adminAuth.authenticateloginpage,AdminControllerz.GetAdminLogin);
router.post('/adminloginpage',AdminControllerz.AdminloginHandler)
router.get('/adminloginpage' ,adminAuth.authenticate,AdminControllerz.AdminIndexPage)
router.post('/statuscheck',AdminControllerz.statuschecking)
router.post('/add-product', upload.single('productImage'), AdminControllerz.addproduct)
router.post('/product-disable',AdminControllerz.DisableProduct)
router.post('/get-edit',AdminControllerz.GetEditPage)
router.post('/productedit',upload.single('productImage'),AdminControllerz.EditProduct)
router.get('/logoutadmin',AdminControllerz.logoutadmin)
router.get('/Userslistpageadmin',AdminControllerz.AdminUserListPage)
router.get('/Productslistpageadmin',AdminControllerz.ProductListPage)
router.get('/Productorders',AdminControllerz.ProductsOrderPage)
router.post('/orderstatus',AdminControllerz.orderstatus)
router.get('/Productorderstable',AdminControllerz.ProductsOrderTablePage)
router.post('/getOrderDetails',AdminControllerz.getOrderDetails)

module.exports = router;
