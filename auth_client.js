/**
 * Created by dx on 2016/3/28.
 */
var myApp = angular.module("myApp", []);
function url_base64_decode(str) {
    var output = str.replace('-', '+').replace('_', '/');
    switch (output.length % 4) {
        case 0:
            break;
        case 2:
            output += '==';
            break;
        case 3:
            output += '=';
            break;
            node
        default:
            throw 'Illegal base64url string!';
    }
    return window.atob(output); //polifyll https://github.com/davidchambers/Base64.js
}
myApp.controller("userCtrl", function ($scope, $http, $window) {

    $scope.user = {username: "dingx", password: "dingx"};
    $scope.isAuthenticated = false;

    $scope.submit = function () {
        $http.post('/authenticate', $scope.user)
            .success(function (data, status, headers, config) {
                $window.sessionStorage.token = data.token;
                $scope.isAuthenticated = true;
                var encodedProfile = data.token.split('.')[1];
                var profile = JSON.parse(url_base64_decode(encodedProfile));
            })
            .error(function (data, status, headers, config) {
                delete $window.sessionStorage.token;
                $scope.isAuthenticated = false;
                $scope.error = 'Error: Invalid user or password';
            });
    };

    $scope.callRestricted = function () {
        $http({url: '/api/restricted', method: 'GET'}).success(function (data, status, headers, config) {
            $scope.message = $scope.message + data.name;
        }).error(function (data, status, headers, config) {
            alert(data);
        });
    };
    $scope.logout = function () {
        $scope.welcome = '';
        $scope.message = '';
        $scope.isAuthenticated = false;
        delete $window.sessionStorage.token;
    }
});
myApp.factory('authInterceptor', function ($rootScope, $q, $window) {
    return {
        request: function (config) {
            config.headers = config.headers || {};
            if ($window.sessionStorage.token) {
                config.headers.Authorization = 'Bearer ' + $window.sessionStorage.token;
            }
            return config;
        },
        responseError: function (rejection) {
            if (rejection.status === 401) {
                // handle the case where the user is not authenticated
            }
            return $q.reject(rejection);
        }
    };
});

myApp.config(function ($httpProvider) {
    $httpProvider.interceptors.push('authInterceptor');
});

