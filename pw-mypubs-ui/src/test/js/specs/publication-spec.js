describe("pw.publication module", function(){

	var scope;


	it('should have a pubs publication module pw.publication', function() {
		// angular should find a defined mod
		module('pw.publication');
		var def = true;
		try {
			angular.module('pw.publication');
		} catch(e) {
			def = false;
		}
		expect( def ).toBeTruthy();
	});


	it('should have defined the tabs', function() {

		module('pw.publication');

		inject (['$rootScope', '$controller', function($rootScope, $controller) {

			scope = $rootScope.$new();

			$controller('publicationCtrl', {
				'$scope': scope,
				pub : {//mock the result of an http promise
                    data : {
                        id : 1
                    }
                }
				
			});

			expect(scope.tabs).toBeDefined();
			expect( angular.isObject(scope.tabs) ).toBeTruthy();
			expect(scope.pub).toEqual({id : 1});
		}]);

	});



});
