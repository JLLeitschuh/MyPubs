describe("pw.bibliodata module", function(){
	var APP_CONFIG = {
        endpoint : 'https://dummy_service/'
    };
	beforeEach(function () {
		module(function ($provide) {
			$provide.value('APP_CONFIG', APP_CONFIG);
		});
	});

	beforeEach(function(){
        module('pw.bibliodata');
        module('pw.publication');
    });


	it('should have a pubs bibliodata module pw.bibliodata', function() {
		// angular should find a defined mod
		var def = true;
		try {
			angular.module('pw.bibliodata');
		} catch(e) {
			def = false;
		}
		expect( def ).toBeTruthy();
	});
        describe('pw.bibliodata.biblioCtrl', function() {
            var scope, rootScope, q, createController, mockLookupFetcher;
            var mockLookupCascadeSelect2;
            var LOOKUP_DATA = [{value : 1, text : 'Text1'}, {value : 2, text : 'Text2'}];

            beforeEach(function() {

                mockLookupFetcher = {
                    promise : function() {
                        return q.when({data : LOOKUP_DATA});
                    }
                };
                mockLookupCascadeSelect2 = jasmine.createSpyObj('mockLookupCascadeSelect2', ['query', 'initSelection']);
                spyOn(mockLookupFetcher, 'promise').andCallThrough();
            });

            beforeEach(inject(function($injector) {
                rootScope = $injector.get('$rootScope');
                scope = rootScope.$new();
                q = $injector.get('$q');

                var $controller = $injector.get('$controller');
                createController = function() {
                    return $controller('biblioCtrl', {
                        '$scope': scope,
                        'LookupFetcher' : mockLookupFetcher,
                        'LookupCascadeSelect2' : mockLookupCascadeSelect2,
                        '$routeParams': {}
                    });
                };
            }));

            it('Expects the change* functions to update the appropriate fields immediately', function() {
                inject(['Publication', function(Publication){
                        scope.pubData = Publication();
                }]);
                myCtrl = createController();
                var pubData = scope.pubData;
                scope.$digest();
                scope.localPubGenreId = 1;
                scope.localCollectionTitleId = 2;
                scope.changeType();
                scope.$digest();
                expect(pubData.publicationSubtype.id).toEqual('');
                expect(pubData.seriesTitle.id).toEqual('');

                pubData.localCollectionTitleId= 3;
                scope.$digest();
                scope.changeGenre();
                expect(pubData.seriesTitle.id).toEqual('');
            });

            describe('Tests with pub data', function() {
                beforeEach(function () {
					scope.pubData = {
						publicationType: {id: 1},
						publicationSubtype: {id: 2},
						'seriesTitle': {id: 3},
						'costCenters': [{id: 4}, {id: 5}],
						'subseriesTitle': 'text1',
						seriesNumber: 'text2',
						'chapter': 'text3',
						'subchapterNumber': 'text4',
						'title': 'text5',
						'docAbstract': 'text6',
						'usgsCitation': 'text7',
						'language': 'text8',
						'publisher': 'text9',
						'publisherLocation': 'text10',
						'largerWorkType': {id: 6},
						'largerWorkSubtype': {id: 7},
						'doi': 'text11',
						'issn': 'text12',
						'isbn': 'text13'
					};
				});

                it('Expects that genre and collection-title are cleared after changeType is called', function() {
                    myCtrl = createController();
                    var pubData = scope.pubData;
                    scope.$digest();
                    expect(pubData.publicationSubtype.id).toEqual(2);
                    expect(pubData.seriesTitle.id).toEqual(3);
                    scope.changeType();
                    scope.$digest();
                    expect(pubData.publicationSubtype.id).toEqual('');
                    expect(pubData.seriesTitle.id).toEqual('');
                });

                it('Expects collection-title is cleared after changeGenre is called', function() {
                    myCtrl = createController();
                    var pubData = scope.pubData;
                    scope.$digest();
                    expect(pubData.seriesTitle.id).toEqual(3);
                    scope.changeGenre();
                    scope.$digest();
                    expect(pubData.seriesTitle.id).toEqual('');
                });


                it('The subtypeSelect2Options.query should use the LookupCascadeSelect2 service', function() {
                    var query, queryParam;
                    myCtrl = createController();
                    scope.$digest();

                    query = scope.subtypeSelect2Options.query;
                    queryParam = {callback : jasmine.createSpy('queryCallback')};
                    query(queryParam);
                    expect(mockLookupCascadeSelect2.query).toHaveBeenCalledWith(
                        queryParam, 'publicationsubtypes', {publicationtypeid : 1});
                });

                it('The subtypeSelect2Options.initSelection should set the initial selection', function() {
                    var element, callback, initSelection;
                    callback = jasmine.createSpy('initCallback');

                    myCtrl = createController();
                    initSelection = scope.subtypeSelect2Options.initSelection;

                    initSelection(element, callback);
                    expect(mockLookupCascadeSelect2.initSelection).toHaveBeenCalledWith(
                        'publicationsubtypes', {publicationtypeid : 1}, 2, callback);
                });

                it('Expects publicationseries lookup by used to set the active and inactive select options for series', function() {
                    myCtrl = createController();
                    scope.$digest();

					expect(mockLookupFetcher.promise).toHaveBeenCalledWith('publicationseries', {publicationsubtypeid : 2, active : 'y'});
					expect(mockLookupFetcher.promise).toHaveBeenCalledWith('publicationseries', {publicationsubtypeid : 2, active : 'n'});
					expect(scope.activeSeries).toEqual(LOOKUP_DATA);
					expect(scope.notActiveSeries).toEqual(LOOKUP_DATA);
				});
            });
        });
});