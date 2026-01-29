
const User=require("../model/user.js");


const renderSignUp=(req,res)=>{
    res.render("users/signup.ejs")
}


const signup=async (req, res) => {
        try{
            let {username , email, password} = req.body;
        const newUser=User({username,email});
        const registeredUser =await User.register(newUser,password);
    //    console.log(registeredUser);
       req.login(registeredUser,(err)=>{
        if (err) {
            return next();
            
        }
  req.flash("success","Welcome to Wanderlust")
    res.redirect("/listings")
       })
  
    }
        catch(e){
            req.flash("error", e.message);
            res.redirect("/signup")

        }
 
}
const login=(req,res)=>{
    res.render("users/login.ejs")
}

const renderLogin=async(req,res)=>{
        req.flash("success","Welcome back to wanderlust!");
        let redirectUrl=res.locals.redirectUrl || "listings";
        res.redirect(redirectUrl);

}



const logout=(req, res, next)=>{
    req.logOut((err)=>
    { if (err) {
        return next(err);
        
    }
    req.flash("success","you are loggout!")
    res.redirect("/listings")

    })
}

module.exports={signup,renderSignUp,login,renderLogin,logout}