const multer = require('multer');
const fs = require('fs');
const path = require('path');

// Define the destination directory
const uploadDirectory = 'uploads/';

// Ensure that the destination directory exists
if (!fs.existsSync(uploadDirectory)) {
    fs.mkdirSync(uploadDirectory);
}

// Set up multer storage
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadDirectory);
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + '-' + file.originalname);
    }
});

// Set up multer middleware
const upload = multer({ 
    storage: storage,
    fileFilter: function (req, file, cb) {
        // Check if the field name is correct
        if (file.fieldname === 'productImage') {
            cb(null, true); // Accept the file
        } else {
            cb(new Error('Unexpected field')); // Reject the file
        }
    }
});


module.exports = {
    upload
};
