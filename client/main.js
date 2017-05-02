var myApp = angular.module('myApp', ['ngRoute']);


myApp.config(function ($routeProvider, $locationProvider) {
  $routeProvider
    .when('/', {
      templateUrl: 'partials/home.html',
      controller: 'homeController',
      access: {restricted: true}
    })
    .when('/login', {
      templateUrl: 'partials/login.html',
      controller: 'loginController',
      access: {restricted: false}
    })
    .when('/logout', {
      controller: 'logoutController',
      access: {restricted: true}
    })
    .when('/register', {
      templateUrl: 'partials/register.html',
      controller: 'registerController',
      access: {restricted: false}
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
      .then(function(){
        if (next.access.restricted && !AuthService.isLoggedIn()){
          $location.path('/login');
          $route.reload();
        }
      });
  });
});


myApp.directive('myModal', function() {
   return {
     restrict: 'A',
     link: function(scope, element, attr) {
       scope.dismiss = function() {
           element.modal('hide');
       };
     }
   } 
});

myApp.filter("searchFilter", function() {
  return function(input,query) {
    if(!query.query){
      console.log(query);
      return input;
    } 
    var out = [];
    for(var i = 0; i < input.length; i++) {
      var currObj = input[i];
      console.log(currObj.title);
      console.log(query);
      console.log(currObj.title.indexOf(query.query));
      var title = currObj.title.indexOf(query.query) > -1;
      var actor = currObj.actor.indexOf(query.query) > -1;
      var genre = currObj.genre.indexOf(query.query) > -1;
      if(title || actor || genre) {
        out.push(currObj);
      }
    }
    return out;
  }
});