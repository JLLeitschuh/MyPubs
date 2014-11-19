(function() {


angular.module('pw.publicationDAO', [])

	.factory('PubEndpoint', ['APP_CONFIG', function(APP_CONFIG) {
		return APP_CONFIG.endpoint + 'mppublications/';
	}])

    .factory('PublicationFetcher', ['$http', 'PubEndpoint', function($http, PubEndpoint) {

        return {
            fetchPubById : function(pubId) {
                var result = undefined;
                if (pubId) {
                    result = $http.get(PubEndpoint + pubId,{
                        params : {
                            mimetype : 'json'
                        }
                    });
                }
                return result;
            },
            searchByTermAndListIds : function(term, listIds, prodId, indexId, ipdsId, contributor, title, seriesName, typeName,
            		year, pageSize, startRow) {
                var result = undefined;
                var parms = {
                        mimetype : 'json'
                    };
                if (term && term.length > 0) {
                	parms.q = term;
                }
                if (listIds && listIds.length > 0) {
                	parms.listId = listIds;
                }

				if (prodId && 0 < prodId.length) {
					parms.prodId = prodId;
				}
				if (indexId && 0 < indexId.length) {
					parms.indexId = indexId;
				}
				if (ipdsId && 0 < ipdsId.length) {
					parms.ipdsId = ipdsId;
				}
				if (contributor && 0 < contributor.length) {
					parms.contributor = contributor;
				}
				if (title && 0 < title.length) {
					parms.title = title;
				}
				if (seriesName && 0 < seriesName.length) {
					parms.seriesName = seriesName;
				}
				if (typeName && 0 < typeName.length) {
					parms.typeName = typeName;
				}
				if (year && 0 < year.length) {
					parms.year = year;
				}
//				if (searchJournal && 0 < searchJournal.length) {
//					advancedSearchTerms. = searchJournal;
//				}

				if (pageSize) {
                	parms.page_size = pageSize;
                }

                if (startRow) {
                	parms.page_row_start = startRow;
                }

                result = $http.get(PubEndpoint, {
                    params : parms
                });
                return result;
            }
        };
    }])


	.factory('PublicationUpdater', ['$http', '$q', 'PubEndpoint', function($http, $q, PubEndpoint) {

		var httpUpdate = function(url, verb, data, errorMessage) {
			var deferred = $q.defer();

			$http[verb](url, data, {
				'headers' : {
					'Content-Type' : 'application/json',
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

		/**
		 * Persist the given pub, whether it is new or existing, and resolve the
		 * deferred as appropriate
		 * @param {Publication} clientPub as in the pubData variable kept on the publication controller scope
		 * @returns {Promise}
		 */
		var persistPub = function(clientPub){
			var errorPersistingPubMessage = 'Error persisting Publication';
			//we do not want to send validation errors to the server, nor do we
			//want stale validation errors to continue to be displayed on the
			//client
			delete clientPub['validationErrors'];

			var pub = _.clone(clientPub);

			//the server manages the last-modified date, so there's no need to
			//send it. However, we do want to keep it on the client until
			//the server sends us an updated version
			delete pub.lastModifiedDate;

			//use a different http verb and url depending on whether the pub is new,
			//but otherwise do the same same thing
			var httpVerb;
			var url = PubEndpoint;
			if (pub.isNew()) {
				httpVerb = 'post';
			}
			else{
				httpVerb = 'put';
				url += pub.id;
			}

			return httpUpdate(url, httpVerb, pub, 'Error persisting publication');
		};

		var releasePub = function(pubId) {
			return httpUpdate(PubEndpoint + 'release', 'post', {id : pubId}, 'Error releasing publication');
		};

		var publishPub = function(pubId) {
			return httpUpdate(PubEndpoint + 'publish', 'post', {id : pubId}, 'Error publishing publication');
		};

		var deletePub = function(pubId) {
			return httpUpdate(PubEndpoint + pubId, 'delete', {}, 'Error deleting publication');
		};

		return {
			persistPub : persistPub,
			releasePub : releasePub,
			publishPub : publishPub,
			deletePub : deletePub
		};
	}]);
}) ();
