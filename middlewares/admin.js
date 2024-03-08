
const authenticate = (req, res, next) => {
    if (req.session.adminId) { 
        next()
    } else {
       res.redirect('/admin');
    }
};
module.exports={
    authenticate
}

