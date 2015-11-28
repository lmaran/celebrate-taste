var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var userService = require('../../userService');

passport.use(new LocalStrategy(
    {
        usernameField: 'email', // the name of fields that we send at login
        passwordField: 'password'
    },
    function (email, password, done) {
        userService.getByEmail(email, function (err, user) {
            if (err) return done(err);

            if (!user) {
                return done(null, false, { message: 'Acest email nu este inregistrat.' });
            }
            if (!userService.authenticate(password, user.hashedPassword, user.salt)) {
                return done(null, false, { message: 'Aceasta parola este incorecta.' });
            }
            return done(null, user);
        });
    }
));