var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var mongoose = require('mongoose');
var User = mongoose.model('User');

/*
We'll be using passport as a middleware for our login endpoint. This middleware will use the passport-local strategy, which is meant for username/password authentication. We'll need to look up our user using the information in the request body and try to find the corresponding user, then see if the password given to the user was valid.
*/

/*
Assuming request body comes like this

{
  "user": {
    "email": "jake@example.com".
    "password": "mypasswordisjake"
  }
}
*/

passport.use(new LocalStrategy({
	usernameField: 'user[email]',
	passwordField: 'user[password',
},function(email,password,done){
	User.findOne({email:email}).then(function(user){
		if(!user || !user.validPassword(password)){
			return done(null, false, {errors: {'email or password':'is invalid'}});
		}

		return done(null, user);
	}).catch(done);
}));

// Remember to add the middleware to validate JWT in routes/auth.js