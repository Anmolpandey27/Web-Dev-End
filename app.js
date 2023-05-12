const express = require("express");
const app = express();
if(process.env.NODE_ENV != "production"){

    require("dotenv").config({ path: "./config.env"})
  }
const path = require("path")
const mongoose = require("mongoose");
const User = require("./models/User")
const bcrypt = require('bcrypt');
const session = require("express-session");
const passport = require("passport");
var LocalStrategy = require('passport-local');
const dbUrl = process.env.DB_URI


const port = process.env.PORT || 5000

const sessionSecret = process.env.SESSION_SECRET || 'this is a secret session'

//Connect to DB
mongoose.connect(dbUrl, { useNewUrlParser: true,useUnifiedTopology: true})
.then(()=> console.log(" DB CONNECTED!"))
.catch((err)=> console.log(err));

const sessionflash = {
    secret: sessionSecret,
    resave: false,
    saveUninitialized: true,
    cookie: {

      httpOnly:true,
      expires: Date.now()  + 7 *24*60*60*1000
    }
  };


  app.use(session(sessionflash))
  app.use(flash());
  app.use(passport.authenticate('session'));


passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());



  app.use((req, res, next) => {

    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error');
    res.locals.currentUser = req.user;
    next();

  });
  

app.set("views", path.join(__dirname, "views"))
app.set("view engine", "ejs");


app.use(express.urlencoded({extended:true}))
app.use(session({
    secret: 'keyboard',
    resave: false,
    saveUninitialized: true,
    store: new MongoDBStore({
        uri: DB_URI,
        collection: 'myTweets'
      }),

      cookie: {

        httpOnly:true,
        maxAge: 7*24*60*60*1000

      }
  }))



  let requireLogin = (req,res,next)=>{

    if(!req.session.user_id){

        return res.redirect("/home",{
            user: req.user, isLoggedIn: req.isLogged
       })
    }
 next();

  }



app.get("/",(req,res)=>{

    res.render("home",{
        user: req.user, isLoggedIn: req.isLogged
   })

})

app.get("/signup",(req,res)=>{

    res.render("signup");


})

app.post("/signup", async(req,res)=>{

    const {username, password ,image } = req.body;

    const salt = await bcrypt.genSalt(12);

    const hash = await bcrypt.hash(password, salt);

    await User.create({username , hash});

    res.redirect("/login")


})

app.get("/login", passport.authenticate("local", {

    failureRedirect: "/login" ,
    failureFlash: "Login error,please try again!"

}), (req,res)=>{

   req.flash("success", `${req.user.username.toUpperCase()}, your login was successfull`)

   res.redirect("/home")

})


app.post("/login", async(req,res)=>{

   const {username,password} = req.body;

   const foundUser = await User.findOne({username});

   console.log(foundUser)

   if(!foundUser){

     return res.redirect("/signup")

   }

   const validUser = await bcrypt.compare(password , foundUser.hash);

   if(!validUser){

    return res.send("inncorrect password entered")

   }

   req.session.user_id = foundUser._id

    return res.redirect("/home",{
        user: req.user, isLoggedIn: req.isLogged
   })

})


app.get("/logout", (req,res)=>{

    req.session.destroy();

    res.send("please login first")




})

app.get("/home", requireLogin , (req,res)=>{


    // res.send(" you have successfully entered dashboard");
    res.render("home");

})


app.listen(port, ()=>{

    console.log("server running");

})

