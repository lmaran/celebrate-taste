var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;

// exports.setup = function (User, config) {
//   passport.use(new LocalStrategy({
//       usernameField: 'email', // the name of fields that ew send at login
//       passwordField: 'password' // this is the virtual field on the model
//     },
//     function(email, password, done) {
//       User.findOne({
//         email: email.toLowerCase()
//       }, function(err, user) {
//         if (err) return done(err);
// 
//         if (!user) {
//           return done(null, false, { message: 'This email is not registered.' });
//         }
//         if (!user.authenticate(password)) {
//           return done(null, false, { message: 'This password is not correct.' });
//         }
//         return done(null, user);
//       });
//     }
//   ));
// };

exports.setup = function (userService, config) {
  passport.use(new LocalStrategy({
      usernameField: 'email', // the name of fields that ew send at login
      passwordField: 'password' // this is the virtual field on the model
    },
    function(email, password, done) {
      userService.getByEmail(email, function(err, user) {
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
};