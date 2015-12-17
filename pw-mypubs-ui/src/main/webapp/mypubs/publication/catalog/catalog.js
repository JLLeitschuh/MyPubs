(function() {

	angular.module('pw.catalog', [])
		.controller('catalogCtrl', [
			'$scope',
			function($scope) {
				$scope.localTemporalStart = $scope.pubData.temporalStart;
				$scope.localTemporalEnd = $scope.pubData.temporalEnd;

				$scope.$watch('localTemporalStart', function (value) {
					$scope.pubData.temporalStart = moment(value).format('YYYY-MM-DD');
				});
				$scope.$watch('localTemporalEnd', function (value) {
					$scope.pubData.temporalEnd = moment(value).format('YYYY-MM-DD');
				});

			}]);
}) ();