(function() {
	var DEFAULT_PAGE_SIZE = 15;

	angular.module('pw.search', ['ngRoute', 'ngGrid', 'pw.publicationDAO', 'pw.pubsListDAO', 'pw.modal', 'pw.notify'])


	.config(['$routeProvider',
	         function($routeProvider) {
		$routeProvider.when('/Search', {
			templateUrl: 'mypubs/search/search.html',
			controller: 'searchCtrl'
		});
	}
	])

	.controller('searchCtrl', [ '$scope', '$location', 'PublicationFetcher', 'PubsListFetcher', 'PubsModal', 'Notifier',
	function($scope, $location, PublicationFetcher, PubsListFetcher, PubsModal, Notifier) {
		$scope.pubsLists = [];
		$scope.pubs = [];

		PubsListFetcher.fetchAllLists().then(
			function(value) {
				$scope.pubsLists = value.data;
			},
			function(reason) {
				Notifier.error('Publication lists could not be loaded');
			}
		);


		$scope.searchClick = function(searchTermField) {
			$scope.searchTerm = searchTermField; //a way for us to not update the model until we get a click
			$scope.search();
		};

		$scope.search = function() {
			$scope.pubs = {}; //clear grid for loader
			$scope.pubsGrid.ngGrid.$root.addClass("pubs-loading-indicator");

			var searchTerm = $scope.searchTerm;

			//create array of listIds
			var listIds = [];
			if($scope.selectedPubsLists) {
				for(var i in $scope.selectedPubsLists) {
					listIds.push($scope.selectedPubsLists[i].id);
				}
			}

			var pageSize = $scope.pagingState.pageSize;

			var currentPage = $scope.pagingState.currentPage;
			var startRow = (currentPage - 1) * pageSize;
			PublicationFetcher.searchByTermAndListIds(searchTerm, listIds, pageSize, startRow).then(function(httpPromise){
				$scope.pubs = httpPromise.data.records;
				$scope.recordCount = httpPromise.data.recordCount;
				$scope.selectedPubs.length = 0; //clear selections, for some reason, ngGrid/angular needs a reference to the original array to keep the watch valid
				$scope.pubsGrid.ngGrid.$root.removeClass("pubs-loading-indicator");
			});
			$scope.searchTerm = searchTerm; //apply search term to scope so template updates
		};

		$scope.editSelectedPublication = function() {
			if($scope.selectedPubs.length == 1) {
				$location.path("/Publication/" + $scope.selectedPubs[0].id);
			} else {
				PubsModal.alert("Select One Publication", "You must select one, and only one, publication to edit.");
			}
		};

		$scope.selectedPubsLists = [];
		$scope.pubsListGrid = {
				data: 'pubsLists',
				selectedItems: $scope.selectedPubsLists,
				columnDefs: [
				             {field:'text', displayName:'Name'},
				             {field:'description', displayName:'Description'}]
		};

		$scope.selectedPubs = [];
		$scope.pagingState = {
				pageSizes: [15, 25, 50, 100],
				pageSize: DEFAULT_PAGE_SIZE,
				currentPage: 1
		};

		//TODO these templates are extracted from the main search template. This is a work around since
		//ngGrid does not support passing in a template location for each of the cellTemplate configs.
		//Would like to either remove the direct dom calls here into a service, or wait for ngGrid to support
		//templateUrl.
		var textFieldCellTemplate = $('#textFieldCellTemplate').html();
		var authorsCellTemplate = $('#authorsCellTemplate').html();
		//TODO: need to use a function since we do not have ng-repeat in cellTemplate, this is "view" code that should be moved out of the controller
		$scope.formatAuthors = function(authArray) {
			var authString = "";
			angular.forEach(authArray, function(auth) {
				if(authString.length > 0) {
					authString += "; ";
				}

				//person
				if(auth.family || auth.given) {
					authString += auth.given + " " + auth.family + (auth.suffix ? ' ' + auth.suffix : '');
				} else if(auth.organization) { //corporation/organization as author
					authString += auth.organization;
				}
			});
			return authString;
		};

		$scope.pubsGrid = {
				data: 'pubs',
				selectedItems: $scope.selectedPubs,
				columnDefs: [
		            {field:'publicationType', displayName:'Type', width: 75,
						cellTemplate: textFieldCellTemplate },
					{field:'seriesTitle', displayName:'USGS Series', width: 150,
						cellTemplate: textFieldCellTemplate },
					{field:'seriesNumber', displayName:'Report Number', width: 125},
					{field:'publicationYear', displayName:'Year', width: 50},
					{field:'title', displayName:'Title'},
					{field:'authors', displayName:'Author', width: 250,
						cellTemplate: authorsCellTemplate }
				],
				enableSorting: false,
				enableColumnResize: true,
				showFooter: true,
				totalServerItems: 'recordCount',
				enablePaging: true,
				pagingOptions: $scope.pagingState
	};

	//Watches to update pub list when list selection or paging settings change
	$scope.$watch('pagingState', function (newVal, oldVal) {
		$scope.search();
	}, true);
	$scope.$watch('selectedPubsLists', function (newVal, oldVal) {
		$scope.search();
	}, true);

}]);
}) ();
