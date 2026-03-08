const jwt = require('jsonwebtoken');

const SECRET = "secret123";

const authMiddleware = (req,res,next)=>{

    const token = req.cookies.token;

    if(!token){
        return res.redirect('/login');
    }

    try{
        const decoded = jwt.verify(token,SECRET);
        req.user = decoded;
        next();
    }
    catch(err){
        res.redirect('/login');
    }
};

module.exports = authMiddleware;