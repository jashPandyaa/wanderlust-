const express = require("express");
const router = express.Router();
const User = require("../models/user.js");
const wrapAsync = require("../utils/wrapAsync");
const passport = require("passport");
const { saveRedirectUrl } = require("../middleware.js");

const userController = require("../controllers/users.js");

router.route("/signup")
    .get(userController.renderSignUpForm)
    .post(wrapAsync (userController.signUp));

router.route("/login")
    .get(userController.renderLoginForm)
    .post(saveRedirectUrl , //if this middleware work then & then we'll go ahead!
        passport.authenticate("local" , { failureRedirect: '/login' , failureFlash: true}),
        userController.login);
        
router.get("/logout" ,userController.logout);

// Add this temporary route (REMOVE AFTER USE)
router.get("/make-admin", async (req, res) => {
    try {
        // Replace with your actual email
        const adminEmail = "your-personal-email@gmail.com"; 
        const user = await User.findOneAndUpdate(
            { email: adminEmail },
            { $set: { isAdmin: true } },
            { new: true }
        );
        
        if (!user) {
            req.flash("error", "User not found");
            return res.redirect("/listings");
        }
        
        req.flash("success", "You are now an admin!");
        res.redirect("/listings/admin/all");
    } catch (e) {
        req.flash("error", e.message);
        res.redirect("/listings");
    }
});

module.exports = router;