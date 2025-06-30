const User = require("../models/user.js");

module.exports.renderSignUpForm =  (req,res) => {
    res.render("users/signup.ejs");
};

module.exports.signUp = async (req,res) => {
    try{
        let { username , email , password } = req.body;
        const newUser = new User({ email , username });
        const registerdUser = await User.register(newUser , password);
        console.log(registerdUser);
        req.login(registerdUser, (err) => {
            if( err ){
               return next(err);
            }
            req.flash("success" , "Welcome to Wanderlust!");
            res.redirect("/listings");
        });
    }catch(e){
        req.flash("error", e.message);
        res.redirect("/signup");
    }
};

module.exports.renderLoginForm =  (req,res) => {
    res.render("users/login.ejs");
};

module.exports.login = async (req,res) => {
    req.flash("success" , "Successfully loggedIn, Welcome back to Wanderlust!");
    let redirectUrl = res.locals.redirectUrl || "/listings";
    res.redirect(redirectUrl);
};

module.exports.logout =  (req,res,next) => {
    req.logout((err) => {
        if(err){
            next(err);
        }else{
            req.flash("success" , "You are Logged out!");
            res.redirect("/listings");
        }
    })
};