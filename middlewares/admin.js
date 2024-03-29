
const authenticate = (req, res, next) => {
    if (req.session.adminId) { 
        next()
    } else {
       res.redirect('/admin');
    }
};

const authenticateloginpage = (req, res, next) => {
    if (req.session.adminId) { 
        res.redirect('/admin/adminloginpage');
    } else {
      next()
    }
};


const isAuthenticated = (req, res, next) => {
    if (req.cookies.userId) {
        return res.redirect('/');
    } else {
        return next();
   
    }
};


module.exports={
    authenticate,
    authenticateloginpage,
    isAuthenticated
}

