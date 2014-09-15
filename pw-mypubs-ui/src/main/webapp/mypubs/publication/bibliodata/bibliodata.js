(function() {


angular.module('pw.bibliodata',['pw.fetcher', 'pw.lookups'])
    .controller('biblioCtrl', [
        '$scope', 'LookupFetcher', 'LookupCascadeSelect2', '$routeParams',
        function ($scope, LookupFetcher, LookupCascadeSelect2, $routeParams) {

            // This are used to control whether the change* functions are executed.
            // We don't want them to execute the first time it is fired when publication
            // data has been loaded.
            var typeInputIsInitialized = false;
            var genreInputIsInitialized = false;

            if (!$routeParams.pubsid){
                typeInputIsInitialized = true;
                genreInputIsInitialized = true;
            }
            //@mbucknell recommends binding ui-select2 ng-model targets to variables
            //on the local-most scope and propagating changes back up to pubData via watches
            $scope.localPubTypeId = $scope.pubData.publicationType.id;
            $scope.localLargerWorkTypeId = $scope.pubData.largerWorkType.id;
            $scope.localPubGenreId = $scope.pubData.publicationSubtype.id;
            $scope.localSeriesTitle = $scope.pubData.seriesTitle.id;
			$scope.localCostCenters = [];
			angular.forEach($scope.pubData.costCenters, function(costCenter){
				if(angular.isDefined(costCenter.id)){
					$scope.localCostCenters.push(costCenter.id);
				}
			});

            var getIdOrOriginal = function(objectOrPrimitive){
                var id = objectOrPrimitive;
                if(objectOrPrimitive.id){
                    id = objectOrPrimitive.id;
                }
                return id;
            };
            $scope.$watch('localPubTypeId', function(value){
                var id = getIdOrOriginal(value);
                $scope.pubData.publicationType.id = id;
            });
            $scope.$watch('localLargerWorkTypeId', function(value){
                var id = getIdOrOriginal(value);
                $scope.pubData.largerWorkType.id = id;
            });
            $scope.$watch('localPubGenreId', function(value){
                var id = getIdOrOriginal(value);
                $scope.pubData.publicationSubtype.id = id;
            });
            $scope.$watch('localSeriesTitle', function(value){
                var id = getIdOrOriginal(value);
                $scope.pubData.seriesTitle.id = id;
            });
            $scope.changeType = function() {
                if (typeInputIsInitialized) {
                    $scope.localPubGenreId = '';
                    $scope.localSeriesTitle = '';
                }
                else {
                    typeInputIsInitialized = true;
                }
            };

            $scope.changeGenre = function() {
                if (genreInputIsInitialized) {
                    $scope.localSeriesTitle = '';
                }
                else {
                    genreInputIsInitialized = true;
                }
            };
			$scope.$watch('localCostCenters', function(newCostCenters){
				$scope.pubData.costCenters = _.map(newCostCenters, function(costCenterId){
					return {id: costCenterId};
				});
			});
            LookupFetcher.promise('publicationtypes').then(function(response) {
                $scope.typeOptions = response.data;

            });

            LookupFetcher.promise('costcenters').then(function(response) {
                $scope.costCenterOptions = response.data;
            });

            $scope.subtypeSelect2Options = {
                query : function(query) {
                    LookupCascadeSelect2.query(query, 'publicationsubtypes', {publicationtypeid : $scope.pubData.publicationType.id});
                },
                initSelection : function(element, callback) {
                    LookupCascadeSelect2.initSelection('publicationsubtypes', {publicationtypeid : $scope.pubData.publicationType.id}, $scope.pubData.publicationSubtype.id, callback);
                },
                placeholder : 'Select a publication subtype',
		allowClear : true
            };

            $scope.seriesTitleSelect2Options = {
                query : function(query) {
                    LookupCascadeSelect2.query(query, 'publicationseries', {publicationsubtypeid : $scope.pubData.publicationSubtype.id});
                },
                initSelection : function(element, callback) {
                    LookupCascadeSelect2.initSelection('publicationseries', {publicationsubtypeid : $scope.pubData.publicationSubtype.id}, $scope.pubData.seriesTitle.id, callback);
                },
                placeholder : 'Select a series',
		allowClear : true
            };

            $scope.costCenterSelect2Options = {
                placeholder : 'Select one or more cost centers'
            };

            $scope.abstractEditorOptions = {
                menubar : false
            };

    }]);

}) ();
