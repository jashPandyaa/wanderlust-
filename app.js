if(process.env.NODE_ENV != "production"){
  require('dotenv').config();
}

const express = require("express");
const app = express();
const mongoose = require("mongoose"); 
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const port = 8080;
const session = require("express-session");
const MongoStore = require('connect-mongo');
const flash = require("connect-flash");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const User = require("./models/user.js");

const listingRouter = require("./routes/listings.js");
const reviewsRouter = require("./routes/review.js");
const userRouter = require("./routes/user.js");
const staticRouter = require("./routes/static.js");

const dbUrl = process.env.ATLASDB_URL;

main()
  .then(() => {
    console.log("connected to DB");
  })
  .catch((err) => {
    console.log(err);
  });

async function main() {
  await mongoose.connect(dbUrl);
}

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.engine("ejs", ejsMate);
app.use(express.static(path.join(__dirname, "/public")));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));  

const store = MongoStore.create({
  mongoUrl : dbUrl,
  crypto:  {
    secret : process.env.SECRET,
  },
  touchAfter : 24 * 3600
});

store.on("error", () => {
  console.log("ERROR in MONGO SESSION STORE", err);
});

const sessionOptions = {
  store,
  secret: process.env.SECRET,
  resave : false,
  saveUninitialized : true,
  cookie : {
    expires : Date.now() + 7 * 24 * 60 * 60 * 1000,
    maxAge : 7 * 24 * 60 * 60 * 1000,
    httpOnly : true,
  },
};

app.use(session(sessionOptions));
app.use(flash());

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req,res,next) => {
  res.locals.success = req.flash("success");
  res.locals.error = req.flash("error");
  res.locals.currUser = req.user;
  next();
});

// app.use("/", staticRouter);

app.get("/", (req, res) => {
  res.redirect("/listings");
});

app.use("/listings" , listingRouter);
app.use("/listings/:id/reviews", reviewsRouter);
app.use("/" , userRouter);

app.use((req, res) => {
  res.status(404).send("Page not found");
});

app.use((err, req, res, next) => {
  let { status = 500, message = "Something went wrong!" } = err;
  res.status(status).render("listings/error.ejs" , {message});
});

app.listen(port, () => {
  console.log("Server is listening to port 8080");
});