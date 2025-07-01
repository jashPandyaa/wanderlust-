const Listing = require("../models/listing.js");
const mbxGeocoding= require('@mapbox/mapbox-sdk/services/geocoding');
const mapToken = process.env.MAP_TOKEN;
const geocodingClient = mbxGeocoding({ accessToken: mapToken });

module.exports.index = async (req, res) => {
  let { search, category } = req.query;
  let allListings;
  let query = {};
  
  if (search) {
    search = search.trim();
    if (search === '') {
      req.flash('searchError', 'Please enter a search term');
      return res.redirect('/listings');
    }
    
    if (search.length < 2) {
      req.flash('searchError', 'Please enter at least 2 characters');
      return res.redirect('/listings');
    }
    
    query.$or = [
      { title: { $regex: search, $options: 'i' } },
      { location: { $regex: search, $options: 'i' } },
      { country: { $regex: search, $options: 'i' } }
    ];
  }
  
  if (category) {
    query.category = category;
  }
  
  allListings = await Listing.find(query);
  
  if (search && allListings.length === 0) {
    req.flash('searchError', `No listings found for "${search}"`);
  }
  
  res.render("listings/index.ejs", { allListings, search, currentCategory: category });
};


module.exports.renderNewForm = (req, res) => {
    res.render("listings/new.ejs");
};

module.exports.showListing = async (req, res) => {
    let { id } = req.params;
    const listing = await Listing.findById(id)
      .populate({path : "reviews",
        populate : {
          path : "author",
        },
      })
      .populate("owner");
    if(listing){
      res.render("listings/show.ejs", { listing });
    }
    else{
      req.flash("error", "Listing you requested for doesn't exist!");
      res.redirect("/listings");
    }
};

module.exports.createListing = async (req, res, next) => {
    let response = await geocodingClient.forwardGeocode({
      query: req.body.listing.location,
      limit: 1,
    })
    .send();

    let url = req.file.path;
    let filename = req.file.filename;
    const newListing = new Listing(req.body.listing);
    newListing.owner = req.user._id;
    newListing.image = {url , filename};

    newListing.geometry = response.body.features[0].geometry;

    let savedListing = await newListing.save();
    console.log(savedListing);
    req.flash("success", "New Listing Created!");
    res.redirect("/listings");
};


module.exports.renderEditForm = async (req, res) => {
    let { id } = req.params;
    const listing = await Listing.findById(id);
    if( listing ){
      res.render("listings/edit.ejs", { listing});
    }else{
      req.flash("error", "Listing you requested for doesn't exist!");
      res.redirect("/listings");
    }
};

module.exports.updateListing = async (req, res) => {
  let { id } = req.params;
  let listing = await Listing.findById(id);
  
  // If location is being updated, get new coordinates
  if (req.body.listing.location !== listing.location) {
      let response = await geocodingClient.forwardGeocode({
          query: req.body.listing.location,
          limit: 1,
      }).send();
      
      listing.geometry = response.body.features[0].geometry;
  }
  
  listing.title = req.body.listing.title;
  listing.description = req.body.listing.description;
  listing.price = req.body.listing.price;
  listing.country = req.body.listing.country;
  listing.location = req.body.listing.location;
  listing.category = req.body.listing.category;
  
  if (typeof req.file !== "undefined") {
      let url = req.file.path;
      let filename = req.file.filename;
      listing.image = {url, filename};
  }
  
  await listing.save();
  
  req.flash("success", "Listing Updated!");
  res.redirect(`/listings/${id}`);
};


module.exports.destroyListing = async (req, res) => {
    let { id } = req.params;
    let deletedListing = await Listing.findByIdAndDelete(id);
    console.log(deletedListing);
    req.flash("success", "Listing Deleted!");
    res.redirect("/listings");
};

module.exports.adminIndex = async (req, res) => {
  const allListings = await Listing.find({}).populate("owner");
  res.render("listings/admin-index.ejs", { allListings });
};