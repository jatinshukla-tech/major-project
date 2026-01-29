const exprees=require("express");
const routes=exprees.Router()
const wrapAsync = require("../utils/wrapAsync");
const passport = require("passport");
const {saveRedirectUrl}= require("../middleware.js")
const {signup,renderSignUp, login, renderLogin, logout}=require("../controllers/user.js");


routes.route("/signup").get(renderSignUp).post( wrapAsync(signup));

routes.route("/login").get(login).post( 
    saveRedirectUrl,
    passport.authenticate("local"
        ,{failureRedirect:"/login", 
            failureFlash:true})
    ,renderLogin);


routes.get("/logout",logout)

module.exports=routes;