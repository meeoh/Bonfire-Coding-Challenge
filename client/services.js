angular.module('myApp').factory('AuthService', ['$q', '$timeout', '$http',
  function ($q, $timeout, $http) {

    // create user variable
    var user = null;

    // return available functions for use in the controllers
    return ({
      isLoggedIn: isLoggedIn,
      getUserStatus: getUserStatus,
      login: login,
      logout: logout,
      register: register
    });

    function isLoggedIn() {
      if (user) {
        return true;
      } else {
        return false;
      }
    }

    function getUserStatus() {
      return $http.get('/user/status')
        // handle success
        .success(function (data) {
          if (data.status) {
            user = true;
          } else {
            user = false;
          }
        })
        // handle error
        .error(function (data) {
          user = false;
        });
    }

    function login(username, password) {

      // create a new instance of deferred
      var deferred = $q.defer();

      // send a post request to the server
      $http.post('/user/login', {
          username: username,
          password: password
        })
        // handle success
        .success(function (data, status) {
          if (status === 200 && data.status) {
            user = true;
            deferred.resolve();
          } else {
            user = false;
            deferred.reject();
          }
        })
        // handle error
        .error(function (data) {
          user = false;
          deferred.reject();
        });

      // return promise object
      return deferred.promise;

    }

    function logout() {

      // create a new instance of deferred
      var deferred = $q.defer();

      // send a get request to the server
      $http.get('/user/logout')
        // handle success
        .success(function (data) {
          user = false;
          deferred.resolve();
        })
        // handle error
        .error(function (data) {
          user = false;
          deferred.reject();
        });

      // return promise object
      return deferred.promise;

    }

    function register(username, password) {

      // create a new instance of deferred
      var deferred = $q.defer();

      // send a post request to the server
      $http.post('/user/register', {
          username: username,
          password: password
        })
        // handle success
        .success(function (data, status) {
          if (status === 200 && data.status) {
            deferred.resolve();
          } else {
            deferred.reject();
          }
        })
        // handle error
        .error(function (data) {
          deferred.reject(data);
        });

      // return promise object
      return deferred.promise;

    }

  }
]);



//Service for getting movies
angular.module('myApp').factory('MovieService', ['$q', '$timeout', '$http', 'AuthService',
  function ($q, $timeout, $http, AuthService) {

    //available methods
    return ({
      getMovies: getMovies,
      addMovie: addMovie,
      removeMovie: removeMovie
    });

    //Getting movies
    function getMovies(username) {

      var deferred = $q.defer();

      //Hit the api
      $http.get('/user/movies')
        .success(function (data, status) {

          //200 result
          if (status === 200) {
            deferred.resolve(data);
          } else {
            //reject the promise
            deferred.reject();
          }
        })
        .catch(function (err) {
          //reject
          deferred.reject();
        })
      //return the promise
      return deferred.promise;
    }

    function addMovie(title, genre, actor = "No actors", image = "http://i.imgur.com/vnG8qYh.jpg") {

      //create the promise
      var deferred = $q.defer();

      //hit the api
      $http.post('/user/createMovie', {
          title: title,
          genre: genre,
          actor: actor,
          image: image
        })
        .success(function (data, status) {
          //success
          deferred.resolve(data);
        })
        .catch(function (err) {
          //error
          deferred.reject(data);
        });

      //return the promise
      return deferred.promise;

    }

    function removeMovie(movieId) {

      //create the promise
      var deferred = $q.defer();

      //hit the api
      $http.post('/user/removeMovie/', {
          movieId: movieId
        })
        .success(function (data, status) {
          //sucess
          deferred.resolve(data);
        })
        .catch(function (err) {
          //fail
          deferred.reject(data);
        });

      //return the promise
      return deferred.promise;
    }


  }
]);