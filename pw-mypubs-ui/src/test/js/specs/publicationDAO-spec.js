describe('pw.publicationDAO module', function() {

    var APP_CONFIG = {
        endpoint : 'https://dummy_service/'
    };
    var MIMETYPE = '?mimetype=json';

    it('should have a pubs fetcher module pw.fetcher', function() {
	    expect(function() { angular.module('pw.publicationDAO'); }).not.toThrow();
    });

	describe('pw.publicationDAO.PublicationUpdater.persistPub', function () {
		var $httpBackend, PublicationUpdater, Publication, PubEndpoint, newPublication, existingPublication;

		beforeEach(module('pw.publicationDAO'));

		beforeEach(function () {
			module(function ($provide) {
				$provide.value('APP_CONFIG', APP_CONFIG);
			});
		});
		beforeEach(module('pw.publication'));

		beforeEach(function () {
			inject(function ($injector) {
				$httpBackend = $injector.get('$httpBackend');
				Publication = $injector.get('Publication');
				PubEndpoint = $injector.get('PubEndpoint');

				newPublication = new Publication();
				existingPublication = new Publication();
				existingPublication.id = 12;

				PublicationUpdater = $injector.get('PublicationUpdater');

				$httpBackend.when('POST', PubEndpoint).respond(newPublication);
				$httpBackend.when('PUT', PubEndpoint + existingPublication.id).respond(existingPublication);

			});
		});
		afterEach(function() {
			$httpBackend.verifyNoOutstandingExpectation();
			$httpBackend.verifyNoOutstandingRequest();
		});

		it('should POST new pubs and it should not include validation errors or last modified date', function(){
			var prunedPublication = _.clone(newPublication);
			delete prunedPublication['validationErrors'];
			delete prunedPublication.lastModifiedDate;

			PublicationUpdater.persistPub(newPublication);

			$httpBackend.expectPOST(PubEndpoint, prunedPublication);
			$httpBackend.flush();
		});
		it('should PUT existing pubs and it should not include validation errorsor last modified date', function(){
			var prunedPublication = _.clone(existingPublication);
			delete prunedPublication['validationErrors'];
			delete prunedPublication.lastModifiedDate;

			PublicationUpdater.persistPub(existingPublication);

			$httpBackend.expectPUT(PubEndpoint + existingPublication.id, prunedPublication);
			$httpBackend.flush();
		});

	});

	describe('pw.publicationDAO.PublicationUpdate.releasePub', function() {
		var $httpBackend, PubEndpoint, PublicationUpdater
		var successSpy, errorSpy;

		beforeEach(module('pw.publicationDAO'));

		beforeEach(function () {
			module(function ($provide) {
				$provide.value('APP_CONFIG', APP_CONFIG);
			});
		});
		beforeEach(module('pw.publication'));

		beforeEach(function () {
			inject(function ($injector) {
				$httpBackend = $injector.get('$httpBackend');
				PubEndpoint = $injector.get('PubEndpoint');

				successSpy = jasmine.createSpy('successSpy');
				errorSpy = jasmine.createSpy('errorSpy');


				PublicationUpdater = $injector.get('PublicationUpdater');
				$httpBackend.when('POST', PubEndpoint + 'release', {id : 1}).respond({validationErrors : []});
				$httpBackend.when('POST', PubEndpoint + 'release', {id : 2}).respond(400, {validationErrors : 'a validation error'});
			});
		});

		afterEach(function() {
			$httpBackend.verifyNoOutstandingExpectation();
			$httpBackend.verifyNoOutstandingRequest();
		});

		it('Expects a successful response to resolve and send no errors', function() {
			PublicationUpdater.releasePub(1).then(successSpy, errorSpy);
			$httpBackend.expectPOST(PubEndpoint + 'release', {id : 1});
			$httpBackend.flush();
			expect(successSpy).toHaveBeenCalled();
			expect(errorSpy).not.toHaveBeenCalled();
		});

		it('Expects a response with validation errors to call error handler with errors', function() {
			PublicationUpdater.releasePub(2).then(successSpy, errorSpy);
			$httpBackend.expectPOST(PubEndpoint + 'release', {id : 2});
			$httpBackend.flush();
			expect(successSpy).not.toHaveBeenCalled();
			expect(errorSpy).toHaveBeenCalledWith({validationErrors : 'a validation error'});
		});
	});

	describe('pw.publicationDAO.PublicationUpdate.publishPub', function() {
		var $httpBackend, PubEndpoint, PublicationUpdater
		var successSpy, errorSpy;

		beforeEach(module('pw.publicationDAO'));

		beforeEach(function () {
			module(function ($provide) {
				$provide.value('APP_CONFIG', APP_CONFIG);
			});
		});
		beforeEach(module('pw.publication'));

		beforeEach(function () {
			inject(function ($injector) {
				$httpBackend = $injector.get('$httpBackend');
				PubEndpoint = $injector.get('PubEndpoint');

				successSpy = jasmine.createSpy('successSpy');
				errorSpy = jasmine.createSpy('errorSpy');


				PublicationUpdater = $injector.get('PublicationUpdater');
				$httpBackend.when('POST', PubEndpoint + 'publish', {id : 1}).respond({validationErrors : []});
				$httpBackend.when('POST', PubEndpoint + 'publish', {id : 2}).respond(400, {validationErrors : 'a validation error'});
			});
		});

		afterEach(function() {
			$httpBackend.verifyNoOutstandingExpectation();
			$httpBackend.verifyNoOutstandingRequest();
		});

		it('Expects a successful response to resolve and send no errors', function() {
			PublicationUpdater.publishPub(1).then(successSpy, errorSpy);
			$httpBackend.expectPOST(PubEndpoint + 'publish', {id : 1});
			$httpBackend.flush();
			expect(successSpy).toHaveBeenCalled();
			expect(errorSpy).not.toHaveBeenCalled();
		});

		it('Expects a response with validation errors to call error handler with errors', function() {
			PublicationUpdater.publishPub(2).then(successSpy, errorSpy);
			$httpBackend.expectPOST(PubEndpoint + 'publish', {id : 2});
			$httpBackend.flush();
			expect(successSpy).not.toHaveBeenCalled();
			expect(errorSpy).toHaveBeenCalledWith({validationErrors : 'a validation error'});
		});
	});

	describe('pw.publicationDAO.PublicationUpdate.deletePub', function() {
		var $httpBackend, PubEndpoint, PublicationUpdater
		var successSpy, errorSpy;

		beforeEach(module('pw.publicationDAO'));

		beforeEach(function () {
			module(function ($provide) {
				$provide.value('APP_CONFIG', APP_CONFIG);
			});
		});
		beforeEach(module('pw.publication'));

		beforeEach(function () {
			inject(function ($injector) {
				$httpBackend = $injector.get('$httpBackend');
				PubEndpoint = $injector.get('PubEndpoint');

				successSpy = jasmine.createSpy('successSpy');
				errorSpy = jasmine.createSpy('errorSpy');


				PublicationUpdater = $injector.get('PublicationUpdater');
				$httpBackend.when('DELETE', PubEndpoint + '1', {}).respond({validationErrors : []});
				$httpBackend.when('DELETE', PubEndpoint + '2', {}).respond(400, {validationErrors : 'a validation error'});
			});
		});

		afterEach(function() {
			$httpBackend.verifyNoOutstandingExpectation();
			$httpBackend.verifyNoOutstandingRequest();
		});

		it('Expects a successful response to resolve and send no errors', function() {
			PublicationUpdater.deletePub(1).then(successSpy, errorSpy);
			$httpBackend.expectDELETE(PubEndpoint + '1');
			$httpBackend.flush();
			expect(successSpy).toHaveBeenCalled();
			expect(errorSpy).not.toHaveBeenCalled();
		});

		it('Expects a response with validation errors to call error handler with errors', function() {
			PublicationUpdater.deletePub(2).then(successSpy, errorSpy);
			$httpBackend.expectDELETE(PubEndpoint + '2');
			$httpBackend.flush();
			expect(successSpy).not.toHaveBeenCalled();
			expect(errorSpy).toHaveBeenCalledWith({validationErrors : 'a validation error'});
		});
	});

    describe('pw.publicationDAO.PublicationFetcher', function() {
		var $httpBackend, PubEndpoint;
        beforeEach(module('pw.publicationDAO'));

        beforeEach(function() {
            module(function($provide) {
                $provide.value('APP_CONFIG', APP_CONFIG);
            });
        });

        beforeEach(inject(function($injector) {
			PubEndpoint = $injector.get('PubEndpoint');
            $httpBackend = $injector.get('$httpBackend');
            $httpBackend.when('GET', PubEndpoint + '12' + MIMETYPE).respond({
                "id": 12,
                "type": {
                    "id": 18,
                    "validationErrors": null
                },
                "genre": {
                    "id": 5,
                    "validationErrors": null
                }
            });
            $httpBackend.when('GET', PubEndpoint + '120' + MIMETYPE).respond({
                "id": 120,
                "type": {
                    "id": 28,
                    "validationErrors": null
                },
                "genre": {
                    "id": 25,
                    "validationErrors": null
                }
            });
        }));

        afterEach(function() {
            $httpBackend.verifyNoOutstandingExpectation();
            $httpBackend.verifyNoOutstandingRequest();
        });

        it('Expects fetchPubById to return a promise', inject(function(PublicationFetcher) {
            var promiseSpy = jasmine.createSpy('promiseSpy');
            var promise = PublicationFetcher.fetchPubById(12).then(promiseSpy);

            $httpBackend.expectGET(PubEndpoint + '12' + MIMETYPE);

            $httpBackend.flush();
            expect(promiseSpy).toHaveBeenCalled();
            expect(promiseSpy.calls[0].args[0].data.id).toEqual(12);
        }));
    });

});