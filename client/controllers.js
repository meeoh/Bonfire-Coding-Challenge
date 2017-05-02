angular.module('myApp').controller('homeController', ['$scope', '$location', 'MovieService', 'AuthService',
  function ($scope, $location, MovieService, AuthService) {
    $scope.search = {};
    $scope.newMovie = {};
    $scope.sort = "title";

    var resort = function () {
      $scope.movies = $scope.movies.sort(function (a, b) {
        if (a[$scope.sort] < b[$scope.sort]) return -1;
        if (a[$scope.sort] > b[$scope.sort]) return 1;
        return 0;
      });
    }

    $scope.changeSort = function (input) {
      $scope.sort = input;
      resort();
    }


    MovieService.getMovies()
      .then(function (data) {        
        $scope.movies = data.movies;
        resort();
      });

    $scope.addMovie = function (newMovie) {

      console.log(newMovie);
      if (!newMovie.title || !newMovie.genre) {
        $scope.modalError = "Please enter all fields";
        return;
      }

      MovieService.addMovie(newMovie.title, newMovie.genre, newMovie.actor, newMovie.image)
        .then(function (data, status) {
          console.log("added");
          console.log(data);
          $scope.movies.push(data.movie);
          resort();
          $scope.newMovie = {};
          $scope.dismiss();
        });
    }

    $scope.removeMovie = function (movieId) {
      MovieService.removeMovie(movieId)
        .then(function (data, status) {
          console.log("removed");
          $scope.search.title = "";
          var myArray = $scope.movies;
          for (i = myArray.length - 1; i >= 0; i--) {
            if (myArray[i]._id == movieId) myArray.splice(i, 1);
          }
        });
    }
  }
]);

angular.module('myApp').controller('indexController', ['$scope', '$location', 'AuthService',
  function ($scope, $location, AuthService) {

    $scope.$watch(function () {
      return $location.$$path;
    }, function (newValue, oldValue) {
      // console.log(newValue + ' ' + oldValue);
      if (newValue == "/") {
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


angular.module('myApp').controller('loginController', ['$scope', '$location', 'AuthService',
  function ($scope, $location, AuthService) {

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

angular.module('myApp').controller('logoutController', ['$scope', '$location', 'AuthService',
  function ($scope, $location, AuthService) {
    $scope.$watch(function () {
      return $location.$$path;
    }, function (newValue, oldValue) {
      // console.log(newValue + ' ' + oldValue);
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

angular.module('myApp').controller('registerController', ['$scope', '$location', 'AuthService',
  function ($scope, $location, AuthService) {

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
          $location.path('/login');
          $scope.disabled = false;
          $scope.registerForm = {};
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