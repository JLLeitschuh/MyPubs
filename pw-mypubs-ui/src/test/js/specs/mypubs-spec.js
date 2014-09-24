describe("pw.mypubs module", function() {


	var scope, location;


	beforeEach(function () {
		module("pw.mypubs");
		inject(function($rootScope, $controller, $log, $location) {
			scope = $rootScope.$new();
			location = $location;
			$controller('mainCtrl', {$scope:scope, $log:$log, $location:$location});
		});
	});


	it('should have a main module', function() {

		// angular should not find an undefined mod
		var undef = false;
		try {
			angular.module('unknownMod');
		} catch(e) {
			undef = true;
		}
		expect( undef ).toBeTruthy();

		// angular should find a defined mod
		var def = true;
		try {
			angular.module('pw.mypubs');
		} catch(e) {
			def = false;
		}
		expect( def ).toBeTruthy();
	});

});
