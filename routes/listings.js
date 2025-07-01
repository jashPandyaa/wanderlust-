const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync.js");
const Listing = require("../models/listing.js");
const { isLoggedIn, isOwnerOrAdmin, validateListing } = require("../middleware.js");
const listingController = require("../controllers/listings.js");
const multer = require('multer');
const { storage } = require("../cloudConfig.js");
const upload = multer({ storage });

// Index and Create routes
router.route("/")
  .get(wrapAsync(listingController.index))
  .post(
    isLoggedIn,
    upload.single('listing[image][url]'),
    validateListing,
    wrapAsync(listingController.createListing)
  );

// New Route
router.get("/new", isLoggedIn, listingController.renderNewForm);

// Show, Update and Delete routes
router.route("/:id")
  .get(wrapAsync(listingController.showListing))
  .put(
    isLoggedIn,
    isOwnerOrAdmin,  // Changed from isOwner
    upload.single('listing[image][url]'),
    validateListing,
    wrapAsync(listingController.updateListing)
  )
  .delete(
    isLoggedIn,
    isOwnerOrAdmin,  // Changed from isOwner
    wrapAsync(listingController.destroyListing)
  );

// Edit route
router.get("/:id/edit", 
  isLoggedIn,
  isOwnerOrAdmin,  // Changed from isOwner
  wrapAsync(listingController.renderEditForm)
);

// Admin route
router.get("/admin/all", 
  isLoggedIn,
  isAdmin,
  wrapAsync(listingController.adminIndex)
);

module.exports = router;