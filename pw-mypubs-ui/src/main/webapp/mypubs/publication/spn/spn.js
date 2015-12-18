(function() {


angular.module('pw.spn', ['pw.lookups'])
	.controller('spnCtrl', [
		'$scope', '$q', 'LookupFetcher',
		function($scope, $q, LookupFetcher) {
			//@mbucknell recommends binding ui-select2 ng-model targets to variables
			//on the local-most scope and propagating changes back up to pubData via watches
			$scope.localPscId = $scope.pubData.publishingServiceCenter.id;
			$scope.localIsPartOfId = $scope.pubData.isPartOf.id;
			$scope.localSupersededById = $scope.pubData.supersededBy.id;
			$scope.localPublishedDate = $scope.pubData.publishedDate;
			$scope.localRevisedDate = $scope.pubData.revisedDate;

			// This method and the watches on the select2 local values gets around an issue where you
			// have to initialize the select2 with an id value, but then it puts an object on the associated
			// scope object.
			var updateObject = function(obj, value) {
				if (angular.isObject(value)) {
					return value;
				}
				else if (obj.id !== value) {
					return {id: value, text: ''};
				}
				else {
					return {id: obj.id, text : obj.text};
				}
			};

			$scope.$watch('localPscId', function (newVal, oldVal) {
				if (newVal !== oldVal) {
					$scope.pubData.publishingServiceCenter.id = newVal;
				}
			});
			$scope.$watch('localIsPartOfId', function (newVal, oldVal) {
				if (newVal !== oldVal) {
					$scope.pubData.isPartOf = updateObject($scope.pubData.isPartOf, newVal);
				}
			});
			$scope.$watch('localSupersededById', function (newVal, oldVal) {
				if (newVal !== oldVal) {
					$scope.pubData.supersededBy = updateObject($scope.pubData.supersededBy, newVal);
				}
			});

			LookupFetcher.promise('publishingServiceCenters').then(function (response) {
				$scope.pscOptions = response.data;
			});

			$scope.isPartOfOptions = {
					query: function (options) {
						if (!options.term && $scope.pubData && $scope.pubData.isPartOf && $scope.pubData.isPartOf.indexId) {
							options.term = $scope.pubData.isPartOf.indexId.slice(0, -2);
						}
						LookupFetcher.promise('publications', {text : options.term}).then(function(response) {
							options.callback({results : response.data});
		                });
					},
					initSelection: function (element, callback) {
						callback($scope.pubData.isPartOf);
					},
					placeholder: 'Select the Is Part of Publication',
					allowClear: true
				};

			$scope.supersededByOptions = {
					query: function (options) {
						if (!options.term && $scope.pubData && $scope.pubData.supersededBy && $scope.pubData.supersededBy.indexId) {
							options.term = $scope.pubData.supersededBy.indexId.slice(0, -2);
						}
						LookupFetcher.promise('publications', {text : options.term}).then(function(response) {
							options.callback({results : response.data});
		                });
					},
					initSelection: function (element, callback) {
						callback($scope.pubData.supersededBy);
					},
					placeholder: 'Select the Superseded By Publication',
					allowClear: true
				};

			$scope.contactsEditorOptions = {
					menubar: false,
					plugins : 'code link paste',
					formats: {
    						italic: {inline: 'i'}
  						},
					browser_spellcheck : true,
					toolbar : 'undo redo | styleselect | bold italic | alignleft aligncenter alignright alignjustify | bullist numlist outdent indent | subscript superscript | link | code'

				};

			$scope.$watch('localPublishedDate', function (value) {
				var newDate = moment(value).format('YYYY-MM-DD');
				if (newDate === 'Invalid date') {
					$scope.pubData.publishedDate = '';
				}
				else {
					$scope.pubData.publishedDate = moment(value).format('YYYY-MM-DD');
				}
			});

			$scope.$watch('localRevisedDate', function (value) {
			var newDate = moment(value).format('YYYY-MM-DD');
				if (newDate === 'Invalid date') {
					$scope.pubData.revisedDate = '';
				}
				else {
					$scope.pubData.revisedDate = moment(value).format('YYYY-MM-DD');
				}
			});
		}
	]);
}) ();
