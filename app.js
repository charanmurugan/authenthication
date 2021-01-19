require('dotenv').config()/**for assiging environmental variables */
const express= require("express");
const bodyParser= require("body-parser");
const mongoose=require("mongoose");
const bcrypt=require("bcrypt");/**for bcryption */
const app=express();
var encrypt = require('mongoose-encryption');/**for encryption */
const md5 = require('md5');/**for hashing */
 const passport =require('passport');
const session=require('express-session');
 const  findOrCreate=require('mongoose-findorcreate');
const GoogleStrategy = require( 'passport-google-oauth2' ).Strategy;
const  FacebookStrategy=require('passport-facebook').Strategy;

//for static files acess 
app.use(express.static("public"));

//for acess user detail
app.use(bodyParser.urlencoded({
    extended:true
}));

//for ejs files
app.set("view engine","ejs");


app.use(session({
    secret:process.env.Secret_Value,
    resave:false,
    saveUninitialized:false
}));
app.use(passport.initialize());
app.use(passport.session());
//mongoose connection to mongodb

mongoose.connect("mongodb+srv://charanmurugan:Charan2002@charanmurugan.axjh5.mongodb.net/userDB?retryWrites=true&w=majority",{ useNewUrlParser: true , useUnifiedTopology: true, });

// creating schema
const UserSchema= new mongoose.Schema({
    username:String,
    password:String,
    googleId:String,
    facebookId:String,
    secrets:String
});
UserSchema.plugin(findOrCreate);

/** before describing model add the plugin of the mongoose encryption */

 UserSchema.plugin(encrypt,{secret:process.env.Secret_Value,encryptedFields: ['password']});

// create model for the database
const User=new mongoose.model("User",UserSchema);

passport.serializeUser(function(user, done) {
    done(null, user);
  });
  
  passport.deserializeUser(function(user, done) {
    done(null, user);
  });
passport.use(new GoogleStrategy({
    clientID:process.env.Client_Id,
    clientSecret:process.env.Client_Secret,
    callbackURL: "http://localhost:3000/auth/google/secrets",
    passReqToCallback   : true
  },
  function(request, accessToken, refreshToken, profile, done) {
    User.findOrCreate({ googleId: profile.id }, function (err, user) {
      return done(err, user);
    });
  }
));
passport.use(new FacebookStrategy({
    clientID:process.env.FaceBook_App_Id,
    clientSecret: process.env.FaceBook_App_Secret,
    callbackURL: "http://localhost:3000/auth/facebook/secrets"
  },
  function(accessToken, refreshToken, profile, cb) {
    User.findOrCreate({ facebookId: profile.id }, function (err, user) {
      return cb(err, user);
    });
  }
));



app.get("/",function(req,res){
   res.render("home");
});
app.get("/register",function(req,res){
     res.render("register");
});
app.get("/login",function(req,res){
    res.render("login");
});
app.get('/auth/google',
  passport.authenticate('google', { scope:
      [ 'email', 'profile' ] }
));

app.get( '/auth/google/secrets',
    passport.authenticate( 'google', {
        successRedirect: '/secrets',
        failureRedirect: '/login'
}));
app.get('/auth/facebook',
  passport.authenticate('facebook'));

app.get('/auth/facebook/secrets',
  passport.authenticate('facebook', { failureRedirect: '/login' }),
  function(req, res) {
    // Successful authentication, redirect home.
    res.redirect('/secrets');
  });
app.get("/secrets",function(req,res){
   if(req.isAuthenticated()){
    User.find({"secret":{$ne:null}},function(err,foundUser){
		if(err){
			console.log(err)
		}
		else{
			if(foundUser){
				res.render("secrets",{usersWithSecrets:foundUser})
			}
		}
	})
   }else{
       res.redirect("/register");
   }
   
});
app.get("/secretsPage",function(req,res){
    User.find({"secret":{$ne:null}},function(err,foundUser){
		if(err){
			console.log(err)
		}
		else{
			if(foundUser){
				res.render("secrets",{usersWithSecrets:foundUser})
			}
		}
	})
    
 });
 app.get("/submit",function(req,res){
		res.render("submit",{value:"UNDER DEVELOPMENT"});
	
});
app.get('/logout', function(req, res){
    req.logout();
    res.redirect('/');
  });

app.post("/register",function(req,res){
/* <_________________ *******   simple  *********_______________> */
    const user= new User({
        username:req.body.username,
        password:req.body.psw
    })
    user.save(function(err,foundItems){
        if(err){
              console.log(err);
        }else{
            res.render("secrets");
    
        }
    });
/* <_________________ *******   simple  *********_______________> */
/* <_________________ *******   encryption  *********_______________> */

// const user= new User({
//         username:req.body.username,
//         password:req.body.psw
//     })
//     user.save(function(err,foundItems){
//         if(err){
//               console.log(err);
//         }else{
//             res.render("secrets");
//         }
//     });
    /* when save is find it automatically encrypt*/
/* <_________________ *******  encryption  *********_______________> */
/* <_________________ *******  hashing  *********_______________> */

const user= new User({
            username:req.body.username,
            password:md5(req.body.psw)
        })
        user.save(function(err,foundItems){
            if(err){
                  console.log(err);
            }else{
                res.render("secrets");
            }
        });
/* <_________________ *******  hashing  *********_______________> */
/* <_________________ *******  bcrypt  *********_______________> */
    const saltRounds = 10;
    bcrypt.hash(req.body.psw,saltRounds,function(err,hash){
        const user =new User({
            username:req.body.username,
            password:hash
        });
        user.save(function(err){
            if(!err){
                res.redirect("/secrets");
            }
        });
    });
/* <_________________ *******  bcrypt  *********_______________> */
});
app.post("/login",function(req,res){
/* <_________________ *******   simple  *********_______________> */
    User.findOne({username:req.body.username},function(err,fountItems){
             if(err){
                 console.log(err);
             }else{
                 if(fountItems){
                     if(fountItems.password===req.body.psw){
                         res.render("secrets");
                     }else{
                         res.render("login");
                     }
                     
                 }
             }
            });  
/* <_________________ *******   simple  *********_______________> */
/* <_________________ *******  encryption  *********_______________> */
User.findOne({username:req.body.username},function(err,fountItems){
             if(err){
                 console.log(err);
             }else{
                 if(fountItems){
                     if(fountItems.password===req.body.psw){
                         res.render("secrets");
                     }else{
                         res.render("login");
                     }
                     
                 }
             }
            });  
    /* when save is find it automatically decrypt*/
/* <_________________ *******  encryption  *********_______________> */
/* <_________________ *******  hashing  *********_______________> */
         User.findOne({username:req.body.username},function(err,fountItems){
             if(err){
                 console.log(err);
             }else{
                 if(fountItems){
                     if(fountItems.password===md5(req.body.psw)){
                         res.render("secrets");
                     }else{
                         res.render("login");
                     }
                     
                 }
             }
            });   
/* <_________________ *******  hashing  *********_______________> */
/* <_________________ *******  bcrypt  *********_______________> */

User.findOne({username:req.body.username},function(err,fountItems){
     if(err){
         console.log(err);
     }else{
         if(fountItems){
             bcrypt.compare(req.body.psw,fountItems.password,function(err,result){
                if(result==true){
                    res.redirect("/secretsPage");
                }
                else{
                   console.log("invalid login credentials");
                    res.redirect("/login");
                }
             } );
             
         }
     }
    }); 
/* <_________________ *******  bcrypt  *********_______________> */   
});










app.listen(3000,function(req,res){
     console.log("server started");
});