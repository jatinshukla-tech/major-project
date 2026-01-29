const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync.js");
const { isLoggedIn, isOwner, validatelisting } = require("../middleware.js");
const {
  index,
  renderNewForm,
  show,
  create,
  edit,
  update,
  removelisting
} = require("../controllers/listing.js");

const multer = require("multer");
const { storage } = require("../cloudConfig.js");
const upload = multer({ storage });

router
  .route("/")
  .get(wrapAsync(index))   // ✅ SEARCH HANDLED HERE
  .post(
    isLoggedIn,
    upload.single("listing[image]"),
    validatelisting,
    wrapAsync(create)
  );

router.get("/new", isLoggedIn, renderNewForm);

router.route("/:id")
  .get(wrapAsync(show))
  .put(
    isLoggedIn,
    isOwner,
    upload.single("listing[image]"),
    validatelisting,
    wrapAsync(update)
  )
  .delete(isLoggedIn, isOwner, wrapAsync(removelisting));

router.get("/:id/edit", isLoggedIn, isOwner, wrapAsync(edit));

module.exports = router;
