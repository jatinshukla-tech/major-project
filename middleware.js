const Listing = require("./model/listing.js");
const Review = require("./model/reviews.js");
const ExpressError = require("./utils/ExpressError.js");
const { listingSchema, reviewSchema } = require("./schema.js");


// ============================
// LOGIN CHECK
// ============================
module.exports.isLoggedIn = (req, res, next) => {
  if (!req.isAuthenticated || !req.isAuthenticated()) {
    req.session.redirectUrl = req.originalUrl;
    req.flash("error", "You must be logged in first!");
    return res.redirect("/login");
  }
  next();
};


// ============================
// SAVE REDIRECT URL
// ============================
module.exports.saveRedirectUrl = (req, res, next) => {
  if (req.session.redirectUrl) {
    res.locals.redirectUrl = req.session.redirectUrl;
    delete req.session.redirectUrl; // ✅ prevent infinite redirect
  }
  next();
};


// ============================
// OWNER CHECK
// ============================
module.exports.isOwner = async (req, res, next) => {
  const { id } = req.params;

  const listing = await Listing.findById(id);
  if (!listing) {
    req.flash("error", "Listing not found");
    return res.redirect("/listings");
  }

  if (!req.user || !listing.owner.equals(req.user._id)) {  // ✅ safer check
    req.flash("error", "You are not the owner of this listing");
    return res.redirect(`/listings/${id}`);
  }

  next();
};


// ============================
// LISTING VALIDATION (JOI)
// ============================
module.exports.validatelisting = (req, res, next) => {
  const { error } = listingSchema.validate(req.body.listing);

  if (error) {
    const errMsg = error.details.map(el => el.message).join(", ");
    return next(new ExpressError(errMsg, 400)); // ✅ status code correct
  }

  next();
};


// ============================
// REVIEW VALIDATION (JOI)
// ============================
module.exports.validReview = (req, res, next) => {
  const { error } = reviewSchema.validate(req.body.review);

  if (error) {
    const errMsg = error.details.map(el => el.message).join(", ");
    return next(new ExpressError(errMsg, 400));
  }

  next();
};


// ============================
// REVIEW AUTHOR CHECK
// ============================
module.exports.isReviewAuthor = async (req, res, next) => {
  const { id, reviewId } = req.params;

  const review = await Review.findById(reviewId);
  if (!review) {
    req.flash("error", "Review not found");
    return res.redirect(`/listings/${id}`);
  }

  if (!req.user || !review.author.equals(req.user._id)) { // ✅ safer
    req.flash("error", "You are not the author of this review");
    return res.redirect(`/listings/${id}`);
  }

  next();
};
