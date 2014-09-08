describe('Tests for pw.contributorDAO', function() {

    var APP_CONFIG = {
        endpoint : 'https://dummy_service/'
    };
    var MIMETYPE = '?mimetype=json';

    it('Should have a pubs contributorDAO module', function() {
	expect(function() { angular.module('pw.contributorDAO'); }).not.toThrow();
    });

    describe('Tests for ContributorFetcher service', function() {
	var $httpBackend;

	beforeEach(module('pw.contributorDAO'));

	beforeEach(function () {
	    module(function ($provide) {
		    $provide.value('APP_CONFIG', APP_CONFIG);
	    });
	});

	beforeEach(inject(function($injector) {
	    $httpBackend = $injector.get('$httpBackend');
	    $httpBackend.when('GET', APP_CONFIG.endpoint + 'contributor/2' + MIMETYPE).respond({
		"id" : 2,
		"name" : "This Name"
	    });
	    $httpBackend.when('GET', APP_CONFIG.endpoint + 'contributor/12' + MIMETYPE).respond({
		"id" : 12,
		"name" : "That Name"
	    });
	}));

	afterEach(function() {
            $httpBackend.verifyNoOutstandingExpectation();
            $httpBackend.verifyNoOutstandingRequest();
        });

	it('Expects fetchContributorById to return a promise', inject(function(ContributorFetcher) {
	    var promiseSpy = jasmine.createSpy('promiseSpy');
	    var promise = ContributorFetcher.fetchContributorById(2).then(promiseSpy);

	    $httpBackend.expectGET(APP_CONFIG.endpoint + 'contributor/2' + MIMETYPE);

	    $httpBackend.flush();
	    expect(promiseSpy).toHaveBeenCalled();
	    expect(promiseSpy.calls[0].args[0].data).toEqual({id : 2, name : 'This Name'});
	}));
    });

    describe('Tests for ContributorPersister', function() {
	var $httpBackend, successSpy, errorSpy;

	beforeEach(module('pw.contributorDAO'));

	beforeEach(function() {
	    module(function($provide) {
		$provide.value('APP_CONFIG', APP_CONFIG);
	    });

	    successSpy = jasmine.createSpy('successSpy');
	    errorSpy = jasmine.createSpy('errorSpy');
	});

	beforeEach(inject(function($injector) {
	    $httpBackend = $injector.get('$httpBackend');
	    $q = $injector.get('$q');
	}));

	afterEach(function() {
	    $httpBackend.verifyNoOutstandingExpectation();
	    $httpBackend.verifyNoOutstandingRequest();
       });

	it('Expects a new corporation to use post with corporation endpoint', inject(function(ContributorPersister) {
	    var corporation = {
		contributorId : '',
		organization : 'Org1',
		corporation : true,
		usgs : false
	    };

	    $httpBackend.expectPOST(APP_CONFIG.endpoint + 'corporation', corporation)
		.respond(201, {contributorId : '1', organization : 'Org1', corporation : true, usgs : false});
	    ContributorPersister.persistContributor(corporation).then(successSpy, errorSpy);

	    $httpBackend.flush();
	    expect(successSpy).toHaveBeenCalled();
	}));

	it('Expects a new USGS person to use post with usgs endpoint', inject(function(ContributorPersister) {
	    var person = {
		contributorId : '',
		family : 'Smith',
		corporation : false,
		usgs : true
	    };

	    $httpBackend.expectPOST(APP_CONFIG.endpoint + 'usgscontributor', person).respond(201, {contributorId : '1'});
	    ContributorPersister.persistContributor(person).then(successSpy, errorSpy);

	    $httpBackend.flush();
	    expect(successSpy).toHaveBeenCalled();
	}));

	it('Expects a new non USGS person to use post with outsider endpoint', inject(function(ContributorPersister) {
	    var person = {
		contributorId : '',
		family : 'Smith',
		corporation : false,
		usgs : false
	    };

	    $httpBackend.expectPOST(APP_CONFIG.endpoint + 'outsidecontributor', person).respond(201, {contributorId : '1'});
	    ContributorPersister.persistContributor(person).then(successSpy, errorSpy);

	    $httpBackend.flush();
	    expect(successSpy).toHaveBeenCalled();
	}));

	it('Expects the errorSpy to be called if the create service fails', inject(function(ContributorPersister) {
	    var person = {
		contributorId : '',
		family : 'Smith',
		corporation : false,
		usgs : false
	    };

	    $httpBackend.expectPOST(APP_CONFIG.endpoint + 'outsidecontributor', person).respond(500, 'Internal server error');
	    ContributorPersister.persistContributor(person).then(successSpy, errorSpy);

	    $httpBackend.flush();
	    expect(errorSpy).toHaveBeenCalled();
	}));

	it('Expects an existing corporation to use put with corporation endpoint', inject(function(ContributorPersister) {
	    var corporation = {
		contributorId : '1',
		organization : 'Org1',
		corporation : true,
		usgs : false
	    };

	    $httpBackend.expectPUT(APP_CONFIG.endpoint + 'corporation/1', corporation)
		.respond(200, {contributorId : '1', organization : 'Org1', corporation : true, usgs : false});
	    ContributorPersister.persistContributor(corporation).then(successSpy, errorSpy);

	    $httpBackend.flush();
	    expect(successSpy).toHaveBeenCalled();
	}));

	it('Expects an existing USGS person to use post with usgs endpoint', inject(function(ContributorPersister) {
	    var person = {
		contributorId : '1',
		family : 'Smith',
		corporation : false,
		usgs : true
	    };

	    $httpBackend.expectPUT(APP_CONFIG.endpoint + 'usgscontributor/1', person).respond(201, {contributorId : '1'});
	    ContributorPersister.persistContributor(person).then(successSpy, errorSpy);

	    $httpBackend.flush();
	    expect(successSpy).toHaveBeenCalled();
	}));

	it('Expects an existing non USGS person to use post with usgs endpoint', inject(function(ContributorPersister) {
	    var person = {
		contributorId : '1',
		family : 'Smith',
		corporation : false,
		usgs : false
	    };

	    $httpBackend.expectPUT(APP_CONFIG.endpoint + 'outsidecontributor/1', person).respond(201, {contributorId : '1'});
	    ContributorPersister.persistContributor(person).then(successSpy, errorSpy);

	    $httpBackend.flush();
	    expect(successSpy).toHaveBeenCalled();
	}));

	it('Expects the errorSpy to be called if the update service fails', inject(function(ContributorPersister) {
	    var person = {
		contributorId : '1',
		family : 'Smith',
		corporation : false,
		usgs : false
	    };

	    $httpBackend.expectPUT(APP_CONFIG.endpoint + 'outsidecontributor/1', person).respond(500, 'Internal server error');
	    ContributorPersister.persistContributor(person).then(successSpy, errorSpy);

	    $httpBackend.flush();
	    expect(errorSpy).toHaveBeenCalled();
	}));

    });
});

