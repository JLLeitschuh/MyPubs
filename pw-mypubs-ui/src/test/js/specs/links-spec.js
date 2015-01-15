describe('Tests for pw.links module', function() {

    beforeEach(module('pw.links'));

    it('Should have a pubs links module pw.links', function() {
	var def = true;
	try {
		angular.module('pw.links');
	} catch(e) {
		def = false;
	}
	expect( def ).toBeTruthy();
    });

    describe('Tests for pw.links linksCtrl', function() {
	var scope, rootscope, q, mockLookupFetcher, mockListOrderingService;
	var myCtrl;
	var createController;
        var LINKTYPE_LOOKUP_DATA = [{value : 1, text : 'Text1'}, {value : 2, text : 'Text2'}];
	var FILETYPE_LOOKUP_DATA = [{value : 10, text : 'Text10'}, {value : 11, text : 'Text11'}, {value : 12, text : 'Text12'}];

	beforeEach(function() {
	    mockLookupFetcher = {
		promise : function(lookup) {
		    var result = [];
		    if (lookup === 'linktypes') {
			result = LINKTYPE_LOOKUP_DATA;
		    }
		    else if (lookup === 'linkfiletypes') {
			result = FILETYPE_LOOKUP_DATA;
		    }
		    return q.when({data : result});
		}
	    };
	    spyOn(mockLookupFetcher, 'promise').andCallThrough();

	    mockListOrderingService = jasmine.createSpyObj('mockListOrderingService', ['updateRank', 'addNewObj', 'deleteObj']);
	});

	beforeEach(inject(function($injector) {
	    rootScope = $injector.get('$rootScope');
	    scope = rootScope.$new();
	    q = $injector.get('$q');

	    var $controller = $injector.get('$controller');
	    createController = function() {
		return $controller('linksCtrl', {
		    '$scope': scope,
		    'LookupFetcher' : mockLookupFetcher,
		    'ListOrderingService' : mockListOrderingService
		});
	    };
	}));

	it('Should initialize $scope.pubData.links if pubsData.link is undefined', function() {
	    scope.pubData = {};
	    myCtrl = createController();
	    scope.$digest();
	    expect(scope.pubData.links).toEqual([]);
	});

	it('Should sort the links by rank when initialized', function() {
	    scope.pubData = {
		links : [{
		    rank : 2
		},{
		    rank : 4
		},{
		    rank : 3
		},{
		    rank : 1
		}]
	    };
	    myCtrl = createController();
	    scope.$digest();
	    expect(scope.pubData.links).toEqual([{rank : 1}, {rank : 2}, {rank : 3}, {rank : 4}]);
	});

	it('Should sort the links in pubData when refreshPubData is broadcast', function() {
		spyOn(scope, '$on').andCallThrough();

		scope.pubData = {};
		myCtrl = createController();
		scope.$digest();

		scope.pubData.links = [{
		    rank : 2
		},{
		    rank : 4
		},{
		    rank : 3
		},{
		    rank : 1
		}];

		scope.$broadcast('refreshPubData');
		expect(scope.$on).toHaveBeenCalled();
		expect(scope.pubData.links).toEqual([{rank : 1}, {rank : 2}, {rank : 3}, {rank : 4}]);
	})

	it('Should get linkTypeOptions and fileTypeOptions from the LookupFetcher', function() {
	    scope.pubData = {};
	    myCtrl = createController();
	    scope.$digest();
	    expect(mockLookupFetcher.promise).toHaveBeenCalled();
	    expect(mockLookupFetcher.promise.calls.length).toBe(2);

	    expect(scope.linkTypeOptions).toEqual(LINKTYPE_LOOKUP_DATA);
	    expect(scope.fileTypeOptions).toEqual(FILETYPE_LOOKUP_DATA);
	});
	it('Should have sortOptions', function() {
	    scope.pubData = {};
	    myCtrl = createController();
	    scope.$digest();

	    expect(scope.sortOptions).toBeDefined();
	});

	it('Should have sortOptions with stop which updates the range to reflect the new order', function() {
	    scope.pubData = {};
	    myCtrl = createController();
	    scope.$digest();

	    scope.pubData = {
		links : [{
		    rank : 2
		},{
		    rank : 4
		},{
		    rank : 3
		},{
		    rank : 1
		}]
	    };
	    scope.sortOptions.stop();
	    expect(mockListOrderingService.updateRank).toHaveBeenCalledWith(scope.pubData.links);
	});

	it('Should have addNewLink defined and it should use the ListOrderingService', function() {
	   scope.pubData = {};
	   myCtrl = createController();
	   scope.$digest();

	   scope.addNewLink();
	   expect(mockListOrderingService.addNewObj).toHaveBeenCalled();
	   expect(mockListOrderingService.addNewObj.calls[0].args[0]).toEqual(scope.pubData.links);
	});

	it('Should have deleteLink defined and it should use the ListOrderingService', function() {
	    scope.pubData =  {
		links : [{
		    rank : 1
		},{
		    rank : 2
		},{
		    rank : 3
		},{
		    rank : 4
		}]
	    };
	    myCtrl = createController();
	    scope.$digest();
	    expect(scope.deleteLink).toBeDefined();
	    scope.deleteLink(2);
	    expect(mockListOrderingService.deleteObj).toHaveBeenCalledWith(scope.pubData.links, 2);
	});
    });
});