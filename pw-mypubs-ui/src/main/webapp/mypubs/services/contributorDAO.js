(function() {
    angular.module('pw.contributorDAO', [])

    .factory('ContributorFetcher', ['$http', 'APP_CONFIG', function($http, APP_CONFIG) {
	    return {
		fetchContributorById : function(contributorId) {
		    var result = undefined;
		    if (contributorId) {
			result = $http.get(APP_CONFIG.endpoint + 'contributor/' + contributorId, {
			    params : {
				mimetype : 'json'
			    }
			});
		    }
		    return result;
		}
	    };
    }])

    .factory('ContributorPersister', ['$http', 'APP_CONFIG', '$q', function($http, APP_CONFIG, $q){
	var usgsEndPoint = APP_CONFIG.endpoint + 'usgscontributor';
	var outsiderEndPoint = APP_CONFIG.endpoint + 'outsidecontributor';
	var corporationEndPoint = APP_CONFIG.endpoint + 'corporation';

	var errorPersistingMessage = 'Error persisting contributor';

	/**
	 * Persist the given contributor, whether it is new or existing, and resolve the
	 * deferred as appropriate
	 * @param {ContributorData} contributor as in the contributor variable kept on the contributor controller scope
	 * @returns {Promise}
	 */
	var persistContributor = function(contributor){
	    //we do not want to send validation errors to the server, nor do we
	    //want stale validation errors to continue to be displayed on the
	    //client
	    delete contributor['validationErrors'];
	    var deferredPersistence = $q.defer();
	    //use a different http verb and url depending on whether the contributor is new,
	    //but otherwise do the same same thing
	    var httpVerb, url;

	    if (contributor.corporation) {
		url = corporationEndPoint;
	    }
	    else if (contributor.usgs) {
		url = usgsEndPoint;
	    }
	    else {
		url = outsiderEndPoint;
	    }

	    if (contributor.contributorId) {
		httpVerb = 'put';
		url += '/' + contributor.contributorId;
	    }
	    else {
		httpVerb = 'post';
	    }

	    $http[httpVerb](url, contributor, {
		    'headers' : {
			    'Content-Type' : 'application/json',
			    'Accept' : 'application/json'
		    }
	    })
	    .success(function(response){
		    deferredPersistence.resolve(response);
	    })
	    .error(function(response){
		    if(response['validationErrors'] && 0 !== response['validationErrors'].length){
		    	deferredPersistence.reject(response);
		    }
		    else{
		    	deferredPersistence.reject(new Error(response));
		    }
	    });

	    return deferredPersistence.promise;
	};
	return {
	    persistContributor: persistContributor
	};
    }]);

})();

