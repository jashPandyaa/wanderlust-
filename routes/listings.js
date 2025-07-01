const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync.js");
const Listing = require("../models/listing.js");
const {isLoggedIn , isOwner, validateListing, isAdmin} = require("../middleware.js");
const listingController = require("../controllers/listings.js");
const multer  = require('multer');
const { storage } = require("../cloudConfig.js");
const upload = multer({ storage });

//Index route //Create Route
router.route("/")
  .get(wrapAsync(listingController.index))
  .post(isLoggedIn , validateListing, upload.single('listing[image][url]'),
  wrapAsync(listingController.createListing));

//New Route
router.get("/new", isLoggedIn , listingController.renderNewForm);

//Show , Update and delete route  
router.route("/:id")
  .get(wrapAsync(listingController.showListing))
  .put(
    isLoggedIn,
    isOwner || isAdmin,  
    upload.single('listing[image][url]'),   
    validateListing,
    wrapAsync(listingController.updateListing)
  )  
  .delete(isLoggedIn, isOwner || isAdmin, wrapAsync(listingController.destroyListing));

router.get("/admin/all", isLoggedIn, isAdmin, wrapAsync(listingController.adminIndex));

//edit route
router.get("/:id/edit", isLoggedIn , isOwner , wrapAsync(listingController.renderEditForm));

module.exports = router;