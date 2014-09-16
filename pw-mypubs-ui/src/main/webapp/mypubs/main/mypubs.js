(function() {


var mypubs = angular.module('pw.mypubs', [

		'ngRoute', 'ngGrid', 'ngCookies', 'ui.select2','ui.bootstrap', 'ui.tinymce', 'ngAnimate', 'ui.sortable',// angular util modules
		'pw.auth', 'pw.notify', 'pw.fetcher',// pw util modules
		'pw.home','pw.search', 'pw.publication', 'pw.editContributor', 'pw.reservation', // mypubs pages
		'ui.bootstrap.datetimepicker' //datetimepicker

	])
	.constant('APP_CONFIG', {
		endpoint: 'services/'
	})
	.controller('mainCtrl', ['$scope', '$log', '$location',
		function ($scope, $log, $location) {
			$scope.show = function(show) {
				if ( angular.isUndefined(show) ) {
					return $scope._show;
				}
				return $scope._show = show;
			};
	}])
	.config(['$routeProvider', '$httpProvider',
	     	function($routeProvider, $httpProvider) {
	     		$routeProvider.otherwise({
	     			redirectTo: '/Search'
	     		});

	     		$httpProvider.interceptors.push('AuthorizationInterceptor');
	     	}
	     ])
	// nice utility directive
	.directive('preventDefault', function() {
		return function(scope, element, attrs) {
			$(element).click(function(event) {
				event.preventDefault();
			});
		};
	});
}) ();
