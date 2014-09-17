describe('Tests for pw.editContributor', function() {

    var $q, mockContributorFetcher, fetcherDeferred, $rootScope;

    beforeEach(module('pw.editContributor'));

	beforeEach(module('pw.editContributor', function($provide) {
	    $provide.value('ContributorFetcher', mockContributorFetcher);
	}));

	beforeEach(function() {
	    mockContributorFetcher = {
		fetchContributorById : function(id) {
		  var fetcherDeferred = $q.defer();

		    var result;
		    if (id === 100) {
			// This is missing a field
			result = {
			    contributorId : id,
			    organization : 'Org1',
			    corporation : true,
			    usgs : false
			}
		    }
		    else {
			result = {
			    contributorId : id,
			    family : 'Jim',
			    given : 'Olsen',
			    suffix : 'JR',
			    email : 'jolsen@gmail.com',
			    affiliation : {id : 2, text : 'A2'},
			    corporation : false,
			    usgs : false
			};
		    }

		    fetcherDeferred.resolve({data : result});
		    return fetcherDeferred.promise;
		}
	    };

	    spyOn(mockContributorFetcher, 'fetchContributorById').andCallThrough();
	});

	beforeEach(inject(function($injector) {
	    $q = $injector.get('$q');
	    $rootScope = $injector.get('$rootScope');
	}));

    describe('Tests for routing', function() {

	it('Should have Contributor as a known route', inject(function($route){
	    var exists = false;
	    angular.forEach($route.routes, function(route, path) {
		exists |= path === '/Contributor';
	    });
	}));
    });

    describe('Tests for ContributorData factory', function() {

	it('Creates an empty contributor if no id is passed to factory function', inject(function(ContributorData) {
	    var contrib = new ContributorData();
	    expect(contrib.contributorId).toEqual('');
	    expect(contrib.corporation).toEqual('');
	    expect(contrib.usgs).toEqual(false);
	}));

	it('Expects isNew to return true for a new contributor', inject(function(ContributorData) {
	    var contrib = new ContributorData();
	    expect(contrib.isNew()).toBe(true);
	}));

	it('Expects isNew to return false if the contributor has an id', inject(function(ContributorData) {
	    var contrib = new ContributorData();
	    contrib.contributorId = '1';
	    expect(contrib.isNew()).toBe(false);
	}));

	it('Expects a new contributor to return false for isPerson and isCorporation', inject(function(ContributorData) {
	    var contrib = new ContributorData();
	    expect(contrib.isCorporation()).toBe(false);
	    expect(contrib.isPerson()).toBe(false);
	}));

	it('Expects a corporation contributor to return true for isCorporation', inject(function(ContributorData) {
	    var contrib = new ContributorData();
	    contrib.corporation = true;
	    expect(contrib.isCorporation()).toBe(true);
	    expect(contrib.isPerson()).toBe(false);
	}));

	it('Expects a non corporation contributor to return true for isPerson', inject(function(ContributorData) {
	    var contrib = new ContributorData();
	    contrib.corporation = false;
	    expect(contrib.isPerson()).toBe(true);
	    expect(contrib.isCorporation()).toBe(false);
	}));

	it('Expects a USGS contributor to return true for isUSGS', inject(function(ContributorData) {
	    var contrib = new ContributorData();
	    contrib.usgs = true;
	    expect(contrib.isUSGS()).toBe(true);
	}));

	it('Expects a non USGS contributor to return false for isUSGS', inject(function(ContributorData) {
	    var contrib = new ContributorData();
	    contrib.usgs = false;
	    expect(contrib.isUSGS()).toBe(false);
	}));

	it('Expects getData to return an object appropriate for persisting the data', inject(function(ContributorData) {
	   var contrib = new ContributorData();
	   contrib.corporation = true;
	   contrib.contributorId = '1';
	   contrib.organization = 'Org1';
	   contrib.usgs = false;
	   expect(contrib.getData()).toEqual({contributorId : '1', organization : 'Org1', corporation : true, usgs : false });

	   contrib.family = 'F1';
	   contrib.given = 'G1';
	   contrib.suffix = 'S1';
	   contrib.email = 'E1';
	   contrib.affiliation = {id : '1'};
	   contrib.corporation = false;
	   expect(contrib.getData()).toEqual({contributorId : '1', family : 'F1', given : 'G1', suffix : 'S1', email : 'E1', affiliation : {id : '1'}, corporation : false, usgs : false});
	}));


	it('Expects the contributor fetcher to be used to create a new contrib if contributorID is specfied', inject(function(ContributorData) {
	    var contrib;
	    var contribPromise = new ContributorData(1);
	    $rootScope.$apply();
	    contribPromise.then(function(data) {
		contrib = data;
	    });
	    $rootScope.$apply();
	    expect(contrib.contributorId).toEqual(1);
	    expect(contrib.organization).toEqual('');
	    expect(contrib.family).toEqual('Jim');
	}));
    });

    describe('Tests for editContributorCtrl', function() {
	COST_CENTERS = [{id : 1, text : 'CC1'}, {id : 2, text : 'CC2'}, {id : 3, text : 'CC3'}];
	OUTSIDE_AFFILIATIONS = [{id : 1, text : 'A1'}, {id : 2, text : 'A2'}, {id : 3, text : 'A3'}];

	var mockLocation, mockNotifier, mockLookupFetcher, $scope, ContributorData, mockContributorPersister, $q, mockRoute;
	var createController;

	beforeEach(function() {
	    mockNotifier = jasmine.createSpyObj('mockNotifier', ['notify', 'error']);
	    mockRoute = jasmine.createSpyObj('mockRoute', ['reload']);
	    mockLocation = jasmine.createSpyObj('mockLocation', ['path']);

	    mockLookupFetcher = {
		promise : function(lookup) {
		    var result = [];
		    var deferred = $q.defer();
		    if (lookup === 'costcenters') {
			result = COST_CENTERS;
		    }
		    else if (lookup === 'outsideaffiliates') {
			result = OUTSIDE_AFFILIATIONS;
		    }
		    deferred.resolve({data : result});
		    return deferred.promise;
		}
	    };
	    spyOn(mockLookupFetcher, 'promise').andCallThrough();

	    mockContributorPersistor = {
		persistContributor : function(data) {
		    var deferred = $q.defer();
		    if (data.contributorId === 2) {
			deferred.reject({'validationErrors' : 'Validation errors'});
		    }
		    else if (data.contributorId === 3) {
			deferred.reject({'message' : 'Internal server error'});
		    }
		    else {
			if (!data.contributorId) {
			    data.contributorId = 1000;
			}
			deferred.resolve(data);
		    }
		    return deferred.promise;
		}
	    };
	    spyOn(mockContributorPersistor, 'persistContributor').andCallThrough();
	});

	beforeEach(inject(function($injector) {
	    var $controller, $rootScope;

	    $rootScope = $injector.get('$rootScope');
	    $scope = $rootScope.$new();
	    $q = $injector.get('$q');
	    ContributorData = $injector.get('ContributorData');
	    $controller = $injector.get('$controller');

	    createController = function(thisContributor) {
		return $controller('editContributorCtrl', {
		    '$scope' : $scope,
		    '$route' : mockRoute,
		    '$location' : mockLocation,
		    'thisContributor' : thisContributor,
		    'LookupFetcher' : mockLookupFetcher,
		    'Notifier' : mockNotifier,
		    'ContributorPersister' : mockContributorPersistor
		});
	    };
	}));

	it('Expects that controller initialized with a non USGS contributor assigns the outside affiliations to affiliations', function() {
	    var contrib = ContributorData();
	    contrib.usgs = false;
	    var ctrl = createController(contrib);
	    $scope.$digest();

	    expect(mockLookupFetcher.promise).toHaveBeenCalledWith('outsideaffiliates');
	    expect($scope.affiliations).toEqual(OUTSIDE_AFFILIATIONS);
	});

	it('Expects that controller initialized with a USGS contributor assigns cost center to affiliations', function() {
	    var contrib = ContributorData();
	    contrib.usgs = true;
	    var ctrl = createController(contrib);
	    $scope.$digest();

	    expect(mockLookupFetcher.promise).toHaveBeenCalledWith('costcenters');
	    expect($scope.affiliations).toEqual(COST_CENTERS);
	});

	it('Expects that changing the localKind, updates the contributor\'s corporation property)', function() {
	    var ctrt = createController(ContributorData());
	    $scope.$digest();
	    $scope.localKind.id = 'P';
	    $scope.changeContribKind();
	    expect($scope.contributor.corporation).toBe(false);

	    $scope.localKind.id = 'C';
	    $scope.changeContribKind();
	    expect($scope.contributor.corporation).toBe(true);
	});

	it('Expects a change to localAffiliationId to update the contributor\'s affiliation', function() {
	    var ctrl = createController(ContributorData());
	    $scope.$digest();

	    $scope.localAffiliation.id = 1;
	    $scope.$digest();
	    expect($scope.contributor.affiliation.id).toEqual(1);

	    $scope.localAffiliation.id = 2;
	    $scope.$digest();
	    expect($scope.contributor.affiliation.id).toEqual(2);
	});

	it('Expects that a save for a new contributor changes the path to use the returned data\'s contributorId and to clear validationErrors', function() {
	    var ctrl = createController(ContributorData());
	    $scope.$digest();
	    $scope.contributor['validationErrors'] = 'Some error';

	    $scope.saveChanges();
	    expect(mockContributorPersistor.persistContributor).toHaveBeenCalled();
	    $scope.$digest();
	    expect(mockLocation.path).toHaveBeenCalledWith('Contributor/1000');
	    expect(mockNotifier.notify).toHaveBeenCalled();
	    expect($scope.contributor['validationErrors']).not.toBeDefined();
	});

	it('Expects a save for an existing contributor not to change the path and to clear validation errors', function() {
	    var contrib = ContributorData();
	    contrib.contributorId = 100;
	    var ctrl = createController(contrib);
	    $scope.$digest();
	    $scope.contributor['validationErrors'] = 'Some error';


	    $scope.saveChanges();
	    expect(mockContributorPersistor.persistContributor).toHaveBeenCalled();
	    $scope.$digest();
	    expect(mockLocation.path).not.toHaveBeenCalled();
	    expect(mockNotifier.notify).toHaveBeenCalled();
	    expect($scope.contributor['validationErrors']).not.toBeDefined();
	});

	it('Expects a save which returns validationErrors to add the validationErrors to scope', function() {
	    var contrib = ContributorData();
	    contrib.contributorId = 2;
	    var ctrl = createController(contrib);
	    $scope.$digest();

	    $scope.saveChanges();
	    expect(mockContributorPersistor.persistContributor).toHaveBeenCalled();
	    $scope.$digest();
	    expect($scope.contributor['validationErrors']).toBeDefined();
	    expect(mockNotifier.error).toHaveBeenCalled();
	});

	it('Expects a save which returns an unknown error to call notifier', function() {
	    var contrib = ContributorData();
	    contrib.contributorId = 3;
	    var ctrl = createController(contrib);
	    $scope.$digest();

	    $scope.saveChanges();
	    expect(mockContributorPersistor.persistContributor).toHaveBeenCalled();
	    $scope.$digest();
	    expect($scope.contributor['validationErrors']).not.toBeDefined();
	    expect(mockNotifier.error).toHaveBeenCalled();
	})

	it('Expects that calling cancel reloads the page', function() {
	    var ctrl = createController(ContributorData());
	    $scope.cancelChanges();
	    expect(mockRoute.reload).toHaveBeenCalled();
	});

	it('Expects that when changeAffiliationSelect is called it sets the affiliations to the correct set', function() {
	    var contrib = ContributorData();
	    contrib.usgs = false;
	    var ctrl = createController(contrib);
	    $scope.$digest();

	    $scope.contributor.usgs = true;
	    $scope.changeAffiliationSelect();
	    $scope.$digest();
	    expect($scope.affiliations).toEqual(COST_CENTERS);
	});

    });

});