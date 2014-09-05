(function() {
var PUB_ROOT = '/Publication';
angular.module('pw.publication', ['ngRoute', 'pw.notify',
	'pw.bibliodata', 'pw.catalog', 'pw.contacts', 'pw.links', 'pw.contributors', 'pw.fetcher' // pub edit modules
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
			    pubData : ['$route', 'Publication', function($route, Publication) {
                    var pubsId = $route.current.params.pubsid;
                    return Publication(pubsId);
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
                "abstract": "",
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
                "contact": {
                  "id": ''
                },
                "ipdsId": "",
                "publicationYear": "",
                "conferenceTitle": "",
                "conferenceDate": "",
                "conferenceLocation": "",
                "largerWorkType": {
                  "id": ''
                },
                "largerWorkTitle": "",
                "lastModifiedDate": "",
                "productDescription": "",
                "startPage": "",
                "endPage": "",
                "numberOfPages": "",
                "onlineOnly": "N",
                "additionalOnlineFiles": "N",
                "temporalStart": "",
                "temporalEnd": "",
                "authors": [],
                "editors": [],
                "validation-errors": []
              };
				angular.forEach(properties, function(defaultValue, propertyName){
					self[propertyName] = defaultValue;
				});
        };
				/**
		 * Is this Publication new?
		 * @returns {Boolean} false if the pub's id is a non-zero-length String or a Number, true otherwise
		 */
		SkeletonPublication.prototype.isNew = function(){
			var isNew = true;
			var id = this.id;
			if(angular.isString(id) && id.length > 1){
				isNew = false;
			}
			else if(angular.isNumber(id)){
				isNew = false;
			}
			return isNew;
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
[ '$scope', '$routeParams', '$route', 'pubData', 'PublicationPersister', 'Notifier', '$location',
function($scope, $routeParams, $route, pubData, PublicationPersister, Notifier, $location) {
	$scope.pubData = pubData;
	/**
	 *
	 * @returns {Promise}
	 */
	$scope.persistPub = function(){
		var persistencePromise = PublicationPersister.persistPub($scope.pubData);
		persistencePromise
		.then(function(returnedPubData){
			
			if($scope.pubData.isNew()){
				$location.path(PUB_ROOT + '/' + returnedPubData.id);
			}
			else{
				$scope.pubData.lastModifiedDate = returnedPubData.lastModifiedDate;
			}
			Notifier.notify('Publication successfully saved');
		}, function(reason){
			if(reason['validation-errors']){
				$scope.pubData['validation-errors'] = reason['validation-errors'];
				Notifier.error('Publication not saved; there were validation errors.');
			}
			else if (reason.message){
				Notifier.error(reason.message);
			}
			else{
				Notifier.error('Publication not saved; there were unanticipated errors. Consult browser logs');
				throw new Error(reason);
			}
		});
		return persistencePromise;
	};

    $scope.returnToSearch = function(){
    	//TODO verify dirty form status before allowing a return
		$location.path("/Search");
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
			title:"Contacts",
			templateUrl: 'mypubs/publication/contacts/contact.html',
			controller: 'contactCtrl'
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

        var pubData = $scope.pubData;
        console.log(pubData);
		var dateForScope;
        if ( angular.isDefined(pubData.displayToPublicDate) && pubData.displayToPublicDate.length !== 0) {
            //write out new date property as a date object
            dateForScope = new Date(pubData.displayToPublicDate);
        }
		else{
			dateForScope = new Date();
		}
		$scope.date = dateForScope;
		$scope.$watch('date', function(newDate){
			/*
			 While the controller scope can have date objects, we need to put
			 strings in the model. In this case the server requires a custom
			 serialization that slightly modifies ISO-8601 by removing the
			 time zone.
			*/
			pubData.displayToPublicDate = newDate.toJSON().replace(/[zZ]/, '');
		});

    }]);

}) ();
