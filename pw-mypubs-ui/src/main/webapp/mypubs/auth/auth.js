(function() {
	var AUTH_TOKEN_HEADER = 'Authorization';
	var AUTH_SERVICE_PATH = 'auth/token';
	var LOGOUT_SERVICE_PATH = 'auth/logout';

	angular.module('pw.auth', ['ngRoute', 'ngCookies'])

	.config(['$routeProvider', function($routeProvider) {
		$routeProvider.when('/Login', {
			templateUrl: 'mypubs/auth/login.html',
			controller: 'LoginController'
		}).when('/403', {
			templateUrl: 'mypubs/auth/403.html',
			controller: 'LoginController'
		});
	}])

	.controller('LoginController', [ '$scope', '$location', 'AuthService', 'PubsModal',
	                                 function($scope, $location, AuthService, PubsModal) {
		$scope.doLogin = function(user, pass) {
			AuthService.getNewTokenPromise(user, pass).then(function(token){
				$location.path('/Search');
			}, function(reason) {
				PubsModal.alert("Unable to Authenticate", reason);
			});
		};
	}])

	.factory('AuthService', ['$http',  'APP_CONFIG', '$q', 'AuthState', '$location', function($http, APP_CONFIG, $q, AuthState, $location) {
		return {
			getNewTokenPromise : function(user, pass) {
				var deferred = $q.defer();

				$http.post(APP_CONFIG.endpoint + AUTH_SERVICE_PATH,
					$.param({ //use jquery to do standard form post
						username : user,
						password : pass
					}),
					{
					    headers:
					    {
					        'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'
					    }
					}
				).success(function(data) {
					if(data && data.token) {
						AuthState.setToken(data.token);
						deferred.resolve(AuthState.getToken());
					} else {
						deferred.reject("Authentication token was not returned from the service.");
					}
				}).error(function(response, status){
					if(status === 401) {
						if(response.reason) {
							deferred.reject(response.reason);
						} else {
							deferred.reject("Unable to authenticate.");
						}
					} else {
						deferred.reject("There was a server error.");
					}
				});

				return deferred.promise;
			},
			logout : function() {
				$http.post(APP_CONFIG.endpoint + LOGOUT_SERVICE_PATH,{
					token : AuthState.getToken()
				}).success(function(response) {
					AuthState.clearToken();
					$location.path("/Login");
				});

			}
		};
	}])

	/**
	 * This service is a stateful singleton and maintains a current logged in state
	 */
	.service('AuthState', ['$cookies', function($cookies) {
		this.loginState = {
				authToken : null
		};

		/**
		 * Retrieves the token from javascript memory or browser cookie.
		 * @returns token or null if none exists
		 */
		this.getToken = function() {
			//if we have a token stored in a browser cookie and none in memory, load from cookie
			if(!this.loginState.authToken && $cookies.myPubsAuthToken) {
				this.loginState.authToken = $cookies.myPubsAuthToken;
			}

			return this.loginState.authToken;
		};

		this.setToken = function(token) {
			this.loginState.authToken = token;
			$cookies.myPubsAuthToken = token;
		};

		this.clearToken = function() {
			this.setToken(null);
		};

		return this;
	}])

	.factory('AuthorizationInterceptor', function($q, $location, AuthState) {
		var attachAuthToken = function(config) {
			if(AuthState.getToken() !== null) {
				//this is following a standard header format used by OAUTH2
				config.headers[AUTH_TOKEN_HEADER] = "Bearer " + AuthState.getToken();
			}
			return config;
		};

		var handleUnauthorized = function(response) {
			switch (response.status) {
			case 401:
				$location.path("/Login");
				break;
			case 403:
				$location.path("/403");
				break;
			}
			return $q.reject(response);
		};

		return {
			'request': attachAuthToken,
			'responseError': handleUnauthorized
		};
	});

})();
