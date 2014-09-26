(function() {
	angular.module('pw.pubsListDAO', [])

		.factory('PubsListEndpoint', ['APP_CONFIG', function(APP_CONFIG) {
			return APP_CONFIG.endpoint + 'lists/';
		}])

		.factory('PubsListFetcher', ['$http', 'PubsListEndpoint', function($http, PubsListEndpoint) {
			DEFAULT_PARAMS = {
				mimetype : 'json'
			};
			return {
				fetchAllLists : function() {
					return $http.get(PubsListEndpoint, DEFAULT_PARAMS);
				}
			};
		}]);

}) ();


