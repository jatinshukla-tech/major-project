if (process.env.NODE_ENV !="production") {
    require('dotenv').config()
}

const bookingRoutes = require("./routes/booking.js");
const express = require('express');
const port = 8080;
const mongoose = require("mongoose");
const path = require("path")
const methodOverride=require("method-override");
const ejsMate= require("ejs-mate");
const ExpressError=require("./utils/ExpressError.js");
const listingsRouter = require('./routes/listing.js')
const reviewsRouter=require('./routes/review.js')
const session = require('express-session')
const MongoStore = require("connect-mongo");
const flash = require('connect-flash');
const passport = require ("passport");
const LocalStrategy= require("passport-local");
const User = require("./model/user.js");
const { log } = require('console');
const app=express();
const userRouter=require("./routes/user.js");
const {isLoggedIn}=require("./middleware.js")


const MONGO_URL="mongodb://127.0.0.1:27017/wanderlusts";
const dbUrl=process.env.ATLASDB_URL ;

main().
then(()=>{
    console.log("Db connected");
    
}
).catch((err)=>{
    console.log(err);
    
})

async function main() {
    await mongoose.connect(dbUrl);
}

app.set("view engine","ejs")
app.set("views",path.join(__dirname,"views"))
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.use((req, res, next) => {
  res.locals.currentPath = req.path;
  next();
});
app.engine('ejs', ejsMate);
app.use(express.static(path.join(__dirname,"public")));


const sessionOption={
    
    secret:process.env.SESSION_SECRET,
    resave:false,
    saveUninitialized:true,
    cookie:{
        expires:Date.now() + 7 *24*60*60*1000,
        maxAge:7*24*60*60*1000,
        httpOnly:true,
    }
}


// app.get('/', (req, res) => {
//     res.send('Hello World!');
// });


app.use(session(sessionOption));
app.use(flash());

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()))

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req,res,next)=>{
    res.locals.success=req.flash("success")
    res.locals.error=req.flash("error")
    res.locals.currUser=req.user;
    next();
})


// app.get("/demo", async (req, res) => {
//   const fakeUser = new User({
//     email: "fakeuser123",
//     username: "delata-user"
//   });

//   try {
//     const registeredUser = await User.register(fakeUser, "helloworld");
//     res.send(registeredUser);
//   } catch (err) {
//     console.error(err);
//     res.status(500).send("Registration failed");
//   }
// });






app.use("/listings",listingsRouter);
app.use("/listings/:id/reviews",reviewsRouter);
app.use("/",userRouter)

app.use("/book", bookingRoutes);






    app.all("/*splat",(req, res, next)=>{
        next(new ExpressError(404,"Page not found!"))
    })
    
app.use(( err , req , res , next)=>{
   let { statusCode=500, message="Something went wrong"} = err;
   res.status(statusCode).render("listings/error.ejs",{ message })

});




app.listen(port, () => {
    console.log(`Example app listening on port ${port}`);
});
