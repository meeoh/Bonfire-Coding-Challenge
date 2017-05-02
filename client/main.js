var myApp = angular.module('myApp', ['ngRoute']);


myApp.config(function ($routeProvider, $locationProvider) {
  $routeProvider
    .when('/', {
      templateUrl: 'partials/home.html',
      controller: 'homeController',
      access: {
        restricted: true
      }
    })
    .when('/login', {
      templateUrl: 'partials/login.html',
      controller: 'loginController',
      access: {
        restricted: false
      }
    })
    .when('/logout', {
      controller: 'logoutController',
      access: {
        restricted: true
      }
    })
    .when('/register', {
      templateUrl: 'partials/register.html',
      controller: 'registerController',
      access: {
        restricted: false
      }
    })
    .otherwise({
      redirectTo: '/'
    });

  $locationProvider.html5Mode(true);

});

myApp.run(function ($rootScope, $location, $route, AuthService) {
  $rootScope.$on('$routeChangeStart',
    function (event, next, current) {
      AuthService.getUserStatus()
        .then(function () {
          if (next.access.restricted && !AuthService.isLoggedIn()) {
            $location.path('/login');
            $route.reload();
          }
        });
    });
});

//Directive for closing modal from controller
myApp.directive('myModal', function () {
  return {
    restrict: 'A',
    link: function (scope, element, attr) {
      scope.dismiss = function () {
        element.modal('hide');
      };
    }
  }
});

//Filter for searching based on title/actor/genre
myApp.filter("searchFilter", function () {
  return function (input, query) {
    //If search is empty 
    if (!query.query) {
      return input;
    }
    var out = [];
    //Go over all objects we need to filter
    for (var i = 0; i < input.length; i++) {
      var currObj = input[i];
      //Split up the typed in words by spaces
      var splitArray = query.query.split(" ");
      var totalIn = true;
      for (var j = 0; j < splitArray.length; j++) {
        //Go over all of the split up words, if the word is in any of the title/genre/actor,
        //then its fine, but all of the words need to be in one of the title/genre/actor
        //so you can search 'Will Smith Drama' and get multiple movies
        var currentWord = splitArray[j].toLowerCase();
        var title = currObj.title.toLowerCase().indexOf(currentWord) > -1;
        var actor = currObj.actor.toLowerCase().indexOf(currentWord) > -1;
        var genre = currObj.genre.toLowerCase().indexOf(currentWord) > -1;
        if(!title && !actor && !genre) {
          totalIn = false;
        }
      }
      if(totalIn) {
        out.push(currObj);
      }
    }
    return out;
  }
});