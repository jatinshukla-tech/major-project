const axios = require("axios");
const Listing = require("../model/listing.js");

// ============================
// INDEX
// ============================

module.exports.index = async (req, res) => {
  const { search, category } = req.query;

  let filter = {};

  if (search && search.trim() !== "") {
    filter.$or = [
      { title: { $regex: search, $options: "i" } },
      { location: { $regex: search, $options: "i" } },
      { country: { $regex: search, $options: "i" } },
    ];
  }

  if (category && category !== "") {
    filter.category = category;
  }

  const allListings = await Listing.find(filter);

  res.render("listings/index.ejs", {
    allListings,
    search,
    category,
  });
};

// ============================
// NEW FORM
// ============================

module.exports.renderNewForm = (req, res) => {
  res.render("listings/new.ejs");
};

// ============================
// SHOW
// ============================

module.exports.show = async (req, res) => {
  const { id } = req.params;

  const listing = await Listing.findById(id)
    .populate({
      path: "reviews",
      populate: {
        path: "author",
      },
    })
    .populate("owner");

  if (!listing) {
    req.flash("error", "Listing does not exist!");
    return res.redirect("/listings");
  }

  res.render("listings/show.ejs", { listing });
};

// ============================
// CREATE
// ============================

module.exports.create = async (req, res) => {
  const location = req.body.listing.location;

  const geoRes = await axios.get(
    "https://nominatim.openstreetmap.org/search",
    {
      params: {
        format: "json",
        q: location,
      },
      headers: {
        "User-Agent": "wanderlust-app",
      },
    }
  );

  if (!geoRes.data || geoRes.data.length === 0) {
    req.flash("error", "Location not found");
    return res.redirect("/listings/new");
  }

  const lat = Number(geoRes.data[0].lat);
  const lng = Number(geoRes.data[0].lon);

  if (!req.file) {
    req.flash("error", "Image upload failed");
    return res.redirect("/listings/new");
  }

  const { path: url, filename } = req.file;

  const newListing = new Listing(req.body.listing);

  newListing.owner = req.user._id;
  newListing.image = {
    url,
    filename,
  };

  newListing.lat = lat;
  newListing.lng = lng;

  await newListing.save();

  req.flash("success", "New Listing Added!");
  res.redirect("/listings");
};

// ============================
// EDIT
// ============================

module.exports.edit = async (req, res) => {
  const { id } = req.params;

  const listing = await Listing.findById(id);

  if (!listing) {
    req.flash("error", "Listing does not exist!");
    return res.redirect("/listings");
  }

  let previewImage = listing.image.url;

  if (previewImage) {
    previewImage = previewImage.replace(
      "/upload",
      "/upload/w_300"
    );
  }

  res.render("listings/edit.ejs", {
    listing,
    previewImage,
  });
};

// ============================
// UPDATE
// ============================

module.exports.update = async (req, res) => {
  const { id } = req.params;

  let listing = await Listing.findByIdAndUpdate(
    id,
    { ...req.body.listing },
    { new: true }
  );

  if (req.file) {
    const { path: url, filename } = req.file;

    listing.image = {
      url,
      filename,
    };

    await listing.save();
  }

  req.flash("success", "Listing Updated!");
  res.redirect(`/listings/${listing._id}`);
};

// ============================
// DELETE
// ============================

module.exports.removelisting = async (req, res) => {
  const { id } = req.params;

  await Listing.findByIdAndDelete(id);

  req.flash("success", "Listing Deleted!");
  res.redirect("/listings");
};