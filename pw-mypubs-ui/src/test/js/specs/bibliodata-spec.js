describe("pw.bibliodata module", function(){


	beforeEach( module('pw.bibliodata') )


	it('should have a pubs bibliodata module pw.bibliodata', function() {
		// angular should find a defined mod
		var def = true;
		try {
			angular.module('pw.bibliodata')
		} catch(e) {
			def = false;
		}
		expect( def ).toBeTruthy();
	});

        describe('pw.bibliodata.biblioCtrl', function() {
            var scope, rootScope, q, createController, mockPubFetcher, mockLookupFetcher;
            var mockLookupCascadeSelect2;
            var LOOKUP_DATA = [{value : 1, text : 'Text1'}, {value : 2, text : 'Text2'}];

            beforeEach(function() {
                scope = {};

                mockPubFetcher = {
                    get : jasmine.createSpy('mockPubFetcher.get')
                };
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
                        'PublicationFetcher': mockPubFetcher,
                        'LookupFetcher' : mockLookupFetcher,
                        'LookupCascadeSelect2' : mockLookupCascadeSelect2
                    });
                };
            }));

            it('Should initialize the appropriate fields when no pubs data is returned from fetcher', function() {
                mockPubFetcher.get.andReturn({});

                myCtrl = createController();
                scope.$digest();
                expect(scope.type).toBeFalsy();
                expect(scope.genre).toBeFalsy();
                expect(scope.collection_title).toBeFalsy();
                expect(scope.typeOptions).toEqual(LOOKUP_DATA);
                expect(scope.subtypeSelect2Options.query).toBeDefined();
                expect(scope.subtypeSelect2Options.initSelection).toBeDefined();
                expect(scope.seriesTitleSelect2Options.query).toBeDefined();
                expect(scope.seriesTitleSelect2Options.initSelection).toBeDefined();
            });

            describe('Tests with pub data', function() {
                beforeEach(function() {
                    mockPubFetcher.get.andReturn({properties : {
                        type : {id : 1},
                        genre : {id : 2},
                        'collection-title' : {id : 3}
                    }});
                });

                it('Should initialize the appropriate fields when pubs data is returned from fetcher', function() {
                    myCtrl = createController();
                    expect(scope.type).toEqual(1);
                    expect(scope.genre).toEqual(2);
                    expect(scope.collection_title).toEqual(3);
                });

                it('Expects that if type is changed, genre is cleared', function() {
                    myCtrl = createController();
                    scope.$digest();
                    scope.genre = 2;
                    expect(scope.genre).toEqual(2);

                    scope.type = 3;
                    scope.$digest();
                    expect(scope.genre).toEqual('');
                });

                it('Expects that if genre is changed, collection_title is cleared', function() {
                    myCtrl = createController();
                    scope.$digest();
                    scope.collection_title = 3;
                    expect(scope.collection_title).toEqual(3);

                    scope.genre = 3;
                    scope.$digest();
                    expect(scope.collection_title).toEqual('');
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

                it('The seriesTitleSelect2Options.query should use the LookupCascadeSelect2 service', function() {
                    var query, queryParam;
                    myCtrl = createController();
                    scope.$digest();

                    // This mocks what happend when the subtype select changes
                    scope.genre = {id : 2};
                    scope.$digest();

                    query = scope.seriesTitleSelect2Options.query;
                    queryParam = {callback : jasmine.createSpy('queryCallback')};
                    query(queryParam);
                    expect(mockLookupCascadeSelect2.query).toHaveBeenCalledWith(
                        queryParam, 'publicationseries', {publicationsubtypeid : 2});
                });

                it('The seriesTitleSelect2Options.initSelection should set the initial selection', function() {
                    var element, callback, initSelection;
                    callback = jasmine.createSpy('initCallback');

                    myCtrl = createController();
                    initSelection = scope.seriesTitleSelect2Options.initSelection;

                    initSelection(element, callback);
                    expect(mockLookupCascadeSelect2.initSelection).toHaveBeenCalledWith(
                        'publicationseries', {publicationsubtypeid : 2}, 3, callback);
                });
            });
        });
});