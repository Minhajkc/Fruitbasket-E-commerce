const express = require('express');
const app = express();
const bcrypt = require('bcrypt');
const uuid = require('uuid');
const jwt = require('jsonwebtoken');
const { cloudinary } = require('../config/cloudinary');

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
            console.log(req.session.adminId); 
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
            res.redirect('/admin/adminloginpage')
        }
        else {
            user.isBlocked = false; 
            await user.save();
            res.redirect('/admin/adminloginpage')
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
        res.redirect('/admin/adminloginpage');
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

const EditProduct = async (req,res)=>{
    try {

        const { id, name, category, subCategory, brand, manufacture, mrp, sellingPrice, weight, productImage, stock, description, advancedDescription, originOfProduct } = req.body;

        const newProduct = await Products.findByIdAndUpdate(id,{
            name,
            category,
            subCategory,
            brand,
            manufacture,
            mrp,
            sellingPrice,
            weight,
            productImage,
            stock,
            description,
            advancedDescription,
            originOfProduct
        });  
        await newProduct.save();
        res.redirect('/admin/adminloginpage')

    } catch (error) {
        console.error('Error adding product:', error);
        res.status(500).send('Error adding product');
    }
  
}

const DeleteProduct = async (req,res)=>{
    const id = req.body.iddelete; 
    try {
        const deletedProduct = await Products.findByIdAndDelete(id);
    
        if (!deletedProduct) {
            return res.status(404).send('Product not found');
        }
    
        res.redirect('/admin/adminloginpage')
    } catch (error) {
        console.error('Error deleting product:', error);
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



module.exports = {
    GetAdminLogin,
    AdminloginHandler,
    AdminIndexPage,
    statuschecking,
    addproduct,
    EditProduct,
    DeleteProduct,
    GetEditPage,
    logoutadmin
};

//admin@123 password
