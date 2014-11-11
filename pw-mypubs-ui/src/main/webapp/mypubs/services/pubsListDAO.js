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
		}])
	
		.factory('PubsListUpdater', ['$http', '$q', 'PubsListEndpoint', function($http, $q, PubEndpoint) {

			var httpUpdate = function(url, verb, data, errorMessage) {
				var deferred = $q.defer();
	
				$http[verb](url, data, {
					'headers' : {
						'Accept' : 'application/json'
					}
				})
				.success(function(response) {
					deferred.resolve(response);
				})
				.error(function(response) {
					if (response['validationErrors'] && 0 !== response['validationErrors'].length){
						deferred.reject(response);
					}
					else {
						deferred.reject(new Error(response));
					}
				});
				return deferred.promise;
			};
	
			var addPubsToList = function(listIds, pubs, lists) {
				return $q.all(listIds.map(function(listId) {
					var msg = 'List: ';
					var lists2 = $.grep(lists, function(e){ return e.id == listId; });
					if (lists2.length > 0) {
						msg = msg + lists2[0].text; 
					}
					msg = msg + ' (' + listId + ')'
					var pubIds = '';
					pubs.forEach(function(pub){
						msg = msg + '\n    IndexID:' + pub.indexId;
						pubIds = pubIds + 'publicationId=' + pub.id + '&';
					})
					return httpUpdate(PubEndpoint + listId + '/pubs?' + pubIds, 'post', {}, 'Error adding publication to list').then(
							function(data) {
								return msg;
							},
							function(reason) {
								return reason;
							}
					)
				}));
			};
	
			var removePubsFromList = function(listId, pubs) {
				return $q.all(pubs.map(function(pub) {
					var msg = 'IndexId: ' + pub.indexId;
					return httpUpdate(PubEndpoint + listId + '/pubs/' + pub.id, 'delete', {}, 'Error removing publication from list').then(
							function(data) {
								return msg;
							},
							function(reason) {
								return reason;
							}
					)
				}));
			};
	
			return {
				addPubsToList : addPubsToList,
				removePubsFromList : removePubsFromList
			};
		}]);

}) ();


