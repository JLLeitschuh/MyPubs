(function() {
    angular.module('pw.editContributor', ['ngRoute', 'pw.lookups', 'pw.modal', 'pw.notify', 'pw.contributorDAO'])

	.config(['$routeProvider', function($routeProvider) {
	    $routeProvider.when('/Contributor', {
		templateUrl : 'mypubs/contributor/edit_contributor.html',
		controller : 'editContributorCtrl',
		resolve: {
		    thisContributor : ['ContributorData', function(ContributorData) {
			    return ContributorData();
		    }]
		}
	    });
	    $routeProvider.when('/Contributor/:contributorid', {
		templateUrl : 'mypubs/contributor/edit_contributor.html',
		controller : 'editContributorCtrl',
		resolve : {
		    thisContributor : ['$route', 'ContributorData', function($route, ContributorData) {
			    var contributorId = $route.current.params.contributorid;
			    return ContributorData(contributorId);
		    }]
		}
	    });
	}])

	.factory('ContributorData', ['ContributorFetcher', '$q', function(ContributorFetcher, $q) {
	    var SkeletonContributor = function() {
		var self = this;
		var properties = {
		    contributorId : '',
		    family : '',
		    given : '',
		    suffix : '',
		    email : '',
		    affiliation : {id : ''},
		    organization : '',
		    corporation : '',
		    usgs : false
		};

		angular.forEach(properties, function(defaultValue, propertyName) {
		    self[propertyName] = defaultValue;
		});
	    };

	    SkeletonContributor.prototype = {
		isNew : function() {
		    return !(this.contributorId);
		},
		isCorporation : function() {
		    return (this.corporation === true);
		},
		isPerson : function() {
		    return (this.corporation === false);
		},
		isUSGS : function() {
		    return this.usgs;
		},
		getData : function() {
		    if (this.isCorporation()) {
			return {
			    contributorId : this.contributorId,
			    organization : this.organization,
			    corporation : this.corporation,
			    usgs : this.usgs
			};
		    }
		    else {
			return {
			    contributorId : this.contributorId,
			    family : this.family,
			    given : this.given,
			    suffix : this.suffix,
			    email : this.email,
			    affiliation : this.affiliation,
			    corporation : this.corporation,
			    usgs : this.usgs
			};
		    }
		}

	    };

	    var getContributor = function(contributorId){
		var result;
		if (contributorId) {
		    var deferred = $q.defer();

		    ContributorFetcher.fetchContributorById(contributorId).then(function(response) {
			var safeContributor = new SkeletonContributor();
			angular.forEach(safeContributor, function(defaultValue, key) {
			   safeContributor[key] = (key in response.data) ? response.data[key] : defaultValue;
			});
			deferred.resolve(safeContributor);
		    });
		    result = deferred.promise;
		}
		else {
		    result = new SkeletonContributor();
		}
		return result;
	    };

	    return getContributor;
	}])

	.controller('editContributorCtrl', ['$scope', '$route', '$location', 'thisContributor', 'LookupFetcher', 'Notifier', 'ContributorPersister',
		function($scope, $route, $location, thisContributor, LookupFetcher, Notifier, ContributorPersister) {

	    var retrieveAffiliations = function(isUSGS) {
		var lookupKind;
		if (isUSGS) {
		    lookupKind = 'costcenters';
		}
		else {
		    lookupKind = 'outsideaffiliates';
		}
		LookupFetcher.promise(lookupKind).then(function(response) {
		    $scope.affiliations = response.data;
		});
	    };

	    $scope.contributor = thisContributor;

	    // Setting up person/corporation picker
	    $scope.contributorKinds = [{id : 'P', text: 'Person'}, {id : 'C', text : 'Corporation'}];

	    $scope.localKind = {id : ''};
	    $scope.changeContribKind = function() {
		$scope.contributor.corporation = ($scope.localKind.id === 'C');
	    };

	    // Setting up affiliations picker
	    $scope.localAffiliation = $scope.contributor.affiliation;
	    $scope.$watch('localAffiliation.id', function(value) {
		$scope.contributor.affiliation = {id : value, text: ''};
	    });

	    retrieveAffiliations($scope.contributor.isUSGS());

	    $scope.changeAffiliationSelect = function() {
		retrieveAffiliations($scope.contributor.isUSGS());
	    };

	    // Controller actions
	    $scope.saveChanges = function(){
		var persistancePromise = ContributorPersister.persistContributor($scope.contributor.getData());
		persistancePromise.
		    then(function(returnedData) {
			if ($scope.contributor.isNew()) {
			    $location.path('Contributor/' + returnedData.contributorId);
			}
			delete $scope.contributor['validation-errors'];
			Notifier.notify('Contributor successfully saved');
		    }, function(reason) {
			if (reason['validation-errors']) {
			    $scope.contributor['validation-errors'] = reason['validation-errors'];
			    Notifier.error('Contributor not saved - validation errors.');
			}
			else if (reason.message){
			    Notifier.error(reason.message);
			}
			else{
			    Notifier.error('Publication not saved; there were unanticipated errors. Consult browser logs');
			    throw new Error(reason);
			}
		    });
	    };

	    $scope.cancelChanges = function() {
		$route.reload();
	    };
	}]);
}) ();


