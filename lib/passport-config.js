
'use strict';

/*!
 * Module dependencies
 */
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const FacebookStrategy = require('passport-facebook').Strategy;
const bcrypt = require('bcryptjs');
const User = require('../models/userModel/user.model');
const auth  = require('./auth');
// Used to serialize the user for the session
passport.serializeUser(function (user, done) {
    console.log('*****************serializeUser*******************',user,user.id);
    return done(null, user.id);
});

// Used to deserialize the user
passport.deserializeUser(function (id, done) {
    User
    .findById(id, function (err, user) {
        if (err) {
            return done(err);
        } else {
            return done(null, user);
        }
    });
});

passport.use(new FacebookStrategy({
    clientID: auth.facebookAuth.clientID,
    clientSecret: auth.facebookAuth.clientSecret,
    callbackURL: auth.facebookAuth.callbackURL
  },
  function(accessToken, refreshToken, profile, done) {
    User.findOne({'facebook.id':profile.id}, function(err, user) {
      if (err) { return done(err); }
      if(user) {
        done(null, user);
      }
      else {
        console.log('*****************profile*******************',profile);
          var newUser = {
            'facebook.id': profile.id,
            'facebook.name' : profile.displayName,
            'facebook.email' : profile.emails,
            'facebook.token' : accessToken
          }
          User.create(newUser,function(err){
            if (err) { return done(err); }
            done(null, newUser);
          })
      }
     
    });
  }
));

// Set Local Strategy for authentication
passport.use(new LocalStrategy(
    {
        usernameField:'email',
        passwordField:'password',
        passReqToCallback:true
    },
    function (req,email, password, done) {
        console.log('********req**********',req);
        User.find({email:username}, function (err, user) {
            var pass = user.password;
           if (err) {
            return done(err,false,{message:'Error'});
           }
           if (user=='') {
                return done(err,false,{message:'email incorrect'});
           } 
           
            return done(null,user);
           
        //    bcrypt.compare(password,user.password,(err,isMatch)=>{
        //     if(isMatch) {
        //         console.log('*************isMatch*********',isMatch)
        //         return done(null,user);
        //     }else {
        //         return done(null,false,{message:'password incorrect'})
        //     }
        //   })
       
        });
        
    }
));

