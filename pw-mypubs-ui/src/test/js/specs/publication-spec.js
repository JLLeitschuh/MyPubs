/* global angular*/
describe("pw.publication module", function(){

	var mockFetcher, $q;

	beforeEach(module('pw.publication'));

	beforeEach(module('pw.publication', function($provide) {
		$provide.value('PublicationFetcher', mockFetcher);
	}));

	beforeEach(function() {
		mockFetcher = {
			fetchPubById : function(id) {
				var deferred = $q.defer();

				if (id === 2) {
					deferred.reject('reject reason');
				}
				else {
					deferred.resolve({data : { id : id, title : 'Title for ' + id }});
				}
				return deferred.promise;
			}
		};
	});
	beforeEach(inject(function($injector) {
	    $q = $injector.get('$q');
	}));

	it('should have a pubs publication module pw.publication', function() {
		// angular should find a defined mod
		var def = true;
		try {
			angular.module('pw.publication');
		} catch(e) {
			def = false;
		}
		expect( def ).toBeTruthy();
	});

	describe('pubHeaderCtrl', function(){

		var scope, controller;

		beforeEach(function(){
			inject(['$rootScope', '$controller', 'Publication',
				function($rootScope, $controller, Publication){
					scope = $rootScope.$new();
					scope.pubData = new Publication();
					controller = $controller('pubHeaderCtrl', {
						'$scope': scope
					});
				}
			]);
		});

		it('when the "date to display to public" in the controller scope changes, a watch should write a custom serialization to the model', function(){
			scope.localDisplayToPublicDate = new Date('Nov 17 2016 06:15:00 GMT-0600');
			scope.$digest();
			expect(scope.pubData.displayToPublicDate).toBe('2016-11-17T06:15:00');

			scope.localDisplayToPublicDate = '';
			scope.$digest();
			expect(scope.pubData.displayToPublicDate).toBe('');
		});

	});

	describe('publicationCtrl', function(){
		var $scope, controller, mockNotifier, Publication, mockUpdater, mockRoute, mockLocation, mockPubsModal;
		beforeEach(function() {
			mockNotifier = jasmine.createSpyObj('mockNotifier', ['notify', 'error']);
			mockRoute = jasmine.createSpyObj('mockRoute', ['reload']);
			mockLocation = jasmine.createSpyObj('mockLocation', ['path']);
			mockPubsModal = jasmine.createSpyObj('mockPubsModal', ['confirm']);
			mockIdUpdater = function(id) {
				var deferred = $q.defer();
				if (id === 4) {
					deferred.reject({'validationErrors' : 'Validation updater errors'});
				}
				else if (id === 5) {
					deferred.reject({'message' : 'Internal server error'});
				}
				else {
					deferred.resolve({validationErrors : []});
				}
				return deferred.promise;
			};

			mockUpdater = {
				persistPub : function(data) {
					var deferred = $q.defer();
					if (data.id === 2) {
						deferred.reject({'validationErrors' : 'Validation errors'});
					}
					else if (data.id === 3) {
						deferred.reject({'message' : 'Internal server error'});
					}
					else {
						if (!data.id) {
							data.id = 1000;
						}
						deferred.resolve(data);
					}
					return deferred.promise;
				},
				releasePub : jasmine.createSpy('releasePub').andCallFake(mockIdUpdater),
				publishPub : jasmine.createSpy('publishPub').andCallFake(mockIdUpdater),
				deletePub : jasmine.createSpy('deletePub').andCallFake(mockIdUpdater)
			};
			spyOn(mockUpdater, 'persistPub').andCallThrough();
		});
		beforeEach(inject(function($injector){
			var $controller, $rootScope;
			$rootScope = $injector.get('$rootScope');
			$scope = $rootScope.$new();
			Publication = $injector.get('Publication');
			$controller = $injector.get('$controller');

			createController = function(thisPub) {
				return $controller('publicationCtrl', {
					'$scope' : $scope,
					'$route' : mockRoute,
					'pubData' : thisPub,
					'PublicationUpdater' : mockUpdater,
					'Notifier' : mockNotifier,
					'$location' : mockLocation,
					'PubsModal' : mockPubsModal
				});
			};
		}));

		it('should have defined the tabs', function() {
			var pub = Publication();
			createController(pub);
			$scope.$digest();
			expect($scope.tabs).toBeDefined();
			expect( angular.isObject($scope.tabs) ).toBeTruthy();
		});

		it('should receive the persisted pubs object when it successfully persists a new pub', function(done){
			var pub = Publication();
			pub.title = 'This title';
			createController(pub);
			$scope.$digest();
			var newPubPersistPromise = $scope.persistPub();

			newPubPersistPromise.then(function(data){
				expect(data.id).toEqual(1000);
				expect(data.title).toEqual('This title');
			}, function(){
				//this must fail if the function is called
				expect(true).toBe(false);
			});
		});
		it('should receive the persisted pubs object when it successfully persists an existing pub', function(){
		    spyOn($scope, '$broadcast');

		    var pub = Publication();
			pub.id = 5;
			pub.title = 'This title';
			createController(pub);
			$scope.$digest();

			var existingPubPersistPromise = $scope.persistPub();
			existingPubPersistPromise.then(function(data){
				expect(data.id).toEqual(1000);
				expect(data.title).toEqual('This title');
				expect($scope.$broadcast).toHaveBeenCalledWith('refreshPubData');
			}, function(){
				//this must fail if the function is called
				expect(true).toBe(false);
			});
		});

		it('should receive an error message when it unsuccessfully persists a pub', function(){
			var pub = Publication();
			pub.id = 3;
			createController(pub);
			$scope.$digest();

			var persistPromise = $scope.persistPub();
			persistPromise.then(function(data){
				//this must fail if the function is called
				expect(true).toBe(false);
			}, function(message){
				expect(message.length).not.toBe(0);
			});
		});

		it('Should change the location path is sucessful release', function() {
			var pub = Publication();
			pub.id = 10;
			createController(pub);
			$scope.$digest();

			$scope.releasePub();
			$scope.$digest();
			expect(mockLocation.path).toHaveBeenCalledWith('/Search');
			expect(mockNotifier.error).not.toHaveBeenCalled();
		});

		it('A call to releasePub should change the location path if the publication has not yet been created', function() {
			var pub = Publication();
			createController(pub);
			$scope.$digest();

			$scope.releasePub();
			$scope.$digest();
			expect(mockLocation.path).toHaveBeenCalledWith('/Search');
			expect(mockNotifier.error).not.toHaveBeenCalled();
		});

		it('A call to releasePub hould show validation errors and notify the user if errors have been received', function() {
			var pub = Publication();
			pub.id = 4;
			createController(pub);
			$scope.$digest();

			$scope.releasePub();
			$scope.$digest();
			expect(mockLocation.path).not.toHaveBeenCalled();
			expect($scope.pubData.validationErrors).toBeDefined();
			expect(mockNotifier.error).toHaveBeenCalled();
		});

		it('Expects publishPub to first persist the Pub and if successful confirm that the user wants to publish', function() {
			mockPubsModal.confirm.andCallFake(function() {
				var deferred = $q.defer();
				deferred.resolve();
				return deferred.promise;
			});
			var pub = Publication();
			pub.id = 1;
			createController(pub);
			$scope.$digest();

			$scope.publishPub();
			expect(mockUpdater.persistPub).toHaveBeenCalledWith(pub);
			$scope.$digest();
			expect(mockUpdater.publishPub).toHaveBeenCalledWith(pub.id)
			$scope.$digest();
			expect(mockLocation.path).toHaveBeenCalled();
		});

		it('Expects publish Pub to not publish the publication if the user cancels the action', function() {
			mockPubsModal.confirm.andCallFake(function() {
				var deferred = $q.defer();
				deferred.reject();
				return deferred.promise;
			});

			var pub = Publication();
			pub.id = 1;
			createController(pub);
			$scope.$digest();
			$scope.publishPub();
			$scope.$digest();
			expect(mockUpdater.publishPub).not.toHaveBeenCalled();
		});

		it('Expects an invalid publication to not be published and to show validation errors', function() {
			var pub = Publication();
			pub.id = 2;
			createController(pub);
			$scope.$digest();
			$scope.publishPub();
			$scope.$digest();
			expect($scope.pubData.validationErrors).toEqual('Validation errors');
		});

		it('Expects an error when trying to publish to show validation errors', function() {
			var pub = Publication();
			pub.id = 4;
			mockPubsModal.confirm.andCallFake(function() {
				var deferred = $q.defer();
				deferred.resolve();
				return deferred.promise;
			});
			createController(pub);
			$scope.$digest();
			$scope.publishPub();
			$scope.$digest();
			$scope.$digest();
			expect($scope.pubData.validationErrors).toEqual('Validation updater errors');
		});

		it('Expects delete on a publication that has not been created, returns to search', function() {
			var pub = Publication();
			createController(pub);
			$scope.$digest();
			$scope.deletePub();
			expect(mockLocation.path).toHaveBeenCalled();
		});

		it('Expects delete to require a confirm dialog before proceeding', function() {
			var pub = Publication();
			pub.id = 10;
			mockPubsModal.confirm.andCallFake(function() {
				var deferred = $q.defer();
				deferred.resolve();
				return deferred.promise;
			});

			createController(pub);
			$scope.$digest();
			$scope.deletePub();
			expect(mockPubsModal.confirm).toHaveBeenCalled();
			$scope.$digest();
			expect(mockUpdater.deletePub).toHaveBeenCalledWith(pub.id);
			$scope.$digest();
			expect(mockLocation.path).toHaveBeenCalled();
		});

		it('Expects delete to not call delete if confirm dialog is canceled', function() {
			var pub = Publication();
			pub.id = 10;
			mockPubsModal.confirm.andCallFake(function() {
				var deferred = $q.defer();
				deferred.reject();
				return deferred.promise;
			});

			createController(pub);
			$scope.$digest();
			$scope.deletePub();
			$scope.$digest();
			expect(mockUpdater.deletePub).not.toHaveBeenCalled();
		});

		it('Expects delete which returns validation errors to set the pubs validationErrors', function() {
			var pub = Publication();
			pub.id = 4;
			mockPubsModal.confirm.andCallFake(function() {
				var deferred = $q.defer();
				deferred.resolve();
				return deferred.promise;
			});

			createController(pub);
			$scope.$digest();
			$scope.deletePub();
			$scope.$digest();
			$scope.$digest();
			expect($scope.pubData.validationErrors).toEqual('Validation updater errors');
		});
	});

	describe("Publication", function(){
		var pubInstance;

		it('should classify a publication with a blank id as "new"', inject(function(Publication) {
			pubInstance = new Publication();
			expect(pubInstance.isNew()).toBe(true);
		}));
		it('should classify a publication with non-zero length id as "not new"', inject(function(Publication){
			pubInstance = new Publication();
			pubInstance.id = 'asdf';
			expect(pubInstance.isNew()).toBe(false);
		}));
		it('should classify a publication with a number id as "not new"', inject(function(Publication){
			pubInstance = new Publication();
			pubInstance.id = 42;
			expect(pubInstance.isNew()).toBe(false);
		}));

		it('Expects update to update the publication with the data', inject(function(Publication) {
		    pubInstance = new Publication();
		    pubInstance.chapter = 'chapter1';
		    pubInstance.title = 'Title1';
		    pubInstance.update({chapter : 'chapter2'});
		    expect(pubInstance.chapter).toEqual('chapter2');
		    expect(pubInstance.title).toEqual('Title1');
		}));
	});
});
