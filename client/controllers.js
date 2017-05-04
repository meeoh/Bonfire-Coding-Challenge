//Controller for '/' route
angular.module('myApp').controller('homeController', ['$scope', '$location', 'MovieService', 'AuthService', '$http',
  function ($scope, $location, MovieService, AuthService, $http) {

    //initial vars
    $scope.search = {};
    $scope.newMovie = {};
    $scope.sort = "title";
    $scope.activeContent = {};

    $scope.moreInfo = function (movie) {
      $http.get("http://www.omdbapi.com/?t=" + movie.title)
        .success(function (data) {          
          console.log(data);
          $scope.activeContent.awards = data.Awards;
          $scope.activeContent.director = data.Director;
          $scope.activeContent.plot = data.Plot;
          $scope.activeContent.runtime = data.Runtime;
          $scope.activeContent.rating = data.imdbRating;
        });
    }

    //Checklength function checks weather or not to disable the autofill
    //from imdb button
    $scope.checkLength = function () {
      if (!$scope.newMovie.title || $scope.newMovie.title.length < 1) {
        return true;
      }
      return false;
    }

    //Autofill function gets data from IMDB and fills in the modal form
    $scope.autofill = function () {
      var title = $scope.newMovie.title.replace(" ", "+")
      $http.get("http://www.omdbapi.com/?t=" + $scope.newMovie.title)
        .success(function (data) {
          // Straight forward gathering of data, only take first actor to keep it minimalistic/clean
          $scope.newMovie.title = data.Title;
          $scope.newMovie.genre = data.Genre;
          $scope.newMovie.actor = data.Actors.split(",")[0];
          $scope.newMovie.image = data.Poster;
        });
    }

    //Resort (Re-sort) function resorts the movies array based on the current category (title/genre/actor)
    //Will sort it alphabetically from A-Z
    var resort = function () {
      $scope.movies = $scope.movies.sort(function (a, b) {
        if (a[$scope.sort] < b[$scope.sort]) return -1;
        if (a[$scope.sort] > b[$scope.sort]) return 1;
        return 0;
      });
    }

    //Change sort function changes the current sorting method (title/genre/actor) then resorts
    $scope.changeSort = function (input) {
      $scope.sort = input;
      resort();
    }

    //On load of this controller, get the movies and sort them according to the current sorting method
    MovieService.getMovies()
      .then(function (data) {
        $scope.movies = data.movies;
        resort();
      });

    //addMovie function adds a movie to the users list and persists the data
    $scope.addMovie = function (newMovie) {
      //Validate fields
      if (!newMovie.title || !newMovie.genre) {
        $scope.modalError = "Please enter all fields";
        return;
      }      

      //Use service to create and add the movie
      MovieService.addMovie(newMovie.title, newMovie.genre, newMovie.actor, newMovie.image)
        .then(function (data, status) {
          //Push the movie in our local list so you dont have to refresh for update          
          $scope.movies.push(data.movie);
          resort();
          //Empty the modal and close it
          $scope.newMovie = {};
          $scope.dismiss();
        });
    }

    //removeMovie function removes a movie from the users list and persists the data
    $scope.removeMovie = function (movieId) {
      //User service to remove the movie based on ID
      MovieService.removeMovie(movieId)
        .then(function (data, status) {
          //Empty the search bar
          $scope.search.title = "";
          var myArray = $scope.movies;
          //Remove the movie from the local list as well so you dont have to refresh for updates
          for (i = myArray.length - 1; i >= 0; i--) {
            if (myArray[i]._id == movieId) myArray.splice(i, 1);
          }
        });
    }
  }
]);

//Controller for index (on every page)
angular.module('myApp').controller('indexController', ['$scope', '$location', 'AuthService',
  function ($scope, $location, AuthService) {

    //Had to keep track of user status like this in order to see if logged in or not
    $scope.$watch(function () {
      //watch the current path
      return $location.$$path;
    }, function (newValue, oldValue) {
      // console.log(newValue + ' ' + oldValue);
      if (newValue == "/") {
        //if we're on '/' we have to be logged in so get the users username
        $scope.loggedIn = true;
        AuthService.getUserStatus()
          .success(function (data) {
            // console.log(data);
            $scope.username = data.user;
          });
      } else {
        $scope.loggedIn = false;
      }
    });
  }
]);

//Controller for login
angular.module('myApp').controller('loginController', ['$scope', '$location', 'AuthService',
  function ($scope, $location, AuthService) {

    //Login function logs the user in
    $scope.login = function () {

      // initial values
      $scope.error = false;
      $scope.disabled = true;

      // call login from service
      AuthService.login($scope.loginForm.username, $scope.loginForm.password)
        // handle success
        .then(function () {
          $location.path('/');
          $scope.disabled = false;
          $scope.loginForm = {};
        })
        // handle error
        .catch(function () {
          $scope.error = true;
          $scope.errorMessage = "Invalid username and/or password";
          $scope.disabled = false;
          $scope.loginForm = {};
        });

    };

  }
]);

//Controller for logout
angular.module('myApp').controller('logoutController', ['$scope', '$location', 'AuthService',
  function ($scope, $location, AuthService) {

    //Watching if the user is loggedin same way as before to see weather or not I should display the logout button
    //Definitely a better way to do this but the factory wasnt working out

    $scope.$watch(function () {
      return $location.$$path;
    }, function (newValue, oldValue) {
      if (newValue == "/") {
        $scope.loggedIn = true;
      } else {
        $scope.loggedIn = false;
      }
    });

    $scope.logout = function () {
      // call logout from service
      AuthService.logout()
        .then(function () {
          $location.path('/login');
        });

    };

  }
]);

//Controller for registering
angular.module('myApp').controller('registerController', ['$scope', '$location', 'AuthService',
  function ($scope, $location, AuthService) {

    //Checking if users logged in
    $scope.$watch(function () {
      return $location.$$path;
    }, function (newValue, oldValue) {
      if (newValue == "/") {
        $scope.loggedIn = true;
      } else {
        $scope.loggedIn = false;
      }
    });

    $scope.register = function () {
      // initial values
      $scope.error = false;
      $scope.disabled = true;

      // call register from service
      AuthService.register($scope.registerForm.username, $scope.registerForm.password)
        // handle success
        .then(function () {
          // call login from service
          AuthService.login($scope.registerForm.username, $scope.registerForm.password)
            // handle success
            .then(function () {
              $location.path('/');
              $scope.disabled = false;
              $scope.loginForm = {};
              $scope.registerForm = {};
            })
            // handle error
            .catch(function () {
              $location.path('/login');
            });
          $scope.disabled = false;
        })
        // handle error
        .catch(function (res) {
          $scope.error = true;
          $scope.errorMessage = res.err.message;
          $scope.disabled = false;
          $scope.registerForm = {};
        });
    };
  }
]);