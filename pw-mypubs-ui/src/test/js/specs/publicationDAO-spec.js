describe('pw.publicationDAO module', function() {

    var APP_CONFIG = {
        endpoint : 'https://dummy_service/'
    };
    var MIMETYPE = '?mimetype=json';

    it('should have a pubs fetcher module pw.fetcher', function() {
	    expect(function() { angular.module('pw.publicationDAO'); }).not.toThrow();
    });

	describe('pw.publicationDAO.PublicationPersister', function () {
		var $httpBackend, PublicationPersister, Publication, PubEndpoint, newPublication, existingPublication;

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

				PublicationPersister = $injector.get('PublicationPersister');

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

			PublicationPersister.persistPub(newPublication);

			$httpBackend.expectPOST(PubEndpoint, prunedPublication);
			$httpBackend.flush();
		});
		it('should PUT existing pubs and it should not include validation errorsor last modified date', function(){
			var prunedPublication = _.clone(existingPublication);
			delete prunedPublication['validationErrors'];
			delete prunedPublication.lastModifiedDate;

			PublicationPersister.persistPub(existingPublication);

			$httpBackend.expectPUT(PubEndpoint + existingPublication.id, prunedPublication);
			$httpBackend.flush();
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