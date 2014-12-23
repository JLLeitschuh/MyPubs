(function() {
var PUB_ROOT = '/Publication';
angular.module('pw.publication', ['ngRoute', 'pw.notify', 'ui.bootstrap.modal',
	'pw.bibliodata', 'pw.catalog', 'pw.spn', 'pw.links', 'pw.contributors', 'pw.geo', 'pw.publicationDAO' // pub edit modules
])
.config(['$routeProvider',
	function($routeProvider) {
		$routeProvider.when(PUB_ROOT, {
			templateUrl: 'mypubs/publication/publication.html',
			controller: 'publicationCtrl',
            resolve: {
                pubData : ['Publication', function(Publication){
                        return Publication();
                }]
            }
		});
		$routeProvider.when(PUB_ROOT + '/:pubsid', {
			templateUrl: 'mypubs/publication/publication.html',
			controller: 'publicationCtrl',
            resolve : {
			    pubData : ['$route', 'Publication', 'PubsModal', '$location', function($route, Publication, PubsModal, $location) {
                    var pubsId = $route.current.params.pubsid;
                    return Publication(pubsId).then(
                    		function(pub) { return pub; },
                    		function(reason) {
                    			if(reason.status == 409 &&
                    					reason.data &&
                    					reason.data.validationErrors) {
                    				PubsModal.alert("Could Not Open Requested Publication", "The publication has been locked by the user \"" +
                    						reason.data.validationErrors[0].value + "\" and must be released. Please wait for the lock to be released by the user. " +
                    								"The lock will also be released after a 3 hour timeout if no activity is detected. ");
                    				$location.path("/Search");
                    			}
                    		});
			    }]
            }
		});
	}
    ])
.factory('Publication', ['PublicationFetcher', '$q', function (PublicationFetcher, $q) {
        var SkeletonPublication = function () {
			var self = this;
			//avoid repetitive assignments to 'this' by declaring properties
			//and values in a map and iteratively assigning them to 'this'
			var properties = {
				"id": '',
				"publicationType": {
					"id": ''
				},
				"publicationSubtype": {
					"id": ''
				},
				"seriesTitle": {
					"id": ''
				},
				"seriesNumber": "",
				"subseriesTitle": "",
				"chapter": "",
				"subchapterNumber": "",
				"title": "",
				"docAbstract": "",
				"language": "",
				"publisher": "",
				"publisherLocation": "",
				"doi": "",
				"issn": "",
				"isbn": "",
				"displayToPublicDate": "",
				"indexId": "",
				"collaboration": "",
				"usgsCitation": "",
				"costCenters": [],
				"links": [],
				"notes": "",
				"ipdsId": "",
				"publicationYear": "",
				"conferenceTitle": "",
				"conferenceDate": "",
				"conferenceLocation": "",
				"largerWorkType": {
					"id": ''
				},
				"largerWorkSubtype": {
					"id": ''
				},
				"largerWorkTitle": "",
				"lastModifiedDate": "",
				"productDescription": "",
				"volume": "",
				"issue": "",
				"startPage": "",
				"endPage": "",
				"numberOfPages": "",
				"onlineOnly": "N",
				"additionalOnlineFiles": "N",
				"temporalStart": "",
				"temporalEnd": "",
				"contributors": {},
				"scale": "",
				"projection": "",
				"datum": "",
				"country": "",
				"state": "",
				"county": "",
				"city": "",
				"otherGeospatial": "",
				"geographicExtents": "",
				"contact": "",
				"edition":"",
				"publicComments":"",
				"tableOfContents":"",
				"publishingServiceCenter": {
					"id": ''
				},
				"publishedDateStatement": "",
				"validationErrors": []
			};
			angular.forEach(properties, function(defaultValue, propertyName){
				self[propertyName] = defaultValue;
			});
        };
	/**
	 * Is this Publication new?
	 * @returns {Boolean} false if the pub's id is a non-zero-length String or a Number, true otherwise
	 */
	SkeletonPublication.prototype.isNew = function() {
	    var isNew = true;
	    var id = this.id;
	    if (angular.isString(id) && id.length > 1) {
			isNew = false;
	    }
	    else if (angular.isNumber(id)) {
			isNew = false;
	    }
	    return isNew;
	};

	/*
	 * @param newPubData
	 * Updates the object with fields in newPubData, preserving properties
	 * that are missing from newPubData
	 */
	SkeletonPublication.prototype.update = function(newPubData) {
	    var that = this;
	    angular.forEach(that, function(value, key) {
			that[key] = newPubData[key] || value;
	    });
	};

        var pubConstructor = function (pubId) {
            var pubToReturn;
            if (pubId) {
                var deferred = $q.defer();
                PublicationFetcher.fetchPubById(pubId).then(function(httpPromise){
                    var response = httpPromise.data;
                    var safePub = new SkeletonPublication();
                    angular.forEach(safePub, function(defaultValue, key){
                        safePub[key] = response[key] || defaultValue;
                    });
                    deferred.resolve(safePub);
                }, function(reason) {
                	deferred.reject(reason);
                });
                pubToReturn = deferred.promise;
            }
            else{
                pubToReturn = new SkeletonPublication();
            }
            return pubToReturn;
        };

        return pubConstructor;
    }])

.controller('publicationCtrl',
[ '$scope', '$route', 'pubData', 'PublicationUpdater', 'Notifier', '$location', 'PubsModal',
function($scope, $route, pubData, PublicationUpdater, Notifier, $location, PubsModal) {

	var handleServiceErrors = function(reason, errorMessage) {
		if (reason.validationErrors) {
			$scope.pubData.validationErrors = reason.validationErrors;
			Notifier.error(errorMessage + '; there were validation errors.');
		}
		else if (reason.message) {
			Notifier.error(reason.message);
		}
		else {
			Notifier.error(errorMessage + '; there were unanticipated errors. Consult browser logs.');
		}
	};

	var returnToSearch = function() {
		$location.path('/Search');
	};

	$scope.pubData = pubData;
	/**
	 *
	 * @returns {Promise}
	 */
	$scope.persistPub = function(){
		var persistencePromise = PublicationUpdater.persistPub($scope.pubData);
		persistencePromise
		.then(function(returnedPubData){
			if($scope.pubData.isNew()){
				$location.path(PUB_ROOT + '/' + returnedPubData.id);
			}
			else{
				$scope.pubData.update(returnedPubData);
				$scope.$broadcast('refreshPubData');
			}
			Notifier.notify('Publication successfully saved');
		}, function(reason){
			handleServiceErrors(reason, 'Publication not saved');
		});
		return persistencePromise;
	};

	$scope.resetPub = function() {
		$route.reload();
	};

	$scope.releasePub = function() {
		if ($scope.pubData.id) {
			PublicationUpdater.releasePub($scope.pubData.id).then(
				function(data) {
					returnToSearch();
				}, function(reason) {
					handleServiceErrors(reason, 'Publication not released');
				}
			);
		}
		else {
			returnToSearch();
		}
	};

	$scope.publishPub = function() {
		PublicationUpdater.persistPub($scope.pubData).then(
			function(pubData) {
				PubsModal.confirm('Are you sure you want to publish this publication?').then(
					function() {
						PublicationUpdater.publishPub(pubData.id).then(
							function(data) {
								returnToSearch();
							},
							function(reason) {
								handleServiceErrors(reason, 'Publication not published');
							}
						);
					}
				);
			},
			function(reason){
				handleServiceErrors(reason, 'Publication not saved');
			}
		);
	};

	$scope.deletePub = function() {
		if ($scope.pubData.id) {
			PubsModal.confirm('Are you sure you want to delete this publication?').then(
				function() {
					PublicationUpdater.deletePub($scope.pubData.id).then(
						function(data) {
							returnToSearch();
						},
						function(reason) {
							handleServiceErrors(reason, 'Publication not deleted');
						}
					);
				}
			);
		}
		else {
			returnToSearch();
		}
	};

	$scope.tabs = [
		{
			title:"Bibliodata",
			templateUrl: 'mypubs/publication/bibliodata/bibliodata.html',
			controller: 'biblioCtrl'
		},
		{
			title:"Contributors",
			templateUrl: 'mypubs/publication/contributors/contributor.html',
			controller: 'contributorCtrl'
		},
		{
			title:"Links",
			templateUrl: 'mypubs/publication/links/links.html',
			controller: 'linksCtrl'
		},
		{
			title:"SPN",
			templateUrl: 'mypubs/publication/spn/spn.html',
			controller: 'spnCtrl'
		},
		{
			title:"Cataloging",
			templateUrl: 'mypubs/publication/catalog/catalog.html',
			controller: 'catalogCtrl'
		},
		{
			title:"Geospatial",
			templateUrl: 'mypubs/publication/geo/geo.html',
			controller: 'geoCtrl'
		}
	];
}])
.controller('pubHeaderCtrl', [
'$scope', function ($scope) {
    $scope.localDisplayToPublicDate = $scope.pubData.displayToPublicDate;
    $scope.$watch('localDisplayToPublicDate', function(newDate) {
		if (newDate) {
			$scope.pubData.displayToPublicDate = moment(newDate).format('YYYY-MM-DDTHH:mm:ss');
		}
		else {
			$scope.pubData.displayToPublicDate = '';
		}
    });

}]);

}) ();
