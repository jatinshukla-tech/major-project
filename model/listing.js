const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const Review = require("./reviews.js");
const Booking = require("./booking.js"); // ✅ for cascade delete

const listingSchema = new Schema({
  title: {
    type: String,
    required: true,
  },

  description: String,

  image: {
    url: String,
    filename: String,
  },

  price: {
    type: Number,
    required: true
  },

  location: {
    type: String,
    required: true
  },

  country: {
    type: String,
    required: true
  },

  // ✅ CATEGORY FIELD (FOR TAG FILTER)
  category: {
    type: String,
    enum: [
      "Amazing Views",
      "Trending",
      "Bed & Breakfasts",
      "Boat",
      "Farms",
      "Arctic",
      "Camping",
      "Amazing Pools",
      "Castles"
    ],
    required: true
  },

  // ✅ MAP COORDINATES
  lat: Number,
  lng: Number,

  reviews: [{
    type: Schema.Types.ObjectId,
    ref: "Review",
  }],

  owner: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true
  }
});


// ✅ CASCADE DELETE REVIEWS & BOOKINGS
listingSchema.post("findOneAndDelete", async (listing) => {
  if (listing) {
    await Review.deleteMany({ _id: { $in: listing.reviews } });
    await Booking.deleteMany({ listing: listing._id });
  }
});

const Listing = mongoose.model("Listing", listingSchema);
module.exports = Listing;
