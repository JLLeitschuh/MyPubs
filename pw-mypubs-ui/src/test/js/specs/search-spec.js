
describe("pw.search module", function(){

	beforeEach(function(){

		module('pw.auth','pw.search', 'ngRoute', 'ngGrid', 'pw.publicationDAO', 'pw.modal');

	});


	it('should have a pubs Search module pw.search', function() {
		// angular should find a defined mod
		var def = true
		try {
			angular.module('pw.search');
		} catch(e) {
			def = false;
		}
		expect( def ).toBeTruthy();
	});


	it("should have Search as a known route", inject(function($route){
		var exists = false;

		angular.forEach($route.routes, function(route, path) {
			exists |= path==='/Search';
		});

		expect(exists).toBeTruthy();

	}));

	describe('pw.search.searchCtrl', function() {
		var scope, location, fetcher, pubsModal, q, pubsGridEl, pubsListsGridEl;

		//TODO this is an anticipated format, update when service side is done
		var PUB_LISTS =
			[
			 	{"id": 1, "name": "List 1", "description" : "List description 1"},
			 	{"id": 2, "name": "List 2", "description" : "List description 2"}
			 ];

		var PUB_SEARCH_RESULTS =
			{"pageSize":"15",
			"pageRowStart":"0",
			"recordCount":2,
			"records":[
			    //pub one
				{"id":1,"title":"TEST TITLE 1","language":"English","publisher":"Publisher1","collaboration":"Collab desc","links":[{"id":1,"rank":1,"type":{"id":1, "name": "LinkTypeName1"},"url":"www.wow.org","text":"amazing link","size":"12 GB","linkFileType":{"id":1, "name": "LinkFileTypeName1"},"description":"link desc 1"},{"id":2,"rank":2,"type":{"id":2, "name": "LinkTypeName2"},"url":"www.xyz.org","text":"end of the line","size":"1 TB","linkFileType":{"id":2, "name": "LinkFileTypeName2"},"description":"link desc 2"}],"indexId":"pub1IndexId","displayToPublicDate":"2014-07-14T17:27:36.000","publicationType":{"id":1, "name": "PubTypeName1"},"publicationSubtype":{"id":2, "name": "PubTypeName2"},"seriesTitle":{"id":1, "title": "Series1Title"},"seriesNumber":"seriesNumber1","subseriesTitle":"Subseries Title","publisherLocation":"Reston, VA","temporalStart":"2014-07-14T12:00:00","temporalEnd":"2014-07-20T12:00:00","authors":[{"contributorId":1,"family":"FamilyName","given":"GivenName","suffix":"Suffix1","email":"email@usgs.gov","affiliation":{"id":1,"text":"Affiliation Text 1"},"id":1,"rank":1},{"contributorId":2,"organization":"Contributing Org 2","id":2,"rank":2}],"editors":[{"contributorId":1,"family":"FamilyName","given":"GivenName","suffix":"Suffix1","email":"email@usgs.gov","affiliation":{"contributorId":2,"organization":"Contributing Org 2","id":2,"rank":2}},{"contributorId":2,"organization":"Contributing Org 4","id":4,"rank":1}],"costCenters":[{"id":74,"text":"CostCenter74"},{"id":114,"text":"CostCenter114"}]}
				//pub two
				,{"id":2,"title":"TEST TITLE 2","language":"English","publisher":"Publisher2","collaboration":"Collab desc 2","links":[{"id":1,"rank":1,"type":{"id":1, "name": "LinkTypeName1"},"url":"www.wow.org","text":"amazing link","size":"12 GB","linkFileType":{"id":1, "name": "LinkFileTypeName1"},"description":"link desc 1"},{"id":2,"rank":2,"type":{"id":2, "name": "LinkTypeName2"},"url":"www.xyz.org","text":"end of the line","size":"1 TB","linkFileType":{"id":2, "name": "LinkFileTypeName2"},"description":"link desc 2"}],"indexId":"pub1IndexId","displayToPublicDate":"2014-07-14T17:27:36.000","publicationType":{"id":1, "name": "PubTypeName1"},"publicationSubtype":{"id":2, "name": "PubTypeName2"},"seriesTitle":{"id":1, "title": "Series1Title"},"seriesNumber":"seriesNumber1","subseriesTitle":"Subseries Title","publisherLocation":"Reston, VA","temporalStart":"2014-07-14T12:00:00","temporalEnd":"2014-07-20T12:00:00","authors":[{"contributorId":1,"family":"FamilyName","given":"GivenName","suffix":"Suffix1","email":"email@usgs.gov","affiliation":{"id":1,"text":"Affiliation Text 1"},"id":1,"rank":1},{"contributorId":2,"organization":"Contributing Org 2","id":2,"rank":2}],"editors":[{"contributorId":1,"family":"FamilyName","given":"GivenName","suffix":"Suffix1","email":"email@usgs.gov","affiliation":{"contributorId":2,"organization":"Contributing Org 2","id":2,"rank":2}},{"contributorId":2,"organization":"Contributing Org 4","id":4,"rank":1}],"costCenters":[{"id":74,"text":"CostCenter74"},{"id":114,"text":"CostCenter114"}]}
			]};
		//
		beforeEach(inject(function($injector, $compile) {
	        rootScope = $injector.get('$rootScope');

	        location = $injector.get('$location');
	        q = $injector.get('$q');

	        fetcher = { //mock PublicationFetcher TODO test new fetcher
	    		searchByTermAndListIds : function(term, listIds, pageSize, startRow) {
	                return q.when({data : PUB_SEARCH_RESULTS});
	            }
	        };
	        spyOn(fetcher, 'searchByTermAndListIds').andCallThrough();

	        pubsModal  = { //mock PubsModal TODO test modal
	    		alert : function(title, message, ctrl) {
	                return "modal called";
	            }
	        };
	        spyOn(pubsModal, 'alert').andCallThrough();

	        var $controller = $injector.get('$controller');
	        createControlleWithdFullInit = function() {
	        	scope = rootScope.$new();

	        	var newCtrlInstance = $controller('searchCtrl', {
	                '$scope': scope,
	                '$location' : location,
	                'PublicationFetcher' : fetcher,
	                'PubsModal' : pubsModal,
	                '$routeParams': {}
	            });

	        	//create holders for ngGrids
	        	pubsGridEl = angular.element('<div class="pub-grid" ng-grid="pubsGrid"></div>');
	        	$compile(pubsGridEl)(scope);

	        	scope.$digest();
	            return
	        };
	    }));

		it('has these methods/fields defined', function(){
			var searchCtrl =createControlleWithdFullInit();

			expect(scope.search).toBeDefined(); //performs ajax search
			expect(scope.searchClick).toBeDefined(); //handles user click
			expect(scope.selectedPubsLists).toBeDefined(); //set of lists currently selected by user
			expect(scope.selectedPubs).toBeDefined(); //set of pubs currently selected by user
			expect(scope.pagingState).toBeDefined(); //current grid config selected by user
		});


		it('immediately does an ajax request to pull back the first 15 pubs in the database with no search terms or list id filtering', function(){
			var searchCtrl =createControlleWithdFullInit();

			//two requests are actually triggered by two $watch statements
 			expect(fetcher.searchByTermAndListIds.callCount).toBe(2);

 			//verify it's a call with no filtering
			expect(fetcher.searchByTermAndListIds).toHaveBeenCalledWith(undefined, [ ], 15, 0 );
		});

		it('has loaded the publication data ', function(){
			var searchCtrl = createControlleWithdFullInit();
			expect(scope.recordCount).toBe(2);
			expect(scope.pubs.length).toBe(2);
			expect(scope.pubs[0].title).toBe("TEST TITLE 1");
			expect(scope.pubs[1].title).toBe("TEST TITLE 2");
		});

		it('updates stored search term when user searches', function() {
			var searchCtrl = createControlleWithdFullInit();
			scope.searchClick("search term"); //simulates a user clicking on search after typing "search term" into search input

			//two requests are actually triggered by two $watch statements on init, 3rd call in response to call above
 			expect(fetcher.searchByTermAndListIds.callCount).toBe(3);

 			//verify it's a call with correct filtering
			expect(fetcher.searchByTermAndListIds).toHaveBeenCalledWith("search term", [], 15, 0 );

			//verify current search term is persisted
			expect(scope.searchTerm).toBe("search term");
		});

		it('performs search when user makes list selections', function() {
			var searchCtrl = createControlleWithdFullInit();

			//mimics user clicking on pubs list grid
        	scope.selectedPubsLists = PUB_LISTS;
        	scope.$digest(); //trigger watches

			//two requests are actually triggered by two $watch statements on init, 3rd call in response to updated list selections
 			expect(fetcher.searchByTermAndListIds.callCount).toBe(3);

 			//verify it's a call with correct filtering
			expect(fetcher.searchByTermAndListIds).toHaveBeenCalledWith(undefined, [1,2], 15, 0 );
		});

		it('displays correct information in pubs grid', function(){
			//TODO HTML dom inspection of ngGrid elements
		});

		it('updates selected pubs data structure when user clicks pubs grid row', function(){
			//TODO mimic user DOM click
		});

		it('displays correct information in pubs list grid', function(){
			//TODO HTML dom inspection of ngGrid elements
		});

		it('triggers pubs search and filters by clicked lists', function(){
			//TODO mimic user DOM click
		});
	});
});



