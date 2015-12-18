(function() {

	angular.module('pw.catalog', [])
		.controller('catalogCtrl', [
			'$scope',
			function($scope) {
				$scope.localTemporalStart = $scope.pubData.temporalStart;
				$scope.localTemporalEnd = $scope.pubData.temporalEnd;

				$scope.$watch('localTemporalStart', function (value) {
					var newDate = moment(value).format('YYYY-MM-DD');
					if (newDate === 'Invalid date') {
						$scope.pubData.temporalStart = '';
					}
					else {
						$scope.pubData.temporalStart = newDate;
					}
				});
				$scope.$watch('localTemporalEnd', function (value) {
					var newDate = moment(value).format('YYYY-MM-DD');
					if (newDate === 'Invalid date') {
						$scope.pubData.temporalEnd = '';
					}
					else {
						$scope.pubData.temporalEnd - newDate;
					}
				});

			}]);
}) ();