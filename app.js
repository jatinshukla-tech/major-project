if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}

const express = require("express");
const app = express();
const path = require("path");
const mongoose = require("mongoose");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const ExpressError = require("./utils/ExpressError.js");
const MongoStore = require("connect-mongo");

const session = require("express-session");
const flash = require("connect-flash");

const passport = require("passport");
const LocalStrategy = require("passport-local");
const User = require("./model/user.js");

// Routes
const listingsRouter = require("./routes/listing.js");
const reviewsRouter = require("./routes/review.js");
const userRouter = require("./routes/user.js");
const bookingRoutes = require("./routes/booking.js");

// =======================
// DATABASE
// =======================

const dbUrl = process.env.ATLASDB_URL;

if (!dbUrl) {
  console.error("❌ ATLASDB_URL is missing");
  process.exit(1);
}

console.log("NODE_ENV =", process.env.NODE_ENV);
console.log("ATLASDB_URL =", "Loaded Successfully");

mongoose
  .connect(dbUrl)
  .then(() => console.log("✅ MongoDB Connected"))
  .catch((err) => console.log("❌ Mongo Error:", err));

// =======================
// VIEW ENGINE
// =======================

app.engine("ejs", ejsMate);
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.use(express.static(path.join(__dirname, "public")));

// =======================
// SESSION
// =======================

const store = MongoStore.create({
  mongoUrl: dbUrl,
  touchAfter: 24 * 3600,
});

store.on("error", (err) => {
  console.log("Session Store Error:", err);
});

const sessionOptions = {
  store,
  name: "wanderlust-session",
  secret: process.env.SESSION_SECRET || "devsecret",
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    maxAge: 7 * 24 * 60 * 60 * 1000,
  },
};

app.use(session(sessionOptions));
app.use(flash());

// =======================
// PASSPORT
// =======================

app.use(passport.initialize());
app.use(passport.session());

passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// =======================
// GLOBAL LOCALS
// =======================

app.use((req, res, next) => {
  res.locals.success = req.flash("success");
  res.locals.error = req.flash("error");
  res.locals.currUser = req.user;
  res.locals.category = req.query.category || "";
  res.locals.currentPath = req.path;
  next();
});

// =======================
// ROUTES
// =======================

// Home Route
app.get("/", (req, res) => {
  res.redirect("/listings");
});

app.use("/listings", listingsRouter);
app.use("/listings/:id/reviews", reviewsRouter);
app.use("/", userRouter);
app.use("/book", bookingRoutes);

// =======================
// ERROR HANDLING
// =======================

app.all("*", (req, res, next) => {
  next(new ExpressError("Page not found!", 404));
});

app.use((err, req, res, next) => {
  console.error(err);

  const { statusCode = 500, message = "Something went wrong" } = err;

  res.status(statusCode).render("listings/error.ejs", {
    message,
  });
});

// =======================
// SERVER
// =======================

const PORT = process.env.PORT || 8080;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});