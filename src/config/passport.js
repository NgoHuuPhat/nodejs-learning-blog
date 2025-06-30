
const GoogleStrategy = require('passport-google-oauth20').Strategy
const Account = require('../app/models/Account')
const passport = require('passport')
const { handleGoogleLogin } = require('../services/userService')

passport.use(new GoogleStrategy({
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: "/user/google/callback",
    },
    async (accessToken, refreshToken, profile, done) => {
        try {
            const user = await handleGoogleLogin(profile)
            return done(null, user)
        } catch (error) {
            return done(error, null)
        }
    }
))

passport.serializeUser((user, done) => {
    done(null, user._id)
})

passport.deserializeUser(async (id, done) => {
    try {
        const user = await Account.findById(id)
        done(null, user)
    } catch (error) {
        done(error, null)
    }
})