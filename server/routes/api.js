var express = require('express');
var router = express.Router();
var passport = require('passport');

var User = require('../models/user.js');
var Movie = require('../models/movie.js');

router.post('/createMovie', function(req, res) {
  if(!req.body.title) {
     return res.status(400).json({
        err: "need a title"
      });
  }

  if(!req.user) {
     return res.status(400).json({
        err: "need logged in"
      });
  }

  var newMovie = new Movie({title: req.body.title});
  newMovie.save(function(err,res) {
    if(err) {
      console.log("error");
    } else {
      console.log("Saved");      
      User.update({'_id': req.user._id}, {$push: {'movies': res._id}}, {upsert: false}, function(err, data) {    
      });
    }
  });

  return res.status(200).json({
    movie: newMovie
  });
});

router.get('/movies', function(req, res) {
  if(!req.user) {
    return res.status(400).json({
      err: "must be logged in"
    });
  }

  Movie.find({
    '_id': { $in: req.user.movies}
  }, function(err, movies) {
    return res.status(200).json({
      movies: movies
    });
  });
});

router.post('/addMovieToCollection/', function(req, res) {
  if(!req.user) {
    return res.status(400).json({
      err: "must be logged in"
    });
  }

  console.log(req.body);
  User.update({'_id': req.user._id}, {$push: {'movies': req.body.movieId}}, {upsert: false}, function(err, data) {    

  });
  return res.status(200).json({
    status: true
  });

});

router.post('/removeMovie/', function(req, res) {
  if(!req.user) {
    return res.status(400).json({
      err: "must be logged in"
    });
  }

  User.update({'_id': req.user._id}, {$pull: {'movies': req.body.movieId}}, function(err, data) {    

  });
  return res.status(200).json({
    status: true
  });

});

router.post('/register', function(req, res) {
  User.register(new User({ username: req.body.username }),
    req.body.password, function(err, account) {
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

router.post('/login', function(req, res, next) {
  passport.authenticate('local', function(err, user, info) {
    if (err) {
      return next(err);
    }
    if (!user) {
      return res.status(401).json({
        err: info
      });
    }
    req.logIn(user, function(err) {
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

router.get('/logout', function(req, res) {
  req.logout();
  res.status(200).json({
    status: 'Bye!'
  });
});

router.get('/status', function(req, res) {
  if (!req.isAuthenticated()) {
    return res.status(200).json({
      status: false
    });
  }
  res.status(200).json({
    status: true
  });
});


module.exports = router;