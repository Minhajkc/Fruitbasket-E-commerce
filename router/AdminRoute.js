const express = require('express');
const AdminControllerz = require('../controller/adminController');
const adminAuth = require('../middlewares/admin');
const { upload } = require('../config/multer');
const router = express.Router();


router.get('/',AdminControllerz.GetAdminLogin);
router.post('/adminloginpage',AdminControllerz.AdminloginHandler)
router.get('/adminloginpage' ,adminAuth.authenticate,AdminControllerz.AdminIndexPage)
router.post('/statuscheck',AdminControllerz.statuschecking)
router.post('/add-product', upload.single('productImage'), AdminControllerz.addproduct)
router.post('/product-delete',AdminControllerz.DeleteProduct)
router.post('/get-edit',AdminControllerz.GetEditPage)
router.post('/productedit',AdminControllerz.EditProduct)
router.get('/logoutadmin',AdminControllerz.logoutadmin)

module.exports = router;
