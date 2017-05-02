var express = require('express');
var router = express.Router();
var passport = require('passport');

var User = require('../models/user.js');
var Movie = require('../models/movie.js');

//Creating a new movie
router.post('/createMovie', function (req, res) {

  //Make sure the post has the proper params
  if (!req.user) {
    return res.status(400).json({
      err: "need to be logged in"
    });
  }

  if (!req.body.title) {
    return res.status(400).json({
      err: "need a title"
    });
  }

  if (!req.body.genre) {
    return res.status(400).json({
      err: "need a genre"
    });
  }

  //Create a new movie object
  var newMovie = new Movie({
    title: req.body.title,
    genre: req.body.genre,
    actor: req.body.actor,
    image: req.body.image
  });

  //Attempt to save it
  newMovie.save(function (err, res) {
    if (err) {
      //return the error
      return res.status(500).json({
        err: err
      });
    } else {
      //Saving worked, add the movie to the users list of movies
      User.update({
        '_id': req.user._id
      }, {
        $push: {
          'movies': res._id
        }
      }, {
        //dont create a new user if we cant find one
        upsert: false
      }, function (err, data) {});
    }
  });
  //Return the new movie
  return res.status(200).json({
    movie: newMovie
  });
});

//Removing a movie
router.post('/removeMovie/', function (req, res) {

  //Make sure user exists
  if (!req.user) {
    return res.status(400).json({
      err: "must be logged in"
    });
  }

  //Remove the movie ID from the users list of ids
  User.update({
    '_id': req.user._id
  }, {
    $pull: {
      'movies': req.body.movieId
    }
  }, function (err, data) {
    //if the movie id doesnt exist, doesnt matter
  });

  //Return 200
  return res.status(200).json({
    status: true
  });

});

//Registering
router.post('/register', function (req, res) {
  User.register(new User({
      username: req.body.username
    }),
    req.body.password,
    function (err, account) {
      if (err) {
        return res.status(500).json({
          err: err
        });
      }
      passport.authenticate('local')(req, res, function () {
        return res.status(200).json({
          status: 'Registration successful!'
        });
      });
    });
});

//Logging in
router.post('/login', function (req, res, next) {
  passport.authenticate('local', function (err, user, info) {
    if (err) {
      return next(err);
    }
    if (!user) {
      return res.status(401).json({
        err: info
      });
    }
    req.logIn(user, function (err) {
      if (err) {
        return res.status(500).json({
          err: 'Could not log in user'
        });
      }
      res.status(200).json({
        status: 'Login successful!'
      });
    });
  })(req, res, next);
});

//Getting all the movies for a user
router.get('/movies', function (req, res) {
  //Make sure theres a user logged in
  if (!req.user) {
    return res.status(400).json({
      err: "must be logged in"
    });
  }

  //Find all movies in the users list 
  Movie.find({
    '_id': {
      $in: req.user.movies
    }
  }, function (err, movies) {
    //Return those movies
    return res.status(200).json({
      movies: movies
    });
  });
});

//Logout
router.get('/logout', function (req, res) {
  req.logout();
  res.status(200).json({
    status: 'Bye!'
  });
});

//Getting user status
router.get('/status', function (req, res) {
  if (!req.isAuthenticated()) {
    return res.status(200).json({
      status: false
    });
  }

  // console.log(req.user);
  res.status(200).json({
    status: true,
    user: req.user.username

  });
});


module.exports = router;