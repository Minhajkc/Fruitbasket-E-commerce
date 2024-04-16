const express = require('express');
const app = express();
const bcrypt = require('bcrypt');
const uuid = require('uuid');
const jwt = require('jsonwebtoken');
const { cloudinary } = require('../config/cloudinary');
const {upload} = require('../config/multer');
const fs = require('fs')

app.set('view engine', 'hbs');






const Admindb = require('../models/AdminModel');
const User = require('../models/UserModel');
const Products = require('../models/ProductModel')



const GetAdminLogin = (req, res) => {
    return res.render('admin/login-admin'); 
};

const AdminIndexPage = async (req,res)=>{
    const users = await User.find({});
    const products = await Products.find({});
    return res.render('admin/indexadmin',{users,products});

}
const AdminUserListPage = async (req,res)=>{
    const users = await User.find({});
    const products = await Products.find({});
    return res.render('admin/userslist',{users,products})
}

const ProductListPage = async (req,res)=>{
    const users = await User.find({});
    const products = await Products.find({});
    return res.render('admin/Productslists',{users,products})
}



const AdminloginHandler = async (req, res) => {

    
        const { email, password } = req.body; 
        console.log(email, password);

    try {
        const users = await User.find({});
        const products = await Products.find({});
        const admin = await Admindb.findOne({ email });
        if (!admin) {
            res.status(400)
            return res.render('admin/login-admin', { erroru: 'Admin Not found' });
        }
        const passwordMatch = await bcrypt.compare(password, admin.password);
        if (passwordMatch) {
            req.session.adminId =  admin._id
            req.cookies.adminId = admin._id
            return res.render('admin/indexadmin',{users,products});
        } else {
            res.status(400)
            res.render('admin/login-admin', { errorp: 'Incorrect password!' });
        }
    } catch (error) {
        console.error('Error during login:', error);
        return res.status(500).send('Internal Server Error');
    }
    

}

const statuschecking = async (req, res) => {
    const id = req.body.id;
    console.log(id);
    try {
        const user = await User.findById(id);
        
        if (!user) {
            return res.status(404).send('User not found');
        }
    
        console.log('isBlocked:', user.isBlocked); 
        
        if (!user.isBlocked) {
            user.isBlocked = true;
            await user.save();
            res.redirect('/admin/Userslistpageadmin')
        }
        else {
            user.isBlocked = false; 
            await user.save();
            res.redirect('/admin/Userslistpageadmin')
        }
    } catch (error) {
        console.error('Error while checking status:', error);
        res.status(500).send('Internal Server Error');
    }
    
    
}

const addproduct = async (req, res) => {
    try {
        const { name, category, subCategory, brand, manufacture, mrp, sellingPrice, weight, stock, description, advancedDescription, originOfProduct } = req.body;
        const productImage = req.file; // Retrieve the uploaded file from req.file

        // Upload the image to Cloudinary
        const result = await cloudinary.uploader.upload(productImage.path); // Assuming req.file contains the file buffer
        console.log(result.secure_url);

        // Create a new product with the Cloudinary image URL
        const newProduct = new Products({
            name,
            category,
            subCategory,
            brand,
            manufacture,
            mrp,
            sellingPrice,
            weight,
            stock,
            description,
            advancedDescription,
            originOfProduct,
            productImage: result.secure_url// Use the secure URL returned by Cloudinary
            
        });

        // Save the new product to the database
        await newProduct.save();
        
        // Redirect to the admin login page
        res.redirect('/admin/Productslistpageadmin');
    } catch (error) {
        console.error('Error adding product:', error);
        res.status(500).send('Error adding product');
    }
};

const GetEditPage = async (req,res)=>{
    const id = req.body.idedit; 
    try{
        const Product = await Products.findById(id)
        return res.render('Admin/editpage',{Product});
    }catch(e){
        console.log(e);
    }
   
}

const EditProduct = async (req, res) => {
    try {
        const { id, name, category, subCategory, brand, manufacture, mrp, sellingPrice, weight, stock, description, advancedDescription, originOfProduct } = req.body;

        let productImage = '';

        if (req.file) {
            console.log(req.file);
            const result = await cloudinary.uploader.upload(req.file.path);
            productImage = result.secure_url;
            fs.unlinkSync(req.file.path);
        }

        const updatedFields = {
            name,
            category,
            subCategory,
            brand,
            manufacture,
            mrp,
            sellingPrice,
            weight,
            stock,
            description,
            advancedDescription,
            originOfProduct
        };

        if (productImage) {
            updatedFields.productImage = productImage;
        }

        const updatedProduct = await Products.findByIdAndUpdate(id, updatedFields, { new: true });

        // Redirect to the product list page after successful update
        res.redirect('/admin/Productslistpageadmin');
    } catch (error) {
        console.error('Error updating product:', error);
        res.status(500).send('Error updating product');
    }
}


