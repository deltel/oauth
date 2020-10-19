const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20');
const keys = require('./keys');
const User = require('../models/user-model');

passport.serializeUser((user, done) => {
    done(null, user.id);
});

passport.deserializeUser((id, done) => {
    User.findById(id).then((user) => {
        done(null, user);
    });
});

passport.use(
    new GoogleStrategy({
        // options for strategy
        callbackURL: '/auth/google/redirect',
        clientID: keys.google.clientID,
        clientSecret: keys.google.clientSecret
    },
    async (accessToken, refreshToken, profile, done) => {
        // check if user exists
        // console.log(profile);
        const currentUser = await User.findOne({ googleId: profile.id });

        if(currentUser) {
            // already have user
            console.log('current user is: ' + currentUser);
            done(null, currentUser); //calls the serialize user middleware
        } else {
            // create user in db
            const user = await new User({
                username: profile.displayName,
                googleId: profile.id,
                thumbnail: profile._json.picture
            }).save();
            console.log('new user created: ' + user);
            done(null, user);
        }
    })
);