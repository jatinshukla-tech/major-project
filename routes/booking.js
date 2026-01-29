const express = require("express");
const router = express.Router();
const { isLoggedIn } = require("../middleware");
const Listing = require("../model/listing.js");
const Booking = require("../model/booking.js");

// ============================
// SHOW BOOKING PAGE
// ============================
router.get("/:id", isLoggedIn, async (req, res) => {
  const listing = await Listing.findById(req.params.id);

  if (!listing) {
    req.flash("error", "Listing not found");
    return res.redirect("/listings");
  }

  // ❌ Owner cannot book own listing
  if (listing.owner && listing.owner.equals(req.user._id)) {
    req.flash("error", "You cannot book your own listing");
    return res.redirect(`/listings/${listing._id}`);
  }

  res.render("bookings/new.ejs", { listing });
});

// ============================
// CREATE BOOKING
// ============================
router.post("/:id", isLoggedIn, async (req, res) => {
  const { checkIn, checkOut } = req.body;

  if (!checkIn || !checkOut) {
    req.flash("error", "Please select valid dates");
    return res.redirect("back");
  }

  const listing = await Listing.findById(req.params.id);

  if (!listing) {
    req.flash("error", "Listing not found");
    return res.redirect("/listings");
  }

  // ❌ Owner cannot book own listing
  if (listing.owner && listing.owner.equals(req.user._id)) {
    req.flash("error", "You cannot book your own listing");
    return res.redirect(`/listings/${listing._id}`);
  }

  const days =
    (new Date(checkOut) - new Date(checkIn)) / (1000 * 60 * 60 * 24);

  if (days <= 0) {
    req.flash("error", "Check-out date must be after check-in date");
    return res.redirect("back");
  }

  const totalPrice = days * listing.price;

  const booking = new Booking({
    user: req.user._id,
    listing: listing._id,
    checkIn,
    checkOut,
    totalPrice
  });

  await booking.save();

  req.flash("success", "Booking Confirmed!");
  res.redirect("/book");   // My bookings page
});

// ============================
// MY BOOKINGS PAGE
// ============================
router.get("/", isLoggedIn, async (req, res) => {
  const bookings = await Booking.find({ user: req.user._id })
    .populate("listing");

  res.render("bookings/index.ejs", { bookings });
});

module.exports = router;