const DisableProduct = async (req,res)=>{
    const id = req.body.id;
    console.log(id);
    try {
        const product = await Products.findById(id);
        
        if (!product) {
            return res.status(404).send('Product not found');
        }
    
        console.log('isDisabled:', product.isDisabled); 
        
        if (!product.isDisabled) {
            product.isDisabled = true;
            await product.save();
            res.redirect('/admin/Productslistpageadmin')
        }
        else {
            product.isDisabled = false; 
            await product.save();
            res.redirect('/admin/Productslistpageadmin')
        }
    } catch (error) {
        console.error('Error while checking status:', error);
        res.status(500).send('Internal Server Error');
    }
    
}
const logoutadmin = (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            console.error('Error destroying session:', err);
            return res.status(500).send('Internal Server Error');
        }
        res.redirect('/admin/adminloginpage');
    }); 
};

const ProductsOrderPage = async (req, res) => {
    try {

        const usersWithOrders = await User.find({ orders: { $exists: true, $ne: [] } });
        return res.render('Admin/orders', { usersWithOrders });
    } catch (error) {
        // Handle errors
        console.error('Error fetching users with orders:', error);
        res.status(500).send('Internal Server Error');
    }
};


const orderstatus = async (req, res) => {
    try {
        const { orderstatusvalue, orderIddb } = req.body;
  
        const updatedUser = await User.findOneAndUpdate(
            { 'orders.orderId': orderIddb },
            { $set: { 'orders.$.status': orderstatusvalue } },
            { new: true }
        );
        if (!updatedUser) {
            return res.status(404).send('Order not found');
        }

        res.redirect('/admin/Productorderstable'); 
    } catch (error) {
        // Handle errors
        console.error('Error updating order status:', error);
        res.status(500).send('Internal Server Error');
    }
};


const ProductsOrderTablePage = async (req,res) => {
    
    try {
        const usersWithOrders = await User.find({ orders: { $exists: true, $ne: [] } });

        return res.render('admin/Orderstable',{usersWithOrders})
    } catch (error) {
        // Handle errors
        console.error('Error fetching users with orders:', error);
        res.status(500).send('Internal Server Error');
    }
}

const getOrderDetails = async (req, res) => {
    const orderId = req.body.productID; // Assuming OrderID is lowercase in your schema
    const userId = req.body.userid;
   
    try {
        const user = await User.findOne({ _id: userId }); // Assuming userId is the user's ObjectId

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        
        const order = user.orders.find(order => order.orderId === orderId);

        if (!order) {
            return res.status(404).json({ error: 'Order not found' });
        } else {
            res.status(200)
            res.json({ order });
        }
    } catch (error) {
        console.error('Error fetching order details:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

const UserData = async (req, res) => {
    try {
        // Aggregate to count the total number of orders across all users
        const orderAggregate = await User.aggregate([
            { $unwind: '$orders' }, // Unwind the orders array to get each order as a separate document
            { $group: { _id: null, totalOrders: { $sum: 1 } } } // Group by null to calculate the total count of orders
        ]);

        // Extract the totalOrders value from the aggregation result
        const totalOrders = orderAggregate.length > 0 ? orderAggregate[0].totalOrders : 0;

        // Fetch user count from your user collection
        const userCount = await User.countDocuments();

        // Process the data as needed for the doughnut chart
        const userData = {
            labels: ['User Count', 'Orders Count'],
            datasets: [{
                label: 'User Data',
                backgroundColor: ['#ffcc00', '#00cc66'], // Custom colors for the doughnut segments
                data: [userCount, totalOrders]
            }]
        };

        res.json(userData); // Send the processed data back to the client
    } catch (error) {
        console.error('Error fetching user data:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
}

const addCoupons = async (req,res) => {
    const data = await Admindb.find({}, { email: 0, password: 0 });
    res.render('admin/Coupons', { data });
}

const addCoupon = async (req, res) => {
    try {
      
        const { couponQuantity, format, code, expiryDate, discountType, discountValue } = req.body;
        const newCoupon = {
            couponQuantity,
            format,
            code,
            expiryDate,
            discountType,
            discountValue
        };

      
        const admin = new Admindb();
        admin.coupons.push(newCoupon);

   
        await admin.save();

        const data = await Admindb.find({}, { email: 0, password: 0 });
       
        res.render('admin/Coupons', { data });
    } catch (err) {
        // Handle errors
        console.error(err);
        res.status(500).json({ message: 'Internal server error' });
    }

};
const deleteCoupon = async (req, res) => {
    try {
        const couponId = req.query.id; // Get the coupon ID from the query parameter

        // Delete the coupon from the admin's coupons array
        await Admindb.updateOne({ 'coupons._id': couponId }, { $pull: { coupons: { _id: couponId } } });

        // Redirect to the admin/Coupons page after deletion
        res.redirect('/admin/Coupons');
    } catch (err) {
        // Handle errors
        console.error(err);
        res.status(500).json({ message: 'Internal server error' });
    }
};




module.exports = {
    GetAdminLogin,
    AdminloginHandler,
    AdminIndexPage,
    statuschecking,
    addproduct,
    EditProduct,
    DisableProduct,
    GetEditPage,
    logoutadmin,
    AdminUserListPage,
    ProductListPage,
    ProductsOrderPage,
    orderstatus,
    ProductsOrderTablePage,
    getOrderDetails,
    UserData,
    addCoupons,
    addCoupon,
    deleteCoupon
};

//admin@123 password
