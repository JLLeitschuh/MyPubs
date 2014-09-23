describe ('Tests for pw.contributors', function() {
    it('Should have a pubs contributor module', function() {
		expect(function() { angular.module('pw.contributors'); }).not.toThrow();
    });

    describe('Tests for ContributorModel', function() {
		var KIND, mockLookupFetcher;

		var personData = {
			id : 1,
			contributorId : 10,
			rank : 1,
			family : 'Jones',
			given : 'Nancy',
			suffix : 'Ms',
			email : 'jones@usgs.gov',
			affiliation : {id : 1, text : 'Wisconsin Water Science Center'},
			corporation : false
		};
		var corporationData = {
			id : 2,
			contributorId : 20,
			rank : 1,
			organization : 'Colorado Water Science Center',
			corporation : true
		};

		beforeEach(module('pw.contributors', function($provide) {
			$provide.value('LookupFetcher', mockLookupFetcher);
		}));

		beforeEach(function() {
			mockLookupFetcher = jasmine.createSpyObj('mockLookupFetcher', ['dynamicSelectOptions']);
		});

		beforeEach(inject(function($injector) {
			KIND = $injector.get('KIND');
		}));

		it('Expects an empty contributor object to be created if no data is provided', inject(function(ContributorModel) {
			var contrib = new ContributorModel();
			expect(contrib.id).toEqual('');
			expect(contrib.contributorId).toEqual('');
			expect(contrib.rank).toEqual('');
			expect(contrib.kind).toEqual('');
			expect(contrib.select2Options).not.toBeDefined();
		}));

		it('Expects a contributor which is a Person to be created with kind equal to Person', inject(function(ContributorModel) {
			var contrib = new ContributorModel(personData);

			expect(contrib.id).toEqual(1);
			expect(contrib.contributorId).toEqual(10);
			expect(contrib.rank).toEqual(1);
			expect(contrib.affiliation).toEqual({id : 1, text : 'Wisconsin Water Science Center'});
			expect(contrib.kind).toEqual(KIND.person);
			expect(contrib.select2Options).toBeDefined();
			expect(mockLookupFetcher.dynamicSelectOptions).toHaveBeenCalledWith('people', 10);
		}));

		it('Expects a contributor which is a Corporation to be created with kind equal to Corporation', inject(function(ContributorModel) {
			var contrib = new ContributorModel(corporationData);

			expect(contrib.id).toEqual(2);
			expect(contrib.contributorId).toEqual(20);
			expect(contrib.rank).toEqual(1);
			expect(contrib.kind).toEqual(KIND.corporation);
			expect(contrib.select2Options).toBeDefined();
			expect(mockLookupFetcher.dynamicSelectOptions).toHaveBeenCalledWith('corporations', 20);
		}));

		it('Expects changeKind to modify the contributor properties to match the kind while preserving the id', inject(function(ContributorModel) {
			var contrib = new ContributorModel(corporationData);
			contrib.kind = KIND.person;
			contrib.changeKind();
			expect(contrib.contributorId).toEqual('');
			expect(contrib.affiliation).toEqual({});
			expect(contrib.rank).toEqual(1);
			expect(contrib.id).toEqual(2);
			expect(contrib.corporation).toBe(false);
			expect(mockLookupFetcher.dynamicSelectOptions.calls[1].args).toEqual(['people', '']);

			contrib = new ContributorModel();
			contrib.kind = 'Corporation';
			contrib.changeKind();
			expect(contrib.id).toEqual('');
			expect(contrib.corporation).toBe(true);
			expect(mockLookupFetcher.dynamicSelectOptions.calls[2].args).toEqual(['corporations', '']);

			contrib = new ContributorModel(personData);
			contrib.kind = 'Corporation';
			contrib.changeKind();
			expect(contrib.id).toEqual(1);
			expect(contrib.contributorId).toEqual('');
			expect(contrib.affiliation).toEqual({});
			expect(mockLookupFetcher.dynamicSelectOptions.calls[4].args).toEqual(['corporations', '']);
			expect(contrib.corporation).toBe(true);
		}));

		it('Expects isPerson to return whether a contributor is a person object', inject(function(ContributorModel) {
			var contrib = new ContributorModel(personData);
			expect(contrib.isPerson()).toBe(true);
			contrib = new ContributorModel();
			expect(contrib.isPerson()).toBe(false);
			contrib = new ContributorModel(corporationData);
			expect(contrib.isPerson()).toBe(false);
		}));

		it('Expects isCorporation to return whether a contributor is a corporation object', inject(function(ContributorModel) {
			var contrib = new ContributorModel(personData);
			expect(contrib.isCorporation()).toBe(false);
			contrib = new ContributorModel();
			expect(contrib.isCorporation()).toBe(false);
			contrib = new ContributorModel(corporationData);
			expect(contrib.isCorporation()).toBe(true);
		}));

		it('Expects getPubData to return an object with the contributor model specific values removed',  inject(function(ContributorModel) {
			var contrib = new ContributorModel(personData);

			expect(contrib.getPubData()).toEqual({id : 1, contributorId : 10, rank : 1, corporation : false, affiliation : {id : 1, text : 'Wisconsin Water Science Center'}});

			contrib = new ContributorModel(corporationData);
			expect(contrib.getPubData()).toEqual({id : 2, contributorId : 20, rank : 1, corporation : true, affiliation : {}});;
		}));

		it('Expects getContributorId to return the contributorId value if it is not an object, otherwise return the id property', inject(function(ContributorModel) {
			var contrib = new ContributorModel(personData);
			expect(contrib.getContributorId()).toEqual(10);
			contrib.contributorId = {id : 11, text : 'Text11'};
			expect(contrib.getContributorId()).toEqual(11);
		}));

		it('Expects update to update the kind, affiliation, and contributorId fields', inject(function(ContributorModel) {
			var contrib = new ContributorModel(personData);
			contrib.contributorId = {id : 10, text : 'Text10'};
			contrib.update({id : 2, contributorId : 10, corporation : false, rank : 1});
			expect(contrib.id).toEqual(2);
			expect(contrib.contributorId).toEqual({id : 10, text : 'Text10'});
			expect(contrib.affiliation).toEqual({});
			expect(contrib.corporation).toBe(false);
			expect(contrib.rank).toEqual(1);
			expect(mockLookupFetcher.dynamicSelectOptions.calls[1].args).toEqual(['people', {id : 10, text : 'Text10'}]);
		}));

		it('Expects updateContributor to only update the affiliation and contributorId properties', inject(function(ContributorModel) {
			var contrib = new ContributorModel();
			contrib.updateContributor({contributorId : 2, affiliation : {id : 1, text : 'Text1'}});
			expect(contrib.contributorId).toEqual(2);
			expect(contrib.affiliation).toEqual({id : 1, text : 'Text1'});
		}));
    });

    describe('Tests for contributorsCtrl', function() {
		var mockLookupFetcher, mockListOrderingService, mockContributorFetcher,  mockNotifier, q, KIND, scope, rootScope;
		var createController, myCtrl;
		var ContributorModel;

		var CONTRIBUTOR_TYPES = [{id : 1, text : 'Tab1'}, {id : 2, text : 'Tab2'}, {id : 3, text : 'Tab3'}];
		var PERSONS = [{id : 1, text : 'Person1'}, {id : 2, text : 'Person2'}, {id : 3, text : 'Person3'}];
		var CORPORATIONS = [{id : 1, text : 'Corp1'}, {id : 2, text : 'Corp2'}];

		var PUB_DATA = {
			tab1 : [{id : 1, contributorId : 1, corporation : false, rank : 1, corporation : false}, {id : 2, contributorId : 20, corporation : false, rank : 2}],
			tab2 : [{id : 3, contributorId : 30, corporation : true, rank : 1}],
			tab3 : [{id : 4, contributorId : 40, corporation : false, rank : 3}, {id : 5, contributorId : 50, corporation : false, rank : 1}, {id : 6, contributorId : 60, corporation : false, rank : 2}]
		};

		beforeEach(module('pw.contributors', function($provide) {
			$provide.value('LookupFetcher', mockLookupFetcher);
		}));

		beforeEach(function() {
			mockContributorFetcher = {
			fetchContributorById : function(contributorId) {
				return q.when({data : {
				contributorId : contributorId,
				name : 'New Name'
				}});
			}
			};
			spyOn(mockContributorFetcher, 'fetchContributorById').andCallThrough();

			mockLookupFetcher = {
			promise : function(lookup) {
				var result = [];
				if (lookup === 'contributortypes') {
				result = CONTRIBUTOR_TYPES;
				}
				else if (lookup === 'people') {
				result = PERSONS;
				}
				else if (lookup === 'corporations') {
				result = CORPORATIONS;
				}
				return q.when({data : result});
			},
			dynamicSelectOptions : jasmine.createSpy('dynamicSelectOptions')
			};
			spyOn(mockLookupFetcher, 'promise').andCallThrough();

			mockListOrderingService = jasmine.createSpyObj('mockListOrderingService', ['updateRank', 'addNewObj', 'deleteObj']);

			mockNotifier = jasmine.createSpyObj('mockNotifier', ['error']);
		});

		beforeEach(inject(function($injector) {
			var $controller;
			rootScope = $injector.get('$rootScope');
			scope = rootScope.$new();
			q = $injector.get('$q');
			KIND = $injector.get('KIND');
			ContributorModel = $injector.get('ContributorModel');

			$controller = $injector.get('$controller');
			createController = function() {
			return $controller('contributorsCtrl', {
				'$scope': scope,
				'KIND' : KIND,
				'Notifier' : mockNotifier,
				'ContributorModel' : ContributorModel,
				'ContributorFetcher' : mockContributorFetcher,
				'LookupFetcher' : mockLookupFetcher,
				'ListOrderingService' : mockListOrderingService
			});
			};
		}));

		it('Expects the controller to fetch the current contributor types', function() {
			scope.pubData = {};
			myCtrl = createController();
			scope.$digest();

			expect(mockLookupFetcher.promise).toHaveBeenCalled();
			expect(mockLookupFetcher.promise.calls[0].args).toEqual(['contributortypes']);
			expect(scope.contribTabs.length).toBe(3);
			expect(scope.contribTabs[0].id).toEqual(1);
			expect(scope.contribTabs[0].text).toEqual('Tab1');
			expect(scope.contribTabs[1].id).toEqual(2);
			expect(scope.contribTabs[1].text).toEqual('Tab2');
			expect(scope.contribTabs[2].id).toEqual(3);
			expect(scope.contribTabs[2].text).toEqual('Tab3');
		});

		it('Expects that if the controller is created with the contrib properties undefined, the controller defines them and adds them to contribTabs', function() {
			scope.pubData = {};
			myCtrl = createController();
			scope.$digest();

			expect(scope.pubData.tab1).toEqual([]);
			expect(scope.pubData.tab2).toEqual([]);
			expect(scope.pubData.tab3).toEqual([]);

			expect(scope.contribTabs[0].data).toEqual([]);
			expect(scope.contribTabs[1].data).toEqual([]);
			expect(scope.contribTabs[2].data).toEqual([]);
		});

		it('Expects that if the contrib properties are already defined the data will be preserved but ordered by rank', function() {
			scope.pubData = PUB_DATA;

			myCtrl = createController();
			scope.$digest();

			expect(scope.pubData.tab1[0].id).toEqual(1);
			expect(scope.pubData.tab1[0].rank).toEqual(1);
			expect(scope.pubData.tab3[0].id).toEqual(5);
			expect(scope.pubData.tab3[0].rank).toEqual(1);

			expect(scope.contribTabs[2].data[0].id).toEqual(5);
		});

		it('Expects that if contrib data changes, the pubData object is updated', function() {
			scope.pubData = PUB_DATA;
			myCtrl = createController();
			scope.$digest();

			scope.contribTabs[0].data[0].contributorId = 7;
			scope.$digest();
			expect(scope.pubData.tab1[0].contributorId).toEqual(7);

			scope.contribTabs[2].data.pop();
			scope.$digest();
			expect(scope.pubData.tab3.length).toBe(2);

			scope.contribTabs[1].data.push(new ContributorModel());
			scope.$digest();
			expect(scope.pubData.tab2.length).toBe(2);
		});

		it('Expects the sortOptions to contain a stop function which updates the currently selected tab\'s data', function() {
			scope.pubData = PUB_DATA;
			myCtrl = createController();
			scope.$digest();

			expect(scope.sortOptions.stop).toBeDefined();

			scope.selectedTab(0);
			scope.sortOptions.stop();
			expect(mockListOrderingService.updateRank).toHaveBeenCalled();
			expect(mockListOrderingService.updateRank.calls[0].args[0][0].id).toEqual(1);

			scope.selectedTab(2);
			scope.sortOptions.stop();
			expect(mockListOrderingService.updateRank.calls[1].args[0][0].id).toEqual(5);
		});

		it('Expects a call to deleteContributor uses the ListOrderingService to delete the object from the selected tab', function() {
			scope.pubData = PUB_DATA;
			myCtrl = createController();
			scope.$digest();

			scope.selectedTab(0);
			scope.deleteContributor(1);
			expect(mockListOrderingService.deleteObj).toHaveBeenCalled();
			expect(mockListOrderingService.deleteObj.calls[0].args[0][0].id).toEqual(1);

			scope.selectedTab(2);
			scope.deleteContributor(0);
			expect(mockListOrderingService.deleteObj).toHaveBeenCalled();
		});

		it('Expects a call to addContributor to use the ListOrderingService to append a new object to the selected tab\'s data', function() {
			scope.pubData = PUB_DATA;
			myCtrl = createController();
			scope.$digest();

			scope.selectedTab(2);
			scope.addContributor();
			expect(mockListOrderingService.addNewObj.calls[0].args[0][0].id).toEqual(5);
		});

		it('Expects a call to updateContributorInfo to retrieve the full contributor info and update the contributor', function() {
			scope.pubData = PUB_DATA;
			myCtrl = createController();
			scope.$digest();
			scope.selectedTab(0);
			scope.updateContributorInfo(1);

			expect(mockContributorFetcher.fetchContributorById).toHaveBeenCalledWith(20);
			scope.$digest();
			expect(scope.contribTabs[0].data[1].id).toEqual(2);
		});

		it('Expects the controller to handler the refreshPubData signal', function() {
			spyOn(scope, '$on').andCallThrough();
			scope.pubData = PUB_DATA;
			myCtrl = createController();
			scope.$digest();
			scope.pubData.tab1[0].id = 1;
			scope.$broadcast('refreshPubData');
			expect(scope.$on).toHaveBeenCalled();
			expect(scope.contribTabs[0].data[0].id).toEqual(1);
		});
    });
});