const express = require("express");
const router = express.Router();

const wrapAsync = require("../utils/wrapAsync");
const passport = require("passport");

const { saveRedirectUrl } = require("../middleware.js");

const {
  signup,
  renderSignUp,
  login,
  renderLogin,
  logout,
} = require("../controllers/user.js");

// =======================
// SIGNUP
// =======================

router
  .route("/signup")
  .get(renderSignUp)
  .post(wrapAsync(signup));

// =======================
// LOGIN
// =======================

router
  .route("/login")
  .get(renderLogin)
  .post(
    saveRedirectUrl,
    passport.authenticate("local", {
      failureRedirect: "/login",
      failureFlash: true,
    }),
    login
  );

// =======================
// LOGOUT
// =======================

router.get("/logout", logout);

module.exports = router;