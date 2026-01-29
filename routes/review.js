const express = require ("express");
const router=express.Router({mergeParams:true});
const wrapAsync= require("../utils/wrapAsync.js")
const {validReview,isLoggedIn,isReviewAuthor}=require("../middleware.js");
const { Postreview, destoryReview } = require("../controllers/review.js");



//REVIEWS
//POST REVIEWS



router.post("/",isLoggedIn,validReview, wrapAsync (Postreview))

// Delete Review Route


router.delete("/:reviewId",isLoggedIn,isReviewAuthor,wrapAsync(destoryReview))


module.exports=router;