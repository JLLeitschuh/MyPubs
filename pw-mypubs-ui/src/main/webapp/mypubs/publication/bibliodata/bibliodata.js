(function () {


	angular.module('pw.bibliodata', ['pw.lookups'])
		.controller('biblioCtrl', [
			'$scope', '$filter', '$q', 'LookupFetcher', 'LookupCascadeSelect2', '$routeParams',
			function ($scope, $filter, $q, LookupFetcher, LookupCascadeSelect2, $routeParams) {

				// This are used to control whether the change* functions are executed.
				// We don't want them to execute the first time it is fired when publication
				// data has been loaded.
				var typeInputIsInitialized = false;
				var genreInputIsInitialized = false;
				var largerWorkTypeInputIsInitialized = false;

				if (!$routeParams.pubsid) {
					typeInputIsInitialized = true;
					genreInputIsInitialized = true;
				}
				//@mbucknell recommends binding ui-select2 ng-model targets to variables
				//on the local-most scope and propagating changes back up to pubData via watches
				$scope.localPubTypeId = $scope.pubData.publicationType.id;
				$scope.localPubGenreId = $scope.pubData.publicationSubtype.id;
				$scope.localSeriesTitle = $scope.pubData.seriesTitle.id;
				$scope.localCostCenters = [];
				angular.forEach($scope.pubData.costCenters, function (costCenter) {
					if (angular.isDefined(costCenter.id)) {
						$scope.localCostCenters.push(costCenter.id);
					}
				});
				$scope.localLargerWorkTypeId = $scope.pubData.largerWorkType.id;
				$scope.localLargerWorkSubtypeId = $scope.pubData.largerWorkSubtype.id;

				var getIdOrOriginal = function (objectOrPrimitive) {
					var id = objectOrPrimitive;
					if (objectOrPrimitive.id) {
						id = objectOrPrimitive.id;
					}
					return id;
				};
				$scope.$watch('localPubTypeId', function (value) {
					var id = getIdOrOriginal(value);
					$scope.pubData.publicationType.id = id;
				});
				$scope.$watch('localPubGenreId', function (value) {
					if (value) {
						var id = getIdOrOriginal(value);
						$scope.pubData.publicationSubtype.id = id;
					}
					else {
						$scope.pubData.publicationSubtype.id = '';
					}
				});
				$scope.$watch('localSeriesTitle', function (value) {
					if (value) {
						var id = getIdOrOriginal(value);
						$scope.pubData.seriesTitle.id = id;
					}
					else {
						$scope.pubData.seriesTitle.id = '';
					}
				});

				$scope.changeType = function () {
					if (typeInputIsInitialized) {
						$scope.localPubGenreId = '';
						$scope.localSeriesTitle = '';
					}
					else {
						typeInputIsInitialized = true;
					}
				};

				$scope.changeGenre = function () {
					if (genreInputIsInitialized) {
						$scope.localSeriesTitle = '';
					}
					else {
						genreInputIsInitialized = true;
					}
				};

				$scope.$watch('localCostCenters', function (newCostCenters) {
					$scope.pubData.costCenters = _.map(newCostCenters, function (costCenterId) {
						return {id: costCenterId};
					});
				});

				$scope.$watch('localLargerWorkTypeId', function (value) {
					var id = getIdOrOriginal(value);
					$scope.pubData.largerWorkType.id = id;
				});
				$scope.$watch('localLargerWorkSubtypeId', function (value) {
					var id = getIdOrOriginal(value);
					$scope.pubData.largerWorkSubtype.id = id;
				});
				$scope.changeLargerWorkType = function () {
					if (largerWorkTypeInputIsInitialized) {
						$scope.localLargerWorkSubtypeId = '';
					}
					else {
						largerWorkTypeInputIsInitialized = true;
					}
				};
				// Set up select2 lists and/or options to retrieve lists dynamically
				LookupFetcher.promise('publicationtypes').then(function (response) {
					$scope.typeOptions = response.data;

				});

				LookupFetcher.promise('costcenters', {active : 'y'}).then(function(response) {
					$scope.activeCostCenterOptions = response.data;
				});
				LookupFetcher.promise('costcenters', {active : 'n'}).then(function(response) {
					$scope.notActiveCostCenterOptions = response.data;
				});

				$scope.subtypeSelect2Options = {
					query: function (query) {
						LookupCascadeSelect2.query(query, 'publicationsubtypes', {publicationtypeid: $scope.pubData.publicationType.id});
					},
					initSelection: function (element, callback) {
						callback($scope.pubData.publicationSubtype);
					},
					placeholder: 'Select a publication subtype',
					allowClear: true
				};

				$scope.seriesTitleSelect2Options = {
					query : function(options) {
						var activePromise, notActivePromise;
						var activeResults = {text : 'Active', children : []};
						var notActiveResults = {text : 'Not Active', children : []};

						activePromise = LookupFetcher.promise('publicationseries', {
							publicationsubtypeid : $scope.pubData.publicationSubtype.id,
							active : 'y',
							text : options.term
						}).then(function(response) {
							activeResults.children = $filter('limitTo')(response.data, 30);
						});
						notActivePromise = LookupFetcher.promise('publicationseries', {
							publicationsubtypeid : $scope.pubData.publicationSubtype.id,
							active : 'n',
							text : options.term
						}).then(function(response) {
							notActiveResults.children = $filter('limitTo')(response.data, 30);
						});

						$q.all([activePromise, notActivePromise]).then(function() {
							options.callback({results : [activeResults, notActiveResults]});
						});
					},
					initSelection : function(element, callback) {
						callback($scope.pubData.seriesTitle);
					},
					minimumInputLength : 1,
					placeholder: 'Select a series',
					allowClear : true
				};
				$scope.costCenterSelect2Options = {
					placeholder: 'Select one or more cost centers'
				};

				$scope.largerWorkSubtypeSelect2Options = {
					query : function(query) {
						LookupCascadeSelect2.query(query, 'publicationsubtypes', {publicationtypeid : $scope.pubData.largerWorkType.id});
					},
					initSelection : function(element, callback) {
						LookupCascadeSelect2.initSelection('publicationsubtypes', {publicationtypeid: $scope.pubData.largerWorkType.id}, $scope.pubData.largerWorkSubtype.id, callback);
					},
					placeholder : 'Select a larger work subtype',
					allowClear : true
				};

				$scope.docAbstractEditorOptions = {
					menubar: false,
					plugins : 'code link',
					toolbar : 'undo redo | styleselect | bold italic | alignleft aligncenter alignright alignjustify | bullist numlist outdent indent | subscript superscript | link | code'
				};

			}]);

})();
