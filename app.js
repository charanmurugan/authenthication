require('dotenv').config()/**for assiging environmental variables */
const express= require("express");
const bodyParser= require("body-parser");
/**for passport */
const passport=require("passport");
const passportLocalMongoose=require("passport-local-mongoose");
const session=require('express-session');
/**for passport */
const mongoose=require("mongoose");
const bcrypt=require("bcrypt");/**for bcryption */
const app=express();
var encrypt = require('mongoose-encryption');/**for encryption */
const md5 = require('md5');/**for hashing */

// for static files acess 
app.use(express.static("public"));

//for acess user detail
app.use(bodyParser.urlencoded({
    extended:true
}));

//for ejs files
app.set("view engine","ejs");


//initialising express-session

app.use(session({
	secret:"our little secret.",
	resave:false,
	saveUninitialized:false
}));

//initialise passport

app.use(passport.initialize());
app.use(passport.session());

//mongoose connection to mongodb

mongoose.connect("mongodb://localhost:27017/userDB",{ useNewUrlParser: true , useUnifiedTopology: true, });
mongoose.set("useCreateIndex",true);

// creating schema
const UserSchema= new mongoose.Schema({
    username:String,
    password:String
});

/** before describing model add the plugin of the mongoose encryption */
// UserSchema.plugin(encrypt,{secret:process.env.Secret_Value,encryptedFields: ['password']});
// add passportLocalMongoose as a plugin to the schema
UserSchema.plugin(passportLocalMongoose);

// create model for the database
const User=new mongoose.model("User",UserSchema);

// intialize passport serialize & deserialize

passport.use(User.createStrategy());
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());


app.get("/",function(req,res){
   res.render("home");
});
app.get("/register",function(req,res){
     res.render("register");
});
app.get("/login",function(req,res){
    res.render("login");
});
app.get("/secrets",function(req,res){
    if(req.isAuthenticated()){
        res.render("secrets");
    }
    else{
        res.redirect("/login");
    }
   
});

app.post("/register",function(req,res){
/* <_________________ *******   simple  *********_______________> */
    // const user= new User({
    //     username:req.body.username,
    //     password:req.body.psw
    // })
    // user.save(function(err,foundItems){
    //     if(err){
    //           console.log(err);
    //     }else{
    //         res.render("secrets");
    
    //     }
    // });
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

// const user= new User({
//             username:req.body.username,
//             password:md5(req.body.psw)
//         })
//         user.save(function(err,foundItems){
//             if(err){
//                   console.log(err);
//             }else{
//                 res.render("secrets");
//             }
//         });
/* <_________________ *******  hashing  *********_______________> */
/* <_________________ *******  bcrypt  *********_______________> */
    // const saltRounds = 10;
    // bcrypt.hash(req.body.psw,saltRounds,function(err,hash){
    //     const user =new User({
    //         username:req.body.username,
    //         password:hash
    //     });
    //     user.save(function(err){
    //         if(!err){
    //             res.render("secrets");
    //         }
    //     });
    // });
/* <_________________ *******  bcrypt  *********_______________> */
/* <_________________ *******  passport local  *********_______________> */
// User.register({username:req.body.username},req.body.psw,function(err,user){
//     if(err){
//         console.log(err);
//         res.redirect("/register");
//     }
//     else{
//         passport.authenticate("local")(req,res,function(){
//             res.redirect("/secrets")
//         });
//     }
// });
/* <_________________ *******  passport local  *********_______________> */
    
});
app.post("/login",function(req,res){
/* <_________________ *******   simple  *********_______________> */
    // User.findOne({username:req.body.username},function(err,fountItems){
    //          if(err){
    //              console.log(err);
    //          }else{
    //              if(fountItems){
    //                  if(fountItems.password===req.body.psw){
    //                      res.render("secrets");
    //                  }else{
    //                      res.render("login");
    //                  }
                     
    //              }
    //          }
    //         });  
/* <_________________ *******   simple  *********_______________> */
/* <_________________ *******  encryption  *********_______________> */
// User.findOne({username:req.body.username},function(err,fountItems){
//              if(err){
//                  console.log(err);
//              }else{
//                  if(fountItems){
//                      if(fountItems.password===req.body.psw){
//                          res.render("secrets");
//                      }else{
//                          res.render("login");
//                      }
                     
//                  }
//              }
//             });  
    /* when save is find it automatically decrypt*/
/* <_________________ *******  encryption  *********_______________> */
/* <_________________ *******  hashing  *********_______________> */
        //  User.findOne({username:req.body.username},function(err,fountItems){
        //      if(err){
        //          console.log(err);
        //      }else{
        //          if(fountItems){
        //              if(fountItems.password===md5(req.body.psw)){
        //                  res.render("secrets");
        //              }else{
        //                  res.render("login");
        //              }
                     
        //          }
        //      }
        //     });   
/* <_________________ *******  hashing  *********_______________> */
/* <_________________ *******  bcrypt  *********_______________> */

// User.findOne({username:req.body.username},function(err,fountItems){
//      if(err){
//          console.log(err);
//      }else{
//          if(fountItems){
//              bcrypt.compare(req.body.psw,fountItems.password,function(err,result){
//                 if(result==true){
//                     res.render("secrets");
//                 }
//                 else{
//                    console.log("invalid login credentials");
//                     res.redirect("/login");
//                 }
//              } );
             
//          }
//      }
    // }); 
/* <_________________ *******  bcrypt  *********_______________> */  
/* <_________________ *******  passport local  *********_______________> */
const user=new User({
    username:req.body.username,
    password:req.body.psw
});

req.login(user,function(err){
    if(err){
        console.log(err);
        res.render("register");
    }
    else{
        passport.authenticate("local")(req,res,function(){
            res.redirect("/secrets")
        });
    }
})   
/* <_________________ *******  passport local  *********_______________> */ 
});










app.listen(3000,function(req,res){
     console.log("server started");
});